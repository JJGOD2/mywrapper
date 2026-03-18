"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn } from "@/components/ui";

interface Template {
  id: string; name: string; description: string;
  category: string; content: string;
  variables: { name: string; description?: string; default?: string }[] | null;
  usageCount: number; isSystem: boolean;
  createdAt: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  CUSTOMER_SERVICE:"客服", SALES:"業務", ADMIN:"行政助理",
  FAQ:"FAQ", FORM_REPLY:"表單回覆", SUMMARY:"摘要",
  ESCALATION:"升級轉接", CUSTOM:"自訂",
};
const CATEGORY_COLOR: Record<string, string> = {
  CUSTOMER_SERVICE:"bg-blue-50 text-blue-700",
  SALES:"bg-green-50 text-green-700",
  ADMIN:"bg-purple-50 text-purple-700",
  FAQ:"bg-amber-50 text-amber-700",
  FORM_REPLY:"bg-teal-50 text-teal-700",
  SUMMARY:"bg-gray-100 text-gray-600",
  ESCALATION:"bg-red-50 text-red-600",
  CUSTOM:"bg-gray-100 text-gray-500",
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
function tok() { return typeof window !== "undefined" ? localStorage.getItem("oc_token") : null; }

// ── Variable renderer ─────────────────────────────────────────
function TemplatePreview({ template }: { template: Template }) {
  const vars  = template.variables ?? [];
  const [vals, setVals] = useState<Record<string, string>>(
    Object.fromEntries(vars.map((v) => [v.name, v.default ?? ""]))
  );

  let rendered = template.content;
  for (const [k, v] of Object.entries(vals)) {
    rendered = rendered.replaceAll(`{{${k}}}`, v || `{{${k}}}`);
  }

  return (
    <div className="space-y-3">
      {vars.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">變數填充</p>
          <div className="grid grid-cols-2 gap-2">
            {vars.map((v) => (
              <div key={v.name}>
                <label className="text-[11px] text-gray-500 block mb-1">
                  {`{{${v.name}}}`} {v.description && `— ${v.description}`}
                </label>
                <input
                  value={vals[v.name] ?? ""}
                  onChange={(e) => setVals({ ...vals, [v.name]: e.target.value })}
                  placeholder={v.default ?? `輸入 ${v.name}`}
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[12px] focus:outline-none focus:border-brand-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Prompt 預覽</p>
        <pre className="bg-gray-50 rounded-lg p-3 text-[12px] font-mono text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100 max-h-60 overflow-y-auto">
          {rendered}
        </pre>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        <span>使用次數：{template.usageCount.toLocaleString()}</span>
        {template.isSystem && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">系統模板</span>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function TemplatesPage() {
  const [catFilter,  setCatFilter]  = useState("ALL");
  const [selected,   setSelected]   = useState<Template | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCat,     setNewCat]     = useState("CUSTOM");
  const [saving,     setSaving]     = useState(false);

  const fetchFn = useCallback(() =>
    fetch(`${BASE}/api/templates`, { headers: { Authorization: `Bearer ${tok()}` } }).then((r) => r.json()),
    []
  );
  const { data: templates, loading, refetch } = useApi<Template[]>(fetchFn, []);

  const filtered = (templates ?? []).filter(
    (t) => catFilter === "ALL" || t.category === catFilter
  );

  async function saveTemplate() {
    if (!newName.trim() || !newContent.trim()) return;
    setSaving(true);
    try {
      await fetch(`${BASE}/api/templates`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
        body:    JSON.stringify({ name: newName, content: newContent, category: newCat }),
      });
      setShowCreate(false); setNewName(""); setNewContent("");
      refetch();
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setCatFilter("ALL")}
          className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${catFilter === "ALL" ? "bg-brand-400 text-white border-brand-400" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
        >
          全部 ({templates?.length ?? 0})
        </button>
        {Object.entries(CATEGORY_LABEL).map(([k, v]) => {
          const count = (templates ?? []).filter((t) => t.category === k).length;
          if (!count) return null;
          return (
            <button
              key={k}
              onClick={() => setCatFilter(k)}
              className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${catFilter === k ? "bg-brand-400 text-white border-brand-400" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              {v} ({count})
            </button>
          );
        })}
        <div className="flex-1" />
        <Btn variant="primary" onClick={() => setShowCreate(true)}>+ 新增模板</Btn>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Template list */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-[12px] text-gray-400 py-8 text-center">載入中...</p>
          ) : filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-colors ${
                selected?.id === t.id ? "border-brand-400" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-[13px] font-medium flex-1">{t.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[t.category]}`}>
                  {CATEGORY_LABEL[t.category]}
                </span>
              </div>
              {t.description && <p className="text-[12px] text-gray-400 line-clamp-1">{t.description}</p>}
              <p className="text-[11px] text-gray-300 mt-1.5 line-clamp-2 font-mono">{t.content.slice(0, 80)}...</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-gray-300">使用 {t.usageCount} 次</span>
                {t.isSystem && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">系統</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Detail / Create */}
        <Card>
          {showCreate ? (
            <>
              <CardTitle action={<button onClick={() => setShowCreate(false)} className="text-[12px] text-gray-400">✕</button>}>
                新增模板
              </CardTitle>
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">名稱</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">分類</label>
                  <select value={newCat} onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px]">
                    {Object.entries(CATEGORY_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">Prompt 內容（用 {"{{變數名}}"} 插入變數）</label>
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                    rows={8}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] font-mono resize-none focus:outline-none focus:border-brand-400" />
                </div>
                <Btn variant="primary" onClick={saveTemplate} className="w-full justify-center">
                  {saving ? "儲存中..." : "儲存模板"}
                </Btn>
              </div>
            </>
          ) : selected ? (
            <>
              <CardTitle action={<Btn>套用至 Agent</Btn>}>{selected.name}</CardTitle>
              <TemplatePreview template={selected} />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <p className="text-[24px] mb-2">📝</p>
              <p className="text-[13px] text-gray-400">選擇模板預覽，或新增自訂模板</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
