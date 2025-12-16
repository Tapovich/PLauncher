/**
 * AI related types
 */

export interface IdeaGenerationRequest {
  problems: string;
  industries: string;
  budget_range: string;
  timeline: string;
  has_technical_skills: boolean;
}

export interface StartupIdea {
  id: string;
  title: string;
  one_liner: string;
  problem_statement: string;
  solution_overview: string;
  target_market: string;
  revenue_model: string;
  mvp_features: string[];
  estimated_cost: number;
  timeline_months: number;
}

export interface TechSpec {
  id: string;
  project_id: string;
  content: string;
  sections: TechSpecSection[];
  created_at: string;
}

export interface TechSpecSection {
  title: string;
  content: string;
  order: number;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  project_id?: string;
  messages: AIMessage[];
  context?: Record<string, unknown>;
  created_at: string;
}

