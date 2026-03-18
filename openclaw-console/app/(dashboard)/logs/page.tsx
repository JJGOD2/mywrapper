"use client";
import { useState } from "react";
import { logs } from "@/lib/mock-data";
import { Card, CardTitle, Select } from "@/components/ui";
import type { LogType } from "@/types";

const logMeta: Record<LogType, { label: string; cls: string }> = {
  error:  { label: "錯誤", cls: "bg-red-50 text-red-600" },
  warn:   { label: "警告", cls: "bg-amber-50 text-amber-700" },
  chat:   { label: "Chat", cls: "bg-blue-50 text-blue-700" },
  tool:   { label: "工具", cls: "bg-purple-50 text-purple-700" },
  system: { label: "系統", cls: "bg-green-50 text-green-700" },
};

const typeOptions = ["全部類型", "chat", "tool", "error", "warn", "system"];
const wsOptions   = ["全部 Workspace", "ws-a", "ws-b", "ws-c"];

export default function LogsPage() {
  const [typeFilter, setTypeFilter] = useState("全部類型");
  const [wsFilter,   setWsFilter]   = useState("全部 Workspace");

  const filtered = logs.filter((l) => {
    const matchType = typeFilter === "全部類型" || l.type === typeFilter;
    const matchWs   = wsFilter   === "全部 Workspace" || l.workspaceId === wsFilter;
    return matchType && matchWs;
  });

  return (
    <div className="space-y-4">
      {/* Summary counts */}
      <div className="grid grid-cols-5 gap-2">
        {(Object.keys(logMeta) as LogType[]).map((t) => {
          const count = logs.filter((l) => l.type === t).length;
          const m = logMeta[t];
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? "全部類型" : t)}
              className={`rounded-lg px-3 py-2 text-left transition-colors border ${
                typeFilter === t ? "border-gray-300 " + m.cls : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className="text-[11px] text-gray-400">{m.label}</p>
              <p className="text-[18px] font-medium mt-0.5">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Log table */}
      <Card>
        <CardTitle
          action={
            <div className="flex gap-2">
              <select
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[12px] text-gray-700"
                value={wsFilter}
                onChange={(e) => setWsFilter(e.target.value)}
              >
                {wsOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <select
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[12px] text-gray-700"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {typeOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          }
        >
          Chat &amp; Execution Logs
        </CardTitle>

        <div>
          {filtered.length === 0 ? (
            <p className="text-[13px] text-gray-400 py-6 text-center">沒有符合條件的 log</p>
          ) : (
            filtered.map((l) => {
              const m = logMeta[l.type];
              return (
                <div key={l.id} className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-[11px] font-mono text-gray-400 pt-0.5 shrink-0 w-[58px]">{l.time}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${m.cls}`}>
                    {m.label}
                  </span>
                  <p className="text-[12px] text-gray-500 leading-relaxed flex-1">{l.message}</p>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
