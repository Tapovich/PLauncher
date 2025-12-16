/**
 * Idea Results Screen - Display generated startup ideas
 * Enhanced with selection, details modal, and bottom action bar
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/store/useStore";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Target,
  Users as UsersIcon,
  Lightbulb,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface Idea {
  id: string;
  title: string;
  oneLiner: string;
  problem: string;
  solution: string;
  targetMarket: string;
  revenueModel: string;
  estimatedCost: number;
  timelineMonths: number;
  mvpFeatures: string[];
}

const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    title: "AI-Powered Task Manager",
    oneLiner: "Smart task prioritization with AI insights",
    problem: "People struggle with prioritizing tasks effectively in their busy lives. Traditional task managers are passive tools that don't provide intelligent guidance.",
    solution: "Use AI to analyze tasks based on deadlines, importance, and user patterns. The AI suggests optimal schedules and automatically prioritizes tasks to maximize productivity.",
    targetMarket: "Busy professionals, entrepreneurs, and students who manage multiple projects and need help staying organized.",
    revenueModel: "Freemium model with basic features free. Pro subscription ($9.99/month) includes AI insights, calendar sync, and team features.",
    estimatedCost: 15000,
    timelineMonths: 3,
    mvpFeatures: ["Natural language task input", "AI-powered prioritization engine", "Google Calendar integration", "Progress tracking dashboard", "Smart notifications", "Mobile responsive design"],
  },
  {
    id: "2",
    title: "Local Service Marketplace",
    oneLiner: "Connect with verified local service providers instantly",
    problem: "Finding reliable local service providers (plumbers, electricians, cleaners) is time-consuming and risky. No easy way to verify quality or book instantly.",
    solution: "Verified marketplace with instant booking, transparent pricing, and comprehensive reviews. Service providers are vetted, insured, and rated by real customers.",
    targetMarket: "Homeowners aged 30-60 and small business owners who need frequent local services.",
    revenueModel: "Commission-based: 15% fee on each completed booking. Premium listings for service providers at $49/month.",
    estimatedCost: 25000,
    timelineMonths: 4,
    mvpFeatures: ["Service provider profiles", "Instant booking system", "Secure payment processing", "Review and rating system", "Search and filter by location", "In-app messaging"],
  },
  {
    id: "3",
    title: "Fitness Social Network",
    oneLiner: "Make fitness fun with friends and challenges",
    problem: "People lack motivation to maintain fitness routines. Solo workouts are boring, and existing apps lack social accountability and gamification.",
    solution: "Social fitness platform where users join challenges, share progress, and compete with friends. Gamification with points, badges, and leaderboards keeps users engaged.",
    targetMarket: "Fitness enthusiasts aged 18-35 who are active on social media and enjoy competitive activities.",
    revenueModel: "Freemium with basic features free. Premium ($12.99/month) includes advanced challenges, detailed analytics, and brand partnerships for prizes.",
    estimatedCost: 20000,
    timelineMonths: 4,
    mvpFeatures: ["User profiles and social feed", "Challenge creation and joining", "Workout tracking integration", "Friend connections", "Leaderboards and badges", "Progress photos and stories"],
  },
];

export function IdeaResults() {
  const navigate = useNavigate();
  const { hapticImpact, hapticNotification, hapticSelection } = useTelegram();
  const { selectedIdeaId, selectIdea, getSelectedIdea } = useStore();
  
  const [detailsIdeaId, setDetailsIdeaId] = useState<string | null>(null);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Initialize ideas in store
  useEffect(() => {
    useStore.getState().setIdeas(MOCK_IDEAS);
  }, []);

  const selectedIdea = getSelectedIdea();
  const detailsIdea = MOCK_IDEAS.find(idea => idea.id === detailsIdeaId);

  const handleSelectIdea = (ideaId: string) => {
    if (selectedIdeaId === ideaId) {
      // Deselect
      selectIdea("");
      hapticImpact("light");
    } else {
      // Select
      selectIdea(ideaId);
      hapticSelection();
    }
  };

  const handleViewDetails = (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    hapticImpact("medium");
    setDetailsIdeaId(ideaId);
  };

  const handleCloseDetails = () => {
    hapticImpact("light");
    setDetailsIdeaId(null);
  };

  const handleGenerateMore = async () => {
    hapticImpact("medium");
    setIsGeneratingMore(true);
    
    // TODO: Call API to generate more ideas
    // POST /api/v1/ai/generate-ideas with same params
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    hapticNotification("success");
    setIsGeneratingMore(false);
  };

  const handleCreateTechSpec = async () => {
    if (!selectedIdea) {
      hapticNotification("error");
      return;
    }

    hapticImpact("heavy");
    setIsSavingDraft(true);

    try {
      // TODO: Call API to save draft project
      // POST /api/v1/projects/draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      hapticNotification("success");
      
      // Navigate to loading screen
      navigate("/loading", { 
        state: { 
          ideaId: selectedIdea.id,
          idea: selectedIdea 
        } 
      });
    } catch (error) {
      hapticNotification("error");
      setIsSavingDraft(false);
    }
  };

  return (
    <>
      <Layout title="Startup Ideas" showBack>
        <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <Badge variant="success" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </Badge>
            <h2 className="text-xl font-bold">Your Personalized Ideas</h2>
            <p className="text-sm text-muted-foreground">
              Select an idea to generate a detailed technical specification
            </p>
          </div>

          {/* Idea Cards */}
          <div className="space-y-3">
            {MOCK_IDEAS.map((idea) => {
              const isSelected = selectedIdeaId === idea.id;
              
              return (
                <Card
                  key={idea.id}
                  className={`cursor-pointer transition-all touch-target ${
                    isSelected
                      ? "border-primary border-2 bg-primary/5 shadow-md"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleSelectIdea(idea.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          {/* Selection Indicator */}
                          <div className={`mt-1 flex-shrink-0 transition-all ${
                            isSelected ? "scale-100" : "scale-0"
                          }`}>
                            <CheckCircle2 className="h-5 w-5 text-primary fill-primary" />
                          </div>
                          
                          <div className="flex-1">
                            <CardTitle className="text-base leading-tight">
                              {idea.title}
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs">
                              {idea.oneLiner}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <Badge variant="success" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Key Stats */}
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          ${(idea.estimatedCost / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {idea.timelineMonths} months
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-xs">{idea.revenueModel.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* MVP Features Preview */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        MVP Features:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {idea.mvpFeatures.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {idea.mvpFeatures.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{idea.mvpFeatures.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between group touch-target"
                      onClick={(e) => handleViewDetails(idea.id, e)}
                    >
                      <span className="text-sm">View Full Details</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 safe-bottom z-40">
          <div className="container mx-auto flex gap-3">
            {/* Generate More Button */}
            <Button
              variant="outline"
              className="flex-1 touch-target"
              onClick={handleGenerateMore}
              disabled={isGeneratingMore}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingMore ? 'animate-spin' : ''}`} />
              {isGeneratingMore ? "Generating..." : "Generate More"}
            </Button>

            {/* Create Tech Spec Button */}
            <Button
              variant="default"
              className="flex-1 touch-target"
              onClick={handleCreateTechSpec}
              disabled={!selectedIdea || isSavingDraft}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isSavingDraft ? "Saving..." : "Create Tech Spec"}
            </Button>
          </div>
        </div>
      </Layout>

      {/* Details Sheet */}
      <Sheet
        isOpen={!!detailsIdeaId}
        onClose={handleCloseDetails}
        title={detailsIdea?.title}
      >
        {detailsIdea && (
          <div className="space-y-6">
            {/* One-liner */}
            <div>
              <p className="text-sm text-muted-foreground">{detailsIdea.oneLiner}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">
                  ${(detailsIdea.estimatedCost / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-muted-foreground">Budget</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">{detailsIdea.timelineMonths}mo</div>
                <div className="text-xs text-muted-foreground">Timeline</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <UsersIcon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">3-4</div>
                <div className="text-xs text-muted-foreground">Team</div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Problem Statement</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {detailsIdea.problem}
              </p>
            </div>

            {/* Solution */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Solution</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {detailsIdea.solution}
              </p>
            </div>

            {/* Target Market */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Target Market</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {detailsIdea.targetMarket}
              </p>
            </div>

            {/* Revenue Model */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Revenue Model</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {detailsIdea.revenueModel}
              </p>
            </div>

            {/* MVP Features */}
            <div className="space-y-3">
              <h3 className="font-semibold">MVP Features</h3>
              <ul className="space-y-2">
                {detailsIdea.mvpFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 touch-target"
                onClick={handleCloseDetails}
              >
                Close
              </Button>
              <Button
                variant="default"
                className="flex-1 touch-target"
                onClick={() => {
                  handleSelectIdea(detailsIdea.id);
                  handleCloseDetails();
                }}
              >
                {selectedIdeaId === detailsIdea.id ? "Selected ✓" : "Select This Idea"}
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}

