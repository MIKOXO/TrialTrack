import asyncHandler from "express-async-handler";
import Case from "../models/caseModel.js";
import User from "../models/userModel.js";
import Hearing from "../models/hearingModel.js";

// @desc    Get dashboard analytics data
// @route   GET api/analytics/dashboard
// @access  Private (Admin only)
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Only admins can access analytics" });
  }

  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get all cases for the current year
    const cases = await Case.find({
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    });

    // Calculate monthly case statistics
    const monthlyStats = Array(12)
      .fill(0)
      .map((_, index) => {
        const monthStart = new Date(currentYear, index, 1);
        const monthEnd = new Date(currentYear, index + 1, 0, 23, 59, 59);

        const monthCases = cases.filter((caseItem) => {
          const caseDate = new Date(caseItem.createdAt);
          return caseDate >= monthStart && caseDate <= monthEnd;
        });

        const activeCases = monthCases.filter(
          (c) =>
            c.status === "Open" ||
            c.status === "In-progress" ||
            c.status === "In Progress"
        ).length;
        const pendingCases = monthCases.filter(
          (c) => c.status === "Open"
        ).length;

        return {
          month: index,
          totalCases: monthCases.length,
          activeCases,
          pendingCases,
        };
      });

    // Return actual data only - no mock data

    // Calculate case status distribution
    const allCases = await Case.find();
    let statusDistribution = {
      Open: allCases.filter((c) => c.status === "Open").length,
      "In Progress": allCases.filter(
        (c) => c.status === "In-progress" || c.status === "In Progress"
      ).length,
      Closed: allCases.filter((c) => c.status === "Closed").length,
    };

    // Return actual status distribution only - no mock data

    // Calculate urgent cases (cases filed in last 7 days that are still open)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const urgentCases = allCases.filter(
      (c) => c.status === "Open" && new Date(c.createdAt) > sevenDaysAgo
    ).length;

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Get hearing statistics
    const upcomingHearings = await Hearing.countDocuments({
      date: { $gte: new Date() },
    });

    res.json({
      monthlyStats,
      statusDistribution,
      urgentCases,
      totalUsers,
      usersByRole,
      upcomingHearings,
      totalCases: allCases.length,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get case trends over time
// @route   GET api/analytics/case-trends
// @access  Private (Admin only)
const getCaseTrends = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Only admins can access analytics" });
  }

  try {
    const { year = new Date().getFullYear(), months = 12 } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const cases = await Case.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const monthlyTrends = Array(12)
      .fill(0)
      .map((_, index) => {
        const monthStart = new Date(year, index, 1);
        const monthEnd = new Date(year, index + 1, 0, 23, 59, 59);

        const monthCases = cases.filter((caseItem) => {
          const caseDate = new Date(caseItem.createdAt);
          return caseDate >= monthStart && caseDate <= monthEnd;
        });

        return {
          month: index,
          monthName: new Date(year, index, 1).toLocaleString("default", {
            month: "short",
          }),
          newCases: monthCases.length,
          openCases: monthCases.filter((c) => c.status === "Open").length,
          inProgressCases: monthCases.filter(
            (c) => c.status === "In-progress" || c.status === "In Progress"
          ).length,
          closedCases: monthCases.filter((c) => c.status === "Closed").length,
        };
      });

    res.json({
      year: parseInt(year),
      trends: monthlyTrends,
    });
  } catch (err) {
    console.error("Case trends error:", err);
    res.status(500).json({ error: err.message });
  }
});

export { getDashboardAnalytics, getCaseTrends };
