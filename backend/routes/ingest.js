// backend/routes/ingest.js - UPDATED WITH JSON SUPPORT
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Knowledge from "../models/Knowledge.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_FILE_PATH = path.join(__dirname, '../data/knowledge.json');

// Ensure JSON file exists
const ensureJsonFile = () => {
  if (!fs.existsSync(JSON_FILE_PATH)) {
    // Create directory if it doesn't exist
    const dirPath = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Create default JSON data
    const defaultData = [
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
    
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log('Created default knowledge JSON file');
  }
};

/**
 * GET /api/ingest
 * Get all knowledge (Admins only) - Now includes JSON data
 */
router.get("/", verifyAdmin, async (req, res) => {
  try {
    ensureJsonFile();
    
    // Get from database
    const dbKnowledge = await Knowledge.find().sort({ updatedAt: -1 });
    
    // Get from JSON file
    const jsonData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const jsonKnowledge = JSON.parse(jsonData).map((item, index) => ({
      ...item,
      _id: `json_${index + 1}`,
      source: 'JSON File',
      question: item.keyword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "knowledge",
      isActive: true,
      // Convert keyword field to question for consistency
      ...(item.keyword && !item.question ? { question: item.keyword } : {})
    }));
    
    // Combine both sources
    const allKnowledge = [
      ...dbKnowledge.map(item => ({ ...item.toObject(), source: item.source || 'Database' })),
      ...jsonKnowledge
    ];
    
    res.json({
      success: true,
      data: allKnowledge,
      stats: {
        database: dbKnowledge.length,
        json: jsonKnowledge.length,
        total: allKnowledge.length
      },
      jsonFilePath: JSON_FILE_PATH
    });
  } catch (error) {
    console.error("Ingest GET error:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Could not fetch knowledge",
      error: error.message 
    });
  }
});

/**
 * POST /api/ingest
 * Add or update knowledge (Admins only)
 */
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { question, answer, tags = [], category = "academic", priority = 3 } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ 
        success: false, 
        message: "Question and answer are required" 
      });
    }

    // Check for existing knowledge
    const existing = await Knowledge.findOne({
      $or: [
        { question: question },
        { answer: answer }
      ]
    });

    if (existing) {
      existing.question = question;
      existing.answer = answer;
      existing.tags = tags;
      existing.category = category;
      existing.priority = priority;
      existing.source = "Admin Panel";
      await existing.save();
      
      return res.json({ 
        success: true, 
        message: "✅ Knowledge updated successfully",
        data: existing 
      });
    }

    const newKnowledge = new Knowledge({
      question: question,
      answer: answer,
      tags: tags,
      category: category,
      priority: priority,
      source: "Admin Panel"
    });
    
    await newKnowledge.save();
    
    res.json({ 
      success: true, 
      message: "✅ Knowledge added successfully",
      data: newKnowledge 
    });
  } catch (error) {
    console.error("Ingest POST error:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Failed to save knowledge",
      error: error.message 
    });
  }
});

/**
 * PUT /api/ingest/:id
 * Update knowledge by ID
 */
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { question, answer, tags, category, priority } = req.body;
    
    // Check if it's a JSON entry (starts with "json_")
    if (req.params.id.startsWith('json_')) {
      return res.status(400).json({ 
        success: false, 
        message: "JSON file entries cannot be modified directly. Use JSON import/export." 
      });
    }
    
    const updated = await Knowledge.findByIdAndUpdate(
      req.params.id,
      { 
        question, 
        answer, 
        tags, 
        category,
        priority,
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: "Knowledge not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "✅ Knowledge updated successfully",
      data: updated 
    });
  } catch (error) {
    console.error("Ingest PUT error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid ID format" 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: "Failed to update knowledge",
      error: error.message 
    });
  }
});

/**
 * DELETE /api/ingest/:id
 * Delete knowledge by ID (Admins only)
 */
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    // Check if it's a JSON entry
    if (req.params.id.startsWith('json_')) {
      return res.status(400).json({ 
        success: false, 
        message: "JSON file entries cannot be deleted from database. Edit the JSON file directly." 
      });
    }
    
    const deleted = await Knowledge.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Knowledge not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "✅ Knowledge deleted successfully" 
    });
  } catch (error) {
    console.error("Ingest DELETE error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid ID format" 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete knowledge",
      error: error.message 
    });
  }
});

/**
 * GET /api/ingest/json
 * View JSON file contents (Admin only)
 */
