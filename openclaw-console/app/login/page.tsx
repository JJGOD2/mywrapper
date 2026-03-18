"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("admin@example.com");
  const [password, setPassword] = useState("admin1234");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-sm shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center text-white text-[13px] font-medium">
            OC
          </div>
          <div>
            <p className="text-[14px] font-medium leading-none">OpenClaw</p>
            <p className="text-[10px] text-gray-400">商業控制台</p>
          </div>
        </div>

        <h1 className="text-[20px] font-medium mb-1">登入</h1>
        <p className="text-[13px] text-gray-400 mb-6">使用您的帳號登入控制台</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] text-gray-500 block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>
          <div>
            <label className="text-[12px] text-gray-500 block mb-1.5">密碼</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-[12px] text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-400 text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </form>

        <p className="text-[11px] text-gray-300 text-center mt-6">
          OpenClaw Console v0.1.0
        </p>
      </div>
    </div>
  );
}
