import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel.js";

// @desc    Submit a new comment/feedback
// @route   POST /api/comments/submit
// @access  Private (Client only)
const submitComment = asyncHandler(async (req, res) => {
  const { subject, message, rating } = req.body;

  // Validate required fields
  if (!subject || !message) {
    res.status(400);
    throw new Error("Subject and message are required");
  }

  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  try {
    const comment = new Comment({
      user: req.user._id,
      subject: subject.trim(),
      message: message.trim(),
      rating: rating || null,
    });

    const savedComment = await comment.save();
    await savedComment.populate("user", "username email firstName lastName");

    res.status(201).json({
      success: true,
      message: "Comment submitted successfully",
      data: savedComment,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to submit comment");
  }
});

// @desc    Get all comments (Admin only)
// @route   GET /api/comments
// @access  Private (Admin only)
const getComments = asyncHandler(async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (status && ["New", "Reviewed", "Resolved"].includes(status)) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get comments with user details
    const comments = await Comment.find(filter)
      .populate("user", "username email firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalComments = await Comment.countDocuments(filter);

    res.json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        hasNext: skip + comments.length < totalComments,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch comments");
  }
});

// @desc    Update comment status
// @route   PUT /api/comments/status/:id
// @access  Private (Admin only)
const updateCommentStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  // Validate status
  if (!status || !["New", "Reviewed", "Resolved"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be New, Reviewed, or Resolved");
  }

  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }

    comment.status = status;
    if (adminNotes) {
      comment.adminNotes = adminNotes.trim();
    }

    const updatedComment = await comment.save();
    await updatedComment.populate("user", "username email firstName lastName");

    res.json({
      success: true,
      message: "Comment status updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    if (error.message === "Comment not found") {
      throw error;
    }
    res.status(500);
    throw new Error("Failed to update comment status");
  }
});

// @desc    Get comment statistics (Admin only)
// @route   GET /api/comments/stats
// @access  Private (Admin only)
const getCommentStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Comment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const totalComments = await Comment.countDocuments();
    const avgRating = await Comment.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    const formattedStats = {
      total: totalComments,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0,
    };

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch comment statistics");
  }
});

export { submitComment, getComments, updateCommentStatus, getCommentStats };
