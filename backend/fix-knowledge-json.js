// backend/fix-knowledge-json.js
import fs from "fs";
import path from "path";

const knowledgePath = path.join('data', 'knowledge.json');

console.log("🔧 Fixing knowledge.json syntax...");
console.log(`File location: ${path.resolve(knowledgePath)}`);

try {
    // Read the file
    const content = fs.readFileSync(knowledgePath, 'utf8');
    console.log(`📄 File size: ${content.length} characters`);
    
    // Try to parse it to find the error
    try {
        JSON.parse(content);
        console.log("✅ JSON is already valid!");
    } catch (parseError) {
        console.log(`❌ JSON Parse Error: ${parseError.message}`);
        console.log(`Error at position: ${parseError.message.match(/position (\d+)/)?.[1] || 'unknown'}`);
        
        // Show context around the error
        const errorPos = parseInt(parseError.message.match(/position (\d+)/)?.[1]) || 0;
        const start = Math.max(0, errorPos - 100);
        const end = Math.min(content.length, errorPos + 100);
        console.log("\n🔍 Context around error:");
        console.log(content.substring(start, end));
        
        // Try to fix common JSON issues
        let fixedContent = content;
        
        // Fix 1: Remove trailing commas
        fixedContent = fixedContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        
        // Fix 2: Ensure all strings are properly quoted
        fixedContent = fixedContent.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
        
        // Fix 3: Remove extra brackets
        fixedContent = fixedContent.replace(/,\s*$/g, '');
        
        try {
            JSON.parse(fixedContent);
            console.log("\n✅ Fixed JSON syntax!");
            
            // Backup original
            const backupPath = knowledgePath + '.backup';
            fs.writeFileSync(backupPath, content, 'utf8');
            console.log(`📦 Original backed up to: ${backupPath}`);
            
            // Save fixed version
            fs.writeFileSync(knowledgePath, fixedContent, 'utf8');
            console.log(`💾 Fixed version saved to: ${knowledgePath}`);
            
        } catch (fixError) {
            console.log(`❌ Still invalid after fixes: ${fixError.message}`);
            
            // Create a clean minimal version
            const cleanData = [
                {
                    "keyword": "admission requirements",
                    "answer": "To be admitted to Bugema University, applicants must present their academic certificates and meet the minimum entry requirements as per the program applied for.",
                    "category": "admissions",
                    "tags": ["admissions", "requirements", "application"],
                    "priority": 1
                },
                {
                    "keyword": "tuition fees",
                    "answer": "Tuition fees at Bugema University vary depending on the program. Please visit the finance office or official website for the updated fee structure.",
                    "category": "fees",
                    "tags": ["fees", "tuition", "payments"],
                    "priority": 1
                },
                {
                    "keyword": "courses offered",
                    "answer": "Bugema University offers programs in Business, Computing, Education, Theology, Health Sciences, and Agriculture.",
                    "category": "academic",
                    "tags": ["courses", "programs", "academics"],
                    "priority": 2
                }
            ];
            
            // Backup original
            const backupPath = knowledgePath + '.backup';
            fs.writeFileSync(backupPath, content, 'utf8');
            
            // Save clean version
            fs.writeFileSync(knowledgePath, JSON.stringify(cleanData, null, 2), 'utf8');
            console.log(`\n💾 Created clean knowledge.json with ${cleanData.length} entries`);
        }
    }
    
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    // Create a basic knowledge.json if it doesn't exist
    if (!fs.existsSync(knowledgePath)) {
        console.log("Creating new knowledge.json...");
        const basicData = [
            {
                "keyword": "admission requirements",
                "answer": "To be admitted to Bugema University, applicants must present their academic certificates.",
                "category": "admissions",
                "tags": ["admissions"],
                "priority": 1
            }
        ];
        
        // Ensure directory exists
        const dirPath = path.dirname(knowledgePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        fs.writeFileSync(knowledgePath, JSON.stringify(basicData, null, 2), 'utf8');
        console.log(`✅ Created new knowledge.json at: ${knowledgePath}`);
    }
}

console.log("\n✅ Fix complete!");