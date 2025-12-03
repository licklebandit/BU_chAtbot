// backend/utils/intentClassifier.js

/**
 * Intent Classifier for University Chatbot
 * Categorizes user queries into predefined intents for better analytics and routing
 */

const intentKeywords = {
  admissions: [
    'admission', 'apply', 'application', 'entry', 'requirements', 'qualify',
    'acceptance', 'enroll', 'enrollment', 'join', 'admit', 'intake',
    'entry requirements', 'how to apply', 'application process', 'entry points',
    'admission letter', 'acceptance letter', 'cutoff points', 'minimum requirements'
  ],
  academics: [
    'course', 'program', 'degree', 'curriculum', 'syllabus', 'module',
    'lecture', 'class', 'timetable', 'schedule', 'exam', 'test', 'assessment',
    'academic', 'study', 'learning', 'semester', 'trimester', 'credit', 'gpa',
    'results', 'grades', 'transcript', 'retake', 'supplementary', 'coursework'
  ],
  fees: [
    'fee', 'fees', 'tuition', 'payment', 'cost', 'price', 'pay', 'billing',
    'invoice', 'amount', 'money', 'charge', 'how much', 'expense', 'financial',
    'installment', 'balance', 'owe', 'debt', 'payment plan', 'pay structure',
    'functional fees', 'caution fees', 'registration fees'
  ],
  scholarships: [
    'scholarship', 'bursary', 'financial aid', 'grant', 'sponsorship',
    'funding', 'loan', 'student loan', 'helb', 'allowance', 'stipend',
    'discount', 'waiver', 'free education', 'government sponsorship'
  ],
  campus_life: [
    'campus', 'life', 'club', 'society', 'guild', 'event', 'activity',
    'sports', 'recreation', 'entertainment', 'cafeteria', 'dining', 'food',
    'chapel', 'church', 'worship', 'fellowship', 'library', 'facility',
    'gym', 'swimming', 'football', 'basketball', 'volleyball'
  ],
  hostel: [
    'hostel', 'accommodation', 'housing', 'room', 'dormitory', 'residence',
    'lodge', 'rental', 'rent', 'bedspace', 'roommate', 'off-campus',
    'on-campus', 'booking', 'reservation', 'hostel fees', 'hostel booking'
  ],
  faculty: [
    'faculty', 'school', 'department', 'dean', 'professor', 'lecturer',
    'instructor', 'teacher', 'staff', 'department of', 'faculty of',
    'business', 'education', 'theology', 'science', 'nursing', 'medicine',
    'agriculture', 'engineering', 'computing', 'ict', 'law'
  ],
  programs: [
    'bachelor', 'masters', 'diploma', 'certificate', 'phd', 'doctorate',
    'postgraduate', 'undergraduate', 'degree program', 'course offerings',
    'what programs', 'available courses', 'offered programs', 'study options',
    'bba', 'bcom', 'bed', 'bsc', 'mba', 'med', 'msc'
  ],
  registration: [
    'register', 'registration', 'sign up', 'enlist', 'student id', 'id card',
    're-register', 'course registration', 'unit registration', 'add course',
    'drop course', 'change course', 'course selection', 'registration deadline',
    'late registration', 'registration process', 'how to register'
  ],
  graduation: [
    'graduate', 'graduation', 'clearance', 'convocation', 'ceremony',
    'gown', 'certificate', 'degree certificate', 'completion', 'final year',
    'graduation requirements', 'graduation fee', 'graduation list', 'alumni',
    'graduation date', 'graduation process', 'how to graduate'
  ],
  support: [
    'help', 'support', 'assistance', 'problem', 'issue', 'error', 'bug',
    'complaint', 'feedback', 'contact', 'reach', 'email', 'phone', 'call',
    'office', 'desk', 'counseling', 'guidance', 'advising', 'mentor',
    'ict support', 'technical support', 'portal help', 'system help'
  ],
  emergency: [
    'emergency', 'urgent', 'critical', 'immediate', 'crisis', 'security',
    'accident', 'medical', 'health', 'sick', 'hospital', 'clinic', 'doctor',
    'nurse', 'ambulance', 'fire', 'police', 'safety', 'danger', 'threat'
  ]
};

/**
 * Classify user query into an intent category
 * @param {string} query - User's question or message
 * @returns {Object} - { intent: string, confidence: number }
 */
