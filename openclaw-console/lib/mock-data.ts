import type {
  Workspace, Agent, Channel, Tool, Skill,
  SecurityAuditItem, Secret, LogEntry, UsageSummary, Integration,
} from "@/types";

// ─── Workspaces ──────────────────────────────────────────────
export const workspaces: Workspace[] = [
  {
    id: "ws-a",
    name: "電商客服",
    client: "客戶 A",
    plan: "Pro",
    status: "active",
    agentCount: 2,
    channelCount: 3,
    toolCount: 14,
    todayMessages: 643,
    monthCostNTD: 1240,
    usagePercent: 62,
    createdAt: "2026-01-15",
    secretCount: 4,
  },
  {
    id: "ws-b",
    name: "房仲業務",
    client: "客戶 B",
    plan: "Pro",
    status: "active",
    agentCount: 2,
    channelCount: 2,
    toolCount: 8,
    todayMessages: 312,
    monthCostNTD: 980,
    usagePercent: 38,
    createdAt: "2026-02-03",
    secretCount: 3,
  },
  {
    id: "ws-c",
    name: "醫療診所",
    client: "客戶 C",
    plan: "Starter",
    status: "setting",
    agentCount: 1,
    channelCount: 1,
    toolCount: 4,
    todayMessages: 88,
    monthCostNTD: 620,
    usagePercent: 14,
    createdAt: "2026-03-01",
    secretCount: 2,
  },
];

// ─── Agents ──────────────────────────────────────────────────
export const agents: Agent[] = [
  {
    id: "agent-aria",
    name: "客服 Aria",
    initials: "AR",
    avatarColor: "bg-brand-50 text-brand-600",
    role: "電商客服",
    workspaceId: "ws-a",
    workspaceName: "客戶 A",
    status: "enabled",
    description: "處理訂單查詢、退換貨申請、商品問題回覆，語氣親切有禮。",
    channels: ["LINE OA", "Telegram", "Slack"],
    tools: ["order-lookup", "refund-request", "product-search", "google-sheets"],
    todayConversations: 643,
    tokenUsage: "128k",
  },
  {
    id: "agent-rex",
    name: "業務 Rex",
    initials: "RX",
    avatarColor: "bg-teal-50 text-teal-700",
    role: "房仲業務",
    workspaceId: "ws-b",
    workspaceName: "客戶 B",
    status: "enabled",
    description: "協助帶看預約、物件說明、初步資格確認，轉介業務同仁接手。",
    channels: ["LINE OA", "Telegram"],
    tools: ["calendar-book", "property-db", "crm-lookup"],
    todayConversations: 312,
    tokenUsage: "64k",
  },
  {
    id: "agent-nora",
    name: "行政 Nora",
    initials: "NO",
    avatarColor: "bg-blue-50 text-blue-700",
    role: "內部行政",
    workspaceId: "ws-a",
    workspaceName: "客戶 A",
    status: "enabled",
    description: "會議摘要、行程安排、Google Calendar 操作、內部通知發送。",
    channels: ["Slack", "Google Chat"],
    tools: ["gcal-write", "gmail-draft", "notion-write"],
    todayConversations: 204,
    tokenUsage: "41k",
  },
  {
    id: "agent-luna",
    name: "診所 Luna",
    initials: "LU",
    avatarColor: "bg-purple-50 text-purple-700",
    role: "診所接待",
    workspaceId: "ws-c",
    workspaceName: "客戶 C",
    status: "standby",
    description: "門診預約、看診提醒、基本衛教問答，複雜問題轉真人。",
    channels: ["LINE OA"],
    tools: ["appointment-book", "patient-lookup"],
    todayConversations: 88,
    tokenUsage: "17k",
  },
];

