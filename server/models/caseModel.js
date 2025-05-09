import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  defendant: {
    name: { type: String, required: true },
    email: String,
  },
  status: {
    type: String,
    enum: ["Open", "In-progress", "Closed"],
    default: "Open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
  },
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
  ],
  hearings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hearing",
    },
  ],
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  ],
});

const Case = mongoose.model("Case", caseSchema);

export default Case;
