// utils/questionVariations.js - UPDATED
export const questionVariations = {
  // Core university queries
  "university_info": [
    "tell me about bugema",
    "about bugema university",
    "information about bugema",
    "describe bugema university",
    "what is bugema university",
    "tell me about this university"
  ],
  
  "admission_help": [
    "help with admission",
    "need help applying",
    "how to join bugema",
    "want to apply",
    "admission assistance",
    "apply to bugema"
  ],
  
  "fees_help": [
    "fee information",
    "cost of study",
    "payment details",
    "how much to pay",
    "fee structure info",
    "payments information"
  ],
  
  "courses_help": [
    "what can i study",
    "available programs",
    "study options",
    "majors available",
    "what degrees",
    "academic options"
  ],
  
  "location_queries": [
    "where is",
    "location of",
    "find",
    "directions to",
    "how to get to",
    "where can i find"
  ],
  
  "contact_queries": [
    "get in touch",
    "reach out",
    "contact details",
    "how to contact",
    "phone number",
    "email address"
  ],
  
  "timing_queries": [
    "when is",
    "what time",
    "opening hours",
    "closing time",
    "schedule",
    "timings"
  ]
};

// Function to get variations for a specific keyword
export function getVariationsForKeyword(keyword) {
  const keywordLower = keyword.toLowerCase();
  
  // Map common keywords to variation categories
  const keywordToVariationMap = {
    "admission": "admission_help",
    "fee": "fees_help",
    "tuition": "fees_help",
    "course": "courses_help",
    "program": "courses_help",
    "library": "location_queries",
    "location": "location_queries",
    "where": "location_queries",
    "contact": "contact_queries",
    "phone": "contact_queries",
    "email": "contact_queries",
    "hours": "timing_queries",
    "time": "timing_queries",
    "when": "timing_queries"
  };
  
  // Find matching variation category
  for (const [key, variation] of Object.entries(keywordToVariationMap)) {
    if (keywordLower.includes(key)) {
      return questionVariations[variation] || [];
    }
  }
  
  return [];
}

// Function to expand a knowledge base entry with variations
export function expandKbEntry(entry) {
  if (!entry.keyword) return entry;
  
  const variations = [];
  const keywordLower = entry.keyword.toLowerCase();
  
  // Add generic variations based on keyword type
  if (keywordLower.includes("admission")) {
    variations.push("how to apply", "application process", "entry procedure");
  }
  if (keywordLower.includes("fee")) {
    variations.push("cost", "payment", "tuition payment");
  }
  if (keywordLower.includes("library")) {
    variations.push("book location", "study area", "reading room");
  }
  if (keywordLower.includes("contact")) {
    variations.push("reach university", "get in touch", "contact details");
  }
  
  // Add the variations to the entry
  return {
    ...entry,
    variations: [...new Set([...(entry.variations || []), ...variations])]
  };
}

