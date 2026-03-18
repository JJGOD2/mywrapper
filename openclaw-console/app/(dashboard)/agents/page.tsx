import { agents } from "@/lib/mock-data";
import { Card, CardTitle, Btn } from "@/components/ui";
import { statusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const channelColor: Record<string, string> = {
  "LINE OA":     "bg-green-50 text-green-700",
  "Telegram":    "bg-blue-50 text-blue-700",
  "Slack":       "bg-purple-50 text-purple-700",
  "Discord":     "bg-indigo-50 text-indigo-700",
  "Google Chat": "bg-blue-50 text-blue-700",
};

export default function AgentsPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {agents.map((a) => (
          <Card key={a.id} className="hover:border-gray-200 transition-colors cursor-pointer">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0",
                  a.avatarColor
                )}
              >
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-none">{a.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {a.role} · {a.workspaceName}
                </p>
              </div>
              {statusBadge(a.status)}
            </div>

            {/* Description */}
            <p className="text-[12px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
              {a.description}
            </p>

            {/* Channels */}
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              可用通道
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {a.channels.map((c) => (
                <span
                  key={c}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    channelColor[c] ?? "bg-gray-100 text-gray-500"
                  )}
                >
                  {c}
                </span>
              ))}
            </div>

            {/* Tools */}
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              掛載 Tools
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {a.tools.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-gray-500 font-mono"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Stats + actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="flex gap-3 text-[11px] text-gray-400">
                <span>今日 {a.todayConversations.toLocaleString()} 則</span>
                <span className="font-mono">{a.tokenUsage} tokens</span>
              </div>
              <div className="flex gap-1.5">
                <Btn>編輯</Btn>
                <Btn>Prompt</Btn>
              </div>
            </div>
          </Card>
        ))}

        {/* Add agent */}
        <div className="border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 transition-colors min-h-[220px]">
          <span className="text-2xl text-gray-300">+</span>
          <span className="text-[13px] text-gray-400">建立新 Agent</span>
        </div>
      </div>

      {/* Summary table */}
      <Card>
        <CardTitle>Agent 總覽</CardTitle>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["Agent", "角色", "Workspace", "今日對話", "Token", "狀態", "操作"].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-4 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="py-2.5 pr-4 text-[13px] font-medium">{a.name}</td>
                <td className="py-2.5 pr-4 text-[13px] text-gray-500">{a.role}</td>
                <td className="py-2.5 pr-4 text-[13px] text-gray-500">{a.workspaceName}</td>
                <td className="py-2.5 pr-4 text-[13px] text-gray-500">{a.todayConversations.toLocaleString()}</td>
                <td className="py-2.5 pr-4 text-[13px] font-mono text-gray-500">{a.tokenUsage}</td>
                <td className="py-2.5 pr-4">{statusBadge(a.status)}</td>
                <td className="py-2.5"><Btn>設定</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
