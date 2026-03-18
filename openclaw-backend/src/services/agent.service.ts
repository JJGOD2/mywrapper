// src/services/agent.service.ts
// 核心 Agent 呼叫服務：接收使用者訊息 → 呼叫 Claude → 回傳回覆
import { prisma } from "@/db/client";
import { decryptSecret } from "@/lib/crypto";

export interface AgentInvokeInput {
  workspaceId: string;
  agentId:     string;
  userId:      string;           // platform user id (LINE uid / Telegram id)
  platform:    string;           // "LINE" | "TELEGRAM" | "SLACK" ...
  text:        string;
  replyToken?: string;           // LINE reply token (if applicable)
  sessionId?:  string;           // for conversation memory
}

export interface AgentInvokeResult {
  reply:       string;
  shouldQueue: boolean;          // true = 需要人工審核才能發送
  queueId?:    string;
  toolsUsed:   string[];
}

export async function invokeAgent(input: AgentInvokeInput): Promise<AgentInvokeResult> {
  // 1. Load agent + workspace + secrets
  const agent = await prisma.agent.findUnique({
    where: { id: input.agentId },
    include: {
      workspace: true,
      toolBindings: { include: { tool: true } },
    },
  });
  if (!agent) throw new Error(`Agent ${input.agentId} not found`);

  // 2. Load Anthropic API key for this workspace
  const secretRow = await prisma.secret.findUnique({
    where: { workspaceId_name: { workspaceId: input.workspaceId, name: "ANTHROPIC_API_KEY" } },
  });
  if (!secretRow) throw new Error("ANTHROPIC_API_KEY not configured for workspace");

  const apiKey = secretRow.encryptedValue.startsWith("PLACEHOLDER")
    ? process.env.ANTHROPIC_API_KEY ?? ""          // fallback to env in dev
    : decryptSecret(secretRow.encryptedValue);

  // 3. Determine if high-risk tools require approval
  const highRiskTools = agent.toolBindings.filter(
    (tb) => tb.tool.requireApproval && tb.tool.risk === "HIGH"
  );

  // 4. Build system prompt
  const systemPrompt = [
    agent.systemPrompt || `你是 ${agent.name}，${agent.role}。`,
    `使用者平台：${input.platform}`,
    `可用工具：${agent.toolBindings.map((tb) => tb.tool.name).join(", ") || "無"}`,
    "請用繁體中文回覆，語氣自然親切。",
  ].join("\n");

  // 5. Call Claude
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   [{ role: "user", content: input.text }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  const reply = data.content?.[0]?.text ?? "（無回應）";

  // 6. Check if requires human review (high-risk tools involved or keyword match)
  const needsReview = highRiskTools.length > 0 && /退款|取消|刪除|退貨/.test(input.text);

  // 7. Log the exchange
  await prisma.logEntry.create({
    data: {
      workspaceId: input.workspaceId,
      type:        "CHAT",
      message:     `[${input.platform}] ${input.userId} → ${agent.name}：「${input.text.slice(0, 80)}」→ 回覆已產生`,
      metadata:    { agentId: input.agentId, platform: input.platform, needsReview },
    },
  });

  // 8. If review needed, create review queue entry
  let queueId: string | undefined;
  if (needsReview) {
    const review = await prisma.reviewQueue.create({
      data: {
        workspaceId:  input.workspaceId,
        agentId:      input.agentId,
        platform:     input.platform,
        userId:       input.userId,
        userMessage:  input.text,
        aiDraft:      reply,
        replyToken:   input.replyToken,
        status:       "PENDING",
      },
    });
    queueId = review.id;
  }

  return {
    reply,
    shouldQueue: needsReview,
    queueId,
    toolsUsed: agent.toolBindings.map((tb) => tb.tool.name),
  };
}
