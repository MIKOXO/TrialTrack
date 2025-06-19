import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  status: {
    type: String,
    enum: ["New", "Reviewed", "Resolved"],
    default: "New",
  },
  adminNotes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
commentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
