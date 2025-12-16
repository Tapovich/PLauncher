/**
 * Success Screen - Confirmation after submission
 * Enhanced with type-specific messages and actions
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Home, 
  MessageCircle, 
  FileText, 
  Clock,
  Users as UsersIcon,
  Mail
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface SuccessState {
  type?: "dfy" | "application" | "general";
  projectName?: string;
  inquiryId?: string;
}

export function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SuccessState || {};
  const { hapticNotification } = useTelegram();

  useEffect(() => {
    // Trigger success haptic and confetti animation
    hapticNotification("success");
  }, [hapticNotification]);

  const isDFY = state.type === "dfy";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-md space-y-6">
          {/* Success Icon with Animation */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 animate-ping opacity-20">
                <div className="w-24 h-24 bg-green-500 rounded-full" />
              </div>
              <div className="absolute inset-0 animate-ping opacity-10" style={{ animationDelay: "0.5s" }}>
                <div className="w-24 h-24 bg-green-500 rounded-full" />
              </div>
              
              {/* Success icon */}
              <div className="relative flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 animate-in zoom-in duration-300" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <Badge variant="success" className="mb-2">
              Success
            </Badge>
            <h2 className="text-2xl font-bold">
              {isDFY ? "Request Submitted!" : "Success!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isDFY 
                ? `Your Done-For-You request for "${state.projectName}" has been submitted.`
                : "Your action completed successfully."
              }
            </p>
          </div>

          {/* Timeline Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2">What happens next?</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Within 4 hours</p>
                        <p>Team reviews your request</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <UsersIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Within 24 hours</p>
                        <p>Discovery call scheduled</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">48 hours</p>
                        <p>Custom proposal & timeline sent</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-secondary/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="text-muted-foreground">You'll receive updates via:</p>
                  <p className="font-medium text-sm mt-1">
                    Telegram {state.inquiryId && `• Request #${state.inquiryId.slice(0, 8)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="default"
              className="w-full touch-target"
              onClick={() => {
                hapticNotification("success");
                navigate("/");
              }}
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Button>

            {isDFY && state.inquiryId && (
              <Button
                variant="outline"
                className="w-full touch-target"
                onClick={() => {
                  // TODO: Navigate to inquiry details
                  // navigate(`/dfy/inquiry/${state.inquiryId}`);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                View My Request
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/marketplace")}
            >
              Browse Team Marketplace
            </Button>
          </div>

          {/* Support Link */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Questions? Contact{" "}
              <a 
                href="mailto:hello@launchkit.ai" 
                className="text-primary font-medium hover:underline"
              >
                hello@launchkit.ai
              </a>
              {" "}or Telegram{" "}
              <a
                href="https://t.me/launchkit_support"
                className="text-primary font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @launchkit_support
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

