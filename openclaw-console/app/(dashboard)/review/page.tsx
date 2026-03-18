"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn } from "@/components/ui";

// ── Types ─────────────────────────────────────────────────────
interface ReviewItem {
  id: string; workspaceId: string; agentId: string;
  platform: string; userId: string;
  userMessage: string; aiDraft: string; editedReply: string | null;
  status: string; reviewedAt: string | null; note: string | null;
  createdAt: string;
  workspace: { client: string; name: string };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:"待審核", APPROVED:"已核准", REJECTED:"已拒絕", EDITED:"改稿發送", TIMEOUT:"已超時",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED:"bg-green-50 text-green-700",
  REJECTED:"bg-red-50 text-red-600",
  EDITED:  "bg-blue-50 text-blue-700",
  TIMEOUT: "bg-gray-100 text-gray-500",
};

// ── API helpers ───────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
function token() {
  return typeof window !== "undefined" ? localStorage.getItem("oc_token") : null;
}
async function apiPost(path: string, body?: object) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ── Counts bar ────────────────────────────────────────────────
function CountBar({ counts }: { counts: { status: string; _count: number }[] }) {
  const map = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {Object.entries(STATUS_LABEL).map(([s, label]) => (
        <div key={s} className="bg-white border border-gray-100 rounded-lg px-3 py-2">
          <p className="text-[11px] text-gray-400">{label}</p>
          <p className="text-[20px] font-medium mt-0.5">{map[s] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

// ── Detail panel ─────────────────────────────────────────────
function ReviewPanel({
  item, onDone,
}: { item: ReviewItem; onDone: () => void }) {
  const [editText, setEditText] = useState(item.aiDraft);
  const [note,     setNote]     = useState("");
  const [loading,  setLoading]  = useState<string | null>(null);
  const [error,    setError]    = useState("");

  async function act(action: "approve" | "reject" | "edit-send") {
    setLoading(action); setError("");
    try {
      const body =
        action === "approve" ? undefined :
        action === "reject"  ? { note }  :
        { editedReply: editText, note };
      await apiPost(`/api/review/${item.id}/${action}`, body);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Message context */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">使用者訊息</p>
        <p className="text-[13px] text-gray-700 leading-relaxed">{item.userMessage}</p>
        <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
          <span>{item.workspace.client} — {item.workspace.name}</span>
          <span>{item.platform}</span>
          <span>{item.userId}</span>
          <span>{new Date(item.createdAt).toLocaleString("zh-TW")}</span>
        </div>
      </div>

      {/* AI draft (editable) */}
      <div>
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
          AI 草稿（可直接修改）
        </p>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={5}
          disabled={item.status !== "PENDING"}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] resize-none focus:outline-none focus:border-brand-400 disabled:opacity-60"
        />
      </div>

      {/* Note */}
      {item.status === "PENDING" && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">審核備注（選填）</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="紀錄審核原因..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400"
          />
        </div>
      )}

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      {/* Actions */}
      {item.status === "PENDING" && (
        <div className="flex gap-2 pt-1">
          <Btn
            variant="primary"
            onClick={() => act("approve")}
            className={loading === "approve" ? "opacity-50" : ""}
          >
            {loading === "approve" ? "發送中..." : "✓ 核准發送"}
          </Btn>
          <Btn
            onClick={() => act("edit-send")}
            className={loading === "edit-send" ? "opacity-50" : ""}
          >
            {loading === "edit-send" ? "發送中..." : "✎ 改稿發送"}
          </Btn>
          <Btn
            variant="danger"
            onClick={() => act("reject")}
            className={loading === "reject" ? "opacity-50" : ""}
          >
            {loading === "reject" ? "處理中..." : "✕ 拒絕"}
          </Btn>
        </div>
      )}

      {item.status !== "PENDING" && (
        <div className="flex items-center gap-2 pt-1">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[item.status]}`}>
            {STATUS_LABEL[item.status]}
          </span>
          {item.reviewedAt && (
            <span className="text-[11px] text-gray-400">
              {new Date(item.reviewedAt).toLocaleString("zh-TW")}
            </span>
          )}
          {item.note && <span className="text-[11px] text-gray-400">備注：{item.note}</span>}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function ReviewPage() {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selected,     setSelected]     = useState<ReviewItem | null>(null);

  const fetchFn = useCallback(
    () => fetch(`${BASE}/api/review?status=${statusFilter}&limit=30`, {
      headers: { Authorization: `Bearer ${token()}` },
    }).then((r) => r.json()),
    [statusFilter]
  );
  const { data, loading, refetch } = useApi<{ items: ReviewItem[]; counts: { status: string; _count: number }[] }>(
    fetchFn, [statusFilter]
  );

  function handleDone() {
    setSelected(null);
    refetch();
  }

  return (
    <div className="space-y-0">
      {data?.counts && <CountBar counts={data.counts} />}

      <div className="grid grid-cols-2 gap-3 h-[calc(100vh-220px)]">
        {/* List */}
        <Card className="overflow-hidden flex flex-col">
          <CardTitle
            action={
              <div className="flex gap-1.5">
                {Object.entries(STATUS_LABEL).map(([s, label]) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setSelected(null); }}
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                      statusFilter === s
                        ? STATUS_COLOR[s] + " border-transparent"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            審核佇列
          </CardTitle>
          <div className="flex-1 overflow-y-auto -mx-4 px-4">
            {loading ? (
              <p className="text-[12px] text-gray-400 py-8 text-center">載入中...</p>
            ) : !data?.items.length ? (
              <p className="text-[12px] text-gray-400 py-8 text-center">
                {statusFilter === "PENDING" ? "目前沒有待審核項目 🎉" : "沒有符合的項目"}
              </p>
            ) : (
              data.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`p-3 rounded-lg mb-1.5 cursor-pointer border transition-colors ${
                    selected?.id === item.id
                      ? "border-brand-400 bg-brand-50"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[item.status]}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.platform}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {new Date(item.createdAt).toLocaleTimeString("zh-TW", { hour:"2-digit", minute:"2-digit" })}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-700 line-clamp-1 font-medium">{item.userMessage}</p>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.aiDraft}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Detail */}
        <Card className="overflow-y-auto">
          {selected ? (
            <>
              <CardTitle action={<button onClick={() => setSelected(null)} className="text-[12px] text-gray-400 hover:text-gray-600">✕ 關閉</button>}>
                審核詳情
              </CardTitle>
              <ReviewPanel item={selected} onDone={handleDone} />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-[24px] mb-2">👆</p>
              <p className="text-[13px] text-gray-400">選擇左側項目開始審核</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
