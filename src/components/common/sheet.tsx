"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AppButton } from "./button";

type SheetProps = {
  open: boolean;
  title: string;
  label?: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Sheet({ open, title, label, children, onClose }: SheetProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 px-4 pb-4">
      <div className="animate-sheet-up w-full max-w-[430px] rounded-[2rem] max-h-[85svh] overflow-y-auto bg-panel p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            {label ? <p className="text-sm font-bold text-gold">{label}</p> : null}
            <h3 className="text-xl font-black text-milk">{title}</h3>
          </div>
          <AppButton type="button" tone="ghost" className="grid h-11 w-11 place-items-center p-0" onClick={onClose}>
            <X size={20} />
          </AppButton>
        </div>
        {children}
      </div>
    </div>, document.body
  );
}