router.get("/json", verifyAdmin, async (req, res) => {
  try {
    ensureJsonFile();
    
    const jsonData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const knowledge = JSON.parse(jsonData);
    
    res.json({
      success: true,
      data: knowledge,
      count: knowledge.length,
      filePath: JSON_FILE_PATH
    });
  } catch (error) {
    console.error("JSON read error:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Failed to read JSON file",
      error: error.message 
    });
  }
});

/**
 * POST /api/ingest/json/import
 * Import from JSON file to database (Admin only)
 */
router.post("/json/import", verifyAdmin, async (req, res) => {
  try {
    ensureJsonFile();
    
    const jsonData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const jsonEntries = JSON.parse(jsonData);
    
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];
    
    for (const item of jsonEntries) {
      try {
        const question = item.keyword || item.question;
        const answer = item.answer || item.content;
        
        if (!question || !answer) {
          errors.push(`Skipped: Missing question or answer in entry`);
          skipped++;
          continue;
        }
        
        const existing = await Knowledge.findOne({ 
          $or: [
            { question: question },
            { answer: answer }
          ]
        });
        
        if (existing) {
          existing.question = question;
          existing.answer = answer;
          existing.tags = item.tags || [];
          existing.category = item.category || "academic";
          existing.priority = item.priority || 3;
          existing.source = "JSON Import";
          await existing.save();
          updated++;
        } else {
          const newKnowledge = new Knowledge({
            question: question,
            answer: answer,
            tags: item.tags || [],
            category: item.category || "academic",
            priority: item.priority || 3,
            source: "JSON Import"
          });
          await newKnowledge.save();
          imported++;
        }
      } catch (err) {
        errors.push(`Failed to import: ${item.keyword || 'Unknown'} - ${err.message}`);
      }
    }
    
    res.json({
      success: true,
      message: `✅ Import completed: ${imported} new, ${updated} updated, ${skipped} skipped`,
      imported,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("JSON import error:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Failed to import from JSON",
      error: error.message 
    });
  }
});

/**
 * POST /api/ingest/json/update
 * Update JSON file with current database (Admin only)
 */
router.post("/json/update", verifyAdmin, async (req, res) => {
  try {
    const knowledge = await Knowledge.find({ source: { $ne: "JSON File" } })
      .select('question answer tags category priority')
      .sort('question');
    
    // Format for JSON export
    const jsonData = knowledge.map(item => ({
      keyword: item.question,
      answer: item.answer,
      category: item.category || "academic",
      tags: item.tags || [],
      priority: item.priority || 3,
      source: "Database Export",
      exportedAt: new Date().toISOString()
    }));
    
    // Write to file
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json({
      success: true,
      message: `✅ JSON file updated with ${jsonData.length} entries`,
      count: jsonData.length,
      filePath: JSON_FILE_PATH
    });
  } catch (error) {
    console.error("JSON update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Failed to update JSON file",
      error: error.message 
    });
  }
});

/**
 * GET /api/ingest/json/export
 * Export database to downloadable JSON file (Admin only)
 */
router.get("/json/export", verifyAdmin, async (req, res) => {
  try {
    const knowledge = await Knowledge.find()
      .select('question answer tags category priority source')
      .sort('question');
    
    // Format for JSON
    const jsonData = knowledge.map(item => ({
      keyword: item.question,
      answer: item.answer,
      category: item.category || "academic",
      tags: item.tags || [],
      priority: item.priority || 3,
      source: item.source || "Database",
      exportedAt: new Date().toISOString()
    }));
    
    res.json({
      success: true,
      data: jsonData,
      count: jsonData.length
    });
  } catch (error) {
    console.error("JSON export error:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Failed to export to JSON",
      error: error.message 
    });
  }
});

/**
 * GET /api/ingest/stats
 * Get knowledge base statistics (Admin only)
 */
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    ensureJsonFile();
    
    // Database stats
    const totalEntries = await Knowledge.countDocuments();
    const byCategory = await Knowledge.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const bySource = await Knowledge.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // JSON file stats
    const jsonData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const jsonEntries = JSON.parse(jsonData);
    
    res.json({
      success: true,
      data: {
        database: {
          total: totalEntries,
          byCategory,
          bySource
        },
        json: {
          total: jsonEntries.length,
          filePath: JSON_FILE_PATH,
          lastModified: fs.statSync(JSON_FILE_PATH).mtime
        }
      }
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Failed to get statistics",
      error: error.message 
    });
  }
});

export default router;