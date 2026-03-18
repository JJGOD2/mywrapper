"use client";
import { useState, useCallback } from "react";
import { useApi } from "@/lib/use-api";
import { Card, CardTitle, Btn } from "@/components/ui";

interface AppUser { id: string; email: string; name: string | null; role: string; createdAt: string; }

const ROLES   = ["ADMIN", "OPERATOR", "VIEWER"] as const;
type  Role    = typeof ROLES[number];
const ROLE_LABEL: Record<Role, string> = { ADMIN:"管理員", OPERATOR:"操作員", VIEWER:"檢視者" };
const ROLE_DESC:  Record<Role, string> = {
  ADMIN:    "完全存取：建立、修改、刪除所有資源，管理使用者",
  OPERATOR: "業務操作：可讀寫 Agent、Channel、Tool，可審核、推送 Gateway，不可管理使用者",
  VIEWER:   "唯讀：僅能查看 Dashboard、Log、Agent 資訊，不可看 Secrets",
};
const ROLE_COLOR: Record<Role, string> = {
  ADMIN:    "bg-red-50 text-red-700",
  OPERATOR: "bg-amber-50 text-amber-700",
  VIEWER:   "bg-gray-100 text-gray-500",
};

const RESOURCE_ROWS = [
  { r:"WORKSPACE",  label:"Workspace 管理" },
  { r:"AGENT",      label:"Agent" },
  { r:"CHANNEL",    label:"Channel" },
  { r:"TOOL",       label:"Tools & Skills" },
  { r:"SECRET",     label:"Secrets（API Keys）" },
  { r:"LOG",        label:"Logs" },
  { r:"SECURITY",   label:"Security Audit" },
  { r:"REVIEW",     label:"人工審核" },
  { r:"GATEWAY",    label:"Gateway 推送" },
  { r:"TEMPLATE",   label:"模板中心" },
  { r:"ALERT",      label:"告警規則" },
  { r:"WHITELABEL", label:"白標設定" },
  { r:"API_KEY",    label:"API Keys" },
  { r:"USER",       label:"使用者管理" },
];

