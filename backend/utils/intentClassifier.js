// utils/intentClassifier.js - COMPLETE UPDATED VERSION

// University-related intents
export const universityIntents = {
  'admission': {
    keywords: ['admission', 'admit', 'apply', 'application', 'entry', 'enroll', 'enrollment', 'join', 'applicant'],
    weight: 10,
    categories: ['admissions']
  },
  'fees': {
    keywords: ['fee', 'fees', 'tuition', 'cost', 'payment', 'pay', 'price', 'charge', 'financial'],
    weight: 10,
    categories: ['fees', 'financial']
  },
  'courses': {
    keywords: ['course', 'courses', 'program', 'programs', 'degree', 'degrees', 'study', 'studies', 'major', 'subject', 'curriculum'],
    weight: 9,
    categories: ['academic']
  },
  'library': {
    keywords: ['library', 'libraries', 'book', 'books', 'reading', 'study', 'research', 'resource'],
    weight: 8,
    categories: ['facilities']
  },
  'contact': {
    keywords: ['contact', 'phone', 'email', 'address', 'location', 'reach', 'call', 'message', 'mail'],
    weight: 8,
    categories: ['general', 'contact']
  },
  'accommodation': {
    keywords: ['hostel', 'dorm', 'dormitory', 'accommodation', 'housing', 'residence', 'living', 'room', 'stay'],
    weight: 8,
    categories: ['accommodation']
  },
  'scholarship': {
    keywords: ['scholarship', 'bursary', 'financial aid', 'funding', 'grant', 'sponsor', 'sponsorship', 'award', 'available', 'there are'],
    weight: 8,
    categories: ['financial']
  },
  'registration': {
    keywords: ['register', 'registration', 'enroll', 'enrollment', 'sign up', 'signup'],
    weight: 7,
    categories: ['academic']
  },
  'exam': {
    keywords: ['exam', 'exams', 'examination', 'test', 'tests', 'assessment', 'paper'],
    weight: 7,
    categories: ['academic']
  },
  'graduation': {
    keywords: ['graduate', 'graduation', 'complete', 'completion', 'finish', 'convocation', 'ceremony'],
    weight: 7,
    categories: ['academic']
  },
  'portal': {
    keywords: ['portal', 'website', 'online', 'system', 'platform', 'login', 'account'],
    weight: 6,
    categories: ['technical']
  },
  'medical': {
    keywords: ['medical', 'health', 'clinic', 'hospital', 'doctor', 'nurse', 'treatment', 'sick'],
    weight: 6,
    categories: ['services']
  },
  'international': {
    keywords: ['international', 'foreign', 'overseas', 'abroad', 'global', 'visa', 'passport'],
    weight: 6,
    categories: ['admissions']
  },
  'administration': {
    keywords: ['vc', 'vice chancellor', 'chancellor', 'dean', 'warden', 'principal', 'director', 'head'],
    weight: 6,
    categories: ['administration']
  },
  'campus': {
    keywords: ['campus', 'building', 'facility', 'ground', 'premises', 'site', 'bensdoff'],
    weight: 5,
    categories: ['campus']
  },
  'student_life': {
    keywords: ['student', 'life', 'activities', 'clubs', 'sports', 'social', 'cafeteria', 'food'],
    weight: 5,
    categories: ['student life']
  },
  'history': {
    keywords: ['history', 'founded', 'origin', 'background', 'past', 'beginning', 'start'],
    weight: 6,
    categories: ['history']
  },
  'identity': {
    keywords: ['anthem', 'song', 'motto', 'vision', 'mission', 'logo', 'identity', 'symbol', 'flag', 'values', 'philosophy'],
    weight: 7,
    categories: ['general', 'history']
  },
  'general_info': {
    keywords: ['bugema', 'university', 'college', 'institution', 'school', 'academy'],
    weight: 4,
    categories: ['general']
  }
};

// Non-KB intents (should go to Gemini)
export const nonKbIntents = {
  'greeting': {
    patterns: [/^(hello|hi|hey|greetings|good\s+(morning|afternoon|evening))$/i, /how\s+are\s+you/i],
    weight: 100
  },
  'farewell': {
    patterns: [/^(bye|goodbye|see you|farewell)$/i, /thanks|thank you/i],
    weight: 100
  },
  'joke': {
    patterns: [/joke|funny|humor|laugh|comedy|haha/i, /tell.*joke|make.*laugh/i],
    weight: 100
  },
  'story': {
    patterns: [/\bstory\b|\btale\b|\bnarrative\b/i, /tell.*story|write.*story/i],
    weight: 100
  },
  'creative': {
    patterns: [/poem|poetry|song|lyric|verse|rhyme/i, /write.*poem|compose.*song/i],
    weight: 100
  },
  'philosophy': {
    patterns: [/meaning.*life|purpose.*life|why.*exist/i, /philosophy|existential/i],
    weight: 100
  },
  'weather': {
    patterns: [/weather|temperature|forecast|rain|sun/i],
    weight: 100
  },
  'time': {
    patterns: [/what.*time|current.*time|clock/i, /date|today.*date|calendar/i],
    weight: 100
  },
  'personal': {
    patterns: [/yourself|who.*are.*you|about.*you/i, /what.*can.*you.*do/i],
    weight: 80
  },
  'opinion': {
    patterns: [/what.*think.*about|opinion.*on|view.*on/i],
    weight: 80
  }
};

