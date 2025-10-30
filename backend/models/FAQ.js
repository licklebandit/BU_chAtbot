import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    // Mongoose handles 'id' (_id) automatically
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('FAQ', faqSchema);