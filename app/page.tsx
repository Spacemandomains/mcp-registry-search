import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Registry Search",
  description:
    "An MCP server that lets any AI agent discover every server in the Model Context Protocol registry.",
};

const ENDPOINT = "https://mcpregistrysearchwilfredleejr.vercel.app/api/mcp";

const tools = [
  {
    name: "search_mcp_registry",
    badge: "Search",
    badgeColor: "#7c3aed",
    description:
      "Natural language search across all servers in the registry. Returns name, description, endpoint, transport, repository, and status for each match.",
    params: ["query: string", "limit?: number", "latest_only?: boolean"],
  },
  {
    name: "get_mcp_server_details",
    badge: "Lookup",
    badgeColor: "#0891b2",
    description:
      "Full metadata for a specific server by its reverse-DNS name (e.g. io.github.username/server-name). Returns all versions, packages, tools, and environment variables.",
    params: ["name: string"],
  },
  {
    name: "list_mcp_servers",
    badge: "Browse",
    badgeColor: "#059669",
    description:
      "Paginated browse of every server in the registry. Use the next_cursor from the response to fetch subsequent pages.",
    params: ["limit?: number", "cursor?: string", "latest_only?: boolean"],
  },
];

const configSnippet = `{
  "mcpServers": {
    "mcp-registry-search": {
      "url": "${ENDPOINT}"
    }
  }
}`;

