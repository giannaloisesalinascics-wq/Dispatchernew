"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { FiEye, FiEyeOff } from "react-icons/fi";

type InputFieldProps = {
  type?: "text" | "email" | "password";
  placeholder: string;
  icon?: IconType;
  value: string;
  onChange: (value: string) => void;
};

export default function InputField({
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9c9c9c]">
          <Icon size={18} />
        </div>
      )}

      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded-full border border-[#d3d3d3] bg-transparent pr-12 text-sm text-[#444] outline-none transition focus:border-[#f2552c] focus:ring-2 focus:ring-[#f2552c]/20 ${
          Icon ? "pl-12" : "pl-5"
        }`}
      />

      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c9c9c] hover:text-[#f2552c]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
        </button>
      )}
    </div>
  );
}