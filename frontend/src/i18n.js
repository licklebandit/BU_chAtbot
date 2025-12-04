// i18n.js - Enhanced with more translations
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Welcome messages
      welcome: "Hello! I'm BUchatbot, your campus assistant. Ask me anything about admissions, programs, campus life, or student services.",
      newChat: 'New chat started. How can I help you today?',
      
      // Input & Actions
      typeMessage: 'Ask anything about campus life or student support...',
      send: 'Send',
      newChatButton: 'New Chat',
      listening: 'Listening...',
      stopListening: 'Stop',
      speak: 'Read Aloud',
      uploadImage: 'Upload Image',
      removeImage: 'Remove',
      
      // Sidebar sections
      yourHistory: 'Chat History',
      quickTopics: 'Quick Topics',
      universityResources: 'University Resources',
      supportProfile: 'Support & Settings',
      searchPlaceholder: 'Search chats...',
      
      // Language
      language: 'Language',
      selectLanguage: 'Select Language',
      languages: {
        en: 'English',
        sw: 'Kiswahili',
        fr: 'Français',
        lg: 'Luganda'
      },
      
      // Auth & Status
      login: 'Log in',
      logout: 'Logout',
      signup: 'Sign up',
      freeQuestions: 'Free questions left',
      unlimitedAccess: 'for unlimited access',
      
      // Common
      conversation: 'Conversation',
      imageSelected: 'Image selected',
      noImageFile: 'No image file provided',
      uploadFailed: 'Failed to upload image',
      
      // Quick topics
      quickTopicsList: [
        'Admissions process',
        'Scholarships & financial aid',
        'Faculty of Business',
        'Campus life & clubs',
        'Work program requirements',
        'Campus directions'
      ],
      
      // Resource links
      resourceLinks: [
        { label: 'Student Portal', prompt: 'Tell me about the student portal' },
        { label: 'Academic Calendar', prompt: 'Share the key dates on the academic calendar' },
        { label: 'Fees & Payments', prompt: 'What are the current tuition fees?' },
        { label: 'Hostels & Housing', prompt: 'What accommodation options are available?' },
        { label: 'Emergency Contacts', prompt: 'Who do I reach in case of emergency?' }
      ],
      
      // Support links
      supportLinks: [
        { label: 'Update Profile', prompt: 'How do I update my student profile?' },
        { label: 'Give Feedback', prompt: 'How can I submit feedback?' },
        { label: 'System Status', prompt: 'What is the current system status?' }
      ]
    }
  },
  sw: {
    translation: {
      welcome: 'Hujambo! Mimi ni BUchatbot, msaidizi wako wa chuo. Uliza chochote kuhusu uandikishaji, kozi, maisha ya chuo, au huduma za wanafunzi.',
      newChat: 'Mazungumzo mapya yameanza. Je, ninaweza kukusaidiaje leo?',
      
      typeMessage: 'Uliza chochote kuhusu maisha ya chuo...',
      send: 'Tuma',
      newChatButton: 'Mazungumzo Mapya',
      listening: 'Ninasikiliza...',
      stopListening: 'Acha',
      speak: 'Soma Kwa Sauti',
      uploadImage: 'Pakia Picha',
      removeImage: 'Ondoa',
      
      yourHistory: 'Historia ya Mazungumzo',
      quickTopics: 'Mada za Haraka',
      universityResources: 'Rasilimali za Chuo',
      supportProfile: 'Msaada na Mipangilio',
      searchPlaceholder: 'Tafuta mazungumzo...',
      
      language: 'Lugha',
      selectLanguage: 'Chagua Lugha',
      languages: {
        en: 'English',
        sw: 'Kiswahili',
        fr: 'Français',
        lg: 'Luganda'
      },
      
      login: 'Ingia',
      logout: 'Toka',
      signup: 'Jisajili',
      freeQuestions: 'Maswali ya bure yaliyobaki',
      unlimitedAccess: 'kwa ufikiaji usio na kikomo',
      
      conversation: 'Mazungumzo',
      imageSelected: 'Picha imechaguliwa',
      
      quickTopicsList: [
        'Mchakato wa uandikishaji',
        'Ufadhili na msaada wa kifedha',
        'Kitivo cha Biashara',
        'Maisha ya chuo na vilabu',
        'Mahitaji ya programu ya kazi',
        'Mwongozo wa kampasi'
      ]
    }
  },
  fr: {
    translation: {
      welcome: "Bonjour ! Je suis BUchatbot, votre assistant de campus. Posez-moi des questions sur les admissions, les programmes, la vie sur le campus ou les services aux étudiants.",
      newChat: "Nouvelle conversation commencée. Comment puis-je vous aider aujourd'hui ?",
      
      typeMessage: 'Posez des questions sur la vie du campus...',
      send: 'Envoyer',
      newChatButton: 'Nouvelle Discussion',
      listening: 'Écoute...',
      stopListening: 'Arrêter',
      speak: 'Lire à Haute Voix',
      uploadImage: 'Télécharger Image',
      removeImage: 'Supprimer',
      
      yourHistory: 'Historique des Discussions',
      quickTopics: 'Sujets Rapides',
      universityResources: 'Ressources Universitaires',
      supportProfile: 'Support et Paramètres',
      searchPlaceholder: 'Rechercher des discussions...',
      
      language: 'Langue',
      selectLanguage: 'Sélectionner la Langue',
      languages: {
        en: 'English',
        sw: 'Kiswahili',
        fr: 'Français',
        lg: 'Luganda'
      },
      
      login: 'Se connecter',
      logout: 'Se déconnecter',
      signup: "S'inscrire",
      freeQuestions: 'Questions gratuites restantes',
      unlimitedAccess: 'pour un accès illimité',
      
      conversation: 'Conversation',
      imageSelected: 'Image sélectionnée',
      
      quickTopicsList: [
        "Processus d'admission",
        'Bourses et aide financière',
        'Faculté de Commerce',
        'Vie du campus et clubs',
        'Exigences du programme de travail',
        'Directions du campus'
      ]
    }
  },
  lg: {
    translation: {
      welcome: "Oli otya! Nze BUchatbot, omuyambi wo mu kkampuni. Mpa ebibuzo ku bintu eby'okwenyigira, ebigezo, obulamu mu kkampuni, oba ebikolwa bya bayizi.",
      newChat: 'Okwogera kumpya kutandise. Nkuyamba ntya leero?',
      
      typeMessage: 'Buuza ekintu kyonna ku bulamu bwa kampasi...',
      send: 'Tuma',
      newChatButton: 'Okwogera Kumpya',
      listening: 'Nkugulikira...',
      stopListening: 'Ssawo',
      speak: 'Soma mu Ddoboozi',
      uploadImage: 'Teeka Kifaananyi',
      removeImage: 'Gyawo',
      
      yourHistory: 'Ebyokwogera Ebiyise',
      quickTopics: "Eby'okwogera ku Mangu",
      universityResources: 'Ebikozesebwa mu Kkampuni',
      supportProfile: "Okuyamba n'Enteekateeka",
      searchPlaceholder: "Noonya eby'okwogera...",
      
      language: 'Olulimi',
      selectLanguage: 'Londa Olulimi',
      languages: {
        en: 'English',
        sw: 'Kiswahili',
        fr: 'Français',
        lg: 'Luganda'
      },
      
      login: 'Yingira',
      logout: 'Fuluma',
      signup: 'Wandiisa',
      freeQuestions: 'Ebibuzo ebya bwereere ebisigadde',
      unlimitedAccess: "okufuna okuyingira okutaliiko kikomo",
      
      conversation: 'Okwogera',
      imageSelected: 'Kifaananyi kiloze',
      
      quickTopicsList: [
        "Enkola y'okwenyigira",
        "Obuyambi n'ensimbi",
        'Kitongole kya Bizinensi',
        'Obulamu bwa kampasi ne bibinja',
        'Ebyetaagisa mu program ya mulimu',
        'Ekkubo erya kampasi'
      ]
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