export default function Home() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0a0f; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; }
        a { color: inherit; text-decoration: none; }

        .container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

        /* Nav */
        nav { border-bottom: 1px solid #1e1e2e; padding: 16px 0; }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; }
        .nav-dot { width: 8px; height: 8px; border-radius: 50%; background: #7c3aed; box-shadow: 0 0 8px #7c3aed; }
        .nav-links { display: flex; gap: 24px; }
        .nav-links a { font-size: 14px; color: #94a3b8; transition: color .15s; }
        .nav-links a:hover { color: #e2e8f0; }

        /* Hero */
        .hero { padding: 96px 0 80px; text-align: center; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #1e1e2e; border: 1px solid #2d2d44; border-radius: 99px; padding: 6px 16px; font-size: 13px; color: #94a3b8; margin-bottom: 32px; }
        .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; }
        h1 { font-size: clamp(36px, 6vw, 64px); font-weight: 700; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 24px; }
        .gradient { background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 18px; color: #94a3b8; max-width: 560px; margin: 0 auto 40px; }
        .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all .15s; border: none; }
        .btn-primary { background: #7c3aed; color: #fff; }
        .btn-primary:hover { background: #6d28d9; }
        .btn-outline { background: transparent; color: #e2e8f0; border: 1px solid #2d2d44; }
        .btn-outline:hover { border-color: #7c3aed; color: #a78bfa; }

        /* Endpoint pill */
        .endpoint-bar { margin: 56px auto 0; max-width: 560px; }
        .endpoint-pill { display: flex; align-items: center; background: #0f0f1a; border: 1px solid #2d2d44; border-radius: 10px; padding: 12px 16px; gap: 12px; }
        .endpoint-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #7c3aed; white-space: nowrap; }
        .endpoint-url { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

        /* Stats */
        .stats { border-top: 1px solid #1e1e2e; border-bottom: 1px solid #1e1e2e; padding: 32px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .stat { text-align: center; padding: 0 24px; border-right: 1px solid #1e1e2e; }
        .stat:last-child { border-right: none; }
        .stat-number { font-size: 32px; font-weight: 700; letter-spacing: -1px; }
        .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }

        /* Tools */
        .section { padding: 80px 0; }
        .section-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .12em; color: #7c3aed; margin-bottom: 12px; }
        h2 { font-size: clamp(24px, 4vw, 36px); font-weight: 700; letter-spacing: -.5px; margin-bottom: 16px; }
        .section-sub { color: #64748b; font-size: 16px; max-width: 480px; }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 48px; }
        .tool-card { background: #0f0f1a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 28px; transition: border-color .2s; }
        .tool-card:hover { border-color: #2d2d44; }
        .tool-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 16px; }
        .tool-name { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 15px; font-weight: 600; color: #e2e8f0; margin-bottom: 12px; }
        .tool-desc { font-size: 14px; color: #64748b; line-height: 1.65; margin-bottom: 20px; }
        .tool-params { display: flex; flex-direction: column; gap: 6px; }
        .tool-param { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #475569; background: #1e1e2e; border-radius: 4px; padding: 4px 8px; display: inline-block; width: fit-content; }

        /* Connect */
        .connect-section { padding: 80px 0; }
        .connect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        @media (max-width: 700px) { .connect-grid { grid-template-columns: 1fr; } }
        .connect-steps { display: flex; flex-direction: column; gap: 28px; margin-top: 32px; }
        .step { display: flex; gap: 16px; }
        .step-num { width: 28px; height: 28px; border-radius: 8px; background: #1e1e2e; border: 1px solid #2d2d44; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #7c3aed; flex-shrink: 0; margin-top: 2px; }
        .step-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .step-desc { font-size: 14px; color: #64748b; }
        .code-block { background: #0f0f1a; border: 1px solid #1e1e2e; border-radius: 12px; overflow: hidden; }
        .code-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #1e1e2e; }
        .code-title { font-size: 12px; color: #475569; font-family: 'SF Mono', 'Fira Code', monospace; }
        .code-dots { display: flex; gap: 6px; }
        .code-dot { width: 10px; height: 10px; border-radius: 50%; }
        pre { padding: 20px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; line-height: 1.7; color: #94a3b8; overflow-x: auto; }
        .token-key { color: #7dd3fc; }
        .token-str { color: #86efac; }
        .token-punc { color: #475569; }

        /* Footer */
        footer { border-top: 1px solid #1e1e2e; padding: 40px 0; }
        .footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-copy { font-size: 13px; color: #475569; }
        .footer-links { display: flex; gap: 20px; }
        .footer-links a { font-size: 13px; color: #475569; transition: color .15s; }
        .footer-links a:hover { color: #94a3b8; }
      `}</style>

      {/* Nav */}
      <nav>
        <div className="container">
          <div className="nav-inner">
            <div className="nav-logo">
              <div className="nav-dot" />
              MCP Registry Search
            </div>
            <div className="nav-links">
              <a href="#tools">Tools</a>
              <a href="#connect">Connect</a>
              <a href="https://github.com/Spacemandomains/mcp-registry-search" target="_blank" rel="noopener">GitHub</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            Live · Streamable HTTP · No auth required
          </div>
          <h1>
            Every MCP server,<br />
            <span className="gradient">instantly discoverable</span>
          </h1>
          <p className="hero-sub">
            An MCP server that wraps the official Model Context Protocol registry.
            Any AI agent with this server configured can search, browse, and inspect
            every server in the ecosystem.
          </p>
          <div className="hero-actions">
            <a href="#connect" className="btn btn-primary">
              Connect to agent
            </a>
            <a href="https://github.com/Spacemandomains/mcp-registry-search" target="_blank" rel="noopener" className="btn btn-outline">
              View source
            </a>
          </div>
          <div className="endpoint-bar">
            <div className="endpoint-pill">
              <span className="endpoint-label">MCP</span>
              <span className="endpoint-url">{ENDPOINT}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-number gradient">3</div>
              <div className="stat-label">Tools</div>
            </div>
            <div className="stat">
              <div className="stat-number gradient">0</div>
              <div className="stat-label">Config required</div>
            </div>
            <div className="stat">
              <div className="stat-number gradient">∞</div>
              <div className="stat-label">Servers discoverable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <section className="section" id="tools">
        <div className="container">
          <div className="section-label">Tools</div>
          <h2>Three tools, full registry coverage</h2>
          <p className="section-sub">
            Search by intent, look up by name, or page through the full catalogue.
          </p>
          <div className="tools-grid">
            {tools.map((tool) => (
              <div key={tool.name} className="tool-card">
                <div
                  className="tool-badge"
                  style={{
                    background: tool.badgeColor + "22",
                    color: tool.badgeColor,
                  }}
                >
                  {tool.badge}
                </div>
                <div className="tool-name">{tool.name}</div>
                <div className="tool-desc">{tool.description}</div>
                <div className="tool-params">
                  {tool.params.map((p) => (
                    <span key={p} className="tool-param">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect */}
      <section className="connect-section" id="connect">
        <div className="container">
          <div className="connect-grid">
            <div>
              <div className="section-label">Quick start</div>
              <h2>Connect in seconds</h2>
              <div className="connect-steps">
                <div className="step">
                  <div className="step-num">1</div>
                  <div>
                    <div className="step-title">Copy the config</div>
                    <div className="step-desc">Add the snippet to your MCP client configuration file.</div>
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">2</div>
                  <div>
                    <div className="step-title">Restart your agent</div>
                    <div className="step-desc">The three tools will appear automatically — no API keys needed.</div>
                  </div>
                </div>
                <div className="step">
                  <div className="step-num">3</div>
                  <div>
                    <div className="step-title">Ask about any MCP server</div>
                    <div className="step-desc">
                      Your agent will call <code style={{fontFamily:"monospace",fontSize:13,color:"#a78bfa"}}>search_mcp_registry</code> before saying it can&apos;t help.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="code-block">
                <div className="code-header">
                  <div className="code-dots">
                    <div className="code-dot" style={{background:"#ff5f57"}} />
                    <div className="code-dot" style={{background:"#febc2e"}} />
                    <div className="code-dot" style={{background:"#28c840"}} />
                  </div>
                  <div className="code-title">mcp config</div>
                </div>
                <pre>{configSnippet}</pre>
              </div>
              <div style={{marginTop: 16, display:"flex", flexDirection:"column", gap: 8}}>
                <a href="/api/health" target="_blank" className="btn btn-outline" style={{width:"100%", justifyContent:"center", fontSize:14}}>
                  Check health endpoint →
                </a>
                <a href="https://registry.modelcontextprotocol.io" target="_blank" rel="noopener" className="btn btn-outline" style={{width:"100%", justifyContent:"center", fontSize:14}}>
                  Browse MCP Registry →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-inner">
            <div className="footer-copy">
              MCP Registry Search · Deployed on Vercel
            </div>
            <div className="footer-links">
              <a href="/api/health" target="_blank">Health</a>
              <a href="https://github.com/Spacemandomains/mcp-registry-search" target="_blank" rel="noopener">GitHub</a>
              <a href="https://registry.modelcontextprotocol.io" target="_blank" rel="noopener">MCP Registry</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
