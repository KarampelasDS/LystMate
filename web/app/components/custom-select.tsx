"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";

interface Option { value: string; label: string; }

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  size?: "sm" | "md";
}

export function CustomSelect({ value, onChange, options, className = "", size = "md" }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // if there's less than 160px to the left, open to the right instead
      setAlignRight(rect.left >= 160);
    }
    setOpen((v) => !v);
  }

  const isSm = size === "sm";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 border border-warm-border rounded-xl bg-warm-white text-espresso hover:bg-cream active:scale-[0.97] transition-all duration-150 cursor-pointer select-none ${
          isSm ? "text-xs px-2.5 py-1.5" : "text-sm px-3 py-2"
        }`}
      >
        <span>{selected?.label ?? value}</span>
        <HiOutlineChevronDown className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""} ${isSm ? "w-3 h-3" : "w-3.5 h-3.5"} text-warm-muted`} />
      </button>

      {open && (
        <div className={`absolute top-full mt-1.5 z-50 min-w-[9rem] bg-warm-white border border-warm-border rounded-xl shadow-md overflow-hidden ${alignRight ? "right-0" : "left-0"}`}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors duration-100 cursor-pointer ${
                o.value === value
                  ? "bg-warm-border text-espresso font-medium"
                  : "text-espresso hover:bg-cream"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
