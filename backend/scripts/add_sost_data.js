import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to knowledge.json (up one level from scripts, then into data)
const knowledgePath = path.join(__dirname, '../data/knowledge.json');

const newEntries = [
    // --- School of Science and Technology (SOST) ---
    {
        keyword: "School of Science and Technology SOST Details",
        answer: "The School of Science and Technology (SOST) at Bugema University is led by Dean Nagwovuma Margret. It includes the Department of Computing & Informatics and the Department of Life & Physical Sciences.",
        category: "academic",
        tags: ["SOST", "science", "technology", "dean", "nagwovuma margret"],
        priority: 80,
        source: "BU Bulletin 2024-29"
    },

    // --- Department of Computing & Informatics ---
    {
        keyword: "Department of Computing and Informatics Staff Vision",
        answer: "The Department of Computing & Informatics is headed by Mr. Muwanga Kosea Erasto. \n\n**Vision:** To offer quality Information Systems learning, Innovations and Research geared towards solving community Technological requirements.\n\n**Lecturers:** Kitumba David, Nantege Hellen, Mugerwa Joseph, Nandere Hudson, Golooba Ronald, Ssewankambo Erma, Onyango Laban, Walusimbi Albert, Balagadde Ssali Robert, Wogisha Dennis, Luwalo Enock, Lowu Francis.",
        category: "academic",
        tags: ["computing", "informatics", "staff", "lecturers", "vision", "muwanga kosea erasto"],
        priority: 75,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Bachelor of Science in Software Engineering Program",
        answer: "The Bachelor of Science in Software Engineering is a 132 Credit Unit program.\n\n**Structure:**\n- General Courses: 21 CU\n- Major Concentration: 51 CU\n- Cognate: 48 CU\n- Research Project: 06 CU\n- Industrial Attachment: 06 CU\n\n**Core Courses:** Software Engineering Ethics, Programming (C, VB.Net, Python, Java), Data Structures, Linux, UI/UX, Android, AI, Data Science, and more.",
        category: "academic",
        tags: ["software engineering", "teaching syllabus", "courses", "requirements"],
        priority: 70,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Bachelor of Science in Network Systems Administration Program",
        answer: "The Bachelor of Science in Network Systems Administration is a 130 Credit Unit program.\n\n**Structure:**\n- Major Concentration: 63 CU\n- Cognate: 34 CU\n- General Courses: 21 CU\n- Research & Project: 12 CU\n\n**Core Courses:** Internet Working, Network Engineering, Computer Architecture, Data Comm, Windows/Linux Server Admin, Cloud Computing, Cyber Security, etc.",
        category: "academic",
        tags: ["network systems", "administration", "teaching syllabus", "courses"],
        priority: 70,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Bachelor of Business Computing Program",
        answer: "The Bachelor of Business Computing is a 134 Credit Unit program.\n\n**Structure:**\n- Major Concentration: 54 CU\n- Cognate: 47 CU\n- General Courses: 21 CU\n- Projects/Training: 12 CU\n\n**Core Focus:** Database Systems, Web Design, Information Systems, E-commerce, Data Analytics, Business Intelligence, Accounting, and Business Law.",
        category: "academic",
        tags: ["business computing", "teaching syllabus", "courses"],
        priority: 70,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Bachelor of Library and Information Science Program",
        answer: "The Bachelor of Library and Information Science is a 133 Credit Unit program.\n\n**Structure:**\n- Major: 58 CU\n- Cognate: 39 CU\n- General: 21 CU\n- Research/Project/Internship: 15 CU\n\n**Core Topics:** Information Literacy, Resource Management, Knowledge Classification, Cataloguing, Library Operations, Records Management, Archives, and Marketing of Info Services.",
        category: "academic",
        tags: ["library science", "information science", "teaching syllabus", "courses"],
        priority: 70,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Bachelor of Information Technology BIT Program",
        answer: "The Bachelor of Information Technology (BIT) is a 121 Credit Unit program.\n\n**Structure:**\n- Major: 50 CU\n- Cognate: 39 CU\n- General: 17 CU\n- Research/Project/Internship: 15 CU\n\n**Core Topics:** Principles of Programming, Data Warehousing, IT Risk Mgmt, Mobile App Programming, Enterprise Architecture, Computer Forensics, System Administration.",
        category: "academic",
        tags: ["BIT", "information technology", "teaching syllabus", "courses"],
        priority: 70,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Diploma in Computer Forensics Program",
        answer: "The Diploma in Computer Forensics requires 88 Credit Units.\n\n**Core Courses:** Security Risk Assessment, Computer Forensics Principles, Cyber Security Concepts, Mobile Forensics, Digital Crime Investigation, Privacy Law, Penetration Testing, Ethical Hacking.",
        category: "academic",
        tags: ["diploma", "computer forensics", "security", "cyber"],
        priority: 65,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Diploma in Information Technology Program",
        answer: "The Diploma in Information Technology requires 88 Credit Units.\n\n**Core Courses:** Multimedia & Graphics, Relational Databases, Web Development, Windows OS, Network Principles, PC Repair, Systems Project.",
        category: "academic",
        tags: ["diploma", "IT", "information technology"],
        priority: 65,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Certificate in Information Technology UBTEB Program",
        answer: "The Certificate in Information Technology (UBTEB) is a 91 Credit Hour program.\n\n**Core Modules:** Fund. of IT, Microsoft Office, HTML/Web Programming, Computer Graphics, Networking, Visual Basic, Computer Maintenance and Real Life Projects.",
        category: "academic",
        tags: ["certificate", "IT", "UBTEB"],
        priority: 65,
        source: "BU Bulletin 2024-29"
    },

    // --- Department of Life & Physical Sciences ---
    {
        keyword: "Department of Life and Physical Sciences Staff Vision",
        answer: "The Department of Life & Physical Sciences is headed by Kasibe Isima Isaiah.\n\n**Vision:** To be a center for progressive innovation in Life and physical sciences.\n\n**Lecturers:** Baggaga Isaac, Atumuhaire Peter, Bageya Godfrey, Magoola Abel, Bbosa Kato John, Busiku Joseph, Dr. Opio Peter, Apel Anthony, Ismail Turyatemba, Kabiswa Winston, Kamya Willy, Kasirye Samuel, Ongwang Joel, Nsubuga Joseph, Ssegawa Faiso Mugerwa, Solomon Matovu, Yiga Vincert, Ahumuza Fortunate, Bwambale Brian.",
        category: "academic",
        tags: ["life sciences", "physical sciences", "staff", "lecturers", "kasibe isima isaiah"],
        priority: 75,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Bachelor of Science in Statistics Program",
        answer: "The Bachelor of Science in Statistics is a 159 Credit Unit program.\n\n**Structure:**\n- Major Concentration: 93 CU\n- Cognates: 32 CU\n- General: 19 CU\n- Project/Internship: 12 CU\n\n**Core Topics:** Statistical Packages (SPSS, Excel), Numerical Methods, Decision Sciences, Calculus, Experimental Designs, Econometrics, Multivariate Analysis, Time Series, Actuarial Modeling, Machine Learning.",
        category: "academic",
        tags: ["statistics", "math", "data analysis", "teaching syllabus"],
        priority: 70,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Bachelor of Science in Biochemistry Program",
        answer: "The Bachelor of Science in Biochemistry is a 147 Credit Unit program.\n\n**Structure:**\n- Major Concentration: 96 CU\n- Cognates: 20 CU\n- General: 19 CU\n- Project/Internship: 12 CU\n\n**Core Topics:** Enzymology, Cell Biology, Bioinformatics, Biomolecules, Toxicology, Medicinal Chemistry, Immunology, Molecular Biology, Cancer Biology, Virology, Bacteriology.",
        category: "academic",
        tags: ["biochemistry", "science", "biology", "chemistry", "teaching syllabus"],
        priority: 70,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Diploma in Science Laboratory Technology Program",
        answer: "The Diploma in Science Laboratory Technology requires 82 Credit Units. It has concentrations in Biological, Chemistry, and Physics.\n\n**Core Topics:** Lab Science & Tech, Lab Management, Electronics, Instrumental Analysis. \n\n**Concentrations:** \n- Biological: Bacteriology, Biotechnology, Enzymology.\n- Chemistry: Physical/Organic/Inorganic Chemistry.\n- Physics: Electricity, Optics, Thermodynamics.",
        category: "academic",
        tags: ["diploma", "laboratory technology", "science"],
        priority: 65,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "Diploma in Biomedical Engineering Technology DBET Program",
        answer: "The Diploma in Biomedical Engineering Technology (DBET) is a 99 Credit Unit program.\n\n**Core Topics:** Biomedical Eng & Lab Equipment, Engineering Drawing, Electronics, Anatomy & Physiology, Bio-Instrumentation, Medical Imaging Systems, Medical Device Standards.",
        category: "academic",
        tags: ["diploma", "biomedical engineering", "engineering", "technology"],
        priority: 65,
        source: "BU Bulletin 2024-29"
    },

    // --- Course Descriptions (Selected Samples / Grouped) ---
    {
        keyword: "BSTA Statistics Courses Description",
        answer: "**BSTA 1101 Statistical Packages I:** Intro to Excel, SPSS, EPI data.\n**BSTA 1103 Numerical Methods:** Approximating mathematical procedures, error analysis.\n**BSTA 1104 Decision Sciences:** Discrete optimization, decision trees, games.\n**BSTA 1208 Experimental Designs:** Analysis of designs (random, block, Latin squares) in research.\n**BSTA 3205 Intro to Machine Learning:** Classification, Bayes risk, logistic regression, clustering.",
        category: "course_description",
        tags: ["BSTA", "statistics", "course description"],
        priority: 60,
        source: "BU Bulletin 2024-29"
    },
    {
        keyword: "BIOC Biochemistry Courses Description",
        answer: "**BIOC 1101 Intro to Enzymology:** Immune system defense, antibodies, immunity.\n**BIOC 1102 Molecular Genetics:** Structure/function of DNA/RNA, genetic engineering.\n**BIOC 1103 Cell Biology:** Organelles, bio membranes, cell cycle, signaling.\n**BIOC 2202 Cancer Biology:** Molecular basis of cancer, oncogenes, tumor suppressors.\n**BIOC 2107 Medical Biochemistry:** Clinical chemistry, human specimen analysis, metabolic disorders.",
        category: "course_description",
        tags: ["BIOC", "biochemistry", "course description"],
        priority: 60,
        source: "BU Bulletin 2024-29"
    }
];

// Helper to check if entry exists
const entryExists = (kb, newEntry) => {
    return kb.some(item =>
        item.keyword.toLowerCase() === newEntry.keyword.toLowerCase()
    );
};

// Main function
const updateKnowledgeBase = () => {
    let kb = [];

    if (fs.existsSync(knowledgePath)) {
        try {
            kb = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
            console.log(`Loaded ${kb.length} existing entries.`);
        } catch (e) {
            console.error("Error reading knowledge.json:", e);
            return;
        }
    } else {
        console.log("knowledge.json not found, creating new.");
    }

    let addedCount = 0;
    newEntries.forEach(entry => {
        if (!entryExists(kb, entry)) {
            // Add timestamp
            entry.exportedAt = new Date().toISOString();
            kb.push(entry);
            addedCount++;
        } else {
            console.log(`Skipping duplicate: ${entry.keyword}`);
        }
    });

    if (addedCount > 0) {
        fs.writeFileSync(knowledgePath, JSON.stringify(kb, null, 2));
        console.log(`Successfully added ${addedCount} new entries.`);
        console.log(`Total entries: ${kb.length}`);
    } else {
        console.log("No new entries added.");
    }
};

updateKnowledgeBase();
