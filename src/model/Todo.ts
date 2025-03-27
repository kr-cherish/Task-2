import mongoose from "mongoose";

const { Schema } = mongoose;

const todoSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserData", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Todo || mongoose.model("Todo", todoSchema);
