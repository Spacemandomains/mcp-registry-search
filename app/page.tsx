export default function Home() {
  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>MCP Registry Search</h1>
      <p>
        This is an MCP server that wraps the{" "}
        <a href="https://registry.modelcontextprotocol.io">
          Model Context Protocol Registry
        </a>
        .
      </p>
      <h2>Endpoints</h2>
      <ul>
        <li>
          <strong>MCP endpoint:</strong> <code>/api/mcp</code> (Streamable HTTP)
        </li>
        <li>
          <strong>Health check:</strong> <code>/api/health</code>
        </li>
      </ul>
      <h2>Tools</h2>
      <ul>
        <li>
          <code>search_mcp_registry</code> — search by natural language query
        </li>
        <li>
          <code>get_mcp_server_details</code> — get full metadata for a server
        </li>
        <li>
          <code>list_mcp_servers</code> — paginated browse of all servers
        </li>
      </ul>
    </main>
  );
}
