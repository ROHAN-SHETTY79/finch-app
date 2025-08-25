export const DJANGO_API_BASE =
  process.env.NEXT_PUBLIC_DJANGO_API_BASE || "http://localhost:8000";

export const AGENT_BASE = process.env.NEXT_PUBLIC_AGENT_BASE || DJANGO_API_BASE;

export async function postJSON<T>(url: string, body: any): Promise<T> {
  console.log("url", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok)
    throw new Error(`POST ${url} failed: ${res.status} ${await res.text()}`);
  return res.json();
}
