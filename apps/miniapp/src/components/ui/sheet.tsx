/**
 * Sheet component for bottom sheets and modals
 * Simple implementation for idea details view
 */

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Sheet({ isOpen, onClose, children, title }: SheetProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-end">
        <div
          className={cn(
            "w-full bg-background rounded-t-2xl border-t border-border shadow-lg",
            "max-h-[90vh] overflow-y-auto",
            "animate-in slide-in-from-bottom duration-300"
          )}
        >
          {/* Header */}
          {title && (
            <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-secondary transition-colors touch-target"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-4 pb-8 safe-bottom">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

