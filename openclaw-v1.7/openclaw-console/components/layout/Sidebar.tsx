"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Bot, Radio, Wrench,
  ShieldCheck, ScrollText, BarChart3, Plug, Settings,
  ClipboardCheck, Cpu, FileText, Bell,
  Paintbrush, ShieldAlert, KeyRound, Server, ListChecks, MessageSquare,
  CreditCard, TrendingUp, FlaskConical, History,
  GitBranch, Shield, Layers, Activity,
  Cpu, Download, Wrench, Brain,
  BookOpen, FlaskRound, LayoutDashboard, FileBarChart,
  Link, Bell, Store, ShieldCheck,
  GitMerge, Megaphone, Users, ArrowRightLeft,
  Star, ClipboardList, Languages, SearchCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

const workspaces = ["客戶 A — 電商客服", "客戶 B — 房仲業務", "客戶 C — 醫療診所"];

const navSections = [
  {
    label: "v1.7 新增",
    items: [
      { href: "/satisfaction",  label: "滿意度評分",  icon: Star },
      { href: "/forms",         label: "表單收集",    icon: ClipboardList },
      { href: "/log-explorer",  label: "Log 搜尋",    icon: SearchCode },
    ],
  },
  {
    label: "v1.6 新增",
    items: [
      { href: "/flows",     label: "對話流程",   icon: GitMerge },
      { href: "/handoff",   label: "人工交接",   icon: ArrowRightLeft },
      { href: "/broadcast", label: "廣播推播",   icon: Megaphone },
      { href: "/segments",  label: "用戶分群",   icon: Users },
    ],
  },
  {
    label: "v1.7 新增",
    items: [
      { href: "/satisfaction",  label: "滿意度評分",  icon: Star },
      { href: "/forms",         label: "表單收集",    icon: ClipboardList },
      { href: "/log-explorer",  label: "Log 搜尋",    icon: SearchCode },
    ],
  },
  {
    label: "v1.6 新增",
    items: [
      { href: "/orchestration",  label: "多 Agent 協作",  icon: Link },
      { href: "/notifications",  label: "通知中心",       icon: Bell },
      { href: "/marketplace",    label: "模板市場",       icon: Store },
      { href: "/security-scan",  label: "安全掃描",       icon: ShieldCheck },
    ],
  },
  {
    label: "v1.5 新增",
    items: [
      { href: "/overview",  label: "總覽指揮台",  icon: LayoutDashboard },
      { href: "/knowledge", label: "知識庫 (RAG)", icon: BookOpen },
      { href: "/ab-test",   label: "A/B 測試",    icon: FlaskRound },
      { href: "/reports",   label: "客戶報告",    icon: FileBarChart },
    ],
  },
  {
    label: "v1.4 新增",
    items: [
      { href: "/models",       label: "模型管理",     icon: Brain },
      { href: "/tool-builder", label: "Tool Builder",  icon: Wrench },
      { href: "/export",       label: "匯出資料",     icon: Download },
    ],
  },
  {
    label: "v1.3 新增",
    items: [
      { href: "/prompt-history", label: "Prompt 版本",  icon: GitBranch },
      { href: "/sla",            label: "SLA 監控",    icon: Activity },
      { href: "/bulk",           label: "批量操作",    icon: Layers },
    ],
  },
  {
    label: "v1.2 新增",
    items: [
      { href: "/playground", label: "Agent Playground", icon: FlaskConical },
      { href: "/audit",      label: "操作稽核",       icon: History },
    ],
  },
  {
    label: "v1.1 新增",
    items: [
      { href: "/billing",    label: "訂閱計費",    icon: CreditCard },
      { href: "/analytics",  label: "進階分析",    icon: TrendingUp },
    ],
  },
  {
    label: "概覽",
    items: [
      { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
    ],
  },
  {
    label: "核心管理",
    items: [
      { href: "/workspaces",   label: "Workspaces",   icon: Building2 },
      { href: "/agents",       label: "Agents",       icon: Bot },
      { href: "/channels",     label: "Channels",     icon: Radio },
      { href: "/tools",        label: "Tools & Skills",icon: Wrench },
    ],
  },
  {
    label: "Phase 3",
    items: [
      { href: "/onboarding",   label: "導入清單",    icon: ListChecks },
      { href: "/whitelabel",   label: "白標設定",    icon: Paintbrush },
      { href: "/permissions",  label: "角色權限",    icon: ShieldAlert },
      { href: "/api-keys",     label: "API & Webhook", icon: KeyRound },
      { href: "/deploy",       label: "部署設定",    icon: Server },
    ],
  },
  {
    label: "Phase 2",
    items: [
      { href: "/review",    label: "人工審核",    icon: ClipboardCheck, badge: 3 },
      { href: "/sessions",  label: "對話記憶",    icon: MessageSquare },
      { href: "/gateway",   label: "Gateway",    icon: Cpu },
      { href: "/templates", label: "模板中心",    icon: FileText },
      { href: "/alerts",    label: "告警通知",    icon: Bell },
    ],
  },
  {
    label: "安全 & 日誌",
    items: [
      { href: "/security",     label: "Security",     icon: ShieldCheck, badge: 2 },
      { href: "/logs",         label: "Logs",         icon: ScrollText },
    ],
  },
  {
    label: "營運",
    items: [
      { href: "/usage",        label: "Usage & Cost", icon: BarChart3 },
      { href: "/integrations", label: "Integrations", icon: Plug },
      { href: "/settings",     label: "Settings",     icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-[220px] min-w-[220px] bg-white border-r border-gray-100 flex flex-col h-screen overflow-y-auto scrollbar-thin">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-brand-400 rounded-md flex items-center justify-center text-white text-[13px] font-medium shrink-0">
          OC
        </div>
        <div>
          <p className="text-[14px] font-medium leading-none">OpenClaw</p>
          <p className="text-[10px] text-gray-400 mt-0.5">商業控制台</p>
        </div>
      </div>

      {/* Workspace picker */}
      <div className="px-3 py-2.5 border-b border-gray-100">
        <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] text-gray-700 cursor-pointer">
          {workspaces.map((ws) => (
            <option key={ws}>{ws}</option>
          ))}
          <option>+ 建立 Workspace</option>
        </select>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-4 py-2.5 pb-1">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = path === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 text-[13px] transition-colors",
                    active
                      ? "text-gray-900 font-medium bg-gray-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon
                    size={14}
                    className={cn(active ? "text-brand-400" : "text-gray-400")}
                    strokeWidth={1.8}
                  />
                  <span className="flex-1">{item.label}</span>
                  {"badge" in item && item.badge ? (
                    <span className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 text-[10px] text-gray-300">
        OpenClaw Console v0.1.0
      </div>
    </aside>
  );
}
