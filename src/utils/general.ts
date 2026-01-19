export function safeId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function formatMs(ms: number) {
  if (!Number.isFinite(ms)) return "—";
  const rounded = Math.max(0, Math.round(ms));
  if (rounded < 1000) return `${rounded}ms`;
  return `${(rounded / 1000).toFixed(2)}s`;
}
