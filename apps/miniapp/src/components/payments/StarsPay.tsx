/**
 * Telegram Stars Payment Component
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Star, Loader2 } from "lucide-react";
import { PaymentIntent } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

interface StarsPayProps {
  intent: PaymentIntent | null;
  onIntentCreated: (intent: PaymentIntent) => void;
  createIntent: () => Promise<PaymentIntent>;
  isCreating: boolean;
  startPolling: (intentId: string) => void;
}

export function StarsPay({
  intent,
  onIntentCreated,
  createIntent,
  isCreating,
  startPolling,
}: StarsPayProps) {
  const { webApp, hapticNotification } = useTelegram();

  const handlePayment = async () => {
    let paymentIntent = intent;

    // Create intent if not exists
    if (!paymentIntent) {
      paymentIntent = await createIntent();
      onIntentCreated(paymentIntent);
    }

    const nextAction = paymentIntent.next_action;
    
    // Get bot deeplink
    const botDeeplink = nextAction?.bot_deeplink || nextAction?.url;

    if (!botDeeplink) {
      hapticNotification("error");
      console.error("No bot deeplink in intent");
      return;
    }

    // Open bot to complete payment
    if (webApp) {
      webApp.openTelegramLink(botDeeplink);
    } else {
      window.open(botDeeplink, "_blank");
    }

    // Start polling to check payment status
    startPolling(paymentIntent.id);
  };

  const handleCheckStatus = () => {
    if (intent) {
      startPolling(intent.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info */}
      <Card className="bg-secondary/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-primary mt-0.5 fill-primary" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Pay with Telegram Stars</p>
              <p className="text-xs text-muted-foreground">
                Quick and easy payment using Telegram's built-in Stars currency
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <p>✓ Instant payment</p>
        <p>✓ Low fees (Telegram takes 10%)</p>
        <p>✓ No external wallet needed</p>
      </div>

      {/* How it works */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <p className="text-xs font-medium mb-2">How it works:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Click "Pay with Stars" below</li>
            <li>You'll be redirected to our bot</li>
            <li>Complete payment in the bot</li>
            <li>Return here to see confirmation</li>
          </ol>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          className="w-full touch-target"
          onClick={handlePayment}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Payment...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Pay with Stars
            </>
          )}
        </Button>

        {intent && (
          <Button
            variant="outline"
            className="w-full touch-target"
            onClick={handleCheckStatus}
          >
            Check Payment Status
          </Button>
        )}
      </div>

      {/* Note */}
      <p className="text-xs text-center text-muted-foreground">
        After completing payment in the bot, return here or tap "Check Payment Status"
      </p>
    </div>
  );
}

