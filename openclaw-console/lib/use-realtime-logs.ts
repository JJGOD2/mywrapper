"use client";
// lib/use-realtime-logs.ts
// WebSocket hook for live log streaming from backend
import { useEffect, useRef, useState, useCallback } from "react";

export interface LiveLogEntry {
  id: string; workspaceId: string; logType: string;
  message: string; createdAt: string;
}

const WS_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
  .replace(/^http/, "ws") + "/ws/logs";

export function useRealtimeLogs(workspaceIds: string[] = []) {
  const [logs,       setLogs]       = useState<LiveLogEntry[]>([]);
  const [connected,  setConnected]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const wsRef   = useRef<WebSocket | null>(null);
  const tokenRef = useRef<string>("");

  const connect = useCallback(() => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("oc_token") ?? ""
      : "";
    tokenRef.current = token;
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      // Subscribe to specific workspaces or all
      const msg = workspaceIds.length > 0
        ? { type: "subscribe",     workspaceIds }
        : { type: "subscribe_all" };
      ws.send(JSON.stringify(msg));
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "log") {
          setLogs((prev) => [data as LiveLogEntry, ...prev].slice(0, 200));
        }
      } catch { /* ignore */ }
    };

    ws.onerror = () => setError("WebSocket 連線失敗");
    ws.onclose = () => {
      setConnected(false);
      // Auto reconnect after 3s
      setTimeout(connect, 3000);
    };
  }, [workspaceIds.join(",")]); // eslint-disable-line

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const clear = () => setLogs([]);

  return { logs, connected, error, clear };
}
