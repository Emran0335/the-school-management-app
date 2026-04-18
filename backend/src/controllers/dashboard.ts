import { type Request, type Response } from "express";
import User from "../models/user.ts";
import Class from "../models/class.ts"
import Exam from "../models/exam.ts"
import Submission from "../models/submission.ts"
import ActivityLog from "../models/activitieslog.ts"
import Timetable from "../models/timetable.ts"


// Helper to get day name(e.g. "Monday")
const getTodayName = ()=> {
    new Date().toLocaleDateString("en-US", {weekday: "long"});
}


// @desc    Get Dashboard Statistics (Role Based)
// @route   GET /api/dashboard/stats
