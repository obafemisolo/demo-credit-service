export function requireEnv(name: string, fallback?: string) {
  const value = process.env[name];
  if (value && value.trim().length > 0) {
    return value.trim();
  }
  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export function requireNumberEnv(name: string, fallback: number): number {
  const value = requireEnv(name, String(fallback));
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }

  return parsed;
}
