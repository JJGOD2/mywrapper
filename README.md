# OpenClaw 商業控制台

把 OpenClaw 從工程師能用的自架 agent，包成企業敢用、營運看得懂、客戶願意付月費的控制台。

---

## 專案結構

```
openclaw-console/   ← Next.js 14 前端
openclaw-backend/   ← Express + Prisma 後端
```

---

## 快速啟動

### 1. 後端

```bash
cd openclaw-backend
cp .env.example .env
# 編輯 .env — 填入 DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY

npm install

# 建立資料庫 schema
npx prisma db push

# 建立初始資料 (admin 帳號 + 3 個示範 Workspace)
npm run db:seed

# 啟動開發伺服器
npm run dev
# → http://localhost:4000
```

### 2. 前端

```bash
cd openclaw-console
cp .env.local.example .env.local
# 預設 NEXT_PUBLIC_API_URL=http://localhost:4000

npm install
npm run dev
# → http://localhost:3000
```

### 3. 登入

- Email:    `admin@example.com`
- Password: `admin1234`

---

## 環境變數說明

### 後端 `.env`

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 連線字串 |
| `JWT_SECRET` | 32 字元以上亂數字串 |
| `JWT_EXPIRES_IN` | Token 有效期，預設 `7d` |
| `PORT` | 後端 port，預設 `4000` |
| `CORS_ORIGIN` | 前端網址，預設 `http://localhost:3000` |
| `ENCRYPTION_KEY` | 64 位元 hex (AES-256 key)，用於加密 secrets |

### 前端 `.env.local`

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_API_URL` | 後端 API 位址 |

---

## API 端點總覽

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/workspaces
POST   /api/workspaces
PATCH  /api/workspaces/:id
DELETE /api/workspaces/:id
POST   /api/workspaces/:id/backup
GET    /api/workspaces/:id/backups

GET    /api/agents?workspaceId=
POST   /api/agents
PATCH  /api/agents/:id
DELETE /api/agents/:id
POST   /api/agents/:id/tools
DELETE /api/agents/:id/tools/:toolId

GET    /api/channels?workspaceId=
POST   /api/channels
PATCH  /api/channels/:id/toggle
PATCH  /api/channels/bindings/:id
POST   /api/channels/bindings/:id/allowlist
DELETE /api/channels/bindings/:id/allowlist/:entryId

GET    /api/tools?workspaceId=
POST   /api/tools
PATCH  /api/tools/:wsId/:toolId/toggle
GET    /api/tools/skills?workspaceId=
POST   /api/tools/skills
PATCH  /api/tools/skills/:wsId/:skillId/review

GET    /api/secrets?workspaceId=
POST   /api/secrets
DELETE /api/secrets/:id

GET    /api/security/audit
POST   /api/security/audit/:id/resolve

GET    /api/logs?workspaceId=&type=&limit=&cursor=
POST   /api/logs

GET    /api/usage?workspaceId=&days=
POST   /api/usage
```

---

## 資料庫 ER 概覽

```
User
└── AuditLog

Workspace
├── Agent
│   ├── PromptTemplate
│   ├── AgentTool → Tool
│   └── AgentChannelBinding → ChannelBinding
├── ChannelBinding → Channel
│   └── SenderAllowlist
├── WorkspaceTool → Tool
├── WorkspaceSkill → Skill
├── Secret
├── LogEntry
├── UsageRecord
├── WorkspaceBackup
└── SecurityAudit (optional workspaceId)

Integration (global or workspace-scoped)
```

---

## Phase 2 待開發

- [ ] LINE OA Webhook 接收器
- [ ] Google Sheets / Notion 整合頁面
- [ ] 人工審核流程（AI 草稿 → 人工確認 → 發送）
- [ ] WebSocket 即時 Log 推送
- [ ] 白標設定（品牌、Logo、自訂網域）
- [ ] 多角色權限細化
- [ ] OpenClaw Gateway 直接 Config 推送

---

## 技術棧

**前端**: Next.js 14 · App Router · TypeScript · Tailwind CSS · Recharts  
**後端**: Express · Prisma · PostgreSQL · JWT · AES-256-GCM  
**規劃部署**: Vercel (前端) + Railway / Render (後端 + DB)
