/**
 * Payment Modal - Bottom sheet for payment method
 */

import { ReactNode } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  status?: string;
  children: ReactNode;
}

export function PaymentModal({
  isOpen,
  onClose,
  title,
  icon,
  status,
  children,
}: PaymentModalProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Pending
        </Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      case "created":
        return <Badge variant="outline">Created</Badge>;
      default:
        return null;
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {status && getStatusBadge()}
      </div>

      {/* Content */}
      {children}
    </Sheet>
  );
}

