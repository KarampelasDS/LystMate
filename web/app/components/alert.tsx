"use client";

import { HiOutlineXMark, HiOutlineCheckCircle } from "react-icons/hi2";

interface AlertProps {
  message: string;
  onDismiss: () => void;
  variant?: "error" | "success" | "info";
}

export function Alert({ message, onDismiss, variant = "error" }: AlertProps) {
  const styles = {
    error:   "bg-red-50 border-red-200 text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info:    "bg-cream border-warm-border text-warm-brown",
  }[variant];

  return (
    <div className={`flex items-start gap-2 border rounded-xl px-4 py-2.5 text-sm ${styles}`}>
      {variant === "success" && <HiOutlineCheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer mt-0.5"
        aria-label="Dismiss"
      >
        <HiOutlineXMark className="w-4 h-4" />
      </button>
    </div>
  );
}
