import { type Request, type Response } from "express";
import { logActivity } from "../utils/activitieslog.ts";
import Exam from "../models/exam.ts";
import Subject from "../models/subject.ts";
import Submission from "../models/submission.ts";
import { inngest } from "../inngest/index.ts";

// @desc    Trigger AI Exam Generation
// @route   POST /api/exams/generate
export const triggerExamGeneration = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      class: classId,
      duration,
      dueDate,
      topic,
      difficulty,
      count,
    } = req.body;

    const subjectDoc = await Subject.findById(subject);

    if (!subjectDoc) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const teacherId = (req as any).user._id;
    const draftExam = await Exam.create({
      title: title || `Auto-Generated: ${topic}`,
      subject,
      class: classId,
      teacher: teacherId,
      duration: duration || 60,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: false,
      questions: [],
    });

    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `User triggered exam generation: ${draftExam}`,
    });

    await inngest.send({
      name: "exam/generate",
      data: {
        examId: draftExam._id,
        topic,
        subjectName: subjectDoc.name,
        difficulty: difficulty || "Medium",
        count: count || 10,
      },
    });

    res.status(202).json({
      message: "Exam generation started.",
      examId: draftExam._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while exam generation", error });
  }
};

// @desc    Create/Publish Exam we won't use it
// @route   POST /api/exams
export const createExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      teacher: (req as any).user._id,
    });

    const userId = (req as any).user._id;

    await logActivity({
      userId,
      action: "User created a new exam",
    });

    res.status(201).json(exam);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while creating new exam", error });
  }
};

// @desc    Get Exams (Student sees available, Teacher sees created)
// @route   GET /api/exams
export const getExams = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let query = {};

    if (user.role === "student") {
      query = { class: user.studentClass, isActive: true };
    } else if (user.role === "teacher") {
      query = { teacher: user._id };
    }

    const exams = await Exam.find(query)
      .populate("subject", "name")
      .populate("class", "name section")
      .select("-questions.correctAnswer");

    res.status(200).json(exams);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while getting exams", error });
  }
};

// @desc    Get exam by id
// @route   POST /api/exams/:id
export const getExamById = async (req: Request, res: Response) => {
  try {
    const examId = req.params.id;
    const user = (req as any).user;

    let query = Exam.findById(examId)
      .populate("subject", "name code")
      .populate("class", "name section")
      .populate("teacher", "name email");

    if (user.role === "teacher" || user.role === "admin") {
      query = query.select("+questions.correctAnswer");
    }

    const exam = await query;
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (user.role === "student") {
      const examClassId = exam.class._id
        ? exam.class._id.toString()
        : exam.class.toString();
      const userClassId = user.studentClass ? user.studentClass.toString() : "";

      if (examClassId !== userClassId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to view this exam" });
      }
    }

    res.json(exam);
  } catch (error: any) {
    console.error(error);

    // Handle Invalid ID format (CastError)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    // Handle other errors
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Toggle Exam Status (Active/Inactive)
// @route   PATCH /api/exams/:id/status
// @access  Private (Teacher/Admin)
export const toggleExamStatus = async (req: Request, res: Response) => {
  try {
    const examId = req.params.id;
    const user = (req as any).user;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res
        .status(404)
        .json({ message: "Exam not found while toggling exam status" });
    }

    if (
      user.role !== "admin" &&
      exam.teacher.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this exam" });
    }

    exam.isActive = !exam.isActive;
    await exam.save();
    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: "User toggled exam status",
    });

    res.status(200).json({
      message: `Exam is now ${exam.isActive ? "Active" : "Inactive"}`,
      _id: exam._id,
      isActive: exam.isActive,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while toggling exam status", error });
  }
};

// @desc    Submit & Auto-Grade Exam let these happen inside inngest
// @route   POST /api/exams/:id/submit
export const submitExam = async (req: Request, res: Response) => {
  try {
    const { answers } = req.body;
    const studentId = (req as any).user._id;
    const examId = req.params.id;

    await inngest.send({
      name: "exam/submit",
      data: {
        examId,
        studentId,
        answers,
      },
    });

    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: "User submitted an exam",
    });

    res.status(201).json({
      message: "Exam submission received and is being processed.",
    });
  } catch (error) {
    res.status(500).json({ message: "error while submitting exam", error });
  }
};

// @desc    Get Exam Results (For Student)
// @route   GET /api/exams/:id/result
export const getExamResult = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user._id;
    const examId = req.params.id;

    const submission = await Submission.findOne({
      exam: examId,
      student: studentId,
    }).populate({
      path: "exam",
      select: "title questions._id questions.correctAnswer",
    });

    if (!submission) {
      return res.status(404).json({ message: "No submission found" });
    }

    res.status(200).json(submission);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while getting exam result", error });
  }
};