// ─── Channels ────────────────────────────────────────────────
export const channels: Channel[] = [
  {
    id: "ch-line",
    type: "line",
    displayName: "LINE Official Account",
    handle: "@openclaw_demo",
    workspaces: ["客戶 A"],
    status: "connected",
    enabled: true,
    todayMessages: 892,
    policy: {
      assignedAgent: "客服 Aria",
      allowlistCount: 12,
      dmScope: "restricted",
      groupEnabled: true,
    },
  },
  {
    id: "ch-tg",
    type: "telegram",
    displayName: "Telegram",
    handle: "@aria_bot",
    workspaces: ["客戶 A", "客戶 B"],
    status: "connected",
    enabled: true,
    todayMessages: 245,
  },
  {
    id: "ch-slack",
    type: "slack",
    displayName: "Slack",
    handle: "acme-corp workspace",
    workspaces: ["客戶 A"],
    status: "connected",
    enabled: true,
    todayMessages: 87,
  },
  {
    id: "ch-discord",
    type: "discord",
    displayName: "Discord",
    handle: "Demo Server",
    workspaces: ["客戶 A"],
    status: "testing",
    enabled: false,
    todayMessages: 23,
  },
];

// ─── Tools ───────────────────────────────────────────────────
export const tools: Tool[] = [
  { id: "t1", name: "order-lookup",    risk: "low",    execCount: 1204, enabled: true,  requireApproval: false },
  { id: "t2", name: "google-sheets",  risk: "medium", execCount: 423,  enabled: true,  requireApproval: false },
  { id: "t3", name: "refund-request", risk: "high",   execCount: 87,   enabled: true,  requireApproval: true  },
  { id: "t4", name: "calendar-book",  risk: "medium", execCount: 56,   enabled: true,  requireApproval: false },
  { id: "t5", name: "crm-lookup",     risk: "low",    execCount: 312,  enabled: true,  requireApproval: false },
  { id: "t6", name: "property-db",    risk: "low",    execCount: 198,  enabled: true,  requireApproval: false },
  { id: "t7", name: "gmail-draft",    risk: "medium", execCount: 44,   enabled: true,  requireApproval: true  },
  { id: "t8", name: "notion-write",   risk: "medium", execCount: 30,   enabled: false, requireApproval: false },
];

// ─── Skills ──────────────────────────────────────────────────
export const skills: Skill[] = [
  { id: "s1", name: "line-oa-adapter",    version: "1.2.0", risk: "low",    status: "enabled",  source: "official", installedAt: "2026-01-15" },
  { id: "s2", name: "google-sheets-skill",version: "0.9.1", risk: "medium", status: "enabled",  source: "official", installedAt: "2026-01-20" },
  { id: "s3", name: "notion-sync",        version: "0.5.0", risk: "low",    status: "pending",  source: "community",installedAt: "2026-03-10" },
  { id: "s4", name: "human-handoff",      version: "1.0.2", risk: "medium", status: "enabled",  source: "official", installedAt: "2026-02-01" },
  { id: "s5", name: "web-search-skill",   version: "2.1.0", risk: "high",   status: "disabled", source: "community",installedAt: "2026-02-15" },
];

// ─── Security ────────────────────────────────────────────────
export const auditItems: SecurityAuditItem[] = [
  {
    id: "sec1",
    title: "Gateway bind 未設定 loopback-only",
    description: "高風險：Gateway 對外暴露，建議設定 127.0.0.1 綁定",
    result: "fail",
    actionLabel: "立即修正",
  },
  {
    id: "sec2",
    title: "Inbound DM scope 未限制",
    description: "中風險：Telegram 私訊未設限，建議啟用 DM scope 限制",
    result: "warn",
    actionLabel: "設定",
  },
  {
    id: "sec3",
    title: "Pairing token 已安全化",
    description: "符合官方建議，token 已加密儲存",
    result: "pass",
  },
  {
    id: "sec4",
    title: "Skills 來源已審核",
    description: "所有啟用 skills 均已完成來源驗證",
    result: "pass",
  },
  {
    id: "sec5",
    title: "Workspace secrets 隔離",
    description: "各 Workspace API keys 獨立存放，無交叉存取",
    result: "pass",
  },
];

export const secrets: Secret[] = [
  { id: "sec-k1", name: "ANTHROPIC_API_KEY",    workspaceId: "ws-a", status: "ok",      lastUpdated: "2026-02-01" },
  { id: "sec-k2", name: "LINE_CHANNEL_SECRET",  workspaceId: "ws-a", status: "ok",      lastUpdated: "2026-01-15" },
  { id: "sec-k3", name: "TELEGRAM_BOT_TOKEN",   workspaceId: "ws-ab",status: "ok",      lastUpdated: "2026-02-03" },
  { id: "sec-k4", name: "GOOGLE_SHEETS_KEY",    workspaceId: "ws-a", status: "expiring",lastUpdated: "2025-12-01" },
];

