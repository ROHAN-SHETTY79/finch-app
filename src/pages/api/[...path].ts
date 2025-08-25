import type { NextApiRequest, NextApiResponse } from "next";
const DJANGO = process.env.DJANGO_PROXY_BASE || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("it's here")
    // const path = (req.query.path || [])?.join("/");
    console.log("path is", req.query.path)
    const path = Array.isArray(req.query.path) ? req.query.path.join("/") : (req.query.path ?? "");
    const target = `${DJANGO}/api/${path}`;
    console.log("target", target)
    const r = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method === "GET" ? undefined : JSON.stringify(req.body || {}),
    });
    const ct = r.headers.get("content-type") || "";
    res.status(r.status);
    if (ct.includes("application/json")) res.json(await r.json());
    else {
      const buf = Buffer.from(await r.arrayBuffer());
      res.setHeader("Content-Type", ct);
      res.send(buf);
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
