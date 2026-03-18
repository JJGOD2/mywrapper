"use client";
import { useState } from "react";
import { Card, CardTitle, Btn } from "@/components/ui";

const roles = ["Admin", "Operator", "Viewer"];

export default function SettingsPage() {
  const [brand, setBrand]     = useState("OpenClaw Console");
  const [domain, setDomain]   = useState("");
  const [notify, setNotify]   = useState({ error: true, warn: true, daily: false });

  return (
    <div className="max-w-2xl space-y-4">
      {/* Brand */}
      <Card>
        <CardTitle>品牌設定</CardTitle>
        <div className="space-y-3">
          <div>
            <label className="text-[12px] text-gray-500 block mb-1">控制台名稱</label>
            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] text-gray-500 block mb-1">自訂網域（白標用）</label>
            <input
              placeholder="console.yourdomain.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] placeholder:text-gray-300 focus:outline-none focus:border-brand-400"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <Btn variant="primary">儲存</Btn>
        </div>
      </Card>

      {/* Roles */}
      <Card>
        <CardTitle>角色權限</CardTitle>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["使用者", "角色", "操作"].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-4 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { user: "admin@example.com", role: "Admin" },
              { user: "ops@example.com",   role: "Operator" },
              { user: "view@example.com",  role: "Viewer" },
            ].map((u) => (
              <tr key={u.user} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="py-2.5 pr-4 text-[13px] font-mono text-gray-700">{u.user}</td>
                <td className="py-2.5 pr-4">
                  <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[12px] text-gray-700">
                    {roles.map((r) => <option key={r} selected={r === u.role}>{r}</option>)}
                  </select>
                </td>
                <td className="py-2.5"><Btn>移除</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3">
          <Btn variant="primary">+ 邀請成員</Btn>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardTitle>通知設定</CardTitle>
        <div className="space-y-3">
          {[
            { key: "error", label: "錯誤事件通知",  desc: "Tool 執行失敗、Gateway 異常" },
            { key: "warn",  label: "安全警告通知",  desc: "Sender allowlist 違規、audit 問題" },
            { key: "daily", label: "每日用量報告",  desc: "早上 9:00 發送 Token / 成本摘要" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[13px] font-medium">{label}</p>
                <p className="text-[11px] text-gray-400">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotify((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                className={`relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors ${notify[key as keyof typeof notify] ? "bg-brand-400" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${notify[key as keyof typeof notify] ? "translate-x-[15px]" : "translate-x-[2px]"}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-100">
        <CardTitle>危險操作</CardTitle>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-red-600">清除所有 Workspace 資料</p>
            <p className="text-[11px] text-gray-400">此操作不可逆，請確認後再執行</p>
          </div>
          <Btn variant="danger">清除資料</Btn>
        </div>
      </Card>
    </div>
  );
}
