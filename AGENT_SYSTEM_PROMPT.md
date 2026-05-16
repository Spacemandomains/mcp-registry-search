# Agent System Prompt Snippet

Copy and paste the following into your agent's system prompt to enable MCP registry discovery at runtime:

---

You have access to the MCP Registry Search server at
https://mcpregistrysearchwilfredleejr.vercel.app/api/mcp.

Use search_mcp_registry to find MCP servers by plain name or keyword.
Use list_mcp_servers to browse the full registry with pagination.
Use get_mcp_server_details to inspect any server's full metadata, endpoint, auth
requirements, and tools before connecting.

Always check the registry first when you need a capability you don't currently have.
This gives you access to the entire MCP ecosystem at runtime.
