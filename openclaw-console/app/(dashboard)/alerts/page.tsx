"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn, Toggle } from "@/components/ui";

interface AlertRule {
  id: string; name: string; trigger: string; channel: string;
  destination: string; threshold: number | null;
  enabled: boolean; lastFiredAt: string | null; createdAt: string;
}
interface AlertLog {
  id: string; ruleId: string; trigger: string; message: string; sentAt: string;
}

const TRIGGER_LABEL: Record<string, string> = {
  ERROR_RATE_HIGH:     "Tool 失敗率過高",
  BUDGET_THRESHOLD:    "月費用超標",
  SECURITY_FAIL:       "安全稽核失敗",
  ALLOWLIST_VIOLATION: "Sender 白名單違規",
  DAILY_REPORT:        "每日用量報告",
  REVIEW_PENDING:      "有待審核項目",
};
const CHANNEL_LABEL: Record<string, string> = {
  EMAIL: "Email", SLACK_WEBHOOK: "Slack Webhook", LINE_NOTIFY: "LINE Notify",
};
const CHANNEL_COLOR: Record<string, string> = {
  EMAIL: "bg-blue-50 text-blue-700",
  SLACK_WEBHOOK: "bg-purple-50 text-purple-700",
  LINE_NOTIFY: "bg-green-50 text-green-700",
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
function tok() { return typeof window !== "undefined" ? localStorage.getItem("oc_token") ?? "" : ""; }
async function apiFetch(path: string, method = "GET", body?: object) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  if (method === "DELETE" || r.status === 204) return null;
  return r.json();
}

