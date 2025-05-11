import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  // case: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Case",
  //   required: true,
  // },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    // required: true,
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