// ─── Logs ────────────────────────────────────────────────────
export const logs: LogEntry[] = [
  { id: "l1",  time: "09:14:32", type: "error",  workspaceId: "ws-a", message: "[Workspace A] google-sheets tool — Connection timeout after 5000ms (retry 3/3 failed)" },
  { id: "l2",  time: "09:12:08", type: "chat",   workspaceId: "ws-a", message: "[Workspace A · LINE] user_8821 → Aria：「我的訂單 #20240918 什麼時候到？」→ order-lookup executed → 回覆發送" },
  { id: "l3",  time: "09:10:44", type: "tool",   workspaceId: "ws-b", message: "[Workspace B · Telegram] Rex → calendar-book：預約帶看 2026-03-20 14:00 成功" },
  { id: "l4",  time: "08:52:21", type: "warn",   workspaceId: "ws-a", message: "[Workspace A · LINE] 非 allowlist sender user_9102 嘗試傳訊，已攔截記錄" },
  { id: "l5",  time: "08:47:05", type: "chat",   workspaceId: "ws-b", message: "[Workspace B · Telegram] user_3341 → Rex：「請問信義區有沒有 3 房物件？」→ property-db executed → 回覆發送" },
  { id: "l6",  time: "08:30:00", type: "system", workspaceId: "ws-a", message: "OpenClaw Gateway health check passed · all channels connected · version 0.14.2" },
  { id: "l7",  time: "08:15:10", type: "tool",   workspaceId: "ws-a", message: "[Workspace A · LINE] Aria → refund-request：訂單 #20240910 退款申請送出，等待人工確認" },
  { id: "l8",  time: "08:00:05", type: "system", workspaceId: "ws-a", message: "每日 Config 備份完成 · 3 workspaces · 備份路徑 /backups/2026-03-18" },
  { id: "l9",  time: "07:30:12", type: "warn",   workspaceId: "ws-c", message: "[Security Audit] gateway bind 未設定 loopback-only，請儘速修正" },
  { id: "l10", time: "07:00:00", type: "system", workspaceId: "ws-a", message: "Token 用量日報：昨日合計 82k tokens · 估算成本 NT$98" },
];

// ─── Usage ───────────────────────────────────────────────────
export const usage: UsageSummary = {
  totalTokens: "2.4M",
  estimatedCostNTD: 2840,
  totalApiCalls: 18247,
  avgDailyMessages: 1104,
  budgetRemainingPercent: 64,
  byWorkspace: [
    { name: "客戶 A",   tokens: "1.6M", percent: 66 },
    { name: "客戶 B",   tokens: "650k", percent: 27 },
    { name: "客戶 C",   tokens: "150k", percent: 7  },
  ],
  byChannel: [
    { name: "LINE OA",  count: 892, percent: 72 },
    { name: "Telegram", count: 245, percent: 20 },
    { name: "Slack",    count: 87,  percent: 7  },
    { name: "Discord",  count: 23,  percent: 2  },
  ],
};

// ─── Integrations ────────────────────────────────────────────
export const integrations: Integration[] = [
  { id: "i1", name: "LINE OA",        initial: "L", colorClass: "bg-brand-50 text-brand-600",   status: "connected",  description: "@openclaw_demo · 892 今日訊息" },
  { id: "i2", name: "Google Sheets",  initial: "G", colorClass: "bg-green-50 text-green-700",   status: "reconnect",  description: "Service Account 憑證即將過期" },
  { id: "i3", name: "Notion",         initial: "N", colorClass: "bg-purple-50 text-purple-700", status: "pending",    description: "notion-sync skill 等待 admin 審核" },
  { id: "i4", name: "Gmail",          initial: "M", colorClass: "bg-blue-50 text-blue-700",     status: "inactive",   description: "草稿發送 · 收件摘要" },
  { id: "i5", name: "Google Calendar",initial: "C", colorClass: "bg-blue-50 text-blue-700",     status: "inactive",   description: "預約管理 · 行程同步" },
  { id: "i6", name: "Webhook",        initial: "W", colorClass: "bg-gray-50 text-gray-600",     status: "inactive",   description: "自訂 HTTP webhook 推送" },
];
