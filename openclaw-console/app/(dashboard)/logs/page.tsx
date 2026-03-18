"use client";
import { useState } from "react";
import { logs as mockLogs } from "@/lib/mock-data";
import { useRealtimeLogs } from "@/lib/use-realtime-logs";
import { Card, CardTitle } from "@/components/ui";

const LOG_META: Record<string, { label: string; cls: string }> = {
  ERROR:  { label:"錯誤", cls:"bg-red-50 text-red-600" },
  WARN:   { label:"警告", cls:"bg-amber-50 text-amber-700" },
  CHAT:   { label:"Chat", cls:"bg-blue-50 text-blue-700" },
  TOOL:   { label:"工具", cls:"bg-purple-50 text-purple-700" },
  SYSTEM: { label:"系統", cls:"bg-green-50 text-green-700" },
};

export default function LogsPage() {
  const [mode,       setMode]       = useState<"live"|"history">("live");
  const [typeFilter, setTypeFilter] = useState("全部類型");
  const [wsFilter,   setWsFilter]   = useState("全部 Workspace");
  const { logs: liveLogs, connected, error, clear } = useRealtimeLogs();

  const historyLogs = mockLogs.filter(l => {
    const matchType = typeFilter === "全部類型" || l.type.toUpperCase() === typeFilter;
    const matchWs   = wsFilter   === "全部 Workspace" || l.workspaceId === wsFilter;
    return matchType && matchWs;
  });

  const displayLogs = mode === "live" ? liveLogs : historyLogs;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(LOG_META).map(([t, m]) => {
          const count = (mode === "live" ? liveLogs : mockLogs)
            .filter(l => ((l as { type?:string;logType?:string }).type ?? (l as {logType?:string}).logType ?? "").toUpperCase() === t).length;
          return (
            <button key={t} onClick={() => { setTypeFilter(typeFilter === t ? "全部類型" : t); setMode("history"); }}
              className={`rounded-lg px-3 py-2 text-left border transition-colors ${typeFilter === t && mode === "history" ? `${m.cls} border-transparent` : "bg-white border-gray-100 hover:border-gray-200"}`}>
              <p className="text-[11px] text-gray-400">{m.label}</p>
              <p className="text-[18px] font-medium mt-0.5">{count}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <CardTitle action={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              {(["live","history"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1 text-[12px] rounded-md transition-colors ${mode === m ? "bg-white font-medium shadow-sm" : "text-gray-500"}`}>
                  {m === "live" ? "⚡ 即時" : "📋 歷史"}
                </button>
              ))}
            </div>
            {mode === "live" ? (
              <>
                <div className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full ${connected ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                  {connected ? "即時串流中" : "連線中..."}
                </div>
                <button onClick={clear} className="text-[11px] text-gray-400 hover:text-gray-600">清除</button>
              </>
            ) : (
              <>
                <select value={wsFilter} onChange={e => setWsFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[12px] text-gray-700">
                  {["全部 Workspace","ws-a","ws-b","ws-c"].map(o => <option key={o}>{o}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[12px] text-gray-700">
                  {["全部類型","CHAT","TOOL","ERROR","WARN","SYSTEM"].map(o => <option key={o}>{o}</option>)}
                </select>
              </>
            )}
          </div>
        }>
          {mode === "live" ? "即時 Log 串流" : "Chat & Execution Logs"}
        </CardTitle>

        {error && <div className="bg-red-50 text-red-600 text-[12px] px-3 py-2 rounded-lg mb-3 border border-red-100">{error} — 將自動重試</div>}

        <div className="min-h-[300px]">
          {mode === "live" && liveLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className={`w-3 h-3 rounded-full mb-3 ${connected ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
              <p className="text-[13px] text-gray-400">{connected ? "等待新事件..." : "正在連線..."}</p>
            </div>
          ) : displayLogs.length === 0 ? (
            <p className="text-[13px] text-gray-400 py-8 text-center">沒有符合條件的 log</p>
          ) : (
            displayLogs.map((l) => {
              const type = ((l as {type?:string;logType?:string}).type ?? (l as {logType?:string}).logType ?? "SYSTEM").toUpperCase();
              const m    = LOG_META[type] ?? { label:type, cls:"bg-gray-100 text-gray-500" };
              const time = (l as {createdAt?:string}).createdAt
                ? new Date((l as {createdAt:string}).createdAt).toLocaleTimeString("zh-TW")
                : (l as {time?:string}).time ?? "";
              return (
                <div key={(l as {id:string}).id} className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-[11px] font-mono text-gray-400 pt-0.5 shrink-0 w-[58px]">{time}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${m.cls}`}>{m.label}</span>
                  <p className="text-[12px] text-gray-500 leading-relaxed flex-1">{(l as {message:string}).message}</p>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
