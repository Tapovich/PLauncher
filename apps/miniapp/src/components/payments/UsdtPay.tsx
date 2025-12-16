/**
 * USDT Payment Component (TON / TRON / SOL)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, AlertTriangle, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PaymentIntent, createDepositAddress, verifyOnchainTransaction } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

interface UsdtPayProps {
  intent: PaymentIntent | null;
  amount: number;
  startPolling: (intentId: string, interval?: number, maxDuration?: number) => void;
}

type Chain = "ton" | "tron" | "sol";

export function UsdtPay({ intent, amount, startPolling }: UsdtPayProps) {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [memo, setMemo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const { hapticImpact, hapticNotification } = useTelegram();

  const handleChainSelect = async (chain: Chain) => {
    hapticImpact("medium");
    setSelectedChain(chain);
    setIsLoading(true);

    try {
      const result = await createDepositAddress({
        chain,
        currency: "USDT",
        amount,
      });

      setDepositAddress(result.address);
      setMemo(result.memo || result.tag || null);
    } catch (err) {
      hapticNotification("error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      hapticImpact("light");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleVerify = async () => {
    if (!intent || !txHash.trim()) {
      hapticNotification("error");
      return;
    }

    setIsVerifying(true);

    try {
      await verifyOnchainTransaction({
        intent_id: intent.id,
        tx_hash: txHash.trim(),
        chain: selectedChain || undefined,
      });

      hapticNotification("success");
      // Start polling with longer intervals for deposits
      startPolling(intent.id, 5000, 900000); // 5s interval, 15 min max
    } catch (err) {
      hapticNotification("error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chain Selection */}
      {!selectedChain ? (
        <>
          <p className="text-sm text-muted-foreground">
            Select blockchain network:
          </p>
          <div className="space-y-2">
            {[
              { chain: "ton" as Chain, name: "TON", desc: "Fast & low fees" },
              { chain: "tron" as Chain, name: "TRON", desc: "Popular & reliable" },
              { chain: "sol" as Chain, name: "Solana", desc: "Ultra-fast" },
            ].map((option) => (
              <Card
                key={option.chain}
                className="cursor-pointer hover:border-primary/50 transition touch-target"
                onClick={() => handleChainSelect(option.chain)}
              >
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">USDT on {option.name}</p>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                  <span className="text-2xl">🪙</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Selected Chain Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              USDT on {selectedChain.toUpperCase()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedChain(null);
                setDepositAddress(null);
              }}
            >
              Change
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Generating deposit address...</p>
            </div>
          ) : depositAddress ? (
            <>
              {/* Warning */}
              <Card className="bg-destructive/5 border-destructive/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <p className="text-xs text-destructive font-medium">
                      Send only USDT on {selectedChain.toUpperCase()} network. Sending other tokens or wrong network will result in loss of funds.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG value={depositAddress} size={200} />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Deposit Address:
                </label>
                <div className="flex gap-2">
                  <Input
                    value={depositAddress}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(depositAddress)}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Memo (if required) */}
              {memo && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Memo/Tag (REQUIRED):
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={memo}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(memo)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Amount to Send:
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold">{amount} USDT</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(amount.toString())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Manual Verification */}
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm font-medium">After sending:</p>
                <div className="space-y-2">
                  <Input
                    placeholder="Paste transaction hash..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <Button
                    className="w-full touch-target"
                    onClick={handleVerify}
                    disabled={!txHash.trim() || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "I've Sent Payment"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  We'll verify your payment on the blockchain
                </p>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

