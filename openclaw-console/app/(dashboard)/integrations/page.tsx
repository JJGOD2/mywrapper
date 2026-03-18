import { integrations } from "@/lib/mock-data";
import { Card, CardTitle, Btn } from "@/components/ui";
import { statusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {integrations.map((i) => (
          <div
            key={i.id}
            className="bg-white border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium shrink-0", i.colorClass)}>
                {i.initial}
              </div>
              <p className="text-[13px] font-medium flex-1">{i.name}</p>
              {statusBadge(i.status)}
            </div>
            <p className="text-[12px] text-gray-400">{i.description}</p>
            <div className="mt-3 flex gap-1.5">
              {i.status === "connected" && <Btn>管理</Btn>}
              {i.status === "reconnect" && <Btn variant="danger">重新連接</Btn>}
              {i.status === "pending"   && <Btn>審核</Btn>}
              {i.status === "inactive"  && <Btn variant="primary">設定</Btn>}
            </div>
          </div>
        ))}

        {/* Add */}
        <div className="border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 min-h-[120px] cursor-pointer hover:bg-gray-50 transition-colors">
          <span className="text-2xl text-gray-300">+</span>
          <span className="text-[13px] text-gray-400">新增整合</span>
        </div>
      </div>

      {/* Webhook */}
      <Card>
        <CardTitle action={<Btn variant="primary">+ 新增 Webhook</Btn>}>Webhook 管理</CardTitle>
        <div className="py-8 text-center">
          <p className="text-[13px] text-gray-400">尚未設定 Webhook</p>
          <p className="text-[12px] text-gray-300 mt-1">可將 Agent 事件推送至任意 HTTP endpoint</p>
        </div>
      </Card>
    </div>
  );
}
