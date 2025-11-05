// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin", "editor", "viewer"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
