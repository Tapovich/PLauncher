/**
 * Loading Screen - Tech spec generation with progress timeline
 * Shows fake progress with checklist animation (<30s target)
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  Code, 
  Zap, 
  CheckCircle2,
  Loader2,
  Target,
  Users,
  DollarSign,
  Calendar
} from "lucide-react";

const LOADING_STEPS = [
  { 
    icon: Target, 
    label: "Analyzing your idea and requirements...", 
    duration: 4000 
  },
  { 
    icon: FileText, 
    label: "Creating product overview and features...", 
    duration: 5000 
  },
  { 
    icon: Code, 
    label: "Defining technical architecture...", 
    duration: 4000 
  },
  { 
    icon: Users, 
    label: "Planning team requirements...", 
    duration: 4000 
  },
  { 
    icon: DollarSign, 
    label: "Calculating budget breakdown...", 
    duration: 3000 
  },
  { 
    icon: Calendar, 
    label: "Building development timeline...", 
    duration: 4000 
  },
  { 
    icon: Zap, 
    label: "Finalizing specification...", 
    duration: 2000 
  },
];

const TOTAL_DURATION = LOADING_STEPS.reduce((sum, step) => sum + step.duration, 0);

export function Loading() {
  const navigate = useNavigate();
  const location = useLocation();
  const ideaId = location.state?.ideaId;
  const idea = location.state?.idea;

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / TOTAL_DURATION) * 100; // Update every 100ms
      });
    }, 100);

    // Step progression
    let elapsed = 0;
    const stepInterval = setInterval(() => {
      elapsed += 100;
      
      // Find current step based on elapsed time
      let cumulativeDuration = 0;
      for (let i = 0; i < LOADING_STEPS.length; i++) {
        cumulativeDuration += LOADING_STEPS[i].duration;
        
        if (elapsed < cumulativeDuration) {
          setCurrentStep(i);
          
          // Mark previous steps as completed
          const completed = new Set<number>();
          for (let j = 0; j < i; j++) {
            completed.add(j);
          }
          setCompletedSteps(completed);
          break;
        }
      }
      
      // All steps complete
      if (elapsed >= TOTAL_DURATION) {
        setCompletedSteps(new Set(LOADING_STEPS.map((_, i) => i)));
        clearInterval(stepInterval);
      }
    }, 100);

    // Navigate to tech spec after completion
    const timer = setTimeout(() => {
      navigate("/tech-spec", { 
        state: { ideaId, idea },
        replace: true 
      });
    }, TOTAL_DURATION + 500); // Small delay after 100%

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(timer);
    };
  }, [navigate, ideaId, idea]);

  const getStepState = (index: number): "completed" | "active" | "pending" => {
    if (completedSteps.has(index)) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-md space-y-8">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 animate-ping opacity-20">
                <div className="w-24 h-24 bg-primary rounded-full" />
              </div>
              
              {/* Icon */}
              <div className="relative flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Generating Tech Spec</h2>
            <p className="text-sm text-muted-foreground">
              Creating a comprehensive technical specification for your startup
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {progress.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Target: &lt;30 seconds • Estimated: 26 seconds
            </p>
          </div>

          {/* Loading Steps Checklist */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Generating Sections:
            </p>
            
            {LOADING_STEPS.map((step, idx) => {
              const state = getStepState(idx);
              
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    state === "completed"
                      ? "bg-primary/10 border border-primary/20"
                      : state === "active"
                      ? "bg-secondary border border-primary/50 animate-pulse"
                      : "bg-secondary/30 opacity-60"
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {state === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-primary fill-primary" />
                    ) : state === "active" ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <step.icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-sm flex-1 ${
                    state === "completed"
                      ? "text-foreground line-through"
                      : state === "active"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>

                  {/* Duration */}
                  {state === "active" && (
                    <span className="text-xs text-muted-foreground">
                      {(step.duration / 1000).toFixed(0)}s
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Fun Fact */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              💡 <span className="font-medium">Did you know?</span> Our AI analyzes 1000+ successful startups to create your personalized tech spec
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}


