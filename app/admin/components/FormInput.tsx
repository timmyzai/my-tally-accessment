"use client";

import React from "react";

interface FormInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  min?: number;
}

export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  min,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm"
      />
    </div>
  );
}
