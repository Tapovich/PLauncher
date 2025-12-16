/**
 * Home Screen - Main landing page
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Users, Rocket } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Onboarding } from "@/components/Onboarding";
import { useTelegram } from "@/hooks/useTelegram";

export function Home() {
  const navigate = useNavigate();
  const { user, hapticImpact } = useTelegram();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem("onboarding_completed");
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleNavigate = (path: string) => {
    hapticImpact("light");
    navigate(path);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout showMenu>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Hero Section */}
        <div className="text-center space-y-2 py-6">
          <Badge variant="success" className="mb-2">
            Beta
          </Badge>
          <h2 className="text-2xl font-bold">
            From Idea to Launch in 14 Days
          </h2>
          <p className="text-muted-foreground">
            {user ? `Welcome, ${user.first_name}!` : "AI-powered platform for entrepreneurs"}
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="space-y-3">
          <Card
            className="cursor-pointer hover:border-primary transition-colors touch-target active:scale-95"
            onClick={() => handleNavigate("/ai-chat")}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">
                    Generate Startup Idea + Tech Spec
                  </CardTitle>
                  <CardDescription className="mt-1">
                    AI creates custom startup ideas and detailed technical specifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors touch-target active:scale-95"
            onClick={() => handleNavigate("/marketplace")}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Find Team Members</CardTitle>
                  <CardDescription className="mt-1">
                    Browse verified developers, designers, and PMs for your project
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors touch-target active:scale-95"
            onClick={() => handleNavigate("/dfy")}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">
                    Done-For-You Launch Service
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Full-service support from idea to launch with our expert team
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Upgrade/Payment CTA */}
        <Card 
          className="bg-gradient-primary cursor-pointer hover:opacity-90 transition-opacity touch-target active:scale-95"
          onClick={() => handleNavigate("/payments")}
        >
          <CardHeader>
            <div className="flex items-center justify-between text-white">
              <div>
                <CardTitle className="text-base text-white">
                  Upgrade to Pro
                </CardTitle>
                <CardDescription className="mt-1 text-white/80">
                  Unlock unlimited AI generations and premium features
                </CardDescription>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats or Social Proof */}
        <div className="pt-6 pb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">20+</div>
              <div className="text-xs text-muted-foreground">Freelancers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">14</div>
              <div className="text-xs text-muted-foreground">Days Avg</div>
            </div>
            <div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-muted-foreground">AI Powered</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

