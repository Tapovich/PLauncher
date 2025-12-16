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
import { generateIdeas, IdeaGenerationRequest, Idea as APIIdea } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

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

export function IdeaResults() {
  const navigate = useNavigate();
  const { hapticImpact, hapticNotification, hapticSelection } = useTelegram();
  const { selectedIdeaId, selectIdea, getSelectedIdea, ideas, user } = useStore();
  const { showToast } = useToast();

  const [detailsIdeaId, setDetailsIdeaId] = useState<string | null>(null);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isGeneratingInitial, setIsGeneratingInitial] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate ideas on mount if we don't have any
  useEffect(() => {
    const generateInitialIdeas = async () => {
      if (ideas.length > 0) return; // Already have ideas

      if (!user) {
        setError("Please authenticate first to generate ideas.");
        return;
      }

      setIsGeneratingInitial(true);
      setError(null);

      try {
        // Use default parameters for idea generation
        // In a real app, these would come from the conversation context
        const request: IdeaGenerationRequest = {
          problems: "People need better productivity tools",
          industries: "Technology, Productivity",
          budget_range: "$10,000 - $50,000",
          timeline: "3-6 months",
          has_technical_skills: false,
        };

        const response = await generateIdeas(request);

        // Transform API response to match our Idea interface
        const transformedIdeas: Idea[] = response.ideas.map((idea: APIIdea, index: number) => ({
          id: `idea-${index + 1}`,
          title: idea.title,
          oneLiner: idea.one_liner,
          problem: idea.problem_statement,
          solution: idea.solution_overview,
          targetMarket: idea.target_market,
          revenueModel: idea.revenue_model,
          estimatedCost: idea.estimated_cost,
          timelineMonths: idea.timeline_months,
          mvpFeatures: idea.mvp_features,
        }));

        // Store in Zustand
        useStore.getState().setIdeas(transformedIdeas, response.conversation_id);

        showToast(`Generated ${transformedIdeas.length} amazing startup ideas!`, "success", "Ideas Ready");

      } catch (err: any) {
        console.error("Failed to generate ideas:", err);
        let errorMessage = "Failed to generate ideas. Please try again.";

        if (err?.message) {
          errorMessage = err.message;
        } else if (err?.status === 401) {
          errorMessage = "Please authenticate to generate ideas.";
        } else if (err?.status === 429) {
          errorMessage = "Too many requests. Please wait before generating more ideas.";
        }

        setError(errorMessage);
        showToast(errorMessage, "error", "Generation Failed");
      } finally {
        setIsGeneratingInitial(false);
      }
    };

    generateInitialIdeas();
  }, [ideas.length, user, showToast]);

  const selectedIdea = getSelectedIdea();
  const detailsIdea = ideas.find(idea => idea.id === detailsIdeaId);

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
    setError(null);

    try {
      // Use similar parameters as initial generation
      const request: IdeaGenerationRequest = {
        problems: "People need better productivity tools",
        industries: "Technology, Productivity",
        budget_range: "$10,000 - $50,000",
        timeline: "3-6 months",
        has_technical_skills: false,
      };

      const response = await generateIdeas(request);

      // Transform API response to match our Idea interface
      const newIdeas: Idea[] = response.ideas.map((idea: APIIdea, index: number) => ({
        id: `idea-${Date.now()}-${index + 1}`,
        title: idea.title,
        oneLiner: idea.one_liner,
        problem: idea.problem_statement,
        solution: idea.solution_overview,
        targetMarket: idea.target_market,
        revenueModel: idea.revenue_model,
        estimatedCost: idea.estimated_cost,
        timelineMonths: idea.timeline_months,
        mvpFeatures: idea.mvp_features,
      }));

      // Add to existing ideas
      const updatedIdeas = [...ideas, ...newIdeas];
      useStore.getState().setIdeas(updatedIdeas, response.conversation_id);

      showToast(`Generated ${newIdeas.length} more ideas!`, "success", "More Ideas Added");
      hapticNotification("success");

    } catch (err: any) {
      console.error("Failed to generate more ideas:", err);
      let errorMessage = "Failed to generate more ideas. Please try again.";

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === 429) {
        errorMessage = "Rate limit reached. Please wait before generating more ideas.";
      }

      setError(errorMessage);
      showToast(errorMessage, "error", "Generation Failed");
      hapticNotification("error");
    } finally {
      setIsGeneratingMore(false);
    }
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

  // Loading state for initial idea generation
  if (isGeneratingInitial) {
    return (
      <Layout title="Generating Ideas" showBack>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4 px-4">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-primary mx-auto animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Generating Startup Ideas</h3>
              <p className="text-sm text-muted-foreground">
                Claude AI is analyzing your requirements and creating amazing startup ideas...
              </p>
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error && ideas.length === 0) {
    return (
      <Layout title="Idea Generation Failed" showBack>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4 px-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <RefreshCw className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">Generation Failed</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

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
            {ideas.map((idea) => {
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

