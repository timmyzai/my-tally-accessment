"use client";

interface StatusBadgeProps {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "REVOKED";
}

const config: Record<
  string,
  { label: string; bg: string; text: string; glow: string }
> = {
  NOT_STARTED: {
    label: "Not Started",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    glow: "",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.15)]",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.15)]",
  },
  REVOKED: {
    label: "Revoked",
    bg: "bg-red-500/10",
    text: "text-red-400",
    glow: "",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] px-3 py-1 text-xs font-medium ${c.bg} ${c.text} ${c.glow} backdrop-blur-sm`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "NOT_STARTED"
            ? "bg-slate-400"
            : status === "IN_PROGRESS"
            ? "bg-blue-400 animate-pulse"
            : status === "REVOKED"
            ? "bg-red-400"
            : "bg-emerald-400"
        }`}
      />
      {c.label}
    </span>
  );
}
