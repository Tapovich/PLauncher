/**
 * User related types
 */

export type UserPlan = "free" | "pro" | "enterprise";

export interface User {
  id: string;
  email: string;
  full_name: string;
  telegram_id?: number;
  plan: UserPlan;
  created_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
}

