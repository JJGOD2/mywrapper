import { cn } from "@/lib/utils";

type Variant = "green" | "red" | "amber" | "gray" | "blue" | "purple";

const variants: Record<Variant, string> = {
  green:  "bg-green-50 text-green-700",
  red:    "bg-red-50 text-red-700",
  amber:  "bg-amber-50 text-amber-700",
  gray:   "bg-gray-100 text-gray-500",
  blue:   "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
};

export function Badge({
  variant = "gray",
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Helper mappers ──────────────────────────────────────────

export function statusBadge(status: string) {
  const map: Record<string, { variant: Variant; label: string }> = {
    active:      { variant: "green",  label: "運行中" },
    setting:     { variant: "amber",  label: "設定中" },
    paused:      { variant: "gray",   label: "暫停" },
    error:       { variant: "red",    label: "異常" },
    enabled:     { variant: "green",  label: "啟用" },
    disabled:    { variant: "gray",   label: "已停用" },
    standby:     { variant: "amber",  label: "待機" },
    connected:   { variant: "green",  label: "已連接" },
    testing:     { variant: "amber",  label: "測試中" },
    disconnected:{ variant: "gray",   label: "未連接" },
    pending:     { variant: "amber",  label: "待審核" },
    ok:          { variant: "green",  label: "正常" },
    expiring:    { variant: "amber",  label: "即將到期" },
    expired:     { variant: "red",    label: "已過期" },
    reconnect:   { variant: "amber",  label: "需重連" },
    inactive:    { variant: "gray",   label: "未設定" },
  };
  const m = map[status] ?? { variant: "gray" as Variant, label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export function riskBadge(risk: string) {
  const map: Record<string, { variant: Variant; label: string }> = {
    low:    { variant: "green", label: "低" },
    medium: { variant: "amber", label: "中" },
    high:   { variant: "red",   label: "高" },
  };
  const m = map[risk] ?? { variant: "gray" as Variant, label: risk };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export function planBadge(plan: string) {
  const map: Record<string, { variant: Variant }> = {
    Starter:  { variant: "gray" },
    Pro:      { variant: "amber" },
    Business: { variant: "blue" },
  };
  const m = map[plan] ?? { variant: "gray" as Variant };
  return <Badge variant={m.variant}>{plan}</Badge>;
}
