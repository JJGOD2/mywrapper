"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn, MetricCard } from "@/components/ui";

interface GatewayStatus {
  gatewayUrl:    string;
  gatewayOnline: boolean;
  lastPushedAt:  string | null;
  validationOk:  boolean;
  validationMsg: string | null;
  rawJson5:      string | null;
}
interface PreviewResult {
  config:     object;
  validation: { ok: boolean; message: string };
  preview:    string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WS_ID = "ws-a"; // TODO: replace with workspace selector

function tok() { return typeof window !== "undefined" ? localStorage.getItem("oc_token") : null; }
async function apiReq(path: string, method = "GET", body?: object) {
  const r = await fetch(`${BASE}${path}`, {
    method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function GatewayPage() {
  const fetchStatus = useCallback(() => apiReq(`/api/gateway/${WS_ID}`), []);
  const { data: status, loading, refetch } = useApi<GatewayStatus>(fetchStatus, []);

  const [preview,  setPreview]  = useState<PreviewResult | null>(null);
  const [action,   setAction]   = useState<string | null>(null);
  const [result,   setResult]   = useState<{ ok: boolean; message: string } | null>(null);

  async function doAction(type: "preview" | "validate" | "push") {
    setAction(type); setResult(null);
    try {
      const r = await apiReq(`/api/gateway/${WS_ID}/${type}`, "POST");
      if (type === "preview") setPreview(r);
      else                    setResult({ ok: r.ok ?? r.validationOk, message: r.message ?? r.validationMsg });
      refetch();
    } catch (e) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setAction(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Status cards */}
      <div className="grid grid-cols-4 gap-2.5">
        <MetricCard
          label="Gateway 狀態"
          value={loading ? "—" : status?.gatewayOnline ? "運行中" : "離線"}
          sub={status?.gatewayUrl ?? ""}
          subColor={status?.gatewayOnline ? "green" : "red"}
        />
        <MetricCard
          label="上次推送"
          value={status?.lastPushedAt ? new Date(status.lastPushedAt).toLocaleDateString("zh-TW") : "—"}
          sub={status?.lastPushedAt ? new Date(status.lastPushedAt).toLocaleTimeString("zh-TW") : "尚未推送"}
        />
        <MetricCard
          label="Config 驗證"
          value={status?.validationOk ? "通過" : "待驗證"}
          sub={status?.validationMsg ?? ""}
          subColor={status?.validationOk ? "green" : "red"}
        />
        <div className="bg-gray-100 rounded-lg px-3.5 py-3 flex flex-col justify-between">
          <p className="text-[11px] text-gray-400 mb-2">操作</p>
          <div className="flex flex-col gap-1.5">
            <Btn onClick={() => doAction("preview")}  className="text-[11px]">{action==="preview"  ? "產生中..." : "預覽 Config"}</Btn>
            <Btn onClick={() => doAction("validate")} className="text-[11px]">{action==="validate" ? "驗證中..." : "驗證 Config"}</Btn>
            <Btn onClick={() => doAction("push")} variant="primary" className="text-[11px]">{action==="push" ? "推送中..." : "推送至 Gateway"}</Btn>
          </div>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`rounded-lg px-4 py-3 border text-[13px] font-medium ${
          result.ok ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-600"
        }`}>
          {result.ok ? "✓" : "✕"} {result.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Current stored config */}
        <Card className="flex flex-col">
          <CardTitle>儲存的 Config（上次驗證）</CardTitle>
          {status?.rawJson5 ? (
            <pre className="flex-1 overflow-auto text-[11px] font-mono text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed max-h-96">
              {status.rawJson5}
            </pre>
          ) : (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-[12px] text-gray-400">尚未產生 Config，請點「預覽 Config」</p>
            </div>
          )}
        </Card>

        {/* Preview + validation */}
        <Card className="flex flex-col">
          <CardTitle>Config 預覽 + 驗證結果</CardTitle>
          {preview ? (
            <div className="space-y-3 flex-1">
              <div className={`rounded-lg px-3 py-2 text-[12px] font-medium border ${
                preview.validation.ok
                  ? "bg-green-50 border-green-100 text-green-700"
                  : "bg-amber-50 border-amber-100 text-amber-700"
              }`}>
                {preview.validation.ok ? "✓" : "⚠"} {preview.validation.message}
              </div>
              <pre className="overflow-auto text-[11px] font-mono text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed max-h-80">
                {preview.preview}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
              <p className="text-[13px] text-gray-400">點擊「預覽 Config」檢視完整設定</p>
              <p className="text-[11px] text-gray-300">包含 Agents、Channels、Security 設定</p>
            </div>
          )}
        </Card>
      </div>

      {/* How it works */}
      <Card>
        <CardTitle>Config 推送流程</CardTitle>
        <div className="flex items-start gap-0 mt-1">
          {[
            { n:"1", title:"從 DB 組裝", desc:"讀取 Agents、Channels、Secrets 狀態" },
            { n:"2", title:"安全驗證",   desc:"檢查 gateway bind、DM scope、API key" },
            { n:"3", title:"推送至 Gateway", desc:"POST /admin/config 至 OpenClaw HTTP" },
            { n:"4", title:"記錄 & 告警", desc:"Log 推送結果，失敗時觸發告警規則" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-start flex-1">
              <div className="flex flex-col items-center mr-3">
                <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[12px] font-medium border border-brand-100 shrink-0">
                  {s.n}
                </div>
                {i < 3 && <div className="w-px h-full bg-gray-100 mt-1" />}
              </div>
              <div className="pt-0.5 pr-4">
                <p className="text-[13px] font-medium">{s.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
