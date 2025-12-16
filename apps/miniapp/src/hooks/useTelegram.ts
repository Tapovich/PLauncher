/**
 * Custom hook for Telegram WebApp integration
 * 
 * Provides complete access to Telegram WebApp SDK with helpers
 */

import { useEffect, useState, useCallback } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: {
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
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: string; text: string }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      // Initialize WebApp
      tg.ready();
      tg.expand();
      
      // Apply theme params to CSS variables
      applyThemeParams(tg.themeParams);
      
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      setColorScheme(tg.colorScheme);
      setIsReady(true);

      // Listen for theme changes
      const handleThemeChanged = () => {
        setColorScheme(tg.colorScheme);
        applyThemeParams(tg.themeParams);
      };

      tg.onEvent("themeChanged", handleThemeChanged);

      return () => {
        tg.offEvent("themeChanged", handleThemeChanged);
      };
    } else {
      // Development mode - set defaults
      setIsReady(true);
      setColorScheme("light");
    }
  }, []);

  // Apply Telegram theme params to CSS variables
  const applyThemeParams = (params: TelegramWebApp["themeParams"]) => {
    const root = document.documentElement;

    if (params.bg_color) {
      root.style.setProperty("--tg-theme-bg-color", params.bg_color);
    }
    if (params.text_color) {
      root.style.setProperty("--tg-theme-text-color", params.text_color);
    }
    if (params.hint_color) {
      root.style.setProperty("--tg-theme-hint-color", params.hint_color);
    }
    if (params.link_color) {
      root.style.setProperty("--tg-theme-link-color", params.link_color);
    }
    if (params.button_color) {
      root.style.setProperty("--tg-theme-button-color", params.button_color);
    }
    if (params.button_text_color) {
      root.style.setProperty("--tg-theme-button-text-color", params.button_text_color);
    }
    if (params.secondary_bg_color) {
      root.style.setProperty("--tg-theme-secondary-bg-color", params.secondary_bg_color);
    }

    // Add dark mode class
    if (colorScheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Main Button helpers
  const showMainButton = useCallback((text: string, onClick: () => void, options?: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
  }) => {
    if (!webApp?.MainButton) return;

    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    
    if (options) {
      webApp.MainButton.setParams({
        text,
        color: options.color,
        text_color: options.textColor,
        is_active: options.isActive !== false,
      });
    }
    
    webApp.MainButton.show();
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    webApp?.MainButton.hide();
  }, [webApp]);

  const showMainButtonProgress = useCallback(() => {
    webApp?.MainButton.showProgress(false);
  }, [webApp]);

  const hideMainButtonProgress = useCallback(() => {
    webApp?.MainButton.hideProgress();
  }, [webApp]);

  // Back Button helpers
  const showBackButton = useCallback((onClick: () => void) => {
    if (!webApp?.BackButton) return;
    
    webApp.BackButton.onClick(onClick);
    webApp.BackButton.show();
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    webApp?.BackButton.hide();
  }, [webApp]);

  // Haptic Feedback helpers
  const hapticImpact = useCallback((style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
    webApp?.HapticFeedback.impactOccurred(style);
  }, [webApp]);

  const hapticNotification = useCallback((type: "error" | "success" | "warning") => {
    webApp?.HapticFeedback.notificationOccurred(type);
  }, [webApp]);

  const hapticSelection = useCallback(() => {
    webApp?.HapticFeedback.selectionChanged();
  }, [webApp]);

  // Utility functions
  const close = useCallback(() => {
    webApp?.close();
  }, [webApp]);

  const showAlert = useCallback((message: string, callback?: () => void) => {
    webApp?.showAlert(message, callback);
  }, [webApp]);

  const showConfirm = useCallback((message: string, callback?: (confirmed: boolean) => void) => {
    webApp?.showConfirm(message, callback);
  }, [webApp]);

  const openLink = useCallback((url: string) => {
    webApp?.openLink(url);
  }, [webApp]);

  const enableClosingConfirmation = useCallback(() => {
    webApp?.enableClosingConfirmation();
  }, [webApp]);

  const disableClosingConfirmation = useCallback(() => {
    webApp?.disableClosingConfirmation();
  }, [webApp]);

  // Get safe area insets
  const getSafeAreaInsets = useCallback(() => {
    return {
      top: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tg-safe-area-inset-top") || "0"),
      bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tg-safe-area-inset-bottom") || "0"),
      left: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tg-safe-area-inset-left") || "0"),
      right: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tg-safe-area-inset-right") || "0"),
    };
  }, []);

  return {
    // WebApp instance
    webApp,
    
    // User data
    user,
    colorScheme,
    isReady,
    platform: webApp?.platform || "unknown",
    version: webApp?.version || "unknown",
    
    // Main Button
    showMainButton,
    hideMainButton,
    showMainButtonProgress,
    hideMainButtonProgress,
    
    // Back Button
    showBackButton,
    hideBackButton,
    
    // Haptic Feedback
    hapticImpact,
    hapticNotification,
    hapticSelection,
    
    // Dialogs
    showAlert,
    showConfirm,
    
    // Navigation
    close,
    openLink,
    
    // Confirmation
    enableClosingConfirmation,
    disableClosingConfirmation,
    
    // Safe area
    getSafeAreaInsets,
    
    // Theme params (direct access)
    themeParams: webApp?.themeParams || {},
  };
}

