import mongoose from "mongoose";

const hearingSchema = new mongoose.Schema({
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  notes: { type: String },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
    required: true,
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Hearing = mongoose.model("Hearing", hearingSchema);

export default Hearing;
