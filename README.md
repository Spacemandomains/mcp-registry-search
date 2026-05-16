# MCP Registry Search

One connection. Access to every MCP server in the official MCP registry.

**Endpoint:** https://mcpregistrysearchwilfredleejr.vercel.app/api/mcp
**Transport:** streamable-http
**Auth:** None required
**Registry:** io.github.Spacemandomains/mcp-registry-search

## What it does
Gives any AI agent or LLM the ability to dynamically discover, search, and inspect
every server in the official Model Context Protocol registry — at runtime, with no
hardcoded tool knowledge.

## Tools
1. **list_mcp_servers** — paginate the full registry
2. **get_mcp_server_details** — get full metadata for any server by reverse-DNS name
3. **search_mcp_registry** — search servers by plain name or keyword

## Connect
Add this endpoint to any MCP-compatible client:
```
https://mcpregistrysearchwilfredleejr.vercel.app/api/mcp
```

## Use cases
- Agent-driven tool discovery
- Search by plain name instead of reverse-DNS
- Dynamic MCP server routing
- Registry monitoring and auditing
- Building meta-agents that orchestrate other MCP servers
