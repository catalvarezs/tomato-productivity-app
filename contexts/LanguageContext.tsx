import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { usePersistedState } from '../hooks/usePersistedState';

interface LanguageContextType {
  language: Language;
  t: typeof TRANSLATIONS['en'];
  setLanguage: (lang: Language) => void;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = usePersistedState<Language>('tomato_language', 'en');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Safe accessor for translations. Fallback to EN if missing (though strictly typed)
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    
    // 1. Trigger Fade Out
    setIsTransitioning(true);

    // 2. Wait for content to fade out slightly (150ms), then switch data
    setTimeout(() => {
      setLanguage(newLang);
      
      // 3. Wait a bit, then trigger Fade In
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
      
    }, 150);
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage: handleLanguageChange, isTransitioning }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};