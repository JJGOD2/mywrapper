"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn } from "@/components/ui";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";

interface SatisfactionStats {
  total: number; completed: number; responseRate: number;
  avgRating: number; nps: number;
  distribution: { rating: number; count: number }[];
  topTags: [string,number][];
  trend: { date: string; avg: number; count: number }[];
}

const BASE  = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WS_ID = "ws-a";
function tok() { return typeof window !== "undefined" ? localStorage.getItem("oc_token") ?? "" : ""; }
function apiFetch(path: string) {
  return fetch(`${BASE}${path}`, { headers:{ Authorization:`Bearer ${tok()}` } }).then(r=>r.json());
}

const STAR_COLOR = ["#ef4444","#f97316","#eab308","#22c55e","#10b981"];
const RATING_LABEL = ["","非常差","差","普通","好","非常好"];
const TAG_ICONS: Record<string,string> = {
  fast:"⚡", accurate:"🎯", friendly:"😊", helpful:"💡",
  clear:"📋", patient:"🕐", professional:"👔", resolved:"✅",
};

export default function SatisfactionPage() {
  const [days,    setDays]    = useState(30);
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<string|null>(null);

  const fetchStats = useCallback(() =>
    apiFetch(`/api/satisfaction/stats?workspaceId=${WS_ID}&days=${days}`), [days]);
  const fetchRecent = useCallback(() =>
    apiFetch(`/api/satisfaction?workspaceId=${WS_ID}&status=COMPLETED&limit=20`), []);

  const { data:stats   } = useApi<SatisfactionStats>(fetchStats,  [days]);
  const { data:recent  } = useApi<{id:string;rating:number;comment:string|null;tags:string[];platform:string;answeredAt:string}[]>(fetchRecent, []);

  async function sendTestSurvey() {
    setSending(true); setSendMsg(null);
    try {
      const r = await fetch(`${BASE}/api/satisfaction`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${tok()}` },
        body: JSON.stringify({
          workspaceId:WS_ID, platform:"PLAYGROUND", userId:"test-user-001",
        }),
      });
      const d = await r.json();
      setSendMsg(`問卷已建立：${d.surveyUrl}`);
    } catch(e){ setSendMsg((e as Error).message); }
    finally{ setSending(false); }
  }

  const npsColor  = stats ? (stats.nps>=50?"text-green-600":stats.nps>=0?"text-amber-600":"text-red-600") : "";
  const avgColor  = stats ? (stats.avgRating>=4?"text-green-600":stats.avgRating>=3?"text-amber-600":"text-red-600") : "";

  return (
    <div className="space-y-4">
      {/* Period + send test */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[7,14,30,90].map(d=>(
            <button key={d} onClick={()=>setDays(d)}
              className={`px-3 py-1.5 text-[12px] rounded-lg border transition-colors ${days===d?"bg-brand-400 text-white border-brand-400":"bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              {d}天
            </button>
          ))}
        </div>
        <Btn onClick={sendTestSurvey} className="ml-auto">
          {sending?"發送中...":"發送測試問卷"}
        </Btn>
      </div>
      {sendMsg && <p className="text-[12px] text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">{sendMsg}</p>}

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-2.5">
        {[
          { label:"平均評分",   value:stats?.avgRating.toFixed(1)??"—", color:avgColor },
          { label:"NPS 分數",   value:stats?.nps.toString()??"—",       color:npsColor },
          { label:"回覆率",     value:`${stats?.responseRate??0}%`,     color:"text-gray-900" },
          { label:"已回覆",     value:stats?.completed.toLocaleString()??"—", color:"text-gray-900" },
          { label:"發送總量",   value:stats?.total.toLocaleString()??"—",  color:"text-gray-900" },
        ].map(s=>(
          <div key={s.label} className="bg-gray-100 rounded-xl px-4 py-3">
            <p className="text-[11px] text-gray-400 mb-1">{s.label}</p>
            <p className={`text-[24px] font-medium ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Rating distribution */}
        <Card>
          <CardTitle>評分分佈</CardTitle>
          <div className="space-y-2 mt-1">
            {(stats?.distribution ?? []).slice().reverse().map(d=>{
              const total = stats?.completed ?? 1;
              const pct   = total ? Math.round(d.count/total*100) : 0;
              return (
                <div key={d.rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-20 shrink-0">
                    <span className="text-[16px]">{"★".repeat(d.rating)}</span>
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width:`${pct}%`, backgroundColor:STAR_COLOR[d.rating-1] }} />
                  </div>
                  <span className="text-[12px] text-gray-500 w-8 text-right">{d.count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top tags */}
        <Card>
          <CardTitle>常見標籤</CardTitle>
          {stats?.topTags.length ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {stats.topTags.map(([tag, count])=>(
                <div key={tag}
                  className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                  <span className="text-[14px]">{TAG_ICONS[tag]??"🏷"}</span>
                  <span className="text-[12px] text-gray-700">{tag}</span>
                  <span className="text-[11px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-[12px] text-gray-400 py-4 text-center">尚無標籤資料</p>}

          {/* NPS gauge */}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">NPS 說明</p>
            <div className="flex gap-2 text-[11px]">
              {[["😍","推薦者","5星"],["😐","中立者","4星"],["😞","批評者","1-3星"]].map(([e,l,r])=>(
                <div key={l} className="flex-1 text-center bg-gray-50 rounded-lg p-2">
                  <p className="text-[16px]">{e}</p>
                  <p className="text-gray-600 font-medium">{l}</p>
                  <p className="text-gray-400">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Trend chart */}
        <Card>
          <CardTitle>評分趨勢</CardTitle>
          {stats?.trend.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:"#9ca3af"}}
                  tickFormatter={d=>d.slice(5)} axisLine={false} tickLine={false}/>
                <YAxis domain={[1,5]} tick={{fontSize:9,fill:"#9ca3af"}}
                  axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:"0.5px solid #e5e7eb"}}
                  formatter={(v:number)=>[v.toFixed(1),"平均評分"]}/>
                <Line type="monotone" dataKey="avg" stroke="#BA7517" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-[12px] text-gray-400 py-8 text-center">尚無趨勢資料</p>}
        </Card>
      </div>

      {/* Recent feedback */}
      <Card>
        <CardTitle>最新評價（{recent?.length??0} 筆）</CardTitle>
        {!recent?.length ? (
          <p className="text-[12px] text-gray-400 py-4 text-center">尚無評價</p>
        ) : (
          <div className="space-y-0">
            {recent.map(s=>(
              <div key={s.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                  {[1,2,3,4,5].map(i=>(
                    <span key={i} className="text-[14px]" style={{color:i<=s.rating?"#f59e0b":"#e5e7eb"}}>★</span>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{s.platform}</span>
                    {s.tags.slice(0,3).map(tag=>(
                      <span key={tag} className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(s.answeredAt).toLocaleDateString("zh-TW")}
                    </span>
                  </div>
                  {s.comment && <p className="text-[12px] text-gray-600 leading-relaxed">{s.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
