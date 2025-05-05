import mongoose from "mongoose";

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["District", "High", "Supreme"],
    required: true,
  },
  judges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Court = mongoose.model("Court", courtSchema);

export default Court;