// Main intent detection function
export function detectIntent(query) {
  const queryLower = query.toLowerCase().trim();

  // First check for non-KB intents
  for (const [intentName, intentData] of Object.entries(nonKbIntents)) {
    for (const pattern of intentData.patterns) {
      if (pattern.test(queryLower)) {
        return {
          intent: intentName,
          type: 'non-kb',
          confidence: intentData.weight / 100,
          shouldUseGemini: true,
          reason: `Matches non-KB intent: ${intentName}`
        };
      }
    }
  }

  // Check for university-related intents
  const intentScores = {};

  for (const [intentName, intentData] of Object.entries(universityIntents)) {
    let score = 0;

    for (const keyword of intentData.keywords) {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (keywordRegex.test(queryLower)) {
        score += intentData.weight;

        // Bonus for exact word match
        if (queryLower.includes(` ${keyword} `) ||
          queryLower.startsWith(`${keyword} `) ||
          queryLower.endsWith(` ${keyword}`)) {
          score += 2;
        }

        // Bonus for plural forms
        if (queryLower.includes(`${keyword}s`) || queryLower.includes(`${keyword}es`)) {
          score += 1;
        }
      }
    }

    if (score > 0) {
      intentScores[intentName] = score;
    }
  }

  // Sort by score
  const sortedIntents = Object.entries(intentScores).sort((a, b) => b[1] - a[1]);

  if (sortedIntents.length > 0) {
    const [topIntent, score] = sortedIntents[0];
    const confidence = Math.min(score / 100, 1);

    return {
      intent: topIntent,
      type: 'university',
      confidence: confidence,
      shouldUseGemini: false,
      reason: `University intent detected: ${topIntent} (score: ${score})`,
      allScores: intentScores
    };
  }

  // No intent detected
  return {
    intent: 'unknown',
    type: 'unknown',
    confidence: 0,
    shouldUseGemini: true,
    reason: 'No specific intent detected'
  };
}

// Check if query is mixed (contains both university and non-university elements)
export function isMixedQuery(query) {
  const queryLower = query.toLowerCase();

  // Check for mixed patterns
  const mixedPatterns = [
    /(joke|funny|humor|laugh).*(university|admission|fee|cours|library|contact)/i,
    /(university|admission|fee|cours|library|contact).*(joke|funny|humor|laugh)/i,
    /(story|poem|song).*(university|admission|fee|cours|library|contact)/i,
    /(university|admission|fee|cours|library|contact).*(story|poem|song)/i,
    /(weather|time|date).*(university|admission|fee|cours|library|contact)/i,
    /(university|admission|fee|cours|library|contact).*(weather|time|date)/i
  ];

  return mixedPatterns.some(pattern => pattern.test(queryLower));
}

// Get recommended KB categories based on intent
export function getRecommendedCategories(intentResult) {
  if (intentResult.type !== 'university') {
    return [];
  }

  const intentData = universityIntents[intentResult.intent];
  return intentData?.categories || [];
}

// Simple intent classification (for feedback.js compatibility)
export function classifyIntent(query) {
  const intentResult = detectIntent(query);
  return {
    intent: intentResult.intent,
    type: intentResult.type,
    confidence: intentResult.confidence,
    shouldUseGemini: intentResult.shouldUseGemini
  };
}

// Get intent priority
export function getIntentPriority(intent) {
  const priorityMap = {
    'admission': 1,
    'fees': 1,
    'courses': 2,
    'contact': 1,
    'library': 2,
    'accommodation': 2,
    'scholarship': 2,
    'registration': 2,
    'exam': 3,
    'graduation': 3,
    'portal': 2,
    'medical': 3,
    'international': 2,
    'administration': 2,
    'campus': 3,
    'student_life': 3,
    'general_info': 4
  };

  return priorityMap[intent] || 5;
}

// Additional helper function for chat.js compatibility
export function shouldUseKnowledgeBase(query) {
  const intentResult = detectIntent(query);

  if (intentResult.shouldUseGemini) {
    return false;
  }

  if (isMixedQuery(query)) {
    return false;
  }

  return true;
}

// Export all functions
export default {
  universityIntents,
  nonKbIntents,
  detectIntent,
  isMixedQuery,
  getRecommendedCategories,
  classifyIntent,
  getIntentPriority,
  shouldUseKnowledgeBase
};