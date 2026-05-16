const REGISTRY_BASE = "https://registry.modelcontextprotocol.io/v0";

export interface ServerSummary {
  name: string;
  description: string;
  endpoint: string | null;
  transport: string | null;
  repository: string | null;
  status: string | null;
}

export interface ServerDetail {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  repository: {
    url: string;
    source: string;
    id: string;
  } | null;
  versions: Array<{
    version: string;
    release_date: string;
    is_latest: boolean;
    packages: Array<{
      registry_name: string;
      name: string;
      version: string;
      package_arguments: unknown[];
      environment_variables: Array<{
        name: string;
        description: string;
        required: boolean;
      }>;
    }>;
    tools: Array<{
      name: string;
      description: string;
      input_schema: unknown;
    }>;
  }>;
}

export interface ListResult {
  servers: ServerSummary[];
  next_cursor: string | null;
}

function extractSummary(server: Record<string, unknown>): ServerSummary {
  const versions = server.versions as Array<Record<string, unknown>> | undefined;
  const latest = versions?.find(
    (v) => (v as Record<string, unknown>).is_latest
  ) ?? versions?.[0];
  const packages = latest
    ? (latest.packages as Array<Record<string, unknown>> | undefined) ?? []
    : [];
  const firstPkg = packages[0] as Record<string, unknown> | undefined;

  return {
    name: String(server.name ?? ""),
    description: String(server.description ?? ""),
    endpoint: firstPkg
      ? String(firstPkg.name ?? "")
      : null,
    transport: firstPkg
      ? String(firstPkg.registry_name ?? "")
      : null,
    repository:
      server.repository && typeof server.repository === "object"
        ? String((server.repository as Record<string, unknown>).url ?? "")
        : null,
    status: latest ? String((latest as Record<string, unknown>).version ?? "") : null,
  };
}

export async function searchRegistry(
  query: string,
  limit = 10,
  latestOnly = true
): Promise<ServerSummary[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(Math.min(limit, 100)),
    ...(latestOnly ? { latest_only: "true" } : {}),
  });
  const res = await fetch(`${REGISTRY_BASE}/servers?${params}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Registry API error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as {
    servers?: Array<Record<string, unknown>>;
  };
  return (data.servers ?? []).map(extractSummary);
}

export async function getServerDetails(name: string): Promise<ServerDetail> {
  const encoded = encodeURIComponent(name);
  const res = await fetch(`${REGISTRY_BASE}/servers/${encoded}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Server not found: ${name}`);
    }
    throw new Error(`Registry API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<ServerDetail>;
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
  if (!res.ok) {
    throw new Error(`Registry API error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as {
    servers?: Array<Record<string, unknown>>;
    next_cursor?: string | null;
  };
  return {
    servers: (data.servers ?? []).map(extractSummary),
    next_cursor: data.next_cursor ?? null,
  };
}
