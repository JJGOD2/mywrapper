// lib/api.ts
// 前端統一 API 客戶端 — 把 mock-data 換成真實 fetch 只需改這個檔案

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Auth token helpers (localStorage in browser) ─────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("oc_token");
}
export function setToken(token: string) {
  localStorage.setItem("oc_token", token);
}
export function clearToken() {
  localStorage.removeItem("oc_token");
}

// ── Base fetch ────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "API error");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  me: () => apiFetch<{ id: string; email: string; name: string; role: string }>("/api/auth/me"),
};

// ─────────────────────────────────────────────────────────────
// WORKSPACES
// ─────────────────────────────────────────────────────────────
export const workspaceApi = {
  list: () => apiFetch<WorkspaceRow[]>("/api/workspaces"),
  get:  (id: string) => apiFetch<WorkspaceDetail>(`/api/workspaces/${id}`),
  create: (data: CreateWorkspaceInput) =>
    apiFetch<WorkspaceRow>("/api/workspaces", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateWorkspaceInput>) =>
    apiFetch<WorkspaceRow>(`/api/workspaces/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/workspaces/${id}`, { method: "DELETE" }),
  backup: (id: string, note?: string) =>
    apiFetch<{ id: string }>(`/api/workspaces/${id}/backup`, { method: "POST", body: JSON.stringify({ note }) }),
  listBackups: (id: string) =>
    apiFetch<BackupRow[]>(`/api/workspaces/${id}/backups`),
};

