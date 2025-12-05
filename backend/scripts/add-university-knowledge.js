// backend/scripts/add-university-knowledge.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgePath = path.join(__dirname, '..', 'data', 'knowledge.json');

console.log("📝 Adding university knowledge base entries...");

// Read existing data
const existingData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
console.log(`📚 Existing entries: ${existingData.length}`);

// New university knowledge entries
const universityKnowledge = [
  {
    "keyword": "contact information",
    "answer": "Bugema University Main Campus is located along Gayaza-Zirobwe Road. Phone: +256 392 730 324, Email: info@bugemauniv.ac.ug, Website: www.bugemauniv.ac.ug",
    "category": "general",
    "tags": ["contact", "location", "phone", "email"],
    "priority": 1
  },
  {
    "keyword": "library hours",
    "answer": "The university library is open Monday to Friday from 8:00 AM to 10:00 PM, Saturday from 9:00 AM to 6:00 PM, and Sunday from 2:00 PM to 8:00 PM.",
    "category": "facilities",
    "tags": ["library", "hours", "facilities"],
    "priority": 2
  },
  {
    "keyword": "registration process",
    "answer": "Registration involves: 1) Paying tuition fees, 2) Course registration at the academic registry, 3) Getting student ID, 4) Orientation attendance. Both online and physical registration are available.",
    "category": "academic",
    "tags": ["registration", "process", "enrollment"],
    "priority": 1
  },
  {
    "keyword": "scholarships available",
    "answer": "Bugema University offers various scholarships including: Academic Excellence Scholarships, Sports Scholarships, Need-Based Scholarships, and Church-Sponsored Scholarships. Apply through the financial aid office.",
    "category": "financial",
    "tags": ["scholarships", "financial aid", "bursary"],
    "priority": 2
  },
  {
    "keyword": "hostel accommodation",
    "answer": "Hostel accommodation is available for both male and female students. Facilities include beds, study tables, WiFi, and 24/7 security. Apply early as spaces are limited.",
    "category": "accommodation",
    "tags": ["hostel", "accommodation", "housing"],
    "priority": 2
  },
  {
    "keyword": "exam timetable",
    "answer": "Exam timetables are usually released 2 weeks before exams. Check the notice boards, student portal, or academic office for the latest exam schedules.",
    "category": "academic",
    "tags": ["exams", "timetable", "schedule"],
    "priority": 3
  },
  {
    "keyword": "graduation requirements",
    "answer": "To graduate, students must: 1) Complete all required course credits, 2) Clear all outstanding fees, 3) Have no disciplinary cases, 4) Apply for graduation through the academic registry.",
    "category": "academic",
    "tags": ["graduation", "requirements", "completion"],
    "priority": 2
  },
  {
    "keyword": "student portal",
    "answer": "The student portal (portal.bugemauniv.ac.ug) allows students to: view results, register courses, check fees balance, download transcripts, and access course materials. Login with your student number and password.",
    "category": "technical",
    "tags": ["portal", "online", "student system"],
    "priority": 1
  },
  {
    "keyword": "medical services",
    "answer": "The university has a medical clinic that provides basic healthcare services to students. It's located near the administration block and is open during working hours. Emergency services are available 24/7.",
    "category": "services",
    "tags": ["medical", "health", "clinic"],
    "priority": 2
  },
  {
    "keyword": "international students",
    "answer": "International students need: 1) Valid passport, 2) Academic transcripts, 3) Student visa, 4) Medical insurance. Contact the international students office for assistance with accommodation and orientation.",
    "category": "admissions",
    "tags": ["international", "foreign", "visa"],
    "priority": 2
  }
];

// Check for duplicates and add new entries
let addedCount = 0;
let skippedCount = 0;

universityKnowledge.forEach(newItem => {
  const exists = existingData.some(existingItem => 
    existingItem.keyword.toLowerCase() === newItem.keyword.toLowerCase()
  );
  
  if (!exists) {
    existingData.push(newItem);
    addedCount++;
    console.log(`✅ Added: "${newItem.keyword}"`);
  } else {
    skippedCount++;
    console.log(`⏭️  Skipped (duplicate): "${newItem.keyword}"`);
  }
});

// Save updated data
fs.writeFileSync(knowledgePath, JSON.stringify(existingData, null, 2), 'utf8');

console.log(`\n📊 Summary:`);
console.log(`Total entries now: ${existingData.length}`);
console.log(`New entries added: ${addedCount}`);
console.log(`Duplicates skipped: ${skippedCount}`);
console.log(`\n✅ University knowledge base updated!`);