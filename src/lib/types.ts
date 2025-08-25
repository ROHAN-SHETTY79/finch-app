export type Row = Record<string, string | number | null>;
export type RowsResponse = { rows: Row[]; template?: string; params?: Record<string, any> };
export type AgentAskResp = {
  plan: { intent: string; params: Record<string, any>; followups?: string[] };
  called: { path: string; body: Record<string, any> };
  message: string;
  data: any;
  followups?: string[];
};
