/**
 * Toast Container - Displays toast notifications
 */

import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

type ToastType = "success" | "error" | "info" | "warning";

const TOAST_ICONS: Record<ToastType, any> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const TOAST_VARIANTS = {
  success: "success" as const,
  error: "destructive" as const,
  info: "default" as const,
  warning: "default" as const,
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = TOAST_ICONS[toast.type];
        const variant = TOAST_VARIANTS[toast.type];

        return (
          <div
            key={toast.id}
            className="animate-in slide-in-from-top duration-300"
          >
            <Toast
              variant={variant}
              onClose={() => removeToast(toast.id)}
            >
              <div className="flex items-start gap-2">
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                  <ToastDescription>{toast.message}</ToastDescription>
                </div>
              </div>
            </Toast>
          </div>
        );
      })}
    </div>
  );
}

