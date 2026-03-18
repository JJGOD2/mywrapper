"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Toggle ──────────────────────────────────────────────────
export function Toggle({
  defaultChecked = false,
  onChange,
}: {
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        setOn(!on);
        onChange?.(!on);
      }}
      className={cn(
        "relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors focus:outline-none",
        on ? "bg-brand-400" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
          on ? "translate-x-[15px]" : "translate-x-[2px]"
        )}
      />
    </button>
  );
}

// ─── MetricCard ──────────────────────────────────────────────
export function MetricCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: "green" | "red" | "muted";
}) {
  const subClass = {
    green: "text-green-600",
    red:   "text-red-500",
    muted: "text-gray-400",
  }[subColor ?? "muted"];
  return (
    <div className="bg-gray-100 rounded-lg px-3.5 py-3">
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <p className="text-[22px] font-medium leading-none">{value}</p>
      {sub && <p className={cn("text-[11px] mt-1", subClass)}>{sub}</p>}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1 bg-gray-100 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-brand-400 rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────
export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-100 rounded-xl px-4 py-3.5",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── CardTitle ───────────────────────────────────────────────
export function CardTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[13px] font-medium text-gray-900">{children}</h3>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ─── Btn ─────────────────────────────────────────────────────
export function Btn({
  children,
  onClick,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  className?: string;
}) {
  const base = "px-2.5 py-1 text-[12px] rounded-lg border cursor-pointer transition-colors";
  const vars = {
    default: "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
    primary: "bg-brand-400 border-brand-400 text-white hover:bg-brand-600",
    danger:  "bg-white border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button onClick={onClick} className={cn(base, vars[variant], className)}>
      {children}
    </button>
  );
}

// ─── UsageBar ────────────────────────────────────────────────
export function UsageBar({
  name,
  value,
  percent,
}: {
  name: string;
  value: string | number;
  percent: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="text-[12px] text-gray-500 w-20 shrink-0">{name}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-400 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[12px] text-gray-400 w-10 text-right shrink-0">{value}</span>
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────
export function Select({
  options,
  className,
}: {
  options: string[];
  className?: string;
}) {
  return (
    <select
      className={cn(
        "bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[12px] text-gray-700 cursor-pointer",
        className
      )}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
