/**
 * Payment flow hook
 * Manages payment intent creation, polling, and status
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { PaymentIntent, createPaymentIntent, getPaymentIntent, APIError } from "@/lib/api";
import { useTelegram } from "./useTelegram";

interface UsePaymentFlowOptions {
  onSuccess?: (intent: PaymentIntent) => void;
  onError?: (error: Error) => void;
}

export function usePaymentFlow(options: UsePaymentFlowOptions = {}) {
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [status, setStatus] = useState<PaymentIntent["status"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>("");
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { hapticNotification } = useTelegram();

  // Create payment intent
  const createIntent = useCallback(async (
    provider: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const newIntent = await createPaymentIntent({
        provider,
        amount,
        currency,
        metadata,
      });

      setIntent(newIntent);
      setStatus(newIntent.status);
      setLoading(false);

      return newIntent;
    } catch (err) {
      const message = err instanceof APIError ? err.message : "Failed to create payment";
      setError(message);
      setLoading(false);
      options.onError?.(err as Error);
      throw err;
    }
  }, [options]);

  // Poll payment status
  const startPolling = useCallback((
    intentId: string,
    intervalMs = 2000,
    maxDurationMs = 90000
  ) => {
    const startTime = Date.now();

    const poll = async () => {
      try {
        const updatedIntent = await getPaymentIntent(intentId);
        setIntent(updatedIntent);
        setStatus(updatedIntent.status);

        // Stop polling if terminal state
        if (["paid", "failed", "expired"].includes(updatedIntent.status)) {
          stopPolling();

          if (updatedIntent.status === "paid") {
            hapticNotification("success");
            options.onSuccess?.(updatedIntent);
          } else if (updatedIntent.status === "failed") {
            hapticNotification("error");
            setError("Payment failed");
          } else if (updatedIntent.status === "expired") {
            hapticNotification("error");
            setError("Payment expired");
          }
        }

        // Stop if max duration exceeded
        if (Date.now() - startTime > maxDurationMs) {
          stopPolling();
          setError("Polling timeout");
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Continue polling on error (transient network issues)
      }
    };

    // Initial poll
    poll();

    // Set up interval
    pollingIntervalRef.current = setInterval(poll, intervalMs);
  }, [hapticNotification, options]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const reset = useCallback(() => {
    setIntent(null);
    setStatus(null);
    setError(null);
    setTxHash("");
    setLoading(false);
    stopPolling();
  }, [stopPolling]);

  return {
    intent,
    status,
    loading,
    error,
    txHash,
    setTxHash,
    createIntent,
    startPolling,
    stopPolling,
    reset,
  };
}

