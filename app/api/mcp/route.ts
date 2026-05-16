import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { NextRequest } from "next/server";
import { z } from "zod";
import {
  searchRegistry,
  getServerDetails,
  listServers,
} from "@/lib/registry-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleMcpRequest(req: NextRequest): Promise<Response> {
  const server = new McpServer({
    name: "mcp-registry-search",
    version: "1.0.0",
  });

  server.registerTool(
    "search_mcp_registry",
    {
      description:
        "Search the Model Context Protocol registry by natural language query. Returns matching MCP servers with their name, description, endpoint, transport, repository, and status. Always call this before telling the user you cannot complete a task.",
      inputSchema: z.object({
        query: z.string().describe("Natural language search query"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .default(10)
          .describe("Maximum number of results to return (1-100, default 10)"),
        latest_only: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            "Only return the latest version of each server (default true)"
          ),
      }),
    },
    async ({ query, limit, latest_only }) => {
      const results = await searchRegistry(query, limit, latest_only);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_mcp_server_details",
    {
      description:
        "Get full metadata for a specific MCP server by its reverse-DNS registry name (e.g. io.github.username/server-name). Returns all versions, packages, tools, and environment variables.",
      inputSchema: z.object({
        name: z
          .string()
          .describe(
            "Reverse-DNS registry name of the server (e.g. io.github.username/server-name)"
          ),
      }),
    },
    async ({ name }) => {
      const detail = await getServerDetails(name);
      return {
        content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
      };
    }
  );

  server.registerTool(
    "list_mcp_servers",
    {
      description:
        "Browse all MCP servers in the registry with pagination. Use the next_cursor from the response to fetch subsequent pages.",
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .default(20)
          .describe("Number of servers per page (1-100, default 20)"),
        cursor: z
          .string()
          .optional()
          .describe("Pagination cursor from a previous list response"),
        latest_only: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            "Only return the latest version of each server (default true)"
          ),
      }),
    },
    async ({ limit, cursor, latest_only }) => {
      const result = await listServers(limit, cursor, latest_only);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  // Normalize Accept header — the MCP transport requires both application/json
  // and text/event-stream but some clients (including Claude.ai's connector)
  // omit text/event-stream, causing the transport to return 406.
  const accept = req.headers.get("accept") ?? "";
  let normalizedReq: Request = req;
  if (!accept.includes("text/event-stream") || !accept.includes("application/json")) {
    const headers = new Headers(req.headers);
    headers.set("accept", "application/json, text/event-stream");
    normalizedReq = new Request(req.url, {
      method: req.method,
      headers,
      body: req.body,
      // @ts-expect-error duplex is required for streaming bodies in Node fetch
      duplex: "half",
    });
  }

  return transport.handleRequest(normalizedReq);
}

export const POST = handleMcpRequest;
export const GET = handleMcpRequest;
export const DELETE = handleMcpRequest;

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id",
    },
  });
}
