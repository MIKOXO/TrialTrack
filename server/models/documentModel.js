import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["Evidence", "Report", "Form", "Other"],
  },
  fileUrl: String,
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
