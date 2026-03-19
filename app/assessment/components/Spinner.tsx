"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function Spinner({ size = "md", label }: SpinnerProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const borderMap = {
    sm: "border-2",
    md: "border-2",
    lg: "border-[3px]",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Glow backdrop */}
        <div
          className={`absolute inset-0 ${sizeMap[size]} rounded-full blur-xl opacity-30`}
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
          }}
        />
        {/* Track ring */}
        <div
          className={`${sizeMap[size]} rounded-full ${borderMap[size]} border-white/[0.06]`}
        />
        {/* Spinning arc */}
        <div
          className={`absolute inset-0 ${sizeMap[size]} animate-spin rounded-full ${borderMap[size]} border-transparent`}
          style={{
            borderTopColor: "#8b5cf6",
            borderRightColor: "#06b6d4",
          }}
        />
      </div>
      {label && (
        <p className="text-sm font-medium text-slate-400 tracking-wide">
          {label}
        </p>
      )}
    </div>
  );
}
