/**
 * @launchkit/shared
 * Shared types and contracts for LaunchKit AI
 */

// User types
export type { User, UserCreate, UserUpdate, UserPlan } from "./types/user";

// Project types
export type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectStatus,
} from "./types/project";

// AI types
export type {
  IdeaGenerationRequest,
  StartupIdea,
  TechSpec,
  TechSpecSection,
  AIMessage,
  AIConversation,
} from "./types/ai";

// Freelancer types
export type {
  Freelancer,
  FreelancerSearchParams,
  FreelancerCreate,
  FreelancerRole,
  Availability,
} from "./types/freelancer";

// API types
export type {
  APIResponse,
  APIError,
  APIMeta,
  PaginationParams,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "./types/api";

