/**
 * Onboarding Flow Component
 * First-time user experience
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Users, 
  Rocket, 
  Sparkles,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface OnboardingProps {
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to LaunchKit AI",
    description: "Your AI-powered platform to go from idea to launch in just 14 days.",
    features: [
      "Generate startup ideas with Claude AI",
      "Get detailed technical specifications",
      "Find verified team members",
    ],
  },
  {
    icon: Lightbulb,
    title: "AI Idea Generation",
    description: "Chat with our AI to discover and refine your perfect startup idea.",
    features: [
      "Answer a few simple questions",
      "Get 3-5 personalized ideas",
      "Detailed market & revenue analysis",
    ],
  },
  {
    icon: Rocket,
    title: "Tech Spec Creation",
    description: "Generate a comprehensive 10-15 page technical specification in minutes.",
    features: [
      "Complete architecture & tech stack",
      "Budget breakdown & timeline",
      "Team requirements & risk analysis",
    ],
  },
  {
    icon: Users,
    title: "Build Your Team",
    description: "Browse 20+ verified developers, designers, and PMs ready to build your vision.",
    features: [
      "Search by skills & budget",
      "Verified portfolios & reviews",
      "Direct communication",
    ],
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { hapticImpact } = useTelegram();

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    hapticImpact("light");
    
    if (isLastStep) {
      // Complete onboarding
      localStorage.setItem("onboarding_completed", "true");
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    hapticImpact("light");
    localStorage.setItem("onboarding_completed", "true");
    onComplete();
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Progress Indicator */}
        <div className="flex gap-2 justify-center">
          {ONBOARDING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? "w-8 bg-primary"
                  : idx < currentStep
                  ? "w-1.5 bg-primary"
                  : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <Card className="border-2">
          <CardContent className="pt-8 pb-6 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <StepIcon className="h-10 w-10 text-primary" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              {currentStep === 0 && (
                <Badge variant="success" className="mb-2">
                  Free to Start
                </Badge>
              )}
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {step.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleSkip}
          >
            Skip
          </Button>
          <Button
            variant="default"
            className="flex-1 touch-target"
            onClick={handleNext}
          >
            {isLastStep ? "Get Started" : "Next"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Step Counter */}
        <p className="text-center text-xs text-muted-foreground">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </p>
      </div>
    </div>
  );
}