// ─────────────────────────────────────────────────────────────
// AGENTS
// ─────────────────────────────────────────────────────────────
export const agentApi = {
  list: (workspaceId?: string) =>
    apiFetch<AgentRow[]>(`/api/agents${workspaceId ? `?workspaceId=${workspaceId}` : ""}`),
  get:  (id: string) => apiFetch<AgentDetail>(`/api/agents/${id}`),
  create: (data: CreateAgentInput) =>
    apiFetch<AgentRow>("/api/agents", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateAgentInput>) =>
    apiFetch<AgentRow>(`/api/agents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/agents/${id}`, { method: "DELETE" }),
  addTool: (agentId: string, toolId: string) =>
    apiFetch<void>(`/api/agents/${agentId}/tools`, { method: "POST", body: JSON.stringify({ toolId }) }),
  removeTool: (agentId: string, toolId: string) =>
    apiFetch<void>(`/api/agents/${agentId}/tools/${toolId}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// CHANNELS
// ─────────────────────────────────────────────────────────────
export const channelApi = {
  list: (workspaceId?: string) =>
    apiFetch<ChannelRow[]>(`/api/channels${workspaceId ? `?workspaceId=${workspaceId}` : ""}`),
  create: (data: CreateChannelInput) =>
    apiFetch<{ channel: ChannelRow; binding: BindingRow }>("/api/channels", {
      method: "POST", body: JSON.stringify(data),
    }),
  toggle: (id: string, enabled: boolean) =>
    apiFetch<ChannelRow>(`/api/channels/${id}/toggle`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
  updatePolicy: (bindingId: string, data: UpdatePolicyInput) =>
    apiFetch<BindingRow>(`/api/channels/bindings/${bindingId}`, {
      method: "PATCH", body: JSON.stringify(data),
    }),
  addAllowlist: (bindingId: string, senderId: string, note?: string) =>
    apiFetch<AllowlistEntry>(`/api/channels/bindings/${bindingId}/allowlist`, {
      method: "POST", body: JSON.stringify({ senderId, note }),
    }),
  removeAllowlist: (bindingId: string, entryId: string) =>
    apiFetch<void>(`/api/channels/bindings/${bindingId}/allowlist/${entryId}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// TOOLS & SKILLS
// ─────────────────────────────────────────────────────────────
export const toolApi = {
  list:   (workspaceId: string) => apiFetch<ToolRow[]>(`/api/tools?workspaceId=${workspaceId}`),
  toggle: (workspaceId: string, toolId: string, enabled: boolean) =>
    apiFetch<void>(`/api/tools/${workspaceId}/${toolId}/toggle`, {
      method: "PATCH", body: JSON.stringify({ enabled }),
    }),
  listSkills: (workspaceId: string) =>
    apiFetch<SkillRow[]>(`/api/tools/skills?workspaceId=${workspaceId}`),
  reviewSkill: (workspaceId: string, skillId: string, status: "ENABLED" | "DISABLED") =>
    apiFetch<void>(`/api/tools/skills/${workspaceId}/${skillId}/review`, {
      method: "PATCH", body: JSON.stringify({ status }),
    }),
};

// ─────────────────────────────────────────────────────────────
// SECRETS
// ─────────────────────────────────────────────────────────────
export const secretApi = {
  list: (workspaceId: string) =>
    apiFetch<SecretRow[]>(`/api/secrets?workspaceId=${workspaceId}`),
  upsert: (data: UpsertSecretInput) =>
    apiFetch<{ id: string; name: string; status: string }>("/api/secrets", {
      method: "POST", body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/api/secrets/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// SECURITY
// ─────────────────────────────────────────────────────────────
export const securityApi = {
  audit: (workspaceId?: string) =>
    apiFetch<{ score: number; items: AuditItem[] }>(
      `/api/security/audit${workspaceId ? `?workspaceId=${workspaceId}` : ""}`
    ),
  resolve: (auditId: string) =>
    apiFetch<AuditItem>(`/api/security/audit/${auditId}/resolve`, { method: "POST" }),
};

// ─────────────────────────────────────────────────────────────
// LOGS
// ─────────────────────────────────────────────────────────────
export const logApi = {
  list: (params: { workspaceId?: string; type?: string; limit?: number; cursor?: string }) => {
    const q = new URLSearchParams();
    if (params.workspaceId) q.set("workspaceId", params.workspaceId);
    if (params.type)        q.set("type",        params.type);
    if (params.limit)       q.set("limit",       String(params.limit));
    if (params.cursor)      q.set("cursor",      params.cursor);
    return apiFetch<{ items: LogRow[]; nextCursor: string | null }>(`/api/logs?${q}`);
  },
};

// ─────────────────────────────────────────────────────────────
// USAGE
// ─────────────────────────────────────────────────────────────
export const usageApi = {
  get: (workspaceId?: string, days = 30) =>
    apiFetch<{ totals: UsageTotals; records: UsageRecord[] }>(
      `/api/usage?days=${days}${workspaceId ? `&workspaceId=${workspaceId}` : ""}`
    ),
};

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS (mirrors backend Prisma output)
// ─────────────────────────────────────────────────────────────
export interface WorkspaceRow {
  id: string; name: string; client: string;
  plan: string; status: string;
  agentCount: number; channelCount: number; secretCount: number;
  todayMessages: number; monthCostNTD: number;
  createdAt: string;
}
export interface WorkspaceDetail extends WorkspaceRow {
  agents: { id: string; name: string; status: string }[];
  channels: BindingRow[];
  secrets: { id: string; name: string; status: string }[];
}
export interface CreateWorkspaceInput {
  name: string; client: string; plan?: string; gatewayUrl?: string;
}
export interface BackupRow { id: string; note: string | null; createdAt: string; }

export interface AgentRow {
  id: string; name: string; initials: string; role: string;
  description: string; status: string;
  workspaceId: string; workspaceName: string;
  tools: string[]; channels: string[];
}
export interface AgentDetail extends AgentRow {
  systemPrompt: string;
  promptTemplates: { id: string; name: string; category: string }[];
}
export interface CreateAgentInput {
  workspaceId: string; name: string; initials: string;
  role: string; description?: string; systemPrompt?: string; status?: string;
}

export interface ChannelRow {
  id: string; type: string; displayName: string; handle: string;
  status: string; enabled: boolean;
  bindings?: BindingRow[];
}
export interface BindingRow {
  id: string; workspaceId: string; channelId: string;
  defaultAgentId: string | null;
  dmScope: string; groupEnabled: boolean; allowlistMode: boolean;
  channel?: ChannelRow;
  allowlist?: AllowlistEntry[];
}
export interface AllowlistEntry { id: string; senderId: string; note: string | null; }
export interface CreateChannelInput {
  workspaceId: string; type: string; displayName: string; handle: string;
  defaultAgentId?: string; dmScope?: string;
}
export interface UpdatePolicyInput {
  defaultAgentId?: string | null; dmScope?: string;
  groupEnabled?: boolean; allowlistMode?: boolean;
}

export interface ToolRow {
  id: string; name: string; risk: string;
  requireApproval: boolean; enabled: boolean; execCount: number;
}
export interface SkillRow {
  id: string; name: string; version: string;
  risk: string; source: string; status: string; reviewedAt: string | null;
}

export interface SecretRow {
  id: string; name: string; maskedValue: string;
  status: string; expiresAt: string | null; lastUpdatedAt: string;
}
export interface UpsertSecretInput {
  workspaceId: string; name: string; value: string; expiresAt?: string;
}

export interface AuditItem {
  id: string; checkId: string; title: string; description: string;
  result: "PASS" | "WARN" | "FAIL"; actionLabel: string | null; resolvedAt: string | null;
}

export interface LogRow {
  id: string; workspaceId: string; type: string;
  message: string; createdAt: string;
}

export interface UsageTotals {
  inputTokens: number; outputTokens: number;
  apiCalls: number; messages: number; toolExecs: number; costNTD: number;
}
export interface UsageRecord {
  id: string; workspaceId: string; date: string;
  inputTokens: number; outputTokens: number;
  apiCalls: number; messages: number; toolExecs: number; costNTD: string;
}

// ─────────────────────────────────────────────────────────────
// REVIEW QUEUE
// ─────────────────────────────────────────────────────────────
export interface ReviewItem {
  id: string; workspaceId: string; agentId: string;
  platform: string; userId: string;
  userMessage: string; aiDraft: string; editedReply: string | null;
  replyToken: string | null; status: string;
  reviewedBy: string | null; reviewedAt: string | null;
  sentAt: string | null; note: string | null; createdAt: string;
  workspace: { client: string; name: string };
}
export interface ReviewListResult {
  items: ReviewItem[];
  nextCursor: string | null;
  counts: { status: string; _count: number }[];
}

export const reviewApi = {
  list: (params: { workspaceId?: string; status?: string; limit?: number; cursor?: string }) => {
    const q = new URLSearchParams();
    if (params.workspaceId) q.set("workspaceId", params.workspaceId);
    if (params.status)      q.set("status",      params.status);
    if (params.limit)       q.set("limit",        String(params.limit));
    if (params.cursor)      q.set("cursor",       params.cursor);
    return apiFetch<ReviewListResult>(`/api/review?${q}`);
  },
  approve:  (id: string) =>
    apiFetch<ReviewItem>(`/api/review/${id}/approve`, { method: "POST" }),
  reject:   (id: string, note?: string) =>
    apiFetch<ReviewItem>(`/api/review/${id}/reject`, { method: "POST", body: JSON.stringify({ note }) }),
  editSend: (id: string, editedReply: string, note?: string) =>
    apiFetch<ReviewItem>(`/api/review/${id}/edit-send`, { method: "POST", body: JSON.stringify({ editedReply, note }) }),
};

// ─────────────────────────────────────────────────────────────
// GATEWAY
// ─────────────────────────────────────────────────────────────
export interface GatewayStatus {
  gatewayUrl: string; gatewayOnline: boolean;
  lastPushedAt: string | null; validationOk: boolean;
  validationMsg: string | null; rawJson5: string | null;
}

export const gatewayApi = {
  status:   (workspaceId: string) => apiFetch<GatewayStatus>(`/api/gateway/${workspaceId}`),
  preview:  (workspaceId: string) =>
    apiFetch<{ config: object; validation: { ok: boolean; message: string }; preview: string }>(
      `/api/gateway/${workspaceId}/preview`, { method: "POST" }
    ),
  validate: (workspaceId: string) =>
    apiFetch<{ ok: boolean; message: string; config: object }>(
      `/api/gateway/${workspaceId}/validate`, { method: "POST" }
    ),
  push:     (workspaceId: string) =>
    apiFetch<{ ok: boolean; message: string; configPreview: string }>(
      `/api/gateway/${workspaceId}/push`, { method: "POST" }
    ),
  updateUrl:(workspaceId: string, gatewayUrl: string) =>
    apiFetch<{ gatewayUrl: string }>(`/api/gateway/${workspaceId}/url`, {
      method: "PATCH", body: JSON.stringify({ gatewayUrl }),
    }),
};

// ─────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────
export interface TemplateItem {
  id: string; name: string; description: string; category: string;
  content: string; variables: { name: string; description?: string; default?: string }[] | null;
  usageCount: number; isSystem: boolean; createdAt: string;
}
export interface CreateTemplateInput {
  workspaceId?: string; name: string; description?: string;
  category?: string; content: string;
  variables?: { name: string; description?: string; default?: string }[];
}

export const templateApi = {
  list:   (workspaceId?: string, category?: string) => {
    const q = new URLSearchParams();
    if (workspaceId) q.set("workspaceId", workspaceId);
    if (category)    q.set("category",    category);
    return apiFetch<TemplateItem[]>(`/api/templates?${q}`);
  },
  create: (data: CreateTemplateInput) =>
    apiFetch<TemplateItem>("/api/templates", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateTemplateInput>) =>
    apiFetch<TemplateItem>(`/api/templates/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/templates/${id}`, { method: "DELETE" }),
  use: (id: string, variables?: Record<string, string>) =>
    apiFetch<{ rendered: string; original: string }>(`/api/templates/${id}/use`, {
      method: "POST", body: JSON.stringify({ variables }),
    }),
};

// ─────────────────────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────────────────────
export interface AlertRuleItem {
  id: string; name: string; trigger: string; channel: string;
  destination: string; threshold: number | null;
  enabled: boolean; lastFiredAt: string | null; createdAt: string;
}
export interface CreateAlertRuleInput {
  workspaceId?: string; name: string; trigger: string;
  channel: string; destination: string; threshold?: number;
}

export const alertApi = {
  listRules: (workspaceId?: string) =>
    apiFetch<AlertRuleItem[]>(`/api/alerts/rules${workspaceId ? `?workspaceId=${workspaceId}` : ""}`),
  createRule: (data: CreateAlertRuleInput) =>
    apiFetch<AlertRuleItem>("/api/alerts/rules", { method: "POST", body: JSON.stringify(data) }),
  updateRule: (id: string, data: Partial<CreateAlertRuleInput & { enabled: boolean }>) =>
    apiFetch<AlertRuleItem>(`/api/alerts/rules/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteRule: (id: string) =>
    apiFetch<void>(`/api/alerts/rules/${id}`, { method: "DELETE" }),
  testRule:   (id: string) =>
    apiFetch<{ ok: boolean; message: string }>(`/api/alerts/test/${id}`, { method: "POST" }),
  listLogs:   () => apiFetch<{ id: string; ruleId: string; trigger: string; message: string; sentAt: string }[]>("/api/alerts/logs"),
};
