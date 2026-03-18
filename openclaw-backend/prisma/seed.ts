// prisma/seed.ts
import { PrismaClient, PlanType, WorkspaceStatus, AgentStatus,
         ChannelType, ChannelStatus, RiskLevel, SkillSource,
         SecretStatus, LogType, AuditResult, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users ──────────────────────────────────────────────────
  const adminPw = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where:  { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", passwordHash: adminPw, name: "Admin", role: UserRole.ADMIN },
  });
  console.log("  ✓ Users");

  // ── Workspaces ─────────────────────────────────────────────
  const wsA = await prisma.workspace.create({
    data: {
      name: "電商客服", client: "客戶 A",
      plan: PlanType.PRO, status: WorkspaceStatus.ACTIVE,
    },
  });
  const wsB = await prisma.workspace.create({
    data: {
      name: "房仲業務", client: "客戶 B",
      plan: PlanType.PRO, status: WorkspaceStatus.ACTIVE,
    },
  });
  const wsC = await prisma.workspace.create({
    data: {
      name: "醫療診所", client: "客戶 C",
      plan: PlanType.STARTER, status: WorkspaceStatus.SETTING,
    },
  });
  console.log("  ✓ Workspaces");

  // ── Agents ─────────────────────────────────────────────────
  const aria = await prisma.agent.create({
    data: {
      workspaceId: wsA.id, name: "客服 Aria", initials: "AR",
      role: "電商客服", status: AgentStatus.ENABLED,
      description: "處理訂單查詢、退換貨申請、商品問題回覆，語氣親切有禮。",
      systemPrompt: "你是電商客服 Aria，專門處理訂單與退換貨問題。請以友善、簡潔的方式回覆顧客。",
    },
  });
  const rex = await prisma.agent.create({
    data: {
      workspaceId: wsB.id, name: "業務 Rex", initials: "RX",
      role: "房仲業務", status: AgentStatus.ENABLED,
      description: "協助帶看預約、物件說明、初步資格確認，轉介業務同仁接手。",
      systemPrompt: "你是房仲業務助理 Rex，協助初步諮詢並安排帶看預約。",
    },
  });
  await prisma.agent.create({
    data: {
      workspaceId: wsA.id, name: "行政 Nora", initials: "NO",
      role: "內部行政", status: AgentStatus.ENABLED,
      description: "會議摘要、行程安排、Google Calendar 操作、內部通知發送。",
      systemPrompt: "你是行政助理 Nora，負責安排行程與內部溝通。",
    },
  });
  await prisma.agent.create({
    data: {
      workspaceId: wsC.id, name: "診所 Luna", initials: "LU",
      role: "診所接待", status: AgentStatus.STANDBY,
      description: "門診預約、看診提醒、基本衛教問答。",
      systemPrompt: "你是診所接待 Luna，協助預約掛號與基本衛教問題。",
    },
  });
  console.log("  ✓ Agents");

  // ── Channels ───────────────────────────────────────────────
  const lineCh = await prisma.channel.create({
    data: {
      type: ChannelType.LINE, displayName: "LINE Official Account",
      handle: "@openclaw_demo", status: ChannelStatus.CONNECTED, enabled: true,
    },
  });
  const tgCh = await prisma.channel.create({
    data: {
      type: ChannelType.TELEGRAM, displayName: "Telegram",
      handle: "@aria_bot", status: ChannelStatus.CONNECTED, enabled: true,
    },
  });
  const slackCh = await prisma.channel.create({
    data: {
      type: ChannelType.SLACK, displayName: "Slack",
      handle: "acme-corp workspace", status: ChannelStatus.CONNECTED, enabled: true,
    },
  });

  // ChannelBinding: wsA ← LINE
  await prisma.channelBinding.create({
    data: {
      workspaceId: wsA.id, channelId: lineCh.id,
      defaultAgentId: aria.id, dmScope: "restricted", groupEnabled: true,
    },
  });
  // wsA + wsB ← Telegram
  await prisma.channelBinding.create({
    data: { workspaceId: wsA.id, channelId: tgCh.id, defaultAgentId: aria.id },
  });
  await prisma.channelBinding.create({
    data: { workspaceId: wsB.id, channelId: tgCh.id, defaultAgentId: rex.id },
  });
  await prisma.channelBinding.create({
    data: { workspaceId: wsA.id, channelId: slackCh.id },
  });
  console.log("  ✓ Channels");

  // ── Tools ──────────────────────────────────────────────────
  const toolDefs = [
    { name: "order-lookup",    risk: RiskLevel.LOW,    requireApproval: false },
    { name: "google-sheets",   risk: RiskLevel.MEDIUM, requireApproval: false },
    { name: "refund-request",  risk: RiskLevel.HIGH,   requireApproval: true  },
    { name: "calendar-book",   risk: RiskLevel.MEDIUM, requireApproval: false },
    { name: "crm-lookup",      risk: RiskLevel.LOW,    requireApproval: false },
    { name: "property-db",     risk: RiskLevel.LOW,    requireApproval: false },
    { name: "gmail-draft",     risk: RiskLevel.MEDIUM, requireApproval: true  },
    { name: "notion-write",    risk: RiskLevel.MEDIUM, requireApproval: false },
  ];
  for (const t of toolDefs) {
    const tool = await prisma.tool.upsert({
      where: { name: t.name }, update: {}, create: t,
    });
    // Enable all tools for wsA
    await prisma.workspaceTool.upsert({
      where:  { workspaceId_toolId: { workspaceId: wsA.id, toolId: tool.id } },
      update: {},
      create: { workspaceId: wsA.id, toolId: tool.id, enabled: t.name !== "notion-write" },
    });
  }
  console.log("  ✓ Tools");

  // ── Skills ─────────────────────────────────────────────────
  const skillDefs = [
    { name: "line-oa-adapter",     version: "1.2.0", risk: RiskLevel.LOW,    source: SkillSource.OFFICIAL },
    { name: "google-sheets-skill", version: "0.9.1", risk: RiskLevel.MEDIUM, source: SkillSource.OFFICIAL },
    { name: "notion-sync",         version: "0.5.0", risk: RiskLevel.LOW,    source: SkillSource.COMMUNITY },
    { name: "human-handoff",       version: "1.0.2", risk: RiskLevel.MEDIUM, source: SkillSource.OFFICIAL },
    { name: "web-search-skill",    version: "2.1.0", risk: RiskLevel.HIGH,   source: SkillSource.COMMUNITY },
  ];
  for (const s of skillDefs) {
    await prisma.skill.upsert({ where: { name: s.name }, update: {}, create: s });
  }
  console.log("  ✓ Skills");

  // ── Secrets ────────────────────────────────────────────────
  // 注意：真實環境請用 encryptSecret() 加密，這裡 seed 用 placeholder
  const secretDefs = [
    { workspaceId: wsA.id, name: "ANTHROPIC_API_KEY",   status: SecretStatus.OK },
    { workspaceId: wsA.id, name: "LINE_CHANNEL_SECRET", status: SecretStatus.OK },
    { workspaceId: wsA.id, name: "TELEGRAM_BOT_TOKEN",  status: SecretStatus.OK },
    { workspaceId: wsA.id, name: "GOOGLE_SHEETS_KEY",   status: SecretStatus.EXPIRING,
      expiresAt: new Date("2026-04-01") },
  ];
  for (const s of secretDefs) {
    await prisma.secret.upsert({
      where:  { workspaceId_name: { workspaceId: s.workspaceId, name: s.name } },
      update: {},
      create: { ...s, encryptedValue: "PLACEHOLDER_ENCRYPTED" },
    });
  }
  console.log("  ✓ Secrets");

  // ── Security Audit ─────────────────────────────────────────
  const auditDefs = [
    { checkId: "gateway-bind",   title: "Gateway bind 未設定 loopback-only", result: AuditResult.FAIL,
      description: "高風險：Gateway 對外暴露，建議設定 127.0.0.1 綁定", actionLabel: "立即修正" },
    { checkId: "dm-scope",       title: "Inbound DM scope 未限制",           result: AuditResult.WARN,
      description: "中風險：Telegram 私訊未設限，建議啟用 DM scope 限制",  actionLabel: "設定" },
    { checkId: "pairing-token",  title: "Pairing token 已安全化",             result: AuditResult.PASS,
      description: "符合官方建議，token 已加密儲存" },
    { checkId: "skill-source",   title: "Skills 來源已審核",                  result: AuditResult.PASS,
      description: "所有啟用 skills 均已完成來源驗證" },
    { checkId: "secret-isolate", title: "Workspace secrets 隔離",             result: AuditResult.PASS,
      description: "各 Workspace API keys 獨立存放，無交叉存取" },
  ];
  for (const a of auditDefs) {
    await prisma.securityAudit.create({ data: a });
  }
  console.log("  ✓ Security Audits");

  // ── Sample Logs ────────────────────────────────────────────
  const logDefs = [
    { workspaceId: wsA.id, type: LogType.ERROR,  message: "[Workspace A] google-sheets tool — Connection timeout after 5000ms (retry 3/3 failed)" },
    { workspaceId: wsA.id, type: LogType.CHAT,   message: "[LINE] user_8821 → Aria：訂單 #20240918 查詢 → order-lookup executed → 回覆發送" },
    { workspaceId: wsB.id, type: LogType.TOOL,   message: "[Telegram] Rex → calendar-book：預約帶看 2026-03-20 14:00 成功" },
    { workspaceId: wsA.id, type: LogType.WARN,   message: "[LINE] 非 allowlist sender user_9102 嘗試傳訊，已攔截記錄" },
    { workspaceId: wsA.id, type: LogType.SYSTEM, message: "OpenClaw Gateway health check passed · version 0.14.2" },
  ];
  await prisma.logEntry.createMany({ data: logDefs });
  console.log("  ✓ Logs");

  // ── Usage Records (past 7 days) ────────────────────────────
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    await prisma.usageRecord.create({
      data: {
        workspaceId: wsA.id, date,
        inputTokens:  50000 + Math.floor(Math.random() * 20000),
        outputTokens: 20000 + Math.floor(Math.random() * 10000),
        apiCalls:     400  + Math.floor(Math.random() * 200),
        messages:     500  + Math.floor(Math.random() * 200),
        toolExecs:    80   + Math.floor(Math.random() * 40),
        costNTD:      85   + Math.floor(Math.random() * 30),
      },
    });
  }
  console.log("  ✓ Usage Records");

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
