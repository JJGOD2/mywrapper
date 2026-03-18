"use client";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Btn } from "@/components/ui";

const titles: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/workspaces":   "Workspaces",
  "/agents":       "Agents",
  "/channels":     "Channels",
  "/tools":        "Tools & Skills",
  "/security":     "Security",
  "/logs":         "Logs",
  "/usage":        "Usage & Cost",
  "/integrations": "Integrations",
  "/settings":     "Settings",
  "/review":       "人工審核",
  "/gateway":      "Gateway Config",
  "/templates":    "模板中心",
  "/alerts":       "告警通知",
};

export default function Topbar() {
  const path = usePathname();
  const title = titles[path] ?? "OpenClaw";

  return (
    <header className="h-[52px] bg-white border-b border-gray-100 flex items-center px-5 gap-3 shrink-0">
      <h1 className="text-[15px] font-medium flex-1">{title}</h1>

      {/* Gateway status */}
      <div className="flex items-center gap-1.5 text-[12px] text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Gateway 運行中
      </div>

      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400">
        <Bell size={15} strokeWidth={1.8} />
      </button>

      <Btn variant="primary">+ 新增</Btn>
    </header>
  );
}
