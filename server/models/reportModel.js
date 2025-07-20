import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "System Performance",
      "Case Management",
      "User Activity",
      "Security Audit",
      "Financial Summary",
      "Operational Issues",
    ],
  },
  priority: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High", "Critical"],
  },
  department: {
    type: String,
    required: true,
    enum: ["Administration", "IT Support", "Legal Affairs", "Operations"],
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: Object,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
