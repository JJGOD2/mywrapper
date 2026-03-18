"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn } from "@/components/ui";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

interface LogEntry {
  id:string; workspaceId:string; type:string;
  message:string; createdAt:string; metadata?:Record<string,unknown>;
}
interface LogAgg {
  totalLogs:number;
  byType:{type:string;count:number}[];
  timeline:{time:string;total:number;errors:number;errorRate:number}[];
  topErrors:{message:string;count:number}[];
}

const TYPE_COLOR:Record<string,{bg:string;text:string}> = {
  ERROR:  {bg:"bg-red-50",   text:"text-red-600"},
  WARN:   {bg:"bg-amber-50", text:"text-amber-700"},
  CHAT:   {bg:"bg-blue-50",  text:"text-blue-700"},
  TOOL:   {bg:"bg-purple-50",text:"text-purple-700"},
  SYSTEM: {bg:"bg-green-50", text:"text-green-700"},
};

const BASE  = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
function tok() { return typeof window !== "undefined" ? localStorage.getItem("oc_token") ?? "" : ""; }
async function apiFetch(path:string, method="GET", body?:object) {
  const r = await fetch(`${BASE}${path}`, {
    method, headers:{"Content-Type":"application/json", Authorization:`Bearer ${tok()}`},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function LogExplorerPage() {
  const [query,      setQuery]      = useState("");
  const [types,      setTypes]      = useState<string[]>([]);
  const [hours,      setHours]      = useState(24);
  const [searching,  setSearching]  = useState(false);
  const [results,    setResults]    = useState<LogEntry[]|null>(null);
  const [nextCursor, setNextCursor] = useState<string|null>(null);
  const [total,      setTotal]      = useState(0);
  const [expanded,   setExpanded]   = useState<string|null>(null);

  const fetchAgg = useCallback(() =>
    apiFetch(`/api/log-search/agg?hours=${hours}`), [hours]);
  const { data:agg } = useApi<LogAgg>(fetchAgg, [hours]);

  const ALL_TYPES = ["ERROR","WARN","CHAT","TOOL","SYSTEM"];

  async function search(cursor?: string) {
    setSearching(true);
    try {
      const body: Record<string,unknown> = { query:query||undefined, limit:100 };
      if (types.length) body.types = types;
      if (cursor) body.cursor = cursor;

      const since = new Date(Date.now() - hours * 3600_000);
      body.startTime = since.toISOString();

      const r = await apiFetch("/api/log-search", "POST", body);
      if (cursor) {
        setResults(prev => [...(prev??[]), ...r.items]);
      } else {
        setResults(r.items);
      }
      setNextCursor(r.nextCursor);
      setTotal(r.total);
    } finally { setSearching(false); }
  }

  function toggleType(t: string) {
    setTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev,t]);
  }

  const timelineData = (agg?.timeline??[]).map(t=>({
    ...t,
    time: new Date(t.time).toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"}),
  }));

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <input value={query} onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&search()}
          placeholder="全文搜尋 log 訊息..."
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-brand-400 shadow-sm"/>
        <Btn variant="primary" onClick={()=>search()}>
          {searching?"搜尋中...":"搜尋"}
        </Btn>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {ALL_TYPES.map(t=>{
            const c = TYPE_COLOR[t];
            const active = types.includes(t);
            return (
              <button key={t} onClick={()=>toggleType(t)}
                className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${active?`${c.bg} ${c.text} border-transparent`:"bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                {t}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1 ml-auto">
          {[6,24,48,168].map(h=>(
            <button key={h} onClick={()=>setHours(h)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${hours===h?"bg-brand-400 text-white border-brand-400":"bg-white border-gray-200 text-gray-500"}`}>
              {h<24?`${h}h`:h===24?"24h":h===48?"2d":"7d"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary + charts */}
      {agg && (
        <div className="grid grid-cols-3 gap-3">
          {/* Type breakdown */}
          <Card>
            <CardTitle>類型分佈（{hours}小時）</CardTitle>
            <div className="space-y-2 mt-1">
              {agg.byType.map(t=>{
                const pct   = agg.totalLogs ? Math.round(t.count/agg.totalLogs*100) : 0;
                const c     = TYPE_COLOR[t.type];
                return (
                  <div key={t.type} className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium w-14 text-center ${c?.bg} ${c?.text}`}>
                      {t.type}
                    </span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-brand-400" style={{width:`${pct}%`}}/>
                    </div>
                    <span className="text-[11px] text-gray-500 w-10 text-right">{t.count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Error timeline */}
          <Card className="col-span-2">
            <CardTitle>錯誤率趨勢</CardTitle>
            {timelineData.length ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="time" tick={{fontSize:9,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{fontSize:11,borderRadius:8,border:"0.5px solid #e5e7eb"}}
                    formatter={(v:number,n:string)=>[n==="errorRate"?`${v}%`:v.toLocaleString(), n==="errorRate"?"錯誤率":n==="total"?"總數":"錯誤數"]}/>
                  <Area type="monotone" dataKey="total" stroke="#94a3b8" strokeWidth={1.5} fill="none"/>
                  <Area type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} fill="url(#errGrad)"/>
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-[12px] text-gray-400 py-6 text-center">尚無資料</p>}
          </Card>
        </div>
      )}

      {/* Top errors */}
      {agg?.topErrors.length ? (
        <Card>
          <CardTitle>高頻錯誤</CardTitle>
          <div className="space-y-0">
            {agg.topErrors.map((e,i)=>(
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-[11px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5">
                  ×{e.count}
                </span>
                <p className="text-[12px] font-mono text-gray-700 leading-relaxed">{e.message}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Search results */}
      {results !== null && (
        <Card>
          <CardTitle action={
            <span className="text-[12px] text-gray-400">找到 {total.toLocaleString()} 筆</span>
          }>
            搜尋結果
          </CardTitle>

          {results.length === 0 ? (
            <p className="text-[13px] text-gray-400 py-6 text-center">沒有符合條件的 Log</p>
          ) : (
            <>
              <div className="space-y-0">
                {results.map(log=>{
                  const c = TYPE_COLOR[log.type] ?? {bg:"bg-gray-50",text:"text-gray-600"};
                  const isExp = expanded === log.id;
                  return (
                    <div key={log.id}
                      className="py-2.5 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2"
                      onClick={()=>setExpanded(isExp?null:log.id)}>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono text-gray-400 shrink-0 pt-0.5 w-16">
                          {new Date(log.createdAt).toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5 ${c.bg} ${c.text}`}>
                          {log.type}
                        </span>
                        <p className={`text-[12px] leading-relaxed flex-1 ${isExp?"text-gray-800":"text-gray-600 line-clamp-1"}`}>
                          {log.message}
                        </p>
                      </div>
                      {isExp && log.metadata && (
                        <pre className="mt-2 ml-[88px] text-[11px] font-mono text-gray-600 bg-gray-50 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>

              {nextCursor && (
                <div className="text-center pt-3">
                  <Btn onClick={()=>search(nextCursor)}>
                    {searching?"載入中...":"載入更多"}
                  </Btn>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
