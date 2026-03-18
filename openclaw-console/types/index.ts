// ─── Workspace ───────────────────────────────────────────────
export type PlanType = "Starter" | "Pro" | "Business";
export type StatusType = "active" | "setting" | "paused" | "error";

export interface Workspace {
  id: string;
  name: string;
  client: string;
  plan: PlanType;
  status: StatusType;
  agentCount: number;
  channelCount: number;
  toolCount: number;
  todayMessages: number;
  monthCostNTD: number;
  usagePercent: number;
  createdAt: string;
  secretCount: number;
}

// ─── Agent ───────────────────────────────────────────────────
export type AgentStatus = "enabled" | "disabled" | "standby";

export interface Agent {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  workspaceId: string;
  workspaceName: string;
  status: AgentStatus;
  description: string;
  channels: string[];
  tools: string[];
  todayConversations: number;
  tokenUsage: string;
}

// ─── Channel ─────────────────────────────────────────────────
export type ChannelStatus = "connected" | "testing" | "disconnected" | "error";
export type ChannelType = "line" | "telegram" | "slack" | "discord" | "teams" | "googlechat" | "whatsapp";

export interface Channel {
  id: string;
  type: ChannelType;
  displayName: string;
  handle: string;
  workspaces: string[];
  status: ChannelStatus;
  enabled: boolean;
  todayMessages: number;
  policy?: ChannelPolicy;
}

export interface ChannelPolicy {
  assignedAgent: string;
  allowlistCount: number;
  dmScope: "restricted" | "open";
  groupEnabled: boolean;
}

// ─── Tools & Skills ──────────────────────────────────────────
export type RiskLevel = "low" | "medium" | "high";

export interface Tool {
  id: string;
  name: string;
  risk: RiskLevel;
  execCount: number;
  enabled: boolean;
  requireApproval: boolean;
}

export interface Skill {
  id: string;
  name: string;
  version: string;
  risk: RiskLevel;
  status: "enabled" | "disabled" | "pending";
  source: string;
  installedAt: string;
}

// ─── Security ────────────────────────────────────────────────
export type AuditResult = "pass" | "warn" | "fail";

export interface SecurityAuditItem {
  id: string;
  title: string;
  description: string;
  result: AuditResult;
  actionLabel?: string;
}

export interface Secret {
  id: string;
  name: string;
  workspaceId: string;
  status: "ok" | "expiring" | "expired";
  lastUpdated: string;
}

// ─── Logs ────────────────────────────────────────────────────
export type LogType = "chat" | "tool" | "error" | "warn" | "system";

export interface LogEntry {
  id: string;
  time: string;
  type: LogType;
  workspaceId: string;
  message: string;
}

// ─── Usage ───────────────────────────────────────────────────
export interface UsageSummary {
  totalTokens: string;
  estimatedCostNTD: number;
  totalApiCalls: number;
  avgDailyMessages: number;
  budgetRemainingPercent: number;
  byWorkspace: { name: string; tokens: string; percent: number }[];
  byChannel: { name: string; count: number; percent: number }[];
}

// ─── Integration ─────────────────────────────────────────────
export type IntegrationStatus = "connected" | "reconnect" | "pending" | "inactive";

export interface Integration {
  id: string;
  name: string;
  initial: string;
  colorClass: string;
  status: IntegrationStatus;
  description: string;
}