const PERMISSION_MATRIX: Record<Role, Record<string, string[]>> = {
  ADMIN: Object.fromEntries(RESOURCE_ROWS.map(r => [r.r, ["VIEW","CREATE","UPDATE","DELETE","APPROVE","PUSH","MANAGE"]])),
  OPERATOR: {
    WORKSPACE:"VIEW UPDATE".split(" "), AGENT:"VIEW CREATE UPDATE".split(" "),
    CHANNEL:"VIEW CREATE UPDATE".split(" "), TOOL:"VIEW UPDATE".split(" "),
    SECRET:[], LOG:["VIEW"], SECURITY:["VIEW"], REVIEW:"VIEW APPROVE".split(" "),
    GATEWAY:"VIEW PUSH".split(" "), TEMPLATE:"VIEW CREATE UPDATE".split(" "),
    ALERT:"VIEW CREATE UPDATE".split(" "), WHITELABEL:["VIEW"],
    API_KEY:"VIEW CREATE".split(" "), USER:["VIEW"],
  },
  VIEWER: Object.fromEntries(RESOURCE_ROWS.map(r => [r.r, r.r === "SECRET" || r.r === "WHITELABEL" || r.r === "API_KEY" || r.r === "USER" ? [] : ["VIEW"]])),
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
function tok() { return typeof window !== "undefined" ? localStorage.getItem("oc_token") ?? "" : ""; }
async function req(path: string, method = "GET", body?: object) {
  const r = await fetch(`${BASE}${path}`, {
    method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  if (r.status === 204) return null;
  return r.json();
}

export default function PermissionsPage() {
  const [tab, setTab] = useState<"matrix"|"users">("matrix");
  const [selectedRole, setSelectedRole] = useState<Role>("ADMIN");

  const fetchUsers = useCallback(() => req("/api/admin/users"), []);
  const { data: users, loading, refetch } = useApi<AppUser[]>(fetchUsers, []);

  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ email:"", password:"", name:"", role:"OPERATOR" as Role });
  const [saving,  setSaving]  = useState(false);
  const [errMsg,  setErrMsg]  = useState("");

  async function createUser() {
    if (!newUser.email || !newUser.password) { setErrMsg("Email 和密碼為必填"); return; }
    setSaving(true); setErrMsg("");
    try {
      await req("/api/admin/users", "POST", newUser);
      setShowAdd(false); setNewUser({ email:"", password:"", name:"", role:"OPERATOR" });
      refetch();
    } catch(e) { setErrMsg((e as Error).message); }
    finally { setSaving(false); }
  }

  async function changeRole(id: string, role: Role) {
    await req(`/api/admin/users/${id}/role`, "PATCH", { role });
    refetch();
  }

  async function deleteUser(id: string) {
    if (!confirm("確定刪除此使用者？")) return;
    await req(`/api/admin/users/${id}`, "DELETE");
    refetch();
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["matrix","users"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-[13px] rounded-md transition-colors ${tab === t ? "bg-white font-medium shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "matrix" ? "權限矩陣" : "使用者管理"}
          </button>
        ))}
      </div>

      {tab === "matrix" && (
        <div className="space-y-4">
          {/* Role cards */}
          <div className="grid grid-cols-3 gap-3">
            {ROLES.map(r => (
              <div key={r} onClick={() => setSelectedRole(r)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-colors ${selectedRole === r ? "border-brand-400" : "border-gray-100 hover:border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[r]}`}>{ROLE_LABEL[r]}</span>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed">{ROLE_DESC[r]}</p>
              </div>
            ))}
          </div>

          {/* Permission table */}
          <Card>
            <CardTitle>{ROLE_LABEL[selectedRole]} 權限明細</CardTitle>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-[11px] font-medium text-gray-400 pb-2 uppercase tracking-wide">資源</th>
                  {["VIEW","CREATE","UPDATE","DELETE","APPROVE","PUSH","MANAGE"].map(a => (
                    <th key={a} className="text-center text-[10px] font-medium text-gray-400 pb-2 px-2 uppercase tracking-wide">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCE_ROWS.map(row => {
                  const actions = PERMISSION_MATRIX[selectedRole][row.r] ?? [];
                  return (
                    <tr key={row.r} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-[13px] font-medium">{row.label}</td>
                      {["VIEW","CREATE","UPDATE","DELETE","APPROVE","PUSH","MANAGE"].map(a => (
                        <td key={a} className="text-center py-2 px-2">
                          {actions.includes(a)
                            ? <span className="text-green-500 text-[14px]">✓</span>
                            : <span className="text-gray-200 text-[12px]">—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          <Card>
            <CardTitle action={
              <Btn variant="primary" onClick={() => setShowAdd(!showAdd)}>
                {showAdd ? "✕ 取消" : "+ 新增使用者"}
              </Btn>
            }>使用者列表</CardTitle>

            {showAdd && (
              <div className="mb-4 pb-4 border-b border-gray-50 grid grid-cols-2 gap-3">
                {[["Email","email","email"],["密碼","password","password"],["姓名","name","text"]].map(([l,k,t]) => (
                  <div key={k}>
                    <label className="text-[12px] text-gray-500 block mb-1">{l}</label>
                    <input type={t} value={(newUser as Record<string,string>)[k]}
                      onChange={e => setNewUser(u => ({ ...u, [k]: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-brand-400" />
                  </div>
                ))}
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">角色</label>
                  <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as Role }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px]">
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                </div>
                {errMsg && <p className="col-span-2 text-[12px] text-red-500">{errMsg}</p>}
                <div className="col-span-2">
                  <Btn variant="primary" onClick={createUser}>{saving ? "建立中..." : "建立使用者"}</Btn>
                </div>
              </div>
            )}

            {loading ? <p className="text-[12px] text-gray-400 py-4 text-center">載入中...</p> : (
              <table className="w-full">
                <thead><tr className="border-b border-gray-50">
                  {["Email","姓名","角色","建立日期","操作"].map(h => (
                    <th key={h} className="text-left text-[11px] font-medium text-gray-400 pb-2 pr-4 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(users ?? []).map(u => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-[13px] font-mono text-gray-700">{u.email}</td>
                      <td className="py-2.5 pr-4 text-[13px] text-gray-500">{u.name ?? "—"}</td>
                      <td className="py-2.5 pr-4">
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value as Role)}
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${ROLE_COLOR[u.role as Role] ?? "bg-gray-100 text-gray-500"}`}>
                          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                        </select>
                      </td>
                      <td className="py-2.5 pr-4 text-[12px] text-gray-400 font-mono">
                        {new Date(u.createdAt).toLocaleDateString("zh-TW")}
                      </td>
                      <td className="py-2.5"><Btn variant="danger" onClick={() => deleteUser(u.id)}>刪除</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
