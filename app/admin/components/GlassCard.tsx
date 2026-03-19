"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  noPadding = false,
}: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] ${
        noPadding ? "" : "p-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}
