import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { NextRequest } from "next/server";
import {
  searchRegistry,
  getServerDetails,
  listServers,
} from "@/lib/registry-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOOLS = [
  {
    name: "search_mcp_registry",
    description:
      "Search the Model Context Protocol registry by natural language query. Returns matching MCP servers with their name, description, endpoint, transport, repository, and version.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Natural language search query",
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 10,
          description: "Maximum number of results to return (1-100, default 10)",
        },
        latest_only: {
          type: "boolean",
          default: true,
          description: "Only return the latest version of each server (default true)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_mcp_server_details",
    description:
      "Get full metadata for a specific MCP server by its reverse-DNS registry name (e.g. io.github.username/server-name). Returns all versions, remotes, packages, and tools.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Reverse-DNS registry name of the server (e.g. io.github.username/server-name)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "list_mcp_servers",
    description:
      "Browse all MCP servers in the registry with pagination. Use the next_cursor from the response to fetch subsequent pages.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 20,
          description: "Number of servers per page (1-100, default 20)",
        },
        cursor: {
          type: "string",
          description: "Pagination cursor from a previous list response",
        },
        latest_only: {
          type: "boolean",
          default: true,
          description: "Only return the latest version of each server (default true)",
        },
      },
    },
  },
] as const;

async function handleMcpRequest(req: NextRequest): Promise<Response> {
  const server = new Server(
    { name: "mcp-registry-search", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const a = (args ?? {}) as Record<string, unknown>;

    try {
      let text: string;

      if (name === "search_mcp_registry") {
        const results = await searchRegistry(
          String(a.query ?? ""),
          typeof a.limit === "number" ? a.limit : 10,
          typeof a.latest_only === "boolean" ? a.latest_only : true
        );
        text = JSON.stringify(results, null, 2);
      } else if (name === "get_mcp_server_details") {
        const detail = await getServerDetails(String(a.name ?? ""));
        text = JSON.stringify(detail, null, 2);
      } else if (name === "list_mcp_servers") {
        const result = await listServers(
          typeof a.limit === "number" ? a.limit : 20,
          typeof a.cursor === "string" ? a.cursor : undefined,
          typeof a.latest_only === "boolean" ? a.latest_only : true
        );
        text = JSON.stringify(result, null, 2);
      } else {
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
      }

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: String(err) }],
        isError: true,
      };
    }
  });

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
