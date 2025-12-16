/**
 * API Client for LaunchKit AI
 * Handles all API requests with authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { error: "unknown", message: response.statusText };
      }

      throw new APIError(
        response.status,
        error.error || "unknown",
        error.message || response.statusText,
        error.details
      );
    }

    return response.json();
  } catch (err) {
    // Handle network errors (CORS, connection refused, etc.)
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new APIError(
        0,
        "network_error",
        `Cannot connect to API at ${API_BASE_URL}. Please check if the backend is running.`,
        { endpoint, baseUrl: API_BASE_URL }
      );
    }
    throw err;
  }
}

// ============================================
// PAYMENT API
// ============================================

export interface PaymentIntent {
  id: string;
  user_id: string;
  provider: "stripe" | "ton" | "usdt_ton" | "usdt_tron" | "usdt_sol" | "stars";
  amount: number;
  currency: string;
  status: "created" | "pending" | "paid" | "failed" | "expired";
  metadata?: Record<string, any>;
  next_action?: {
    type: "redirect" | "deposit" | "bot_deeplink" | "ton_transaction";
    url?: string;
    address?: string;
    amount_crypto?: string;
    memo?: string;
    receiver?: string;
    comment?: string;
    bot_deeplink?: string;
  };
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

export async function createPaymentIntent(data: {
  provider: string;
  amount: number;
  currency: string;
  project_id?: string;
  metadata?: Record<string, any>;
}): Promise<PaymentIntent> {
  return fetchAPI("/payments/intents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPaymentIntent(intentId: string): Promise<PaymentIntent> {
  return fetchAPI(`/payments/intents/${intentId}`);
}

export async function createDepositAddress(data: {
  chain: "ton" | "tron" | "sol";
  currency: string;
  amount: number;
}): Promise<{
  address: string;
  memo?: string;
  tag?: string;
  amount: string;
  currency: string;
  chain: string;
}> {
  return fetchAPI("/payments/deposit-address", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyOnchainTransaction(data: {
  intent_id: string;
  tx_hash: string;
  chain?: string;
}): Promise<{ verified: boolean; status: string }> {
  return fetchAPI("/payments/verify/onchain", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================
// AUTHENTICATION API
// ============================================

export interface TelegramAuthRequest {
  init_data: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    telegram_id?: number;
    email?: string;
    full_name: string;
    plan: string;
    created_at: string;
  };
}

export interface UserProfile {
  id: string;
  telegram_id?: number;
  email?: string;
  full_name: string;
  plan: string;
  created_at: string;
}

export async function telegramAuth(request: TelegramAuthRequest): Promise<AuthResponse> {
  return fetchAPI("/auth/telegram", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getCurrentUser(): Promise<UserProfile> {
  return fetchAPI("/auth/me");
}

// ============================================
// AI API
// ============================================

export interface ChatRequest {
  conversation_id?: string;
  message: string;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  should_generate_ideas: boolean;
}

export interface IdeaGenerationRequest {
  problems: string;
  industries: string;
  budget_range: string;
  timeline: string;
  has_technical_skills: boolean;
}

export interface Idea {
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

export interface IdeasResponse {
  ideas: Idea[];
  conversation_id: string;
}

export interface TechSpecRequest {
  idea: Record<string, any>;
  project_id?: string;
}

export interface TechSpecSection {
  title: string;
  content: string;
  order: number;
}

export interface TechSpecResponse {
  spec_markdown: string;
  sections: TechSpecSection[];
  conversation_id: string;
  version: string;
  generated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  project_id?: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  created_at: string;
}

export async function chatWithAI(request: ChatRequest): Promise<ChatResponse> {
  return fetchAPI("/ai/chat", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function generateIdeas(request: IdeaGenerationRequest): Promise<IdeasResponse> {
  return fetchAPI("/ai/generate-ideas", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function generateTechSpec(request: TechSpecRequest): Promise<TechSpecResponse> {
  return fetchAPI("/ai/generate-spec", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  return fetchAPI(`/ai/conversations/${conversationId}`);
}

export async function listConversations(): Promise<Conversation[]> {
  return fetchAPI("/ai/conversations");
}

// TODO: Add other API methods as needed
// - Freelancer search
// - Project CRUD
// - etc.

export default {
  // Auth methods
  telegramAuth,
  getCurrentUser,

  // Payment methods
  createPaymentIntent,
  getPaymentIntent,
  createDepositAddress,
  verifyOnchainTransaction,

  // AI methods
  chatWithAI,
  generateIdeas,
  generateTechSpec,
  getConversation,
  listConversations,
};

