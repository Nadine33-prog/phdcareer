/** 只接受 http(s)，避免把备注或 javascript: 渲染成链接。 */
export function asHttpUrl(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}
