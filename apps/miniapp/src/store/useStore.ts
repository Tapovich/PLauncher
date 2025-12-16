/**
 * Global state management with Zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface User {
  id: string;
  telegram_id?: number;
  full_name: string;
  email?: string;
  plan: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
}

interface IdeaState {
  ideas: Idea[];
  selectedIdeaId: string | null;
  conversationId: string | null;
  setIdeas: (ideas: Idea[], conversationId?: string) => void;
  selectIdea: (ideaId: string) => void;
  clearIdeas: () => void;
  getSelectedIdea: () => Idea | null;
}

interface AppState extends AuthState, IdeaState {
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      
      // Idea state
      ideas: [],
      selectedIdeaId: null,
      conversationId: null,
      
      setIdeas: (ideas, conversationId) =>
        set({
          ideas,
          conversationId,
          selectedIdeaId: null, // Reset selection
        }),
      
      selectIdea: (ideaId) =>
        set({ selectedIdeaId: ideaId }),
      
      clearIdeas: () =>
        set({
          ideas: [],
          selectedIdeaId: null,
          conversationId: null,
        }),
      
      getSelectedIdea: () => {
        const state = get();
        if (!state.selectedIdeaId) return null;
        return state.ideas.find((idea) => idea.id === state.selectedIdeaId) || null;
      },
      
      // Loading state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Error state
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: "launchkit-storage",
      partialize: (state) => ({
        // Only persist auth and selected idea
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        selectedIdeaId: state.selectedIdeaId,
      }),
    }
  )
);

