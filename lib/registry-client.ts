const REGISTRY_BASE = "https://registry.modelcontextprotocol.io/v0";
const MAX_PAGES = 25; // up to 2500 servers
const PAGE_SIZE = 100;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface ServerSummary {
  name: string;
  title: string;
  description: string;
  endpoint: string | null;
  transport: string | null;
  repository: string | null;
  version: string | null;
  status: string | null;
  isLatest: boolean;
}

export interface ServerVersion {
  version: string;
  isLatest: boolean;
  publishedAt: string;
  status: string;
  remotes: Array<{ type: string; url: string }>;
  packages: Array<{ registry: string; name: string; version: string }>;
  tools: Array<{ name: string; description: string }>;
}

export interface ServerDetail {
  name: string;
  title: string;
  description: string;
  repository: string | null;
  versions: ServerVersion[];
}

export interface ListResult {
  servers: ServerSummary[];
  next_cursor: string | null;
}

type RegistryItem = {
  server: Record<string, unknown>;
  _meta: Record<string, unknown>;
};

// Module-level cache — persists across requests on the same warm Vercel instance
let _cache: { data: ServerSummary[]; fetchedAt: number } | null = null;

function extractSummary(item: RegistryItem): ServerSummary {
  const s = item.server;
  const meta = (
    (item._meta?.["io.modelcontextprotocol.registry/official"] ?? {}) as Record<string, unknown>
  );
  const remotes = (s.remotes as Array<{ type: string; url: string }> | undefined) ?? [];
  const repo = s.repository as Record<string, unknown> | undefined;

  return {
    name: String(s.name ?? ""),
    title: String(s.title ?? s.name ?? ""),
    description: String(s.description ?? ""),
    endpoint: remotes[0]?.url ?? null,
    transport: remotes[0]?.type ?? null,
    repository: repo?.url ? String(repo.url) : null,
    version: String(s.version ?? ""),
    status: String(meta.status ?? ""),
    isLatest: Boolean(meta.isLatest),
  };
}

async function fetchPage(cursor?: string): Promise<{
  items: RegistryItem[];
  nextCursor: string | null;
}> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    latest_only: "true",
    ...(cursor ? { cursor } : {}),
  });
  const res = await fetch(`${REGISTRY_BASE}/servers?${params}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 }, // Next.js edge cache — 5 min per page URL
  });
  if (!res.ok) throw new Error(`Registry API error: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as {
    servers?: RegistryItem[];
    metadata?: { nextCursor?: string };
  };
  return {
    items: data.servers ?? [],
    nextCursor: data.metadata?.nextCursor ?? null,
  };
}

async function getAllServers(): Promise<ServerSummary[]> {
  // Return in-memory cache if still warm
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL) {
    return _cache.data;
  }

  const all: ServerSummary[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const { items, nextCursor } = await fetchPage(cursor);
    all.push(...items.map(extractSummary));
    if (!nextCursor) break;
    cursor = nextCursor;
  }

  _cache = { data: all, fetchedAt: Date.now() };
  return all;
}

function matchesQuery(server: ServerSummary, terms: string[]): boolean {
  const haystack = [server.name, server.title, server.description]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export async function searchRegistry(
  query: string,
  limit = 10,
  latestOnly = true
): Promise<ServerSummary[]> {
  const all = await getAllServers();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  let results = all.filter((s) => matchesQuery(s, terms));

  if (latestOnly) {
    // Deduplicate by name, preferring the entry marked isLatest
    const seen = new Map<string, ServerSummary>();
    for (const s of results) {
      const existing = seen.get(s.name);
      if (!existing || s.isLatest) seen.set(s.name, s);
    }
    results = Array.from(seen.values());
  }

  return results.slice(0, limit);
}

export async function getServerDetails(name: string): Promise<ServerDetail> {
  const encoded = encodeURIComponent(name);
  const res = await fetch(`${REGISTRY_BASE}/servers/${encoded}/versions`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Server not found: ${name}`);
    throw new Error(`Registry API error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { servers?: RegistryItem[] };
  const items = data.servers ?? [];
  if (items.length === 0) throw new Error(`Server not found: ${name}`);

  const first = items[0].server;
  const repo = first.repository as Record<string, unknown> | undefined;

  const versions: ServerVersion[] = items.map((item) => {
    const s = item.server;
    const meta = (
      (item._meta?.["io.modelcontextprotocol.registry/official"] ?? {}) as Record<string, unknown>
    );
    const remotes = (s.remotes as Array<{ type: string; url: string }> | undefined) ?? [];
    const packages = (s.packages as Array<Record<string, unknown>> | undefined) ?? [];
    const tools = (s.tools as Array<Record<string, unknown>> | undefined) ?? [];

    return {
      version: String(s.version ?? ""),
      isLatest: Boolean(meta.isLatest),
      publishedAt: String(meta.publishedAt ?? ""),
      status: String(meta.status ?? ""),
      remotes,
      packages: packages.map((p) => ({
        registry: String(p.registry_name ?? p.registry ?? ""),
        name: String(p.name ?? ""),
        version: String(p.version ?? ""),
      })),
      tools: tools.map((t) => ({
        name: String(t.name ?? ""),
        description: String(t.description ?? ""),
      })),
    };
  });

  return {
    name: String(first.name ?? ""),
    title: String(first.title ?? first.name ?? ""),
    description: String(first.description ?? ""),
    repository: repo?.url ? String(repo.url) : null,
    versions,
  };
}

export async function listServers(
  limit = 20,
  cursor?: string,
  latestOnly = true
): Promise<ListResult> {
  const params = new URLSearchParams({
    limit: String(Math.min(limit, 100)),
    ...(latestOnly ? { latest_only: "true" } : {}),
    ...(cursor ? { cursor } : {}),
  });
  const res = await fetch(`${REGISTRY_BASE}/servers?${params}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Registry API error: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as {
    servers?: RegistryItem[];
    metadata?: { nextCursor?: string };
  };
  return {
    servers: (data.servers ?? []).map(extractSummary),
    next_cursor: data.metadata?.nextCursor ?? null,
  };
}
