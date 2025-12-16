/**
 * Payment Method Card Component
 */

import { ReactNode } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface PaymentMethodCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
  onClick: () => void;
}

export function PaymentMethodCard({
  icon,
  title,
  description,
  recommended,
  onClick,
}: PaymentMethodCardProps) {
  const { hapticImpact } = useTelegram();

  const handleClick = () => {
    hapticImpact("light");
    onClick();
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors touch-target active:scale-95"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{title}</h3>
                {recommended && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
    </Card>
  );
}