export function classifyIntent(query) {
  if (!query || typeof query !== 'string') {
    return { intent: 'other', confidence: 0 };
  }

  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);

  // Score each intent based on keyword matches
  const scores = {};
  let maxScore = 0;
  let maxIntent = 'other';

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    let score = 0;

    for (const keyword of keywords) {
      // Check for exact keyword match
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        // Multi-word keywords get higher weight
        const weight = keyword.split(' ').length;
        score += weight;
      }
    }

    scores[intent] = score;

    if (score > maxScore) {
      maxScore = score;
      maxIntent = intent;
    }
  }

  // Calculate confidence (0-1 scale)
  // More matches = higher confidence
  const totalWords = words.length;
  const confidence = maxScore > 0
    ? Math.min(maxScore / totalWords, 1.0)
    : 0;

  // If confidence is too low, classify as 'other'
  if (confidence < 0.1 && maxScore < 2) {
    return { intent: 'other', confidence: 0 };
  }

  return {
    intent: maxIntent,
    confidence: parseFloat(confidence.toFixed(2)),
    scores // Return all scores for debugging
  };
}

/**
 * Get suggested quick replies based on intent
 * @param {string} intent - The classified intent
 * @returns {Array<string>} - Array of suggested follow-up questions
 */
export function getSuggestedQuestions(intent) {
  const suggestions = {
    admissions: [
      "What are the admission requirements?",
      "How do I apply for admission?",
      "When is the next intake?",
      "What are the entry points?"
    ],
    academics: [
      "What courses do you offer?",
      "How do I check my results?",
      "What is the exam timetable?",
      "How do I get my transcript?"
    ],
    fees: [
      "What are the tuition fees?",
      "Can I pay in installments?",
      "How do I check my fee balance?",
      "What payment methods are accepted?"
    ],
    scholarships: [
      "What scholarships are available?",
      "How do I apply for a scholarship?",
      "What are the scholarship requirements?",
      "When do scholarship applications open?"
    ],
    campus_life: [
      "What clubs and societies are available?",
      "Tell me about campus events",
      "What sports facilities do you have?",
      "Where is the library?"
    ],
    hostel: [
      "How do I book a hostel?",
      "What are the hostel fees?",
      "What accommodation options are available?",
      "Can I get off-campus accommodation?"
    ],
    faculty: [
      "What faculties do you have?",
      "Who is the dean of business?",
      "Tell me about the faculty of education",
      "How do I contact a lecturer?"
    ],
    programs: [
      "What degree programs do you offer?",
      "Tell me about the business programs",
      "What is the duration of the programs?",
      "What are the program requirements?"
    ],
    registration: [
      "How do I register for courses?",
      "When is the registration deadline?",
      "How do I get my student ID?",
      "Can I change my registered courses?"
    ],
    graduation: [
      "What are the graduation requirements?",
      "How do I apply for graduation?",
      "When is the graduation ceremony?",
      "How do I get my graduation clearance?"
    ],
    support: [
      "How can I contact ICT support?",
      "Where is the student affairs office?",
      "How do I give feedback?",
      "Who can help me with my issue?"
    ],
    emergency: [
      "What are the emergency contacts?",
      "Where is the medical center?",
      "How do I report a security issue?",
      "What should I do in an emergency?"
    ],
    other: [
      "Tell me about Bugema University",
      "Where is the campus located?",
      "What are the contact details?",
      "How do I access the student portal?"
    ]
  };

  return suggestions[intent] || suggestions.other;
}

/**
 * Get priority level based on intent
 * @param {string} intent - The classified intent
 * @returns {string} - Priority level: low, medium, high, urgent
 */
export function getIntentPriority(intent) {
  const priorities = {
    emergency: 'urgent',
    support: 'high',
    fees: 'high',
    admissions: 'medium',
    registration: 'medium',
    graduation: 'medium',
    academics: 'medium',
    scholarships: 'medium',
    programs: 'low',
    faculty: 'low',
    campus_life: 'low',
    hostel: 'low',
    other: 'low'
  };

  return priorities[intent] || 'low';
}

/**
 * Determine if query requires human escalation
 * @param {string} intent - The classified intent
 * @param {number} confidence - The classification confidence
 * @returns {boolean} - True if should escalate to human
 */
export function shouldEscalate(intent, confidence) {
  // Escalate if urgent or if confidence is too low
  if (intent === 'emergency') return true;
  if (confidence < 0.3) return true;

  // Escalate support queries with low confidence
  if (intent === 'support' && confidence < 0.5) return true;

  return false;
}

export default {
  classifyIntent,
  getSuggestedQuestions,
  getIntentPriority,
  shouldEscalate
};
