"use client";
import { usage } from "@/lib/mock-data";
import { Card, CardTitle, MetricCard, UsageBar } from "@/components/ui";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const dailyData = [
  { day: "3/12", tokens: 68 }, { day: "3/13", tokens: 74 },
  { day: "3/14", tokens: 81 }, { day: "3/15", tokens: 70 },
  { day: "3/16", tokens: 92 }, { day: "3/17", tokens: 88 },
  { day: "3/18", tokens: 95 },
];

export default function UsagePage() {
  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2.5">
        <MetricCard label="本月總 Token"    value={usage.totalTokens}             sub="上月 1.9M" />
        <MetricCard label="估算成本"        value={`NT$${usage.estimatedCostNTD.toLocaleString()}`} sub={`預算剩 ${usage.budgetRemainingPercent}%`} subColor="green" />
        <MetricCard label="總 API 呼叫"    value={usage.totalApiCalls.toLocaleString()} sub="Tool calls 2,104" />
        <MetricCard label="日均訊息量"      value={usage.avgDailyMessages.toLocaleString()} sub="↑ 23% MoM" subColor="green" />
      </div>

      {/* Chart + workspace breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardTitle>每日 Token 用量（近 7 天，單位：k）</CardTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis  tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "0.5px solid #e5e7eb" }}
                cursor={{ fill: "#faeeda" }}
              />
              <Bar dataKey="tokens" fill="#BA7517" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Workspace 用量分佈</CardTitle>
          <div className="mt-2">
            {usage.byWorkspace.map((w) => (
              <UsageBar key={w.name} name={w.name} value={w.tokens} percent={w.percent} />
            ))}
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">通道用量</p>
            {usage.byChannel.map((c) => (
              <UsageBar key={c.name} name={c.name} value={c.count.toLocaleString()} percent={c.percent} />
            ))}
          </div>
        </Card>
      </div>

      {/* Budget warning */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
        <p className="text-[13px] font-medium text-amber-800">預算提醒</p>
        <p className="text-[12px] text-amber-600 mt-0.5">
          客戶 A 本月已使用 62%，預計月底前達到上限。建議與客戶確認是否升級方案。
        </p>
      </div>
    </div>
  );
}
