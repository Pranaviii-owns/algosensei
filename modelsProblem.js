import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: String,
  solution: String,
  topic: String,
  difficulty: String,
  timeComplexity: String,
  spaceComplexity: String,
}, { timestamps: true });

export default mongoose.model("Problem", problemSchema);