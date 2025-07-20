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
    phone: { type: String, required: true },
    address: String,
  },
  plaintiff: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  caseType: {
    type: String,
    enum: ["civil", "criminal", "family", "traffic", "smallClaims", "other"],
  },
  court: {
    type: String,
    enum: ["district", "high", "supreme", "family", "traffic"],
    default: null, // Court can be assigned later by admin
  },
  reportDate: {
    type: Date,
  },
  evidence: {
    type: String,
  },
  // Phase 1 - Essential Fields
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium",
  },
  urgencyReason: {
    type: String,
  },
  representation: {
    hasLawyer: { type: Boolean, default: false },
    lawyerName: String,
    lawyerBarNumber: String,
    lawyerContact: {
      email: String,
      phone: String,
      address: String,
    },
    selfRepresented: { type: Boolean, default: true },
  },
  reliefSought: {
    monetaryDamages: { type: Boolean, default: false },
    injunctiveRelief: { type: Boolean, default: false },
    declaratoryJudgment: { type: Boolean, default: false },
    specificPerformance: { type: Boolean, default: false },
    other: String,
    detailedRequest: String,
  },
  compliance: {
    verificationStatement: { type: Boolean, required: true },
    perjuryAcknowledgment: { type: Boolean, required: true },
    courtRulesAcknowledgment: { type: Boolean, required: true },
    signatureDate: { type: Date, default: Date.now },
    electronicSignature: String,
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Closed"],
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
  courtRef: {
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
