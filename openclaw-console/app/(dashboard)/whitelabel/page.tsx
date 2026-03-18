"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn } from "@/components/ui";

interface WhiteLabel {
  id?: string; brandName: string; logoUrl: string | null; faviconUrl: string | null;
  primaryColor: string; accentColor: string; customDomain: string | null;
  customCss: string | null; supportEmail: string | null;
  supportUrl: string | null; footerText: string | null; hideBuiltBy: boolean;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
function tok() { return typeof window !== "undefined" ? localStorage.getItem("oc_token") ?? "" : ""; }

export default function WhitelabelPage() {
  const fetchFn = useCallback(() =>
    fetch(`${BASE}/api/whitelabel`, { headers: { Authorization: `Bearer ${tok()}` } }).then(r => r.json()),
    []
  );
  const { data: saved, refetch } = useApi<WhiteLabel>(fetchFn, []);

  const [form, setForm] = useState<WhiteLabel>({
    brandName: "OpenClaw Console", logoUrl: null, faviconUrl: null,
    primaryColor: "#BA7517", accentColor: "#854F0B", customDomain: null,
    customCss: null, supportEmail: null, supportUrl: null, footerText: null, hideBuiltBy: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Merge saved into form on load
  useState(() => { if (saved) setForm(saved); });

  function set(k: keyof WhiteLabel, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true); setMsg(null);
    try {
      await fetch(`${BASE}/api/whitelabel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body: JSON.stringify(form),
      });
      setMsg({ ok: true, text: "品牌設定已儲存" });
      refetch();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally { setSaving(false); }
  }

  const field = (label: string, hint?: string, children?: React.ReactNode) => (
    <div>
      <label className="text-[12px] text-gray-500 block mb-1">{label}
        {hint && <span className="text-gray-300 ml-1.5">{hint}</span>}
      </label>
      {children}
    </div>
  );
  const inp = (k: keyof WhiteLabel, ph?: string, type = "text") => (
    <input type={type} value={(form[k] as string) ?? ""} placeholder={ph}
      onChange={e => set(k, e.target.value)}
      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400" />
  );

  return (
    <div className="max-w-3xl space-y-4">
      {/* Preview banner */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-12 flex items-center px-4 gap-2.5"
          style={{ backgroundColor: form.primaryColor + "15" }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[12px] font-medium"
            style={{ backgroundColor: form.primaryColor }}>
            {form.brandName.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[14px] font-medium" style={{ color: form.primaryColor }}>
            {form.brandName || "Brand Name"}
          </span>
          {form.customDomain && (
            <span className="text-[11px] text-gray-400 ml-auto">{form.customDomain}</span>
          )}
        </div>
        <div className="px-4 py-2 bg-white border-t border-gray-50">
          <p className="text-[11px] text-gray-300">
            {form.footerText || (form.hideBuiltBy ? "" : "Powered by OpenClaw")}
          </p>
        </div>
      </div>

      {/* Brand */}
      <Card>
        <CardTitle>品牌識別</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          {field("品牌名稱", "", inp("brandName", "OpenClaw Console"))}
          {field("自訂網域", "白標用", inp("customDomain", "console.yourdomain.com"))}
          {field("Logo URL", "建議 40px 高 SVG/PNG", inp("logoUrl", "https://..."))}
          {field("Favicon URL", "32×32 PNG/ICO", inp("faviconUrl", "https://..."))}
        </div>
      </Card>

      {/* Colors */}
      <Card>
        <CardTitle>色彩設定</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] text-gray-500 block mb-1">主色</label>
            <div className="flex gap-2">
              <input type="color" value={form.primaryColor}
                onChange={e => set("primaryColor", e.target.value)}
                className="w-10 h-9 rounded border border-gray-200 cursor-pointer bg-gray-50 p-0.5" />
              <input value={form.primaryColor} onChange={e => set("primaryColor", e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-brand-400" />
            </div>
          </div>
          <div>
            <label className="text-[12px] text-gray-500 block mb-1">強調色</label>
            <div className="flex gap-2">
              <input type="color" value={form.accentColor}
                onChange={e => set("accentColor", e.target.value)}
                className="w-10 h-9 rounded border border-gray-200 cursor-pointer bg-gray-50 p-0.5" />
              <input value={form.accentColor} onChange={e => set("accentColor", e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-brand-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {["#BA7517","#185FA5","#0F6E56","#534AB7","#993556","#3B6D11"].map(c => (
            <button key={c} onClick={() => set("primaryColor", c)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: form.primaryColor === c ? c : "transparent" }} />
          ))}
        </div>
      </Card>

      {/* Support & Footer */}
      <Card>
        <CardTitle>支援資訊 & 頁尾</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          {field("支援 Email",  "", inp("supportEmail",  "support@yourdomain.com", "email"))}
          {field("支援網址",    "", inp("supportUrl",    "https://docs.yourdomain.com"))}
          {field("頁尾文字",    "留空則顯示預設", inp("footerText", "© 2026 YourCompany"))}
          <div>
            <label className="text-[12px] text-gray-500 block mb-1">隱藏「Powered by」標示</label>
            <div className="flex items-center gap-2 mt-1.5">
              <button onClick={() => set("hideBuiltBy", !form.hideBuiltBy)}
                className={`relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors ${form.hideBuiltBy ? "bg-brand-400" : "bg-gray-200"}`}>
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${form.hideBuiltBy ? "translate-x-[15px]" : "translate-x-[2px]"}`} />
              </button>
              <span className="text-[12px] text-gray-500">{form.hideBuiltBy ? "已隱藏" : "顯示中"}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Custom CSS */}
      <Card>
        <CardTitle>自訂 CSS <span className="text-[11px] font-normal text-gray-400">進階</span></CardTitle>
        <textarea
          value={form.customCss ?? ""}
          onChange={e => set("customCss", e.target.value)}
          rows={6}
          placeholder={`/* 覆寫 CSS 變數或元件樣式 */\n:root {\n  --sidebar-width: 240px;\n}`}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[12px] font-mono resize-none focus:outline-none focus:border-brand-400"
        />
      </Card>

      {msg && (
        <div className={`rounded-lg px-4 py-3 text-[13px] border ${msg.ok ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-600"}`}>
          {msg.ok ? "✓" : "✕"} {msg.text}
        </div>
      )}
      <Btn variant="primary" onClick={save} className="w-full justify-center py-2.5">
        {saving ? "儲存中..." : "儲存品牌設定"}
      </Btn>
    </div>
  );
}
