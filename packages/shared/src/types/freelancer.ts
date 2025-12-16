/**
 * Freelancer related types
 */

export type FreelancerRole =
  | "developer"
  | "designer"
  | "pm"
  | "qa"
  | "devops"
  | "marketing"
  | "other";

export type Availability = "full-time" | "part-time" | "contract";

export interface Freelancer {
  id: string;
  user_id: string;
  role: FreelancerRole;
  skills: string[];
  hourly_rate_usd: number;
  availability: Availability;
  portfolio_url?: string;
  bio: string;
  rating: number;
  projects_completed: number;
  verified: boolean;
  created_at: string;
}

export interface FreelancerSearchParams {
  role?: FreelancerRole;
  skills?: string[];
  min_rate?: number;
  max_rate?: number;
  availability?: Availability;
  verified_only?: boolean;
}

export interface FreelancerCreate {
  role: FreelancerRole;
  skills: string[];
  hourly_rate_usd: number;
  availability: Availability;
  portfolio_url?: string;
  bio: string;
}

