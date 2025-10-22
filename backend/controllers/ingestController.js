// backend/controllers/ingestController.js
import Knowledge from "../models/Knowledge.js"; // your schema for chatbot knowledge

export const getKnowledge = async (req, res) => {
  try {
    const data = await Knowledge.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching knowledge" });
  }
};

export const addKnowledge = async (req, res) => {
  try {
    const { keyword, answer } = req.body;
    const entry = new Knowledge({ keyword, answer });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: "Error adding knowledge" });
  }
};

export const deleteKnowledge = async (req, res) => {
  try {
    await Knowledge.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting knowledge" });
  }
};
