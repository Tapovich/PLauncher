/**
 * Toast notification hook
 * Simple toast system with animations
 */

import { useState, useCallback } from "react";
import { useTelegram } from "./useTelegram";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { hapticNotification } = useTelegram();

  const showToast = useCallback((
    message: string,
    type: ToastType = "info",
    title?: string,
    duration = 3000
  ) => {
    const id = Date.now().toString();
    const toast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Haptic feedback
    if (type === "success") {
      hapticNotification("success");
    } else if (type === "error") {
      hapticNotification("error");
    } else if (type === "warning") {
      hapticNotification("warning");
    }
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, [hapticNotification]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    return showToast(message, "success", title);
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    return showToast(message, "error", title);
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    return showToast(message, "info", title);
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    return showToast(message, "warning", title);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}

