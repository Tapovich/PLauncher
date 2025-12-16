/**
 * Main layout component with header and safe areas
 */

import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
}

export function Layout({ children, title, showBack = false, showMenu = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hapticImpact } = useTelegram();

  const handleBack = () => {
    hapticImpact("light");
    navigate(-1);
  };

  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with safe area */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border safe-top">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-3">
              {showBack && !isHome && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="touch-target"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              
              {title && (
                <h1 className="text-lg font-semibold">{title}</h1>
              )}
              
              {!title && (
                <span className="text-xl font-bold">LaunchKit AI</span>
              )}
            </div>

            {/* Right side */}
            {showMenu && (
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={() => {
                  hapticImpact("light");
                  // TODO: Open menu
                }}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content with safe area */}
      <main className="flex-1 safe-bottom">
        {children}
      </main>
    </div>
  );
}

