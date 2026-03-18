import { auditItems, secrets } from "@/lib/mock-data";
import { Card, CardTitle, ProgressBar, Btn } from "@/components/ui";
import { statusBadge } from "@/components/ui/Badge";

const resultIcon: Record<string, { icon: string; cls: string }> = {
  pass: { icon: "✓", cls: "bg-green-50 text-green-600" },
  warn: { icon: "~", cls: "bg-amber-50 text-amber-600" },
  fail: { icon: "!", cls: "bg-red-50 text-red-600" },
};

const score = 78;

export default function SecurityPage() {
  const failCount = auditItems.filter((i) => i.result === "fail").length;
  const warnCount = auditItems.filter((i) => i.result === "warn").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Score */}
        <Card>
          <CardTitle>安全分數</CardTitle>
          <div className="flex flex-col items-center py-4">
            <p className="text-5xl font-medium text-brand-600">{score}</p>
            <p className="text-[12px] text-gray-400 mt-1">/ 100 · 良好</p>
            <div className="w-full mt-4">
              <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                <span>安全分數</span>
                <span>{score}%</span>
              </div>
              <ProgressBar value={score} />
            </div>
            <div className="flex gap-4 mt-4 text-[12px] text-gray-500">
              <span className="text-red-500 font-medium">{failCount} 高風險</span>
              <span className="text-amber-600">{warnCount} 待改善</span>
              <span className="text-green-600">{auditItems.length - failCount - warnCount} 通過</span>
            </div>
          </div>
        </Card>

        {/* Secrets */}
        <Card>
          <CardTitle action={<Btn variant="primary">+ 新增 Key</Btn>}>Secrets 管理</CardTitle>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {["Key 名稱", "Workspace", "狀態", "操作"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-3 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {secrets.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 pr-3 text-[12px] font-mono font-medium text-gray-800">{s.name}</td>
                  <td className="py-2.5 pr-3 text-[12px] text-gray-500">{s.workspaceId.replace("ws-", "").toUpperCase()}</td>
                  <td className="py-2.5 pr-3">{statusBadge(s.status)}</td>
                  <td className="py-2.5"><Btn>更新</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Audit */}
      <Card>
        <CardTitle action={<Btn>重新掃描</Btn>}>Security Audit 結果</CardTitle>
        <div>
          {auditItems.map((item) => {
            const r = resultIcon[item.result];
            return (
              <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0 ${r.cls}`}>
                  {r.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium">{item.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.description}</p>
                </div>
                {item.actionLabel ? (
                  <Btn variant={item.result === "fail" ? "danger" : "default"}>
                    {item.actionLabel}
                  </Btn>
                ) : (
                  <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">通過</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
