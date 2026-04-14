import { type Request, type Response } from "express";
import ActivityLog from "../models/activitieslog.ts";

// @desc    Get System Activity Logs(including pagination)
// @route   GET /api/activity
// @access  Private/Admin
export const getAllActivities = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const count = await ActivityLog.countDocuments();

    const logs = await ActivityLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      page,
      pages: Math.ceil(count / limit),
      total: count,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error while activity logging", error });
  }
};
