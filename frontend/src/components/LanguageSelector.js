import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const currentLanguage = i18n.language || 'en';
  // Define languages directly since we're having issues with the translation
  const languages = {
    en: 'English',
    sw: 'Kiswahili',
    fr: 'Français',
    lg: 'Luganda'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700/50"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{t('selectLanguage')}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          {Object.entries(languages).map(([code, name]) => code && name ? (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${currentLanguage === code ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}
            >
              {name}
            </button>
          ) : null)}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
