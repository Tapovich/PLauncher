/**
 * Sentry integration for frontend error tracking
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || "development";

export function initSentry() {
  if (!SENTRY_DSN) {
    console.log("Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: ENVIRONMENT,
    
    // Performance monitoring
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Sample rates
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter errors
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      const error = hint.originalException;
      
      if (error && typeof error === "object") {
        const message = error.toString();
        
        // Ignore network errors (handled by UI)
        if (message.includes("NetworkError") || message.includes("Failed to fetch")) {
          return null;
        }
        
        // Ignore ResizeObserver errors (browser bug)
        if (message.includes("ResizeObserver")) {
          return null;
        }
      }
      
      // Remove sensitive data
      if (event.request?.headers) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["Cookie"];
      }
      
      return event;
    },
  });

  console.log("Sentry initialized:", ENVIRONMENT);
}

export function setUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email,
  });
}

export function clearUser() {
  Sentry.setUser(null);
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext("custom", context);
  }
  Sentry.captureException(error);
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

export function addBreadcrumb(message: string, category: string = "user-action") {
  Sentry.addBreadcrumb({
    message,
    category,
    level: "info",
  });
}

