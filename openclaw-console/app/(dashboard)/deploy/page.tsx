"use client";
import { useState } from "react";
import { Card, CardTitle, Btn } from "@/components/ui";

function CopyBox({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-gray-900 rounded-lg p-3 relative group">
      <pre className="text-[11px] text-green-400 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">{value}</pre>
      <button
        onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-2 right-2 text-[10px] text-gray-500 hover:text-white bg-gray-800 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? "✓" : "複製"}
      </button>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(n === 1);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-left transition-colors">
        <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[12px] font-medium shrink-0">{n}</div>
        <p className="text-[13px] font-medium flex-1">{title}</p>
        <span className="text-gray-400 text-[12px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 bg-white border-t border-gray-50 space-y-3">{children}</div>}
    </div>
  );
}

export default function DeployPage() {
  const [tab, setTab] = useState<"docker"|"manual"|"cloud">("docker");

  const envContent = `# .env — 填入真實值後執行 docker compose up -d

POSTGRES_USER=openclaw
POSTGRES_PASSWORD=         # openssl rand -base64 16
POSTGRES_DB=openclaw_console

JWT_SECRET=                # openssl rand -base64 32
ENCRYPTION_KEY=            # openssl rand -hex 32
CORS_ORIGIN=https://your-domain.com

NEXT_PUBLIC_API_URL=https://your-domain.com
ANTHROPIC_API_KEY=         # sk-ant-...

LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=`;

  const dockerCmds = `# 1. Clone & 進入目錄
git clone https://github.com/your-org/openclaw-console.git
cd openclaw-console

# 2. 設定環境變數
cp .env.production.example .env
nano .env  # 填入必填值

# 3. 啟動所有服務
docker compose up -d

# 4. 首次初始化資料庫
docker compose run --rm backend npx prisma db push
docker compose run --rm backend npm run db:seed

# 5. 確認服務狀態
docker compose ps
curl http://localhost:4000/health`;

  const nginxSetup = `# 取得 SSL 憑證 (Let's Encrypt)
certbot certonly --standalone -d your-domain.com

# 複製憑證到 nginx/certs/
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/certs/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem   nginx/certs/

# 啟動含 Nginx 的完整部署
docker compose --profile with-nginx up -d`;

  const manualCmds = `# Backend
cd openclaw-backend
npm install
cp .env.example .env  # 填入 DATABASE_URL 等
npx prisma db push && npm run db:seed
npm run dev  # 或 npm run build && npm start

# Frontend
cd openclaw-console
npm install
cp .env.local.example .env.local
npm run dev  # 或 npm run build && npm start`;

  const railwaySteps = `1. Fork 此 repo 到你的 GitHub
2. 在 Railway.app 建立新 Project
3. 新增 PostgreSQL service
4. Deploy Backend service：
   - Root: /openclaw-backend
   - Build: npm install && npx prisma generate && npm run build
   - Start: npm start
   - 設定所有環境變數
5. Deploy Frontend service：
   - Root: /openclaw-console
   - 設定 NEXT_PUBLIC_API_URL = Backend URL
6. 設定自訂網域`;

  return (
    <div className="max-w-3xl space-y-4">
      {/* Tab selector */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["docker","manual","cloud"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-[13px] rounded-md transition-colors ${tab === t ? "bg-white font-medium shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "docker" ? "🐳 Docker Compose" : t === "manual" ? "⚙️ 手動部署" : "☁️ Railway / Render"}
          </button>
        ))}
      </div>

      {/* System requirements */}
      <Card>
        <CardTitle>系統需求</CardTitle>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon:"🖥", title:"最低配置",   desc:"2 vCPU / 2GB RAM / 20GB SSD" },
            { icon:"🐘", title:"資料庫",     desc:"PostgreSQL 14+ (Docker 或外部)" },
            { icon:"🟢", title:"Node.js",   desc:"v20 LTS 以上" },
          ].map(i => (
            <div key={i.title} className="bg-gray-50 rounded-lg p-3">
              <p className="text-[18px] mb-1">{i.icon}</p>
              <p className="text-[12px] font-medium">{i.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{i.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {tab === "docker" && (
        <>
          <Step n={1} title="設定環境變數 (.env)">
            <p className="text-[12px] text-gray-500">複製以下範本到專案根目錄的 <code className="bg-gray-100 px-1 rounded font-mono text-[11px]">.env</code>，並填入必要值：</p>
            <CopyBox value={envContent} />
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-[12px] text-amber-700">
              ⚠ 必填：POSTGRES_PASSWORD、JWT_SECRET、ENCRYPTION_KEY、ANTHROPIC_API_KEY
            </div>
          </Step>
          <Step n={2} title="啟動 Docker Compose">
            <CopyBox value={dockerCmds} />
          </Step>
          <Step n={3} title="設定 Nginx + SSL（選填，建議生產環境使用）">
            <p className="text-[12px] text-gray-500">修改 <code className="bg-gray-100 px-1 rounded font-mono text-[11px]">nginx/nginx.conf</code> 中的 <code className="bg-gray-100 px-1 rounded font-mono text-[11px]">server_name</code>，然後：</p>
            <CopyBox value={nginxSetup} />
          </Step>
          <Step n={4} title="驗證部署">
            <CopyBox value={`# 健康檢查
curl https://your-domain.com/api/health

# 登入測試
curl -X POST https://your-domain.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@example.com","password":"admin1234"}'`} />
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-[12px] text-red-600">
              🔐 首次登入後請立即更改預設密碼！
            </div>
          </Step>
        </>
      )}

      {tab === "manual" && (
        <>
          <Step n={1} title="安裝相依套件 & 啟動"><CopyBox value={manualCmds} /></Step>
          <Step n={2} title="資料庫設定">
            <CopyBox value={`# PostgreSQL 建立資料庫
psql -U postgres
CREATE USER openclaw WITH PASSWORD 'yourpassword';
CREATE DATABASE openclaw_console OWNER openclaw;
\\q

# 執行 migration
cd openclaw-backend
DATABASE_URL="postgresql://openclaw:yourpassword@localhost/openclaw_console" \\
  npx prisma db push
npm run db:seed`} />
          </Step>
        </>
      )}

      {tab === "cloud" && (
        <>
          <Step n={1} title="Railway.app 部署（推薦）">
            <CopyBox value={railwaySteps} />
          </Step>
          <Step n={2} title="Render.com 部署">
            <CopyBox value={`1. 建立 PostgreSQL database (free tier 可用)
2. 建立 Web Service for backend:
   Build:  npm install && npx prisma generate && npm run build
   Start:  npm start
   Root:   openclaw-backend
3. 建立 Web Service for frontend:
   Build:  npm install && npm run build
   Start:  npm start
   Root:   openclaw-console
4. 設定 Environment Variables`} />
          </Step>
          <Card>
            <CardTitle>各平台費用估算</CardTitle>
            <table className="w-full text-[12px]">
              <thead><tr className="border-b border-gray-50">
                {["平台","Backend","DB","Frontend","月費估算"].map(h => (
                  <th key={h} className="text-left font-medium text-gray-400 pb-2 pr-4 uppercase text-[10px] tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[
                  ["Railway",   "Hobby $5/mo",   "Postgres $5/mo","包含","~NT$310"],
                  ["Render",    "Starter $7/mo", "Free (限制)",   "Free","~NT$215"],
                  ["Fly.io",    "按用量",         "Postgres 按用量","按用量","~NT$150-400"],
                  ["自架 VPS",  "包含",           "包含",          "包含","NT$300-600/mo"],
                ].map(r => (
                  <tr key={r[0]} className="border-b border-gray-50 last:border-0">
                    {r.map((v,i) => <td key={i} className={`py-2 pr-4 ${i === 4 ? "font-medium text-brand-600" : "text-gray-500"}`}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
