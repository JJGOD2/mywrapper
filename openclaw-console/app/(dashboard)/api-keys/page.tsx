"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn, Toggle } from "@/components/ui";

interface ApiKey {
  id: string; name: string; keyPrefix: string; scope: string;
  allowedIps: string[]; expiresAt: string | null; lastUsedAt: string | null;
  usageCount: number; enabled: boolean; createdAt: string;
  rawKey?: string;
}
interface WebhookEndpoint {
  id: string; name: string; url: string; events: string[];
  enabled: boolean; lastFiredAt: string | null; failCount: number; createdAt: string;
  webhookSecret?: string;
}

const SCOPES: Record<string, string> = {
  READ_ONLY:"唯讀", READ_WRITE:"讀寫", WEBHOOK_ONLY:"Webhook 限定", FULL_ACCESS:"完整存取",
};
const SCOPE_COLOR: Record<string, string> = {
  READ_ONLY:"bg-green-50 text-green-700", READ_WRITE:"bg-amber-50 text-amber-700",
  WEBHOOK_ONLY:"bg-blue-50 text-blue-700", FULL_ACCESS:"bg-red-50 text-red-600",
};
const ALL_EVENTS = [
  "log.error","log.warn","review.pending","review.approved","review.rejected",
  "gateway.push_ok","gateway.push_fail","security.fail","security.warn",
  "usage.threshold","agent.error","channel.disconnect",
];

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
function tok() { return typeof window !== "undefined" ? localStorage.getItem("oc_token") ?? "" : ""; }
async function apiFetch(path: string, method = "GET", body?: object) {
  const r = await fetch(`${BASE}${path}`, {
    method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  if (r.status === 204) return null;
  return r.json();
}

function CopyBox({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-2">
      <code className="flex-1 text-[11px] text-green-400 font-mono break-all">{value}</code>
      <button onClick={copy} className="shrink-0 text-[11px] text-gray-400 hover:text-white transition-colors">
        {copied ? "✓ 已複製" : "複製"}
      </button>
    </div>
  );
}

export default function ApiKeysPage() {
  const [tab, setTab] = useState<"keys"|"webhooks">("keys");

  // API Keys
  const fetchKeys = useCallback(() => apiFetch("/api/admin/api-keys"), []);
  const { data: keys, loading: keysLoading, refetch: refetchKeys } = useApi<ApiKey[]>(fetchKeys, []);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [keyForm, setKeyForm] = useState({ name:"", scope:"READ_ONLY", expiresAt:"" });
  const [savingKey, setSavingKey] = useState(false);

  async function createKey() {
    setSavingKey(true);
    try {
      const k = await apiFetch("/api/admin/api-keys", "POST", {
        ...keyForm, expiresAt: keyForm.expiresAt || undefined,
      });
      setNewKey(k); refetchKeys();
    } finally { setSavingKey(false); }
  }
  async function toggleKey(id: string, enabled: boolean) {
    await apiFetch(`/api/admin/api-keys/${id}`, "PATCH", { enabled });
    refetchKeys();
  }
  async function deleteKey(id: string) {
    if (!confirm("確定刪除此 API Key？此操作不可復原。")) return;
    await apiFetch(`/api/admin/api-keys/${id}`, "DELETE");
    refetchKeys();
  }

  // Webhooks
  const fetchWh = useCallback(() => apiFetch("/api/admin/webhooks"), []);
  const { data: endpoints, loading: whLoading, refetch: refetchWh } = useApi<WebhookEndpoint[]>(fetchWh, []);
  const [newWh, setNewWh] = useState<WebhookEndpoint | null>(null);
  const [whForm, setWhForm] = useState({ name:"", url:"", events:[] as string[] });
  const [savingWh, setSavingWh] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  async function createWh() {
    if (!whForm.name || !whForm.url || !whForm.events.length) return;
    setSavingWh(true);
    try {
      const w = await apiFetch("/api/admin/webhooks", "POST", whForm);
      setNewWh(w); refetchWh();
    } finally { setSavingWh(false); }
  }
  async function testWh(id: string) {
    setTesting(id);
    try { await apiFetch(`/api/admin/webhooks/${id}/test`, "POST"); }
    finally { setTesting(null); refetchWh(); }
  }
  async function deleteWh(id: string) {
    if (!confirm("確定刪除此 Webhook endpoint？")) return;
    await apiFetch(`/api/admin/webhooks/${id}`, "DELETE");
    refetchWh();
  }

  function toggleEvent(ev: string) {
    setWhForm(f => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev],
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["keys","webhooks"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-[13px] rounded-md transition-colors ${tab === t ? "bg-white font-medium shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "keys" ? "API Keys" : "Webhook Endpoints"}
          </button>
        ))}
      </div>

      {tab === "keys" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <Card>
              <CardTitle>建立 API Key</CardTitle>
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">名稱</label>
                  <input value={keyForm.name} onChange={e => setKeyForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="例：外部報表系統"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">權限範圍</label>
                  <select value={keyForm.scope} onChange={e => setKeyForm(f => ({ ...f, scope: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px]">
                    {Object.entries(SCOPES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">過期日期（選填）</label>
                  <input type="date" value={keyForm.expiresAt}
                    onChange={e => setKeyForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px]" />
                </div>
                <Btn variant="primary" onClick={createKey} className="w-full justify-center">
                  {savingKey ? "生成中..." : "生成 API Key"}
                </Btn>
              </div>
            </Card>

            {newKey?.rawKey && (
              <Card className="border-amber-100 bg-amber-50">
                <CardTitle>⚠ 請立即複製此 Key</CardTitle>
                <p className="text-[12px] text-amber-700 mb-2">此 Key 只會顯示一次，關閉後無法再次查看。</p>
                <CopyBox value={newKey.rawKey} label="API Key" />
              </Card>
            )}
          </div>

          <Card>
            <CardTitle>已建立的 Keys</CardTitle>
            {keysLoading ? <p className="text-[12px] text-gray-400 py-4 text-center">載入中...</p> : (
              <div>
                {(keys ?? []).map(k => (
                  <div key={k.id} className="py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] font-medium flex-1">{k.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SCOPE_COLOR[k.scope]}`}>
                        {SCOPES[k.scope]}
                      </span>
                      <Toggle defaultChecked={k.enabled} onChange={v => toggleKey(k.id, v)} />
                    </div>
                    <p className="text-[12px] font-mono text-gray-500">{k.keyPrefix}</p>
                    <div className="flex gap-3 text-[10px] text-gray-400 mt-1">
                      <span>使用 {k.usageCount} 次</span>
                      {k.lastUsedAt && <span>上次 {new Date(k.lastUsedAt).toLocaleDateString("zh-TW")}</span>}
                      {k.expiresAt && <span>到期 {new Date(k.expiresAt).toLocaleDateString("zh-TW")}</span>}
                    </div>
                    <div className="mt-2">
                      <Btn variant="danger" onClick={() => deleteKey(k.id)} className="text-[11px]">撤銷</Btn>
                    </div>
                  </div>
                ))}
                {!keys?.length && <p className="text-[12px] text-gray-400 py-4 text-center">尚未建立任何 API Key</p>}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <Card>
              <CardTitle>新增 Webhook Endpoint</CardTitle>
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">名稱</label>
                  <input value={whForm.name} onChange={e => setWhForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="例：Slack 告警 Bot"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">目標 URL</label>
                  <input value={whForm.url} onChange={e => setWhForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://your-server.com/hooks/openclaw"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 block mb-2">訂閱事件</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_EVENTS.map(ev => (
                      <label key={ev} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={whForm.events.includes(ev)}
                          onChange={() => toggleEvent(ev)}
                          className="rounded border-gray-300 text-brand-400 focus:ring-brand-400" />
                        <span className="text-[11px] text-gray-600 font-mono">{ev}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Btn variant="primary" onClick={createWh} className="w-full justify-center">
                  {savingWh ? "建立中..." : "建立 Endpoint"}
                </Btn>
              </div>
            </Card>

            {newWh?.webhookSecret && (
              <Card className="border-amber-100 bg-amber-50">
                <CardTitle>⚠ Webhook Secret（僅顯示一次）</CardTitle>
                <p className="text-[12px] text-amber-700 mb-2">請用此 secret 驗證 X-OpenClaw-Signature header。</p>
                <CopyBox value={newWh.webhookSecret} label="Webhook Secret" />
              </Card>
            )}
          </div>

          <Card>
            <CardTitle>已設定的 Endpoints</CardTitle>
            {whLoading ? <p className="text-[12px] text-gray-400 py-4 text-center">載入中...</p> : (
              <div>
                {(endpoints ?? []).map(ep => (
                  <div key={ep.id} className="py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] font-medium flex-1">{ep.name}</p>
                      {ep.failCount > 0 && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                          失敗 {ep.failCount}
                        </span>
                      )}
                      <Toggle defaultChecked={ep.enabled} onChange={v =>
                        apiFetch(`/api/admin/webhooks/${ep.id}`, "PATCH", { enabled: v }).then(() => refetchWh())
                      } />
                    </div>
                    <p className="text-[11px] font-mono text-gray-500 truncate">{ep.url}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ep.events.map(ev => (
                        <span key={ev} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{ev}</span>
                      ))}
                    </div>
                    {ep.lastFiredAt && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        上次觸發：{new Date(ep.lastFiredAt).toLocaleString("zh-TW")}
                      </p>
                    )}
                    <div className="flex gap-1.5 mt-2">
                      <Btn onClick={() => testWh(ep.id)} className="text-[11px]">
                        {testing === ep.id ? "測試中..." : "測試發送"}
                      </Btn>
                      <Btn variant="danger" onClick={() => deleteWh(ep.id)} className="text-[11px]">刪除</Btn>
                    </div>
                  </div>
                ))}
                {!endpoints?.length && <p className="text-[12px] text-gray-400 py-4 text-center">尚未設定 Webhook Endpoint</p>}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
