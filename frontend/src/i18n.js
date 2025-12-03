import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      welcome: "Hello! I'm BUchatbot, your campus assistant. Ask me anything about admissions, programs, campus life, or student services.",
      newChat: 'New chat started. How can BUchatbot support you today?',
      typeMessage: 'Type a message...',
      send: 'Send',
      newChatButton: 'New Chat',
      quickTopics: 'Quick topics',
      universityResources: 'University resources',
      supportProfile: 'Support & profile',
      searchPlaceholder: 'Search chats...',
      language: 'Language',
      speak: 'Speak',
      listening: 'Listening...',
      stopListening: 'Stop listening',
      selectLanguage: 'Select Language',
      languages: {
        en: 'English',
        sw: 'Kiswahili',
        fr: 'Français',
        lg: 'Luganda'
      }
    }
  },
  sw: {
    translation: {
      welcome: 'Hujambo! Mimi ni BUchatbot, msaidizi wako wa chuo. Nikuulize chochote kuhusu uandikishaji, kozi, maisha ya chuo, au huduma za wanafunzi.',
      newChat: 'Mazungumzo mapya yameanza. Je, BUchatbot anaweza kukusaidiaje leo?',
      typeMessage: 'Andika ujumbe...',
      send: 'Tuma',
      newChatButton: 'Mazungumzo Mapya',
      quickTopics: 'Mada za haraka',
      universityResources: 'Rasilimali za chuo',
      supportProfile: 'Msaada na wasifu',
      searchPlaceholder: 'Tafuta mazungumzo...',
      language: 'Lugha',
      speak: 'Sema',
      listening: 'Ninasikiliza...',
      stopListening: 'Acha kusikiliza',
      selectLanguage: 'Chagua Lugha',
      languages: {
        en: 'English',
        sw: 'Kiswahili',
        fr: 'Français',
        lg: 'Luganda'
      }
    }
  },
  fr: {
    translation: {
      welcome: 'Bonjour ! Je suis BUchatbot, votre assistant de campus. Posez-moi des questions sur les admissions, les programmes, la vie sur le campus ou les services aux étudiants.',
      newChat: "Nouvelle conversation commencée. Comment BUchatbot peut-il vous aider aujourd'hui ?",
      typeMessage: 'Tapez un message...',
      send: 'Envoyer',
      newChatButton: 'Nouvelle discussion',
      quickTopics: 'Sujets rapides',
      universityResources: 'Ressources universitaires',
      supportProfile: 'Support et profil',
      searchPlaceholder: 'Rechercher des discussions...',
      language: 'Langue',
      speak: 'Parler',
      listening: 'Écoute...',
      stopListening: "Arrêter d'écouter",
      selectLanguage: 'Sélectionner la langue',
      languages: {
        en: 'English',
        sw: 'Kiswahili',
        fr: 'Français',
        lg: 'Luganda'
      }
    }
  },
  lg: {
    translation: {
      welcome: "Oli otya! Nze BUchatbot, omuyambi wo mu kkampuni. Mpa ebibuzo ku bintu eby'okwenyigira, ebigezo, obulamu mu kkampuni, oba ebikolwa bya bayizi.",
      newChat: 'Okwogera kumpya kutandise. BUchatbot asobola okukuyamba bwe tuti leero?',
      typeMessage: 'Wandika obubaka...',
      send: 'Tuma',
      newChatButton: 'Okwogera Kumpya',
      quickTopics: "Eby'okwogera ku mangu",
      universityResources: 'Ebikozesebwa mu kkampuni',
      supportProfile: "Okuyamba n'ebikwata ku muntu",
      searchPlaceholder: "Noonya eby'okwogera...",
      language: 'Olulimi',
      speak: 'Yogera',
      listening: 'Nkugulikira...',
      stopListening: 'Ssawo okugulikira',
      selectLanguage: 'Londa Olulimi',
      languages: {
        en: 'English',
        sw: 'Kiswahili',
        fr: 'Français',
        lg: 'Luganda'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
