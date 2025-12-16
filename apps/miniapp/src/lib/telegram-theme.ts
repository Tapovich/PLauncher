/**
 * Telegram Mini App Theme Integration
 * Maps Telegram theme parameters to CSS variables
 * Supports both light and dark modes
 */

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

/**
 * Converts hex color to HSL
 */
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Default light theme (fallback if Telegram theme not available)
 */
const DEFAULT_LIGHT_THEME: TelegramThemeParams = {
  bg_color: "#ffffff",
  text_color: "#000000",
  hint_color: "#999999",
  link_color: "#6366F1",
  button_color: "#6366F1",
  button_text_color: "#ffffff",
  secondary_bg_color: "#f1f3f4",
  header_bg_color: "#ffffff",
  accent_text_color: "#6366F1",
  section_bg_color: "#ffffff",
  section_header_text_color: "#6c7883",
  subtitle_text_color: "#999999",
  destructive_text_color: "#ef4444",
};

/**
 * Default dark theme
 */
const DEFAULT_DARK_THEME: TelegramThemeParams = {
  bg_color: "#1f2937",
  text_color: "#ffffff",
  hint_color: "#9ca3af",
  link_color: "#818cf8",
  button_color: "#6366F1",
  button_text_color: "#ffffff",
  secondary_bg_color: "#111827",
  header_bg_color: "#1f2937",
  accent_text_color: "#818cf8",
  section_bg_color: "#1f2937",
  section_header_text_color: "#9ca3af",
  subtitle_text_color: "#9ca3af",
  destructive_text_color: "#f87171",
};

/**
 * Apply Telegram theme to CSS variables
 */
export function applyTelegramTheme(theme?: TelegramThemeParams, isDark = false) {
  const themeParams = theme || (isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME);

  // Set CSS variables
  if (themeParams.bg_color) {
    document.documentElement.style.setProperty("--background", hexToHSL(themeParams.bg_color));
  }

  if (themeParams.text_color) {
    document.documentElement.style.setProperty("--foreground", hexToHSL(themeParams.text_color));
  }

  if (themeParams.button_color) {
    document.documentElement.style.setProperty("--primary", hexToHSL(themeParams.button_color));
  }

  if (themeParams.button_text_color) {
    document.documentElement.style.setProperty(
      "--primary-foreground",
      hexToHSL(themeParams.button_text_color)
    );
  }

  if (themeParams.secondary_bg_color) {
    document.documentElement.style.setProperty(
      "--secondary",
      hexToHSL(themeParams.secondary_bg_color)
    );
  }

  if (themeParams.hint_color) {
    document.documentElement.style.setProperty("--muted-foreground", hexToHSL(themeParams.hint_color));
  }

  if (themeParams.link_color) {
    document.documentElement.style.setProperty("--accent", hexToHSL(themeParams.link_color));
  }

  if (themeParams.destructive_text_color) {
    document.documentElement.style.setProperty(
      "--destructive",
      hexToHSL(themeParams.destructive_text_color)
    );
  }

  // Set other design tokens
  document.documentElement.style.setProperty("--radius", "8px");

  // Add dark class if needed
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/**
 * Get Telegram theme from WebApp API
 */
export function getTelegramTheme(): TelegramThemeParams | null {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    return webApp.themeParams as TelegramThemeParams;
  }
  return null;
}

/**
 * Check if dark mode is enabled
 */
export function isTelegramDarkMode(): boolean {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.colorScheme === "dark";
  }
  return false;
}

/**
 * Initialize theme on app start
 */
export function initializeTelegramTheme() {
  const theme = getTelegramTheme();
  const isDark = isTelegramDarkMode();
  applyTelegramTheme(theme || undefined, isDark);

  // Listen for theme changes
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.onEvent("themeChanged", () => {
      const newTheme = getTelegramTheme();
      const newIsDark = isTelegramDarkMode();
      applyTelegramTheme(newTheme || undefined, newIsDark);
    });
  }
}

// Type augmentation moved to useTelegram.ts to avoid conflicts

