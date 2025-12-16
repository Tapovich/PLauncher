/**
 * Payments Screen - Payment method selection and processing
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodCard } from "@/components/payments/PaymentMethodCard";
import { PaymentModal } from "@/components/payments/PaymentModal";
import { StripePay } from "@/components/payments/StripePay";
import { TonPay } from "@/components/payments/TonPay";
import { UsdtPay } from "@/components/payments/UsdtPay";
import { StarsPay } from "@/components/payments/StarsPay";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";
import { PaymentIntent } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

type PaymentMethod = "stripe" | "ton" | "usdt" | "stars" | null;

interface PaymentsState {
  item?: string;
  amount?: number;
  currency?: string;
  projectId?: string;
}

export function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as PaymentsState;
  
  // Payment config
  const item = state.item || "PLauncher Pro Subscription";
  const amount = state.amount || 199;
  const currency = state.currency || "USD";
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const { hapticImpact, hapticNotification } = useTelegram();

  const {
    intent,
    status,
    loading,
    createIntent,
    startPolling,
    stopPolling,
    reset,
  } = usePaymentFlow({
    onSuccess: (_intent) => {
      hapticNotification("success");
      // Navigate to success or close modal
      setTimeout(() => {
        setSelectedMethod(null);
        navigate("/success", { state: { type: "payment" } });
      }, 1500);
    },
    onError: (_err) => {
      hapticNotification("error");
    },
  });

  const handleMethodSelect = (method: PaymentMethod) => {
    hapticImpact("medium");
    setSelectedMethod(method);
    reset(); // Reset previous payment state
  };

  const handleCloseModal = () => {
    hapticImpact("light");
    setSelectedMethod(null);
    stopPolling();
  };

  // Create intent for specific provider
  const createProviderIntent = async (provider: string) => {
    const createdIntent = await createIntent(provider, amount, currency === "USD" ? currency : "XTR");
    if (createdIntent.provider === "stripe") {
      // Will redirect, start polling when user returns
      startPolling(createdIntent.id);
    }
    return createdIntent;
  };

  const handleIntentCreated = (_: PaymentIntent) => {
    // Intent created callback
  };

  return (
    <>
      <Layout title="Payment" showBack>
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Purchase Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Item:</span>
                  <span className="font-medium">{item}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-xl font-bold">
                    {currency === "XTR" ? "⭐" : "$"}{amount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Payment Method:</h3>
            <div className="space-y-3">
              <PaymentMethodCard
                icon="⭐"
                title="Telegram Stars"
                description="Quick payment with Stars"
                recommended
                onClick={() => handleMethodSelect("stars")}
              />

              <PaymentMethodCard
                icon="💎"
                title="Toncoin (TON)"
                description="Pay with TON cryptocurrency"
                onClick={() => handleMethodSelect("ton")}
              />

              <PaymentMethodCard
                icon="🪙"
                title="USDT"
                description="Stablecoin on TON/TRON/SOL"
                onClick={() => handleMethodSelect("usdt")}
              />

              <PaymentMethodCard
                icon="💳"
                title="Card (Stripe)"
                description="Credit or debit card"
                onClick={() => handleMethodSelect("stripe")}
              />
            </div>
          </div>

          {/* Payment Status (if intent exists) */}
          {intent && !selectedMethod && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  {status === "paid" && (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium">Payment Successful!</p>
                        <p className="text-xs text-muted-foreground">
                          Thank you for your purchase
                        </p>
                      </div>
                    </>
                  )}
                  {status === "pending" && (
                    <>
                      <Clock className="h-6 w-6 text-primary animate-pulse" />
                      <div>
                        <p className="font-medium">Payment Pending...</p>
                        <p className="text-xs text-muted-foreground">
                          Waiting for confirmation
                        </p>
                      </div>
                    </>
                  )}
                  {status === "failed" && (
                    <>
                      <XCircle className="h-6 w-6 text-destructive" />
                      <div>
                        <p className="font-medium">Payment Failed</p>
                        <p className="text-xs text-muted-foreground">
                          Please try again
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>

      {/* Payment Modals */}
      <PaymentModal
        isOpen={selectedMethod === "stripe"}
        onClose={handleCloseModal}
        title="Card Payment"
        icon="💳"
        status={status || undefined}
      >
        <StripePay
          intent={intent}
          onIntentCreated={handleIntentCreated}
          createIntent={() => createProviderIntent("stripe")}
          isCreating={loading}
        />
      </PaymentModal>

      <PaymentModal
        isOpen={selectedMethod === "ton"}
        onClose={handleCloseModal}
        title="TON Payment"
        icon="💎"
        status={status || undefined}
      >
        <TonPay
          intent={intent}
          onIntentCreated={handleIntentCreated}
          createIntent={() => createProviderIntent("ton")}
          isCreating={loading}
          startPolling={startPolling}
        />
      </PaymentModal>

      <PaymentModal
        isOpen={selectedMethod === "usdt"}
        onClose={handleCloseModal}
        title="USDT Payment"
        icon="🪙"
        status={status || undefined}
      >
        <UsdtPay
          intent={intent}
          amount={amount}
          startPolling={startPolling}
        />
      </PaymentModal>

      <PaymentModal
        isOpen={selectedMethod === "stars"}
        onClose={handleCloseModal}
        title="Telegram Stars"
        icon="⭐"
        status={status || undefined}
      >
        <StarsPay
          intent={intent}
          onIntentCreated={handleIntentCreated}
          createIntent={() => createProviderIntent("stars")}
          isCreating={loading}
          startPolling={startPolling}
        />
      </PaymentModal>
    </>
  );
}

