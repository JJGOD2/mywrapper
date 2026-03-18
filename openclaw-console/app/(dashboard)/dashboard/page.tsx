"use client";
import { useMemo } from "react";
import { workspaceApi, agentApi, logApi, usageApi } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { MetricCard, Card, CardTitle, UsageBar } from "@/components/ui";
import { statusBadge } from "@/components/ui/Badge";

const LOG_COLORS: Record<string, string> = {
  ERROR:"bg-red-50 text-red-600", WARN:"bg-amber-50 text-amber-700",
  CHAT:"bg-blue-50 text-blue-700", TOOL:"bg-purple-50 text-purple-700", SYSTEM:"bg-green-50 text-green-700",
};
const LOG_LABELS: Record<string, string> = {
  ERROR:"錯誤", WARN:"警告", CHAT:"Chat", TOOL:"工具", SYSTEM:"系統",
};
const CH_DATA = [
  { name:"LINE OA",  count:892, percent:72 },
  { name:"Telegram", count:245, percent:20 },
  { name:"Slack",    count:87,  percent:7  },
  { name:"Discord",  count:23,  percent:2  },
];

export default function DashboardPage() {
  const { data: workspaces, loading } = useApi(() => workspaceApi.list(), []);
  const { data: agents }              = useApi(() => agentApi.list(), []);
  const { data: logsData }            = useApi(() => logApi.list({ limit: 5 }), []);
  const { data: usage }               = useApi(() => usageApi.get(undefined, 30), []);

  const todayMsgs   = useMemo(() => workspaces?.reduce((s,w)=>s+w.todayMessages,0)??0,[workspaces]);
  const monthCost   = useMemo(() => workspaces?.reduce((s,w)=>s+Number(w.monthCostNTD),0)??0,[workspaces]);
  const activeCount = useMemo(() => workspaces?.filter(w=>w.status==="ACTIVE").length??0,[workspaces]);
  const alerts      = logsData?.items.filter(l=>["ERROR","WARN"].includes(l.type.toUpperCase()))??[];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2.5">
        <MetricCard label="今日訊息量"    value={loading?"—":todayMsgs.toLocaleString()} sub="所有 Workspace 合計"/>
        <MetricCard label="本月估算成本"  value={loading?"—":`NT$${monthCost.toLocaleString()}`}
          sub={`Token: ${((usage?.totals.inputTokens??0)+(usage?.totals.outputTokens??0)).toLocaleString()}`}/>
        <MetricCard label="Tool 呼叫"    value={usage?.totals.toolExecs.toLocaleString()??"—"} sub={`API 呼叫 ${usage?.totals.apiCalls.toLocaleString()??"—"} 次`}/>
        <MetricCard label="Active Workspaces" value={loading?"—":`${activeCount} / ${workspaces?.length??0}`} sub="方案使用中"/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardTitle>通道流量（今日）</CardTitle>
          {CH_DATA.map(c=><UsageBar key={c.name} name={c.name} value={c.count.toLocaleString()} percent={c.percent}/>)}
        </Card>
        <Card>
          <CardTitle>近期異常事件</CardTitle>
          {alerts.length===0
            ? <p className="text-[12px] text-gray-400 py-4 text-center">暫無異常事件</p>
            : alerts.slice(0,4).map(l=>{
                const t=l.type.toUpperCase();
                return(
                  <div key={l.id} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] font-mono text-gray-400 mt-0.5 shrink-0 w-[42px]">
                      {new Date(l.createdAt).toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"})}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${LOG_COLORS[t]??"bg-gray-100 text-gray-500"}`}>
                      {LOG_LABELS[t]??t}
                    </span>
                    <p className="text-[12px] text-gray-500 leading-relaxed flex-1 line-clamp-2">{l.message}</p>
                  </div>
                );
              })
          }
        </Card>
      </div>
      <Card>
        <CardTitle>Agent 活躍度</CardTitle>
        {!agents ? <p className="text-[12px] text-gray-400 py-4">載入中...</p> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-50">
              {["Agent","Workspace","狀態"].map(h=>(
                <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-4 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {agents.map(a=>(
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 pr-4 text-[13px] font-medium">{a.name}</td>
                  <td className="py-2.5 pr-4 text-[13px] text-gray-500">{a.workspaceName}</td>
                  <td className="py-2.5">{statusBadge(a.status.toLowerCase())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
