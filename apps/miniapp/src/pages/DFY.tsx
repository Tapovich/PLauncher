/**
 * Done-For-You Form - Request full-service launch
 * Enhanced with MainButton and validation
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Rocket, Users as UsersIcon, Zap, AlertCircle } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useStore } from "@/store/useStore";

export function DFY() {
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    projectType: "",
    budget: "",
    timeline: "",
    stage: "",
    additionalInfo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { 
    hapticImpact, 
    hapticNotification, 
    user, 
    webApp,
    showMainButton,
    hideMainButton,
    showMainButtonProgress,
    hideMainButtonProgress,
  } = useTelegram();

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    } else if (formData.projectName.trim().length < 3) {
      newErrors.projectName = "Project name must be at least 3 characters";
    }
    
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = "Description is required";
    } else if (formData.projectDescription.trim().length < 50) {
      newErrors.projectDescription = "Description must be at least 50 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show MainButton when form is valid (inside Telegram)
  useEffect(() => {
    const isValid = formData.projectName.trim().length >= 3 && 
                     formData.projectDescription.trim().length >= 50;
    
    if (webApp && isValid) {
      showMainButton("Submit Request", handleSubmit, {
        color: "#6366F1",
      });
    } else {
      hideMainButton();
    }
    
    return () => {
      hideMainButton();
    };
  }, [formData, webApp, showMainButton, hideMainButton]);

  const handleSubmit = async () => {
    if (!validate()) {
      hapticNotification("error");
      return;
    }

    hapticImpact("heavy");
    setIsSubmitting(true);
    
    if (webApp) {
      showMainButtonProgress();
    }

    try {
      // TODO: Call API
      // POST /api/v1/dfy/inquiry
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      hapticNotification("success");
      
      // Store inquiry ID in state
      useStore.getState().setError(null);
      
      // Navigate to success
      navigate("/success", {
        state: {
          type: "dfy",
          projectName: formData.projectName,
        }
      });
    } catch (error) {
      hapticNotification("error");
      setErrors({ submit: "Failed to submit. Please try again." });
      setIsSubmitting(false);
      
      if (webApp) {
        hideMainButtonProgress();
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Layout title="Done-For-You" showBack>
      <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="success" className="mb-2 gap-1">
            <Rocket className="h-3 w-3" />
            Premium Service
          </Badge>
          <h2 className="text-2xl font-bold">Full-Service Launch</h2>
          <p className="text-sm text-muted-foreground">
            Our team will handle everything from idea to launch
          </p>
        </div>

        {/* What's Included */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {[
                { icon: CheckCircle2, text: "Complete technical specification" },
                { icon: UsersIcon, text: "Dedicated project team" },
                { icon: Zap, text: "Fast-track development (14 days)" },
                { icon: Rocket, text: "Launch support & training" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Details</CardTitle>
              <CardDescription className="text-xs">
                Tell us about your project and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.projectName}
                  onChange={(e) => handleChange("projectName", e.target.value)}
                  placeholder="e.g., AI Task Manager"
                  className={errors.projectName ? "border-destructive" : ""}
                />
                {errors.projectName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.projectName}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project Description <span className="text-destructive">*</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    (min 50 characters)
                  </span>
                </label>
                <Textarea
                  value={formData.projectDescription}
                  onChange={(e) => handleChange("projectDescription", e.target.value)}
                  placeholder="Describe your project idea, goals, and what you want to achieve..."
                  rows={5}
                  className={errors.projectDescription ? "border-destructive" : ""}
                />
                <div className="flex justify-between text-xs">
                  {errors.projectDescription ? (
                    <p className="text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.projectDescription}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      {formData.projectDescription.length}/50 characters
                    </p>
                  )}
                </div>
              </div>

              {/* Project Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Type</label>
                <select
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={formData.projectType}
                  onChange={(e) => handleChange("projectType", e.target.value)}
                >
                  <option value="">Select project type</option>
                  <option value="web">Web Application</option>
                  <option value="mobile">Mobile App</option>
                  <option value="ai">AI/ML Product</option>
                  <option value="saas">SaaS Platform</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Range</label>
                <select
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                >
                  <option value="">Select budget range</option>
                  <option value="3k-5k">$3,000 - $5,000</option>
                  <option value="5k-10k">$5,000 - $10,000</option>
                  <option value="10k-20k">$10,000 - $20,000</option>
                  <option value="20k-50k">$20,000 - $50,000</option>
                  <option value="50k+">$50,000+</option>
                </select>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Desired Timeline</label>
                <select
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={formData.timeline}
                  onChange={(e) => handleChange("timeline", e.target.value)}
                >
                  <option value="">Select timeline</option>
                  <option value="urgent">ASAP (2 weeks)</option>
                  <option value="normal">1-2 months</option>
                  <option value="flexible">3+ months</option>
                </select>
              </div>

              {/* Current Stage */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Stage</label>
                <select
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={formData.stage}
                  onChange={(e) => handleChange("stage", e.target.value)}
                >
                  <option value="">Select current stage</option>
                  <option value="idea">Just an idea</option>
                  <option value="planning">Have a plan/spec</option>
                  <option value="design">Have designs</option>
                  <option value="development">Partially developed</option>
                </select>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Information</label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={(e) => handleChange("additionalInfo", e.target.value)}
                  placeholder="Any other details we should know... (competitors, similar products, special requirements)"
                  rows={3}
                />
              </div>

              {/* Contact Info (pre-filled from Telegram) */}
              {user && (
                <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Contact Information:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {user.first_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.first_name} {user.last_name || ""}</p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username || `id${user.id}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Fallback Submit Button (when not in Telegram or MainButton not shown) */}
          {!webApp && (
            <Button
              type="submit"
              className="w-full touch-target"
              disabled={isSubmitting || !formData.projectName || !formData.projectDescription}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            <span className="font-medium">Response Time:</span> Within 24 hours • <span className="font-medium">Discovery Call:</span> 60 minutes
          </p>
        </form>
      </div>
    </Layout>
  );
}

