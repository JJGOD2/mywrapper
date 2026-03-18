"use client";
import { usePathname } from "next/navigation";
import { Btn } from "@/components/ui";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { NotificationBell } from "@/components/features/NotificationBell";

const titles: Record<string, string> = {
  "/dashboard":"Dashboard","/workspaces":"Workspaces","/agents":"Agents",
  "/channels":"Channels","/tools":"Tools & Skills","/security":"Security",
  "/logs":"Logs","/usage":"Usage & Cost","/integrations":"Integrations",
  "/settings":"Settings","/review":"人工審核","/sessions":"對話記憶",
  "/gateway":"Gateway Config","/templates":"模板中心","/alerts":"告警通知",
  "/whitelabel":"白標設定","/permissions":"角色權限","/api-keys":"API & Webhook",
  "/deploy":"部署設定","/onboarding":"導入清單","/billing":"訂閱計費",
  "/analytics":"進階分析","/playground":"Agent Playground","/audit":"操作稽核",
  "/prompt-history":"Prompt 版本","/sla":"SLA 監控","/bulk":"批量操作",
  "/models":"模型管理","/tool-builder":"Tool Builder","/export":"匯出資料",
  "/overview":"總覽指揮台","/knowledge":"知識庫 (RAG)","/ab-test":"A/B 測試",
  "/reports":"客戶報告","/orchestration":"多 Agent 協作",
  "/notifications":"通知中心","/marketplace":"模板市場","/security-scan":"安全掃描",
};

export default function Topbar() {
  const path  = usePathname();
  const clean = "/" + path.split("/").slice(path.match(/^\/(en)\//)?1:1).filter(Boolean).join("/");
  const title = titles[clean] ?? "OpenClaw";
  return (
    <header className="h-[52px] bg-white border-b border-gray-100 flex items-center px-5 gap-3 shrink-0">
      <h1 className="text-[15px] font-medium flex-1">{title}</h1>
      <div className="flex items-center gap-1.5 text-[12px] text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Gateway 運行中
      </div>
      <LocaleSwitcher />
      <NotificationBell />
      <Btn variant="primary">+ 新增</Btn>
    </header>
  );
}
