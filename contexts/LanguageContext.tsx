import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadLanguage();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (isMountedRef.current && savedLanguage && ['en', 'hi', 'tel'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', newLanguage);
      if (isMountedRef.current) {
        setLanguageState(newLanguage);
      }
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}