// Function to check if a query is a variation of a keyword
export function isVariationOf(query, keyword) {
  const queryLower = query.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  // Direct inclusion check (bidirectional)
  if (queryLower.includes(keywordLower) || keywordLower.includes(queryLower)) {
    return true;
  }
  
  // Check common variations - UPDATED with more comprehensive mapping
  const variationMap = {
    "library": ["book", "study", "reading", "resource", "where is", "location", "find", "directions to", "how to get to"],
    "location": ["where", "find", "directions to", "how to get to", "place", "situated", "located"],
    "hours": ["when", "open", "close", "schedule", "timing", "time", "operating", "working hours"],
    "admission": ["apply", "application", "entry", "join", "enroll", "admit", "admission", "requirements", "criteria"],
    "fee": ["cost", "price", "payment", "tuition", "charge", "pay", "financial", "money", "how much"],
    "course": ["program", "subject", "study", "major", "degree", "degrees", "what can i study", "available", "offer", "curriculum"],
    "hostel": ["dorm", "accommodation", "housing", "residence", "stay", "living", "room"],
    "scholarship": ["bursary", "financial aid", "funding", "grant", "sponsorship", "award"],
    "contact": ["phone", "email", "address", "location", "reach", "call", "number", "get in touch", "how to contact"],
    "vc": ["vice chancellor", "chancellor", "president", "head", "leader", "director"],
    "warden": ["supervisor", "manager", "head of hostel", "dorm manager", "hostel supervisor"],
    "registration": ["enrollment", "signup", "registering", "enrol", "sign up", "course registration"],
    "exam": ["test", "assessment", "evaluation", "paper", "examination"],
    "graduation": ["completion", "finishing", "convocation", "ceremony", "graduate", "finish studies"],
    "portal": ["website", "online system", "platform", "login", "student portal", "academic portal"],
    "medical": ["health", "clinic", "hospital", "healthcare", "doctor", "nurse", "treatment"],
    "international": ["foreign", "overseas", "abroad", "global", "visa", "passport", "exchange student"],
    "bensdoff": ["hostel", "dormitory", "residence", "accommodation"],
    "bugema": ["university", "college", "institution", "campus", "school"],
    "student": ["learner", "pupil", "undergraduate", "graduate", "scholar"],
    "university": ["college", "institution", "campus", "school", "academy"]
  };
  
  // Special handling for "where is library" -> "library location"
  if ((queryLower.includes("where") && queryLower.includes("library")) && 
      keywordLower.includes("library") && keywordLower.includes("location")) {
    return true;
  }
  
  // Special handling for "when is library open" -> "library hours"
  if ((queryLower.includes("when") || queryLower.includes("what time")) && 
      queryLower.includes("library") && (queryLower.includes("open") || queryLower.includes("close")) &&
      keywordLower.includes("library") && keywordLower.includes("hours")) {
    return true;
  }
  
  // Check if query contains a variation that maps to the keyword
  for (const [baseWord, variations] of Object.entries(variationMap)) {
    if (keywordLower.includes(baseWord)) {
      for (const variation of variations) {
        // Check if query contains any variation word
        if (queryLower.includes(variation)) {
          // Additional check: make sure it's not a partial match in the middle of another word
          const regex = new RegExp(`\\b${variation}\\b`, 'i');
          if (regex.test(queryLower)) {
            return true;
          }
        }
      }
    }
    
    // Also check reverse: if query contains base word and keyword contains variation
    if (queryLower.includes(baseWord)) {
      for (const variation of variations) {
        if (keywordLower.includes(variation)) {
          return true;
        }
      }
    }
  }
  
  // Check for common question patterns
  const questionPatterns = {
    "library location": [
      /where.*library/i,
      /library.*where/i,
      /find.*library/i,
      /library.*location/i,
      /location.*library/i,
      /directions.*library/i,
      /how.*get.*library/i
    ],
    "library hours": [
      /when.*library.*open/i,
      /library.*open.*when/i,
      /what.*time.*library/i,
      /library.*hours/i,
      /hours.*library/i,
      /library.*schedule/i,
      /when.*does.*library/i
    ],
    "admission requirements": [
      /how.*apply/i,
      /apply.*how/i,
      /admission.*requirements/i,
      /requirements.*admission/i,
      /how.*get.*admission/i,
      /admission.*process/i,
      /entry.*requirements/i
    ],
    "tuition fees": [
      /how.*much.*fee/i,
      /fee.*how.*much/i,
      /tuition.*cost/i,
      /cost.*tuition/i,
      /how.*much.*pay/i,
      /payment.*details/i,
      /fee.*structure/i
    ],
    "contact information": [
      /how.*contact/i,
      /contact.*how/i,
      /phone.*number/i,
      /email.*address/i,
      /university.*address/i,
      /how.*reach/i,
      /get.*in.*touch/i
    ]
  };
  
  // Check if query matches any pattern for this keyword
  for (const [patternKeyword, patterns] of Object.entries(questionPatterns)) {
    if (keywordLower.includes(patternKeyword.toLowerCase())) {
      for (const pattern of patterns) {
        if (pattern.test(queryLower)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// New function: Get similarity score between query and keyword
export function getVariationScore(query, keyword) {
  const queryLower = query.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  let score = 0;
  
  // Direct match
  if (queryLower === keywordLower) {
    return 100;
  }
  
  // Check if is variation
  if (isVariationOf(query, keyword)) {
    score += 80;
  }
  
  // Word overlap
  const queryWords = queryLower.split(/\s+/);
  const keywordWords = keywordLower.split(/\s+/);
  
  const commonWords = queryWords.filter(word => 
    keywordWords.some(kw => kw.includes(word) || word.includes(kw))
  );
  
  score += commonWords.length * 10;
  
  // Check for important word matches
  const importantWords = ['library', 'admission', 'fee', 'course', 'contact', 'hostel', 'scholarship'];
  for (const word of importantWords) {
    if (queryLower.includes(word) && keywordLower.includes(word)) {
      score += 15;
    }
  }
  
  return Math.min(score, 100);
}