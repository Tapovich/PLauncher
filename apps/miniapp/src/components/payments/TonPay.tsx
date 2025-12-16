/**
 * TON Connect Payment Component
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { PaymentIntent, verifyOnchainTransaction } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

interface TonPayProps {
  intent: PaymentIntent | null;
  onIntentCreated: (intent: PaymentIntent) => void;
  createIntent: () => Promise<PaymentIntent>;
  isCreating: boolean;
  startPolling: (intentId: string) => void;
}

export function TonPay({ 
  intent, 
  onIntentCreated, 
  createIntent, 
  isCreating,
  startPolling 
}: TonPayProps) {
  const [isSending, setIsSending] = useState(false);
  const [manualTxHash, setManualTxHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const connected = tonConnectUI.connected;
  const { hapticNotification } = useTelegram();

  const handlePayment = async () => {
    let paymentIntent = intent;

    // Create intent if not exists
    if (!paymentIntent) {
      paymentIntent = await createIntent();
      onIntentCreated(paymentIntent);
    }

    const nextAction = paymentIntent.next_action;
    if (!nextAction || nextAction.type !== "ton_transaction") {
      hapticNotification("error");
      return;
    }

    setIsSending(true);

    try {
      // Send TON transaction via TON Connect
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: nextAction.receiver || nextAction.address || "",
            amount: nextAction.amount_crypto || "0",
            payload: nextAction.comment || "",
          },
        ],
      });

      // Transaction sent
      hapticNotification("success");
      
      // TODO: Extract tx_hash from result if available
      // For now, start polling
      startPolling(paymentIntent.id);
    } catch (err) {
      console.error("TON transaction error:", err);
      hapticNotification("error");
    } finally {
      setIsSending(false);
    }
  };

  const handleManualVerify = async () => {
    if (!intent || !manualTxHash.trim()) {
      hapticNotification("error");
      return;
    }

    setIsVerifying(true);

    try {
      await verifyOnchainTransaction({
        intent_id: intent.id,
        tx_hash: manualTxHash.trim(),
        chain: "ton",
      });

      hapticNotification("success");
      startPolling(intent.id);
    } catch (err) {
      hapticNotification("error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info */}
      <Card className="bg-secondary/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Pay with TON Wallet</p>
              <p className="text-xs text-muted-foreground">
                Fast and secure cryptocurrency payment via TON Connect
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      {!connected && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">
              Connect your TON wallet to continue
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      {intent?.next_action && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{intent.next_action.amount_crypto} TON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Receiver:</span>
            <span className="font-mono text-xs">{intent.next_action.receiver?.slice(0, 8)}...</span>
          </div>
        </div>
      )}

      {/* Send Transaction */}
      <Button
        className="w-full touch-target"
        onClick={handlePayment}
        disabled={!connected || isCreating || isSending}
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending Transaction...
          </>
        ) : isCreating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating Intent...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4 mr-2" />
            Send Payment
          </>
        )}
      </Button>

      {/* Manual TX Hash Input (fallback) */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Already sent? Paste transaction hash to verify:
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Transaction hash..."
            value={manualTxHash}
            onChange={(e) => setManualTxHash(e.target.value)}
            className="text-xs font-mono"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualVerify}
            disabled={!manualTxHash.trim() || isVerifying}
          >
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>
        </div>
      </div>
    </div>
  );
}

