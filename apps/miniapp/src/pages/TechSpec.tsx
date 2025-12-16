/**
 * Tech Spec Viewer - Display generated technical specification
 * Enhanced with expandable sections and action bar
 */

import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { 
  Download, 
  Share2, 
  CheckCircle2, 
  Users, 
  DollarSign, 
  Clock,
  FileText,
  Code,
  Target,
  Calendar,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const MOCK_SPEC_SECTIONS = [
  {
    title: "Executive Summary",
    icon: FileText,
    content: "This AI-powered task management application revolutionizes how busy professionals organize their work. By leveraging machine learning algorithms, the app automatically prioritizes tasks, suggests optimal schedules, and provides actionable insights to boost productivity. The MVP will focus on individual users with plans for team features in Phase 2.",
  },
  {
    title: "User Personas & Target Market",
    icon: Users,
    content: "**Primary Persona: Sarah, The Overwhelmed Professional**\n- Age: 32, Product Manager\n- Pain: Managing 50+ tasks across multiple projects\n- Goal: Focus on high-impact work\n- Behavior: Checks task list 10+ times/day\n\n**Secondary Persona: Mike, The Entrepreneur**\n- Age: 28, Startup Founder\n- Pain: Context switching between different priorities\n- Goal: Execute fastest path to product-market fit\n- Behavior: Works on 3-5 projects simultaneously",
  },
  {
    title: "MVP Features (Detailed)",
    icon: CheckCircle2,
    content: "1. **Natural Language Task Input**\n- Voice or text input\n- AI extracts: title, deadline, importance\n- Tags auto-suggested\n\n2. **AI-Powered Prioritization**\n- Analyzes: deadlines, dependencies, user patterns\n- Scores 1-100 importance\n- Suggests daily focus tasks\n\n3. **Google Calendar Integration**\n- Sync events automatically\n- Block time for important tasks\n- Smart conflict detection\n\n4. **Progress Dashboard**\n- Completion rate tracking\n- Productivity insights (weekly/monthly)\n- Goal progress visualization\n\n5. **Smart Notifications**\n- Deadline reminders\n- AI-suggested breaks\n- Daily summary",
  },
  {
    title: "Technical Architecture",
    icon: Code,
    content: "**System Architecture:**\n\nFrontend (Web + PWA)\n- React 18 + TypeScript\n- Tailwind CSS\n- Redux Toolkit\n- React Query (API cache)\n\nBackend\n- Python 3.11 + FastAPI\n- PostgreSQL (user data, tasks)\n- Redis (caching, rate limiting)\n- Celery (background jobs)\n\nAI/ML\n- OpenAI GPT-4 (task analysis)\n- Scikit-learn (priority scoring)\n- Custom ML model (user pattern recognition)\n\nInfrastructure\n- Vercel (frontend)\n- Railway (backend)\n- Supabase (database)\n- AWS S3 (file storage)",
  },
  {
    title: "Budget Breakdown",
    icon: DollarSign,
    content: "**Development Costs:**\n- Frontend Developer (200h × $75): $15,000\n- Backend Developer (150h × $80): $12,000\n- UI/UX Designer (80h × $65): $5,200\n- QA Engineer (60h × $60): $3,600\n\n**Infrastructure (First Year):**\n- Hosting & Database: $600\n- OpenAI API: $500\n- Email Service: $120\n- Domain & SSL: $50\n\n**Contingency (15%):** $5,500\n\n**Total MVP:** $42,570\n**Rounded:** $43,000",
  },
  {
    title: "Development Timeline",
    icon: Calendar,
    content: "**Phase 1: Foundation (Weeks 1-4)**\n- Week 1-2: Setup, Auth, Database\n- Week 3-4: Core task CRUD, Basic UI\n\n**Phase 2: AI Integration (Weeks 5-7)**\n- Week 5: OpenAI integration\n- Week 6: Priority algorithm\n- Week 7: Testing & refinement\n\n**Phase 3: Features (Weeks 8-10)**\n- Week 8: Calendar sync\n- Week 9: Dashboard & insights\n- Week 10: Notifications\n\n**Phase 4: Polish (Weeks 11-12)**\n- Week 11: Bug fixes, performance\n- Week 12: Beta testing, launch prep\n\n**Launch:** End of Week 12",
  },
  {
    title: "Team Requirements",
    icon: Target,
    content: "**Required Roles:**\n\n1. **Full-Stack Developer** (200h)\n- React + TypeScript expertise\n- Python + FastAPI experience\n- Database design skills\n- Rate: $75-85/hour\n\n2. **Backend Developer** (150h)\n- Python expert\n- AI/ML integration experience\n- API design\n- Rate: $80-90/hour\n\n3. **UI/UX Designer** (80h)\n- Product design\n- User research\n- Figma expert\n- Rate: $65-75/hour\n\n4. **QA Engineer** (60h, part-time)\n- Manual + automated testing\n- Bug tracking\n- Rate: $60-70/hour",
  },
  {
    title: "Risk Mitigation",
    icon: AlertTriangle,
    content: "**Technical Risks:**\n\n1. AI Accuracy (<85%)\n- Mitigation: Manual override + feedback loop\n- Fallback: Rule-based prioritization\n\n2. Calendar API Rate Limits\n- Mitigation: Caching + batch requests\n- Fallback: Manual calendar entry\n\n3. Performance (>2s load time)\n- Mitigation: Redis caching, lazy loading\n- Fallback: Optimize queries, CDN\n\n**Business Risks:**\n\n1. Low User Adoption\n- Mitigation: Beta program, referrals\n- Fallback: Pivot features based on feedback\n\n2. High CAC (>$50)\n- Mitigation: Content marketing, SEO\n- Fallback: Reduce paid ads, focus organic",
  },
];

export function TechSpec() {
  const navigate = useNavigate();
  const { hapticImpact, hapticNotification } = useTelegram();

  const handleShare = () => {
    hapticImpact("light");
    hapticNotification("success");
    // TODO: Implement share via Telegram
  };

  const handleDownload = () => {
    hapticImpact("medium");
    // TODO: Call API to generate PDF
    // GET /api/projects/{id}/export/pdf
  };

  const handleFindTeam = () => {
    hapticImpact("medium");
    navigate("/marketplace");
  };

  const handleGetHelp = () => {
    hapticImpact("light");
    navigate("/dfy");
  };

  return (
    <Layout title="Tech Specification" showBack>
      <div className="container mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Generated
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <h2 className="text-2xl font-bold">AI-Powered Task Manager</h2>
          <p className="text-sm text-muted-foreground">
            Complete technical specification for your startup MVP
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardHeader className="pb-2 pt-4">
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">$43K</div>
              <div className="text-xs text-muted-foreground">Total Budget</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <Clock className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">12 weeks</div>
              <div className="text-xs text-muted-foreground">Timeline</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">3-4</div>
              <div className="text-xs text-muted-foreground">Team Size</div>
            </CardContent>
          </Card>
        </div>

        {/* Expandable Sections */}
        <Accordion>
          {MOCK_SPEC_SECTIONS.map((section, idx) => (
            <AccordionItem
              key={idx}
              title={
                <div className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  <span>{section.title}</span>
                </div>
              }
              defaultOpen={idx === 0}
            >
              <div className="prose prose-sm max-w-none">
                <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </div>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Document Info */}
        <Card className="bg-secondary/30">
          <CardContent className="pt-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Version 1.0</span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 safe-bottom z-40">
        <div className="container mx-auto space-y-3">
          {/* Primary Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 touch-target"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="default"
              className="flex-1 touch-target"
              onClick={handleFindTeam}
            >
              <Users className="h-4 w-4 mr-2" />
              Find Team
            </Button>
          </div>
          
          {/* Secondary Action */}
          <Button
            variant="ghost"
            className="w-full touch-target"
            onClick={handleGetHelp}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Get Professional Help (Done-For-You)
          </Button>
        </div>
      </div>
    </Layout>
  );
}

