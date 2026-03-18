import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tr, Translations } from './locales/tr';
import { en } from './locales/en';

export type Language = 'tr' | 'en';

const LANGUAGE_KEY = '@language';

const locales: Record<Language, Translations> = { tr, en };

function detectDeviceLanguage(): Language {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.startsWith('tr') ? 'tr' : 'en';
  } catch {
    return 'tr';
  }
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'tr',
  setLanguage: async () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>('tr');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored === 'tr' || stored === 'en') {
        setLang(stored);
      } else {
        // No stored preference — use device language
        setLang(detectDeviceLanguage());
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLang(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage } },
    children
  );
}

export function useTranslation() {
  const { language, setLanguage } = useContext(LanguageContext);
  return {
    t: locales[language],
    language,
    setLanguage,
  };
}

// Standalone getter for use outside React components (e.g. services)
export function getTranslations(lang: Language = 'tr'): Translations {
  return locales[lang];
}
