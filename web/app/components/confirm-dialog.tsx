"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({ message, confirmLabel = "Confirm", onConfirm, onCancel, destructive = false }: ConfirmDialogProps) {
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; }, []);

  const dialog = (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={onCancel}
    >
      <div
        style={{ backgroundColor: "#fdf6ee", border: "1px solid #e8d5c0", borderRadius: "16px", padding: "24px", maxWidth: "384px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontSize: "14px", color: "#2c1810", marginBottom: "20px" }}>{message}</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ padding: "8px 16px", fontSize: "14px", border: "1px solid #e8d5c0", borderRadius: "12px", color: "#7a5c44", backgroundColor: "transparent", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: "8px 16px", fontSize: "14px", borderRadius: "12px", border: "none", color: "#fff", backgroundColor: destructive ? "#dc2626" : "#2c1810", cursor: "pointer" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
