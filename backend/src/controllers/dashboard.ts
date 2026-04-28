import { type Request, type Response } from "express";
import User from "../models/user.ts";
import Class from "../models/class.ts";
import Exam from "../models/exam.ts";
import Submission from "../models/submission.ts";
import ActivityLog from "../models/activitieslog.ts";
import Timetable from "../models/timetable.ts";

// Helper to get day name(e.g. "Monday")
const getTodayName = () => {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
};

// @desc    Get Dashboard Statistics (Role Based)
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let stats = {};

    const activityQuery = user.role === "admin" ? {} : { user: user._id };

    res.json({ stats });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server Error" });
  }
};
