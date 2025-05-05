import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["Evidence", "Report", "Form", "Other"],
  },
  fileUrl: String,
  type: {
    type: String,
    enum: ["Evidence", "Report", "Form", "Other"],
  },
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