// ── Create rule form ──────────────────────────────────────────
function CreateRuleForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    name: "", trigger: "ERROR_RATE_HIGH", channel: "EMAIL",
    destination: "", threshold: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    if (!form.name || !form.destination) { setErr("名稱與發送目標為必填"); return; }
    setSaving(true); setErr("");
    try {
      await apiFetch("/api/alerts/rules", "POST", {
        name: form.name, trigger: form.trigger, channel: form.channel,
        destination: form.destination,
        threshold: form.threshold ? Number(form.threshold) : undefined,
      });
      onSaved();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  }

  const field = (label: string, key: keyof typeof form, el: React.ReactNode) => (
    <div>
      <label className="text-[12px] text-gray-500 block mb-1">{label}</label>
      {el}
    </div>
  );
  const inp = (key: keyof typeof form, ph?: string) => (
    <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      placeholder={ph}
      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400" />
  );

  return (
    <div className="space-y-3">
      {field("規則名稱", "name", inp("name", "例：月費用超標通知"))}
      {field("觸發條件", "trigger",
        <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px]">
          {Object.entries(TRIGGER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      )}
      {(form.trigger === "ERROR_RATE_HIGH" || form.trigger === "BUDGET_THRESHOLD") &&
        field("閾值（%／NT$）", "threshold", inp("threshold", form.trigger === "BUDGET_THRESHOLD" ? "例：5000" : "例：10"))}
      {field("通知通道", "channel",
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px]">
          {Object.entries(CHANNEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      )}
      {field(
        form.channel === "EMAIL" ? "Email 地址" :
        form.channel === "SLACK_WEBHOOK" ? "Slack Webhook URL" : "LINE Notify Token",
        "destination", inp("destination",
          form.channel === "EMAIL" ? "ops@example.com" :
          form.channel === "SLACK_WEBHOOK" ? "https://hooks.slack.com/..." : "LINE Notify token"
        )
      )}
      {err && <p className="text-[12px] text-red-500">{err}</p>}
      <Btn variant="primary" onClick={save} className="w-full justify-center">
        {saving ? "儲存中..." : "建立規則"}
      </Btn>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AlertsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const fetchRules = useCallback(() => apiFetch("/api/alerts/rules"), []);
  const fetchLogs  = useCallback(() => apiFetch("/api/alerts/logs"),  []);
  const { data: rules, loading: rulesLoading, refetch: refetchRules } = useApi<AlertRule[]>(fetchRules, []);
  const { data: logs }  = useApi<AlertLog[]>(fetchLogs, []);

  async function toggleRule(id: string, enabled: boolean) {
    await apiFetch(`/api/alerts/rules/${id}`, "PATCH", { enabled });
    refetchRules();
  }
  async function deleteRule(id: string) {
    if (!confirm("確定刪除這條告警規則？")) return;
    await apiFetch(`/api/alerts/rules/${id}`, "DELETE");
    refetchRules();
  }
  async function testRule(id: string) {
    setTesting(id);
    try {
      const r = await apiFetch(`/api/alerts/test/${id}`, "POST");
      setTestResult((p) => ({ ...p, [id]: { ok: r.ok, msg: r.message } }));
    } catch (e) {
      setTestResult((p) => ({ ...p, [id]: { ok: false, msg: (e as Error).message } }));
    } finally { setTesting(null); }
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-gray-100 rounded-lg px-3.5 py-3">
          <p className="text-[11px] text-gray-400 mb-1">已啟用規則</p>
          <p className="text-[22px] font-medium">{rules?.filter(r => r.enabled).length ?? "—"}</p>
        </div>
        <div className="bg-gray-100 rounded-lg px-3.5 py-3">
          <p className="text-[11px] text-gray-400 mb-1">本月告警發送</p>
          <p className="text-[22px] font-medium">{logs?.length ?? "—"}</p>
        </div>
        <div className="bg-gray-100 rounded-lg px-3.5 py-3">
          <p className="text-[11px] text-gray-400 mb-1">通知通道</p>
          <p className="text-[22px] font-medium">
            {rules ? new Set(rules.map(r => r.channel)).size : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Rules list */}
        <div className="space-y-3">
          <Card>
            <CardTitle action={
              <Btn variant="primary" onClick={() => setShowCreate(!showCreate)}>
                {showCreate ? "✕ 取消" : "+ 新增規則"}
              </Btn>
            }>
              告警規則
            </CardTitle>

            {showCreate && (
              <div className="mb-4 pb-4 border-b border-gray-50">
                <CreateRuleForm onSaved={() => { setShowCreate(false); refetchRules(); }} />
              </div>
            )}

            {rulesLoading ? (
              <p className="text-[12px] text-gray-400 py-4 text-center">載入中...</p>
            ) : !rules?.length ? (
              <p className="text-[12px] text-gray-400 py-4 text-center">尚未設定任何告警規則</p>
            ) : (
              <div className="space-y-0">
                {rules.map((rule) => (
                  <div key={rule.id} className="py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[13px] font-medium">{rule.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${CHANNEL_COLOR[rule.channel]}`}>
                            {CHANNEL_LABEL[rule.channel]}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500">{TRIGGER_LABEL[rule.trigger]}
                          {rule.threshold && ` › 閾值 ${rule.threshold}`}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">{rule.destination}</p>
                        {rule.lastFiredAt && (
                          <p className="text-[10px] text-gray-300 mt-0.5">
                            上次觸發：{new Date(rule.lastFiredAt).toLocaleString("zh-TW")}
                          </p>
                        )}
                        {testResult[rule.id] && (
                          <p className={`text-[11px] mt-1 ${testResult[rule.id].ok ? "text-green-600" : "text-red-500"}`}>
                            {testResult[rule.id].ok ? "✓" : "✕"} {testResult[rule.id].msg}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Toggle defaultChecked={rule.enabled} onChange={(v) => toggleRule(rule.id, v)} />
                        <Btn onClick={() => testRule(rule.id)} className="text-[11px]">
                          {testing === rule.id ? "測試中..." : "測試"}
                        </Btn>
                        <Btn variant="danger" onClick={() => deleteRule(rule.id)} className="text-[11px]">刪</Btn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Alert log */}
        <Card>
          <CardTitle>近期告警紀錄</CardTitle>
          {!logs?.length ? (
            <div className="py-8 text-center">
              <p className="text-[24px] mb-2">🔔</p>
              <p className="text-[13px] text-gray-400">尚無告警紀錄</p>
              <p className="text-[12px] text-gray-300 mt-1">設定規則後，觸發時將記錄於此</p>
            </div>
          ) : (
            <div>
              {logs.slice(0, 20).map((l) => (
                <div key={l.id} className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-[12px] shrink-0">🔔</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-gray-700 leading-relaxed">{l.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(l.sentAt).toLocaleString("zh-TW")} · {l.trigger}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Preset rules */}
      <Card>
        <CardTitle>建議規則（快速套用）</CardTitle>
        <div className="grid grid-cols-3 gap-3 mt-1">
          {[
            { title:"Tool 失敗率告警",   desc:"失敗率 > 10% 時通知", trigger:"ERROR_RATE_HIGH",     icon:"⚠️" },
            { title:"月費用超標告警",    desc:"超過 NT$5,000 時通知", trigger:"BUDGET_THRESHOLD",   icon:"💰" },
            { title:"安全稽核失敗通知",  desc:"每次 audit FAIL 即時通知", trigger:"SECURITY_FAIL", icon:"🔒" },
            { title:"每日用量報告",      desc:"每天 09:00 發送摘要", trigger:"DAILY_REPORT",        icon:"📊" },
            { title:"白名單違規通知",    desc:"非授權 sender 嘗試傳訊", trigger:"ALLOWLIST_VIOLATION", icon:"🚫" },
            { title:"審核待辦提醒",      desc:"有待審核訊息時通知", trigger:"REVIEW_PENDING",       icon:"📋" },
          ].map((p) => (
            <div key={p.trigger}
              className="border border-dashed border-gray-200 rounded-xl p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setShowCreate(true)}
            >
              <p className="text-[18px] mb-1.5">{p.icon}</p>
              <p className="text-[13px] font-medium">{p.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{p.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
