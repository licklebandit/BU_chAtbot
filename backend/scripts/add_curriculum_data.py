"""
Script to add curriculum data to knowledge.json
Parses the Bugema University bulletin curriculum data and adds structured KB entries
"""

import json

# Load existing knowledge base
with open('../data/knowledge.json', 'r', encoding='utf-8') as f:
    knowledge = json.load(f)

# Curriculum data for Software Engineering
curriculum_data = [
    # Software Engineering - Year 1 Semester 1
    {
        "keyword": "Bachelor Software Engineering Year 1 Semester 1 courses",
        "answer": "Year 1 Semester 1:\n• Database Systems (BBCT 1111) - 3 CU\n• Web Design & Development (BBCT 1112) - 3 CU\n• Software Engineering Ethics (BSCT 1111) - 3 CU\n• Programming Concepts Using C (BSCT 1112) - 3 CU\n• Fundamentals of Computers & Office Applications (GECC 1101) - 4 CU\n• Health Principles (GECH 1101) - 3 CU\n• Introduction to Writing Skills (GECL 1101) - 3 CU\nTotal: 22 credit units",
        "synonyms": ["bse year 1 semester 1", "software engineering first year first semester", "year one sem 1 software", "y1s1 software engineering"],
        "category": "curriculum",
        "tags": ["software engineering", "year 1", "semester 1", "courses"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    # Software Engineering - Year 1 Semester 2  
    {
        "keyword": "Bachelor Software Engineering Year 1 Semester 2 courses",
        "answer": "Year 1 Semester 2:\n• Information Systems (BBCT 1215) - 3 CU\n• Computer Mathematics (BSCM 1201) - 3 CU\n• Discrete Mathematics (BSCM 1202) - 3 CU\n• Software Engineering Principles (BSCT 1203) - 3 CU\n• Programming Using VB.Net (BSCT 1214) - 3 CU\n• Python Programming (BSCT 1215) - 3 CU\n• Statistics (GECS 1202) - 3 CU\n• Motor Vehicle Driving (GECV 1201) - 2 CU\nTotal: 23 credit units",
        "synonyms": ["bse year 1 semester 2", "software engineering first year second semester", "y1s2 software", "semester two year one software"],
        "category": "curriculum",
        "tags": ["software engineering", "year 1", "semester 2", "courses"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    # Software Engineering - Year 2 Semester 1
    {
        "keyword": "Bachelor Software Engineering Year 2 Semester 1 courses",
        "answer": "Year 2 Semester 1:\n• NoSQL Database Systems (BBCT 2115) - 3 CU\n• System Analysis & Design (BBCT 2114) - 3 CU\n• Computer Architecture & Organization (BNCT 2113) - 3 CU\n• OOP Using Java (BSCT 2116) - 3 CU\n• Data Structures & Algorithms (BSCT 2117) - 3 CU\n• Christian Beliefs (GECL 1101) - 3 CU\n• Introduction to Internet of Things (BNCT 2101) - 3 CU\nTotal: 21 credit units",
        "synonyms": ["bse year 2 semester 1", "software engineering second year first semester", "y2s1 software"],
        "category": "curriculum",
        "tags": ["software engineering", "year 2", "semester 1", "courses"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    # Software Engineering - Year 2 Semester 2
    {
        "keyword": "Bachelor Software Engineering Year 2 Semester 2 courses",
        "answer": "Year 2 Semester 2:\n• Internet & Web Programming (BBCT 2213) - 3 CU\n• Computer Networks & Data Communication (BNCT 2214) - 3 CU\n• Windows Client Server Administration (BNCT 2216) - 3 CU\n• Network & Information Security (BNCT 2217) - 3 CU\n• User Interface & User Experience Design (BSCT 2209) - 3 CU\n• Android Programming (BSCT 2220) - 3 CU\n• Introduction to Linux (BSCT 2208) - 3 CU\nTotal: 21 credit units",
        "synonyms": ["bse year 2 semester 2", "software engineering second year second semester", "y2s2 software"],
        "category": "curriculum",
        "tags": ["software engineering", "year 2", "semester 2", "courses"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    # Software Engineering - Year 3 Semester  1
    {
        "keyword": "Bachelor Software Engineering Year 3 Semester 1 courses",
        "answer": "Year 3 Semester 1:\n• Introduction to Data Science (BSCT 3125) - 3 CU\n• IT Project Management (BPCT 3101) - 3 CU\n• Research Methods in Computing (BRMC 3101) - 3 CU\n• Software Architecture & Design (BSCT 3122) - 3 CU\n• Artificial Intelligence (BSCT 3103) - 3 CU\n• Application Development Frameworks (BSCT 3124) - 3 CU\n• Basic Entrepreneurship (BENT 2101) - 3 CU\nTotal: 21 credit units",
        "synonyms": ["bse year 3 semester 1", "software engineering third year first semester", "y3s1 software", "final year semester 1 software"],
        "category": "curriculum",
        "tags": ["software engineering", "year 3", "semester 1", "courses"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    # Software Engineering - Year 3 Semester 2
    {
        "keyword": "Bachelor Software Engineering Year 3 Semester 2 courses",
        "answer": "Year 3 Semester 2:\n• Open Source Software (BSCT 3221) - 3 CU\n• Cloud Computing (BNCT 3229) - 3 CU\n• Linux Client Server Administration (BNCT 3220) - 3 CU\n• Final Year Project (BPCT 3212) - 3 CU\n• Operating Systems (BNCT 3222) - 3 CU\n• Numerical Computing (BBCT 3220) - 3 CU\nTotal: 18 credit units\n\nNote: Industrial Training (BSCI 3301) - 6 CU is done during recess/summer",
        "synonyms": ["bse year 3 semester 2", "software engineering final semester", "y3s2 software", "last semester software engineering"],
        "category": "curriculum",
        "tags": ["software engineering", "year 3", "semester 2", "courses", "final year"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    
    # Split entries for Vision/Mission/Motto
    {
        "keyword": "What is Bugema University motto",
        "answer": "Excellence in Service",
        "synonyms": ["motto", "university motto", "bugema motto", "what is the motto"],
        "category": "general",
        "tags": ["motto", "mission", "vision"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "What is Bugema University vision",
        "answer": "A Christian University of choice for Excellence in Education and Skilling.",
        "synonyms": ["vision", "university vision", "bugema vision", "what is the vision"],
        "category": "general",
        "tags": ["vision", "mission", "motto"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "What is Bugema University mission",
        "answer": "To offer an excellent and distinctive holistic Christian education designed to prepare students for productive lives of useful service to God and Society with integrity, honesty, and loyalty.",
        "synonyms": ["mission", "university mission", "bugema mission", "what is the mission"],
        "category": "general",
        "tags": ["mission", "vision", "motto"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    
    # Additional helpful general entries
    {
        "keyword": "How to travel to Bugema University from Kampala",
        "answer": "From Kampala to Bugema University:\n• Location: 32 km north of Kampala on Gayaza-Zirobwe Road, near Busiika Town Council\n• Public Transport: Take a taxi from Old Taxi Park, Kampala (approx. UGX 5,000)\n• Private Hire: Special hire car costs approximately UGX 70,000\n• Direction: Follow Gayaza-Zirobwe Road heading north from Kampala",
        "synonyms": ["how to reach bugema", "directions to bugema", "transport to bugema", "commute to bugema"],
        "category": "general",
        "tags": ["location", "transport", "directions", "kampala"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
]

# Add new entries
print(f"Starting with {len(knowledge)} entries in knowledge base")

# Add only entries that don't already exist
added = 0
for entry in curriculum_data:
    # Check if keyword already exists
    exists = any(item.get('keyword', '').lower() == entry['keyword'].lower() for item in knowledge)
    if not exists:
        knowledge.append(entry)
        added += 1
        print(f"✅ Added: {entry['keyword']}")
    else:
        print(f"⚠️  Skipped (exists): {entry['keyword']}")

# Save updated knowledge base
with open('../data/knowledge.json', 'w', encoding='utf-8') as f:
    json.dump(knowledge, f, indent=2, ensure_ascii=False)

print(f"\n✅ Done! Added {added} new entries")
print(f"📚 Total KB size: {len(knowledge)} entries")
