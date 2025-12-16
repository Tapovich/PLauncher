/**
 * Stripe Payment Component
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, CreditCard, Loader2 } from "lucide-react";
import { PaymentIntent } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

interface StripePayProps {
  intent: PaymentIntent | null;
  onIntentCreated: (intent: PaymentIntent) => void;
  createIntent: () => Promise<PaymentIntent>;
  isCreating: boolean;
}

export function StripePay({ intent, onIntentCreated, createIntent, isCreating }: StripePayProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { webApp, openLink } = useTelegram();

  const handlePayment = async () => {
    let paymentIntent = intent;

    // Create intent if not exists
    if (!paymentIntent) {
      paymentIntent = await createIntent();
      onIntentCreated(paymentIntent);
    }

    // Get checkout URL from next_action
    const checkoutUrl = paymentIntent.next_action?.url;

    if (!checkoutUrl) {
      console.error("No checkout URL in intent");
      return;
    }

    setIsRedirecting(true);

    // Open Stripe checkout
    if (webApp) {
      openLink(checkoutUrl);
    } else {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <div className="space-y-4">
      {/* Info */}
      <Card className="bg-secondary/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Secure Card Payment</p>
              <p className="text-xs text-muted-foreground">
                Powered by Stripe. Supports Visa, Mastercard, Amex, and more.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <p>✓ Instant confirmation</p>
        <p>✓ Secure PCI-compliant processing</p>
        <p>✓ Supports all major cards</p>
      </div>

      {/* Action */}
      <Button
        className="w-full touch-target"
        onClick={handlePayment}
        disabled={isCreating || isRedirecting}
      >
        {isCreating || isRedirecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isCreating ? "Creating..." : "Opening Stripe..."}
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4 mr-2" />
            Pay with Card
          </>
        )}
      </Button>

      {isRedirecting && (
        <p className="text-xs text-center text-muted-foreground">
          You'll be redirected to Stripe checkout...
        </p>
      )}
    </div>
  );
}

