"use client";
import { useState } from "react";
import { channels as initialChannels } from "@/lib/mock-data";
import { Card, CardTitle, Toggle, Btn } from "@/components/ui";
import { statusBadge } from "@/components/ui/Badge";
import type { Channel } from "@/types";

const channelIcon: Record<string, string> = {
  line: "L", telegram: "T", slack: "S", discord: "D", teams: "MS", googlechat: "G", whatsapp: "W",
};

export default function ChannelsPage() {
  const [chans, setChans] = useState<Channel[]>(initialChannels);

  function toggle(id: string, val: boolean) {
    setChans((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: val } : c)));
  }

  const selected = chans[0]; // LINE as default policy display

  return (
    <div className="space-y-4">
      {/* Channel list */}
      <Card>
        <CardTitle action={<Btn variant="primary">+ 新增通道</Btn>}>通道狀態</CardTitle>
        <div>
          {chans.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[13px] font-medium text-gray-600 shrink-0">
                {channelIcon[c.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{c.displayName}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {c.handle} · {c.workspaces.join(", ")} · {c.todayMessages.toLocaleString()} 則今日
                </p>
              </div>
              {statusBadge(c.status)}
              <Toggle defaultChecked={c.enabled} onChange={(v) => toggle(c.id, v)} />
              <Btn>設定</Btn>
            </div>
          ))}

          {/* Add row */}
          <div className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-[16px] text-gray-300 shrink-0">
              +
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-gray-400">新增通道</p>
              <p className="text-[11px] text-gray-300">Teams · Google Chat · WhatsApp · 其他</p>
            </div>
            <Btn>設定</Btn>
          </div>
        </div>
      </Card>

      {/* Policy */}
      {selected.policy && (
        <Card>
          <CardTitle>Channel Policy — {selected.displayName}</CardTitle>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {["設定項目", "目前值", "說明", "操作"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-4 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2.5 pr-4 text-[13px] font-medium">指定 Agent</td>
                <td className="py-2.5 pr-4 text-[13px] text-gray-500">{selected.policy.assignedAgent}</td>
                <td className="py-2.5 pr-4 text-[12px] text-gray-400">此通道預設 Agent</td>
                <td className="py-2.5"><Btn>更改</Btn></td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2.5 pr-4 text-[13px] font-medium">Sender Allowlist</td>
                <td className="py-2.5 pr-4">
                  <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    {selected.policy.allowlistCount} 筆
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-[12px] text-gray-400">白名單外觸發警告</td>
                <td className="py-2.5"><Btn>編輯</Btn></td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2.5 pr-4 text-[13px] font-medium">DM Scope</td>
                <td className="py-2.5 pr-4 text-[13px] text-gray-500">
                  {selected.policy.dmScope === "restricted" ? "限制模式" : "開放模式"}
                </td>
                <td className="py-2.5 pr-4 text-[12px] text-gray-400">Inbound DM 為不可信輸入</td>
                <td className="py-2.5"><Btn>設定</Btn></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2.5 pr-4 text-[13px] font-medium">群組訊息</td>
                <td className="py-2.5 pr-4">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${selected.policy.groupEnabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {selected.policy.groupEnabled ? "啟用" : "停用"}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-[12px] text-gray-400">需被 @ 才回應</td>
                <td className="py-2.5"><Btn>更改</Btn></td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
