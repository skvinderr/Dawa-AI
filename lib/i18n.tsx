"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";

export type Language = "en" | "hi";
export type UserRole = "citizen" | "shopkeeper" | "admin";

const translations = { en, hi };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  t: (keyPath: string) => string;
  dict: typeof en;
  // Accessibility
  isLargeText: boolean;
  toggleLargeText: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [role, setRoleState] = useState<UserRole>("citizen");
  const [isLargeText, setIsLargeTextState] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrastState] = useState<boolean>(false);

  useEffect(() => {
    // 1. Language persistence
    const savedLang = localStorage.getItem("dawaasetu_lang") as Language;
    if (savedLang === "en" || savedLang === "hi") {
      setLanguageState(savedLang);
    }

    // 2. Role persistence
    const savedRole = localStorage.getItem("dawaasetu_role") as UserRole;
    if (savedRole === "citizen" || savedRole === "shopkeeper" || savedRole === "admin") {
      setRoleState(savedRole);
    }

    // 3. Accessibility: Large Text
    const savedLargeText = localStorage.getItem("dawaasetu_large_text") === "true";
    if (savedLargeText) {
      setIsLargeTextState(true);
      document.documentElement.classList.add("large-text");
    }

    // 4. Accessibility: High Contrast
    const savedHighContrast = localStorage.getItem("dawaasetu_high_contrast") === "true";
    if (savedHighContrast) {
      setIsHighContrastState(true);
      document.documentElement.classList.add("high-contrast");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dawaasetu_lang", lang);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("dawaasetu_role", newRole);
  };

  const toggleLargeText = () => {
    setIsLargeTextState((prev) => {
      const next = !prev;
      localStorage.setItem("dawaasetu_large_text", String(next));
      if (next) {
        document.documentElement.classList.add("large-text");
      } else {
        document.documentElement.classList.remove("large-text");
      }
      return next;
    });
  };

  const toggleHighContrast = () => {
    setIsHighContrastState((prev) => {
      const next = !prev;
      localStorage.setItem("dawaasetu_high_contrast", String(next));
      if (next) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
      return next;
    });
  };

  const dict = translations[language] || en;

  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    let current: any = dict;
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        // Fallback to English
        let fallback: any = en;
        for (const fb of keys) {
          if (fallback && typeof fallback === "object" && fb in fallback) {
            fallback = fallback[fb];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === "string" ? fallback : keyPath;
      }
    }
    return typeof current === "string" ? current : keyPath;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        role,
        setRole,
        t,
        dict,
        isLargeText,
        toggleLargeText,
        isHighContrast,
        toggleHighContrast,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
