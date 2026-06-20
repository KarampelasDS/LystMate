"use client";

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({ message, confirmLabel = "Confirm", onConfirm, onCancel, destructive = false }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-espresso/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-warm-white border border-warm-border rounded-2xl p-6 shadow-lg max-w-sm w-full">
        <p className="text-sm text-espresso mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-warm-border rounded-xl text-warm-brown hover:text-espresso hover:bg-cream transition-colors cursor-pointer select-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-xl text-warm-white transition-colors cursor-pointer select-none ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-espresso hover:bg-espresso-light"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
