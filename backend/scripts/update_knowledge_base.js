
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgePath = path.join(__dirname, '../data/knowledge.json');

// Read existing knowledge
const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));

const newEntries = [
    // ANTHEMS
    {
        "keyword": "Bugema University Anthem Lyrics",
        "answer": "BUGEMA UNIVERSITY ANTHEM:\nOnward to progress, Bugema\nEver serving, ever shining\nCountless youths have left your portals\nReady to share the wonderful light;\nOur prayers will rise for you\nWherever we may go\nOur good work will show\nThat we’re ever true to you.\n\nOnward, Bugema!\nO’er the valleys and the hills\nShine on, Bugema!\nO’er the plains and cities too;\nLead on, press on, Bugema!\nOur praises will ring true.\n\nKeep the standards high, Bugema\nEver waving, ever rising\nFor on you depends the future\nOf many a youth both far and near;\nSo together we sing\nAnd together we serve\nTill the Lord’s coming\nBugema, you shall stand.",
        "category": "history",
        "tags": ["anthem", "song", "lyrics", "identity"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "Uganda National Anthem Lyrics",
        "answer": "UGANDA NATIONAL ANTHEM:\nOh Uganda!\nMay God uphold Thee,\nWe lay our future in thy hand,\nUnited, free,\nFor liberty,\nTogether we’ll always stand.\n\nOh Uganda!\nThe land of Freedom,\nOur love and labor we give,\nAnd with neighbours’ all,\nAt our Country’s call,\nIn peace and friendship, we’ll live.\n\nOh Uganda!\nThe land that Feeds us,\nBy sun and fertile soil grown,\nFor our own dear land,\nWe’ll always stand,\nThe Pearl of Africa’s Crown.",
        "category": "general",
        "tags": ["national anthem", "uganda", "song", "lyrics"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "East African Community Anthem",
        "answer": "EAST AFRICAN COMMUNITY ANTHEM:\nChorus:\nJumuiya Yetu sote tuilinde\nTuwajibike tuimarike\nUmoja wetu ni nguzo yetu\nIdumu Jumuiya yetu.\n\n1. Ee Mungu twakuomba ulinde\nJumuiya Africa Mashariki\nTuwezeshe kuishi kwa amani\nTutimize na malengo yetu\n\n2. Uzalendo pia mshikamano\nViwe msingi wa Umoja wetu\nNatulinde Uhuru na Amani\nMila zetu na desturi zetu.\n\n3. Viwandani na hata mashambani\nTufanye kazi sote kwa makini\nTujitoe kwa hali na mali\nTuijenge Jumuiya bora.",
        "category": "general",
        "tags": ["eac", "anthem", "community", "lyrics", "swahili"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },

    // GENERAL INFORMATION
    {
        "keyword": "Contact Bugema University",
        "answer": "Contact Information:\nAddress: 32km North of Kampala, Gayaza-Zirobwe Rd, Near Busiika Town Council, Luweero, UGANDA\nPostal: P.O. Box 6529, Kampala, UGANDA\nTel: (256) 312 351400\nMob/WhatsApp: +256 773 408 090\nEmail: registrar@bugemauniv.ac.ug\nWebsite: www.bugemauniv.ac.ug",
        "category": "contact",
        "tags": ["address", "phone", "email", "location", "contact"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "Bugema University Location",
        "answer": "Bugema University is located 32 kilometers north of Kampala on Gayaza-Zirobwe Road. Public Taxis cost approx. Ushs 5,000 from Old Taxi Park, Kampala. Special hire cars approx. UShs 70,000.",
        "category": "contact",
        "tags": ["location", "directions", "transport", "taxi"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "History of Bugema University",
        "answer": "Brief History:\n1927: First Adventist educational institution in Nchwanga.\n1948: Moved to Bugema (640 acres).\n1950: Secondary education started.\n1970: Junior college for pastors.\n1974: Upgrade to 4-year seminary (BTh).\n1994: Licensed as university.\n2009: Granted Charter by President Museveni.\n2010: Launched Graduate School.\nCurrently offers Undergraduate, Graduate, and PhD programs.",
        "category": "history",
        "tags": ["history", "founded", "charter", "origin"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "Bugema University Philosophy",
        "answer": "Philosophy: True education fosters the restoration of the lost image of God in human beings through the harmonious development of the physical, mental, social, and spiritual dimensions (Head, Heart, and Hand - 3H program).",
        "category": "about",
        "tags": ["philosophy", "3h", "mission", "values"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "Bugema University Vision Mission Motto",
        "answer": "Vision: A Christian University of choice for Excellence in Education and Skilling.\nMotto: Excellence in Service.\nMission: To offer an excellent and distinctive holistic Christian education designed to prepare students for productive lives of useful service to God and Society with integrity, honesty, and loyalty.",
        "category": "about",
        "tags": ["vision", "mission", "motto", "values"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },

    // SPIRITUAL LIFE
    {
        "keyword": "Spiritual Life and Worship",
        "answer": "Spiritual Life: Central to Bugema. Students expected to attend weekly Convocations (Tuesdays 10:00-11:00am) and other worship services.\nSabbath Observance: Observed from sunset Friday to sunset Saturday. A day of rest and worship. All students expected to respect the sacredness of the day.\nActivities: Prayer bands, witnessing, Adventist Youth Society.",
        "category": "spiritual",
        "tags": ["worship", "sabbath", "religion", "convocation"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },

    // STUDENT LIFE
    {
        "keyword": "Student Food Services",
        "answer": "Food Services: Cafeteria provides balanced vegetarian diet (included in boarding fees). No cooking allowed in rooms. Snack center available.",
        "category": "student_life",
        "tags": ["food", "cafeteria", "diet", "meals"],
        "priority": 2,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "Student Housing Accommodation",
        "answer": "Housing: Female students encouraged to live in on-campus residence halls (beds provided, bring mattress/bedding). Male students can live in approved private hostels near campus. Married housing not available. Room/board charged for vacation stay.",
        "category": "student_life",
        "tags": ["housing", "hostel", "accommodation", "residence"],
        "priority": 2,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "Student Code of Conduct",
        "answer": "Code of Conduct: Upholds Christian principles. Prohibited: Illegal drugs, alcohol, tobacco, gambling, vulgar language, violence, immorality, public sexual intimacy, theft, unauthorized meetings. Dress code applies. Violation leads to disciplinary action.",
        "category": "student_life",
        "tags": ["conduct", "rules", "behavior", "discipline"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },

    // LIBRARY
    {
        "keyword": "E. W. Petersen Memorial Library",
        "answer": "Library: Named after pioneer E. W. Petersen. Provides books, e-journals, internet access. \nOpening Hours:\nSun-Thu: 7:30am-6:00pm, 7:30pm-10:00pm\nFri: 7:30am-12:00noon\nSat: 7:30pm-10:00pm\nServices: Lending, Literature search, Photocopying, Binding.",
        "category": "academic",
        "tags": ["library", "hours", "services", "books"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },

    // ADMISSIONS
    {
        "keyword": "HEAC Higher Education Access Certificate Details",
        "answer": "Higher Education Access Certificate (HEAC): For those needing to upgrade to degree/diploma eligibility.\nDuration: 1 year.\nTracks:\n1. HEAC (Humanities): For Business, Arts, Theology. (Courses: English, Bible, Computing, Economics, etc.)\n2. HEAC (Physical Sciences): For Computing, Tech. (Courses: Math, Physics, Computing.)\n3. HEAC (Biological Studies): For Nursing, Agric, Health. (Courses: Biology, Chemistry, Env Studies.)\nPass required to upgrade.",
        "category": "admissions",
        "tags": ["heac", "certificate", "access program", "remedial"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },

    // ACADEMIC POLICIES
    {
        "keyword": "Academic Bulletin Validity",
        "answer": "This Bulletin (2024-2029) is the 'Academic Manual'. Valid for 5 years. Last graduation under this bulletin: November 2028. Students should keep it for reference.",
        "category": "academic",
        "tags": ["bulletin", "validity", "manual"],
        "priority": 3,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "Grading System Legend",
        "answer": "Grading System:\nA (80-100%) = 5.00 (Excellent)\nB+ (75-79.99%) = 4.50\nB (70-74.99%) = 4.00 (Above Average)\nC+ (65-69.99%) = 3.50\nC (60-64.99%) = 3.00 (Average)\nD+ (55-59.99%) = 2.50\nD (50-54.99%) = 2.00 (Below Average)\nF (0-49.99%) = 0.00 (Failure)",
        "category": "academic",
        "tags": ["grading", "gpa", "marks", "scores"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },
    {
        "keyword": "Degree Classification Honors",
        "answer": "Degree Classification:\nFirst Class: GPA 4.40 - 5.00 (Summa cum laude)\nSecond Upper: GPA 3.60 - 4.39 (Magna cum laude)\nSecond Lower: GPA 2.80 - 3.59 (Cum laude)\nPass: GPA 2.00 - 2.79\n\nDiploma/Certificate:\nDistinction: 4.40 - 5.00\nCredit: 2.80 - 4.39\nPass: 2.00 - 2.79",
        "category": "academic",
        "tags": ["honors", "classification", "degree class", "gpa"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    },

    // FINANCIAL
    {
        "keyword": "Bank Accounts for Fees",
        "answer": "Bugema University Bank Accounts:\nEquity Bank (KES): 1004203110057\nEquity Bank (UGX): 1017200261563\nCentenary Bank (UGX): 3100018764\nUBA (UGX): 1206000016\nStandard Chartered (Forex): 8702010609600\nUBA (Forex): 0113009891\n(Swift codes available for international)",
        "category": "fees",
        "tags": ["bank", "account", "payment", "fees"],
        "priority": 1,
        "source": "Bulletin 2024-2029"
    }
];

// Append new entries
const updatedKnowledge = [...knowledge, ...newEntries];

// Write back to file
fs.writeFileSync(knowledgePath, JSON.stringify(updatedKnowledge, null, 2));

console.log(`Successfully added ${newEntries.length} new items to knowledge.json`);
console.log(`Total items: ${updatedKnowledge.length}`);
