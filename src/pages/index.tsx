import * as React from "react";
import { DJANGO_API_BASE, AGENT_BASE } from "../lib/api";
import { RowsResponse } from "../lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

export default function FinchPage() {
  const [apiBase, setApiBase] = React.useState<string>(DJANGO_API_BASE);
  const [agentBase, setAgentBase] = React.useState<string>(AGENT_BASE);
  const [companyId, setCompanyId] = React.useState<number>(1);

  // params
  const [minDays, setMinDays] = React.useState<string>("30");
  const [limit, setLimit] = React.useState<string>("10");
  const [asOf, setAsOf] = React.useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [revShift, setRevShift] = React.useState<string>("0");
  const [expShift, setExpShift] = React.useState<string>("0");

  // state
  const [loading, setLoading] = React.useState<string | null>(null);
  const [arRows, setArRows] = React.useState<any[]>([]);
  const [apRows, setApRows] = React.useState<any[]>([]);
  const [cashRow, setCashRow] = React.useState<any | null>(null);
  const [runwayRow, setRunwayRow] = React.useState<any | null>(null);
  const [dups, setDups] = React.useState<any[]>([]);
  const [outliers, setOutliers] = React.useState<any[]>([]);

  async function call<T>(path: string, body: any): Promise<T> {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  }

  const fetchAR = async () => {
    setLoading("ar");
    try {
      const data = await call<RowsResponse>("/api/query/ar", {
        company_id: companyId,
        min_days_overdue: Number(minDays || 0),
        limit: Number(limit || 10),
      });
      setArRows(data.rows || []);
    } catch (e: any) {
      toast(e.message);
    } finally {
      setLoading(null);
    }
  };

  const fetchAP = async () => {
    setLoading("ap");
    try {
      const data = await call<RowsResponse>("/api/query/ap", {
        company_id: companyId,
        min_days_overdue: Number(minDays || 0),
        limit: Number(limit || 10),
      });
      setApRows(data.rows || []);
    } catch (e: any) {
      toast(e.message);
    } finally {
      setLoading(null);
    }
  };

  const fetchCash = async () => {
    setLoading("cash");
    try {
      const data = await call<RowsResponse>("/api/query/cash", {
        as_of_date: asOf,
      });
      setCashRow((data.rows || [])[0] || null);
    } catch (e: any) {
      toast(e.message);
    } finally {
      setLoading(null);
    }
  };

  const fetchRunway = async () => {
    setLoading("runway");
    try {
      const data = await call<RowsResponse>("/api/query/runway", {
        horizon_days: 90,
        rev_shift_pct: Number(revShift || 0),
        exp_shift_pct: Number(expShift || 0),
      });
      setRunwayRow((data.rows || [])[0] || null);
    } catch (e: any) {
      toast(e.message);
    } finally {
      setLoading(null);
    }
  };

  const fetchAnomalies = async () => {
    setLoading("anoms");
    try {
      const d1 = await call<RowsResponse>("/api/query/anomalies/duplicates", {
        company_id: companyId,
        lookback_days: 60,
      });
      const d2 = await call<RowsResponse>(
        "/api/query/anomalies/vendor_outliers",
        {
          company_id: companyId,
          lookback_days: 60,
          threshold_multiplier: 3,
        }
      );
      setDups(d1.rows || []);
      setOutliers(d2.rows || []);
    } catch (e: any) {
      toast(e.message);
    } finally {
      setLoading(null);
    }
  };

  const money = (n: any) =>
    n == null
      ? "—"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(Number(n));

  return (
    <div className="h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6 h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Finch for AI Accountant</h1>
            <p className="text-muted-foreground text-sm">
              Conversational finance agent UI
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder="Django API Base"
              className="w-72"
            />
            <Input
              value={agentBase}
              onChange={(e) => setAgentBase(e.target.value)}
              placeholder="Agent Base"
              className="w-72"
            />
            <Select
              defaultValue="1"
              onValueChange={(v) => setCompanyId(Number(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Company 1</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
          </div>
        </div>

        <Tabs defaultValue="chat" className="h-full w-full border">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="dash">Dashboard</TabsTrigger>
          </TabsList>

          {/* CHAT */}
          <TabsContent value="chat">
            <Card className=" h-full ">
              <CardHeader>
                <CardTitle>Conversational Agent</CardTitle>
              </CardHeader>
              <CardContent className=" h-full">
                {/* <AgentChat agentBase={agentBase} companyId={companyId} /> */}
                <AgentChat
                  agentBase={agentBase}
                  apiBase={apiBase}
                  companyId={companyId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* DASHBOARD */}
          <TabsContent value="dash">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aging Params</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="w-24">Min days</Label>
                    <Input
                      value={minDays}
                      onChange={(e) => setMinDays(e.target.value)}
                      className="w-24"
                    />
                    <Label className="w-16">Limit</Label>
                    <Input
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      className="w-24"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={fetchAR} disabled={loading === "ar"}>
                      {loading === "ar" ? "Working…" : "Fetch AR"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={fetchAP}
                      disabled={loading === "ap"}
                    >
                      {loading === "ap" ? "Working…" : "Fetch AP"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cash Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="w-24">As of</Label>
                    <Input
                      type="date"
                      value={asOf}
                      onChange={(e) => setAsOf(e.target.value)}
                      className="w-48"
                    />
                    <Button onClick={fetchCash} disabled={loading === "cash"}>
                      {loading === "cash" ? "Working…" : "Get Cash"}
                    </Button>
                  </div>
                  <div className="text-sm">
                    {cashRow ? (
                      <>
                        As of <b>{cashRow.as_of_date}</b>:{" "}
                        <b>{money(cashRow.cash_balance)}</b>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        No data yet.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Runway What-If</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="w-16">Rev %</Label>
                    <Input
                      value={revShift}
                      onChange={(e) => setRevShift(e.target.value)}
                      className="w-24"
                    />
                    <Label className="w-16">Exp %</Label>
                    <Input
                      value={expShift}
                      onChange={(e) => setExpShift(e.target.value)}
                      className="w-24"
                    />
                    <Button
                      onClick={fetchRunway}
                      disabled={loading === "runway"}
                    >
                      {loading === "runway" ? "Working…" : "Compute"}
                    </Button>
                  </div>
                  <div className="text-sm">
                    {runwayRow ? (
                      <>
                        Cash: <b>{money(runwayRow.current_cash)}</b> · Estimated
                        runway: <b>{runwayRow.est_days_of_runway} days</b>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        No data yet.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AR Aging Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <RowsTable rows={arRows} empty="Run Fetch AR to load data" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AP Due Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <RowsTable rows={apRows} empty="Run Fetch AP to load data" />
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle>Anomalies</CardTitle>
                    <Button
                      onClick={fetchAnomalies}
                      disabled={loading === "anoms"}
                    >
                      {loading === "anoms" ? "Working…" : "Refresh"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Duplicate Payments</h4>
                    <RowsTable rows={dups} empty="No duplicates found" />
                  </div>
                  <div>
                    <h4 className="font-medium my-2">Vendor Outliers</h4>
                    <RowsTable rows={outliers} empty="No outliers found" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Runway Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Served by Django: <code>/api/query/runway_chart</code>
                  </p>
                  <img
                    src={`${apiBase}/api/query/runway_chart`}
                    className="w-full rounded border"
                    alt="Runway Chart"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/** Minimal table with shadcn primitives */
function RowsTable({ rows, empty }: { rows: any[]; empty?: string }) {
  if (!rows || rows.length === 0)
    return (
      <div className="text-sm text-muted-foreground">{empty ?? "No data"}</div>
    );
  const cols = Object.keys(rows[0] || {});
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {cols.map((c) => (
            <TableHead key={c} className="whitespace-nowrap">
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            {cols.map((c) => (
              <TableCell key={c} className="whitespace-nowrap">
                {String(r[c] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type AgentAskResp = {
  message?: string;
  data?: any;
  context?: any;
  followups?: string[];
};

type ChatMsg = {
  role: "user" | "agent";
  content: string;
  chartUrlAbs?: string | null; // absolute URL for <img> (GET)
  csvPathRel?: string | null; // relative path for POST via proxy
};

function AgentChat({
  agentBase,
  apiBase,
  companyId,
}: {
  agentBase: string;
  apiBase: string;
  companyId: number;
}) {
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msgs, setMsgs] = React.useState<ChatMsg[]>([]);
  const [lastContext, setLastContext] = React.useState<any | null>(null);
  const [lastFollowups, setLastFollowups] = React.useState<string[]>([]);

  const agentAskPath = `/api/agent/ask`; // Next proxy

  function absolutize(pathOrUrl: string, base: string) {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const b = base.replace(/\/+$/, "");
    const p = pathOrUrl.startsWith("/api/")
      ? pathOrUrl
      : pathOrUrl.startsWith("/")
      ? `/api${pathOrUrl}`
      : `/api/${pathOrUrl}`;
    return `${b}${p}`;
  }

  function looksLikeFollowup(s: string): boolean {
    const t = s.trim().toLowerCase();
    if (!t) return false;
    const AFFIRM = [
      "y",
      "yes",
      "yeah",
      "yup",
      "sure",
      "ok",
      "okay",
      "please",
      "do it",
      "go ahead",
    ];
    if (AFFIRM.includes(t)) return true;
    const HINTS = [
      "detail",
      "details",
      "report",
      "list",
      "show",
      "view",
      "csv",
      "export",
      "download",
      "chart",
      "png",
      "image",
      "graph",
      "compare",
      "last week",
      "week",
      "draft",
      "send",
    ];
    return HINTS.some((k) => t.includes(k));
  }

  async function callAgent(userText: string, context?: any) {
    setBusy(true);
    try {
      const res = await fetch(agentAskPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userText,
          company_id: companyId,
          ...(context ? { context } : {}),
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Agent request failed (${res.status})`);
      }

      const data: AgentAskResp = await res.json();

      // IMPORTANT:
      // - images: use absolute URL for <img> (data.chart_url)
      // - csv: keep relative path (data.csv_url) to POST via Next proxy with lastContext.last_params
      const agentMsg: ChatMsg = {
        role: "agent",
        content: data?.message ?? "(no message)",
        chartUrlAbs: data?.data?.chart_url
          ? absolutize(String(data.data.chart_url), apiBase)
          : null,
        csvPathRel: data?.data?.csv_url
          ? String(data.data.csv_url) // e.g. "/api/export/ar_csv"
          : null,
      };

      setMsgs((m) => [...m, agentMsg]);
      setLastContext(data?.context ?? null);
      setLastFollowups(Array.isArray(data?.followups) ? data.followups : []);
    } catch (e: any) {
      toast(e.message);
      setMsgs((m) => [...m, { role: "agent", content: `Oops: ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  async function downloadCsv(pathRel: string) {
    try {
      // We POST to the Next proxy at the SAME relative path
      // Include last routed params so the backend can reproduce the results
      const body = lastContext?.last_params ?? {};
      const r = await fetch(pathRel, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const msg = await r.text();
        throw new Error(msg || `CSV download failed (${r.status})`);
      }

      const ct = r.headers.get("content-type") || "";
      const blob = await r.blob();

      // filename from Content-Disposition if present
      const cd = r.headers.get("content-disposition") || "";
      const match = /filename="?([^"]+)"?/.exec(cd || "");
      const filename = match?.[1] || "export.csv";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast(e.message);
    }
  }

  async function send() {
    const t = text.trim();
    if (!t) return;

    if (t.toLowerCase() === "reset") {
      setText("");
      setLastContext(null);
      setLastFollowups([]);
      setMsgs((m) => [
        ...m,
        { role: "user", content: t },
        {
          role: "agent",
          content: "Context reset. Ask a new question anytime.",
        },
      ]);
      return;
    }

    setMsgs((m) => [...m, { role: "user", content: t }]);
    setText("");

    const ctx = looksLikeFollowup(t) && lastContext ? lastContext : undefined;
    await callAgent(t, ctx);
  }

  async function sendFollowup(label: string) {
    setMsgs((m) => [...m, { role: "user", content: label }]);
    await callAgent(label, lastContext ?? undefined);
  }

  return (
    <div className="space-y-3">
      <div className="min-h-[90%] overflow-auto border rounded p-3 bg-background">
        {msgs.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Try: “show overdue invoices over 60 days”, “what’s my cash last
            Friday?”, “simulate runway revenue -10 expenses +5”.
          </div>
        )}

        {msgs.map((m, i) => (
          <div
            key={i}
            className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-lg max-w-[90%] break-words ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {m.content}
            </span>

            {m.role === "agent" && (m.chartUrlAbs || m.csvPathRel) && (
              <div className="mt-2 space-y-2">
                {m.chartUrlAbs && (
                  <img
                    src={m.chartUrlAbs}
                    className="w-full rounded border"
                    alt="Chart"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                )}
                {m.csvPathRel && (
                  <div>
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => downloadCsv(m.csvPathRel!)}
                      disabled={busy}
                    >
                      Download CSV
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {lastFollowups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lastFollowups.map((f, i) => (
            <Button
              key={i}
              variant="secondary"
              size="sm"
              onClick={() => sendFollowup(f)}
              disabled={busy}
            >
              {f}
            </Button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask your finance agent…"
          className="min-h-[44px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button onClick={send} disabled={busy} className="shrink-0 self-start">
          Send
        </Button>
      </div>
    </div>
  );
}
