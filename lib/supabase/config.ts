function normalizeEnvValue(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  // Allow values copied with surrounding quotes in env dashboards.
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim() || undefined;
  }

  return trimmed;
}

export function getPublicSupabaseConfig() {
  return {
    url: normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function getServerSupabaseConfig() {
  const publicConfig = getPublicSupabaseConfig();

  return {
    url: publicConfig.url ?? normalizeEnvValue(process.env.SUPABASE_URL),
    anonKey: publicConfig.anonKey ?? normalizeEnvValue(process.env.SUPABASE_ANON_KEY),
  };
}
