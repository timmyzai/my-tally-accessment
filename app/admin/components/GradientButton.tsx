"use client";

import React from "react";

interface GradientButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function GradientButton({
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: GradientButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-300 hover:from-violet-500 hover:to-cyan-500 hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
