/**
 * Project related types
 */

export type ProjectStatus =
  | "ideation"
  | "planning"
  | "hiring"
  | "development"
  | "launched";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  ai_generated_spec?: Record<string, unknown>;
  budget_min?: number;
  budget_max?: number;
  timeline_weeks?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  timeline_weeks?: number;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  budget_min?: number;
  budget_max?: number;
  timeline_weeks?: number;
}

