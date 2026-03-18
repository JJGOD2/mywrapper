"use client";
import { useState } from "react";
import { tools as initialTools, skills as initialSkills } from "@/lib/mock-data";
import { Card, CardTitle, Toggle, Btn } from "@/components/ui";
import { riskBadge, statusBadge } from "@/components/ui/Badge";
import type { Tool, Skill } from "@/types";

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [skills] = useState<Skill[]>(initialSkills);

  function toggleTool(id: string, val: boolean) {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: val } : t)));
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Tools */}
      <Card>
        <CardTitle action={<Btn variant="primary">+ 新增</Btn>}>Tools</CardTitle>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["名稱", "風險", "執行次數", "需審核", "啟用"].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-3 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="py-2.5 pr-3 text-[13px] font-mono font-medium text-gray-800">{t.name}</td>
                <td className="py-2.5 pr-3">{riskBadge(t.risk)}</td>
                <td className="py-2.5 pr-3 text-[13px] text-gray-500">{t.execCount.toLocaleString()}</td>
                <td className="py-2.5 pr-3">
                  {t.requireApproval ? (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">需批准</span>
                  ) : (
                    <span className="text-[10px] text-gray-300">—</span>
                  )}
                </td>
                <td className="py-2.5">
                  <Toggle defaultChecked={t.enabled} onChange={(v) => toggleTool(t.id, v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Skills */}
      <Card>
        <CardTitle action={<Btn variant="primary">+ 安裝</Btn>}>Skills</CardTitle>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["名稱", "版本", "來源", "風險", "狀態"].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-3 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="py-2.5 pr-3 text-[13px] font-mono font-medium text-gray-800">{s.name}</td>
                <td className="py-2.5 pr-3 text-[11px] font-mono text-gray-400">v{s.version}</td>
                <td className="py-2.5 pr-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.source === "official" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.source === "official" ? "官方" : "社群"}
                  </span>
                </td>
                <td className="py-2.5 pr-3">{riskBadge(s.risk)}</td>
                <td className="py-2.5">{statusBadge(s.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Dependency warning */}
        <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-[11px] text-amber-700 font-medium">相依性提醒</p>
          <p className="text-[11px] text-amber-600 mt-0.5">
            notion-sync 需要 <code className="font-mono">@notionhq/client</code> — 尚未安裝
          </p>
        </div>
      </Card>
    </div>
  );
}
