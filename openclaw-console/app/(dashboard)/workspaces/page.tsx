import { workspaces } from "@/lib/mock-data";
import { Card, CardTitle, ProgressBar, Btn } from "@/components/ui";
import { statusBadge, planBadge } from "@/components/ui/Badge";

const statusDot: Record<string, string> = {
  active:  "bg-green-400",
  setting: "bg-amber-400",
  paused:  "bg-gray-300",
  error:   "bg-red-400",
};

export default function WorkspacesPage() {
  return (
    <div className="space-y-4">
      {/* Cards grid */}
      <div className="grid grid-cols-3 gap-3">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className="bg-white border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[ws.status]}`} />
              <p className="text-[13px] font-medium flex-1 truncate">{ws.client} — {ws.name}</p>
              {statusBadge(ws.status)}
            </div>
            <p className="text-[12px] text-gray-400 mb-2">
              {ws.agentCount} Agents · {ws.channelCount} Channels · {ws.toolCount} Tools
            </p>
            <div className="flex gap-3 text-[11px] text-gray-400 mb-3">
              <span>今日 {ws.todayMessages.toLocaleString()} 則</span>
              <span>NT${ws.monthCostNTD.toLocaleString()} / 月</span>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>本月用量</span>
                <span>{ws.usagePercent}%</span>
              </div>
              <ProgressBar value={ws.usagePercent} />
            </div>
          </div>
        ))}

        {/* Add card */}
        <div className="border border-dashed border-gray-200 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 transition-colors min-h-[140px]">
          <span className="text-2xl text-gray-300">+</span>
          <span className="text-[13px] text-gray-400">建立 Workspace</span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardTitle action={<Btn>匯出</Btn>}>所有 Workspace</CardTitle>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["Workspace", "建立日期", "方案", "Agents", "Secrets", "狀態", "操作"].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-4 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workspaces.map((ws) => (
              <tr key={ws.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="py-2.5 pr-4 text-[13px] font-medium">{ws.client} — {ws.name}</td>
                <td className="py-2.5 pr-4 text-[13px] text-gray-500 font-mono">{ws.createdAt}</td>
                <td className="py-2.5 pr-4">{planBadge(ws.plan)}</td>
                <td className="py-2.5 pr-4 text-[13px] text-gray-500">{ws.agentCount}</td>
                <td className="py-2.5 pr-4 text-[13px] text-gray-500">{ws.secretCount} keys</td>
                <td className="py-2.5 pr-4">{statusBadge(ws.status)}</td>
                <td className="py-2.5">
                  <div className="flex gap-1.5">
                    <Btn>設定</Btn>
                    <Btn>備份</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
