import { type Request, type Response } from "express";
import Class from "../models/class.ts";
import { logActivity } from "../utils/activitieslog.ts";
import mongoose from "mongoose";

// @desc    Create a new Class
// @route   POST /api/classes
// @access  Private/Admin
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, academicYear, classTeacher, capacity } = req.body;

    const existingClass = await Class.findOne({ name, academicYear });

    if (existingClass) {
      return res.status(400).json({
        message:
          "Class with this name already exists for the specified academic year",
      });
    }

    const newClass = await Class.create({
      name,
      academicYear,
      classTeacher,
      capacity,
    });

    await logActivity({
      userId: (req as any).user._id,
      action: `Created new class: ${newClass.name}`,
    });

    res.status(201).json(newClass);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while creating class", error });
  }
};

// @desc    Get All Classes
// @route   GET /api/classes
// @access  Private
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page as string) | 1;
    const limit = Number(req.query.limit as string) | 10;
    const search = req.query.search as string;

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    // console.log('query', query)

    const [total, classes] = await Promise.all([
      Class.countDocuments(query),
      Class.find(query)
        .populate("academicYear", "name")
        .populate("classTeacher", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      classes,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while getting classes", error });
  }
};

// @desc    Update Class
// @route   PUT /api/classes/:id
// @access  Private/Admin
export const updateClass = async (req: Request, res: Response) => {
  try {
    const classId = req.params.id;

    const existingClass = await Class.findOne({
      _id: { $ne: new mongoose.Types.ObjectId(classId as string) },
    });

    if (existingClass) {
      const updatedClass = await Class.findByIdAndUpdate(classId, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      await logActivity({
        userId: (req as any).user._id,
        action: `Updated class: ${updatedClass.name}`,
      });

      return res.status(200).json(updatedClass);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error while updating class", error });
  }
};

// @desc    Delete Class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    const userId = (req as any).user._id;

    await logActivity({
      userId,
      action: `Deleted class: ${deletedClass?.name}`,
    });

    if (!deletedClass) {
      return res.status(404).json({ message: "Class nof found" });
    }

    res.json({ message: "Class removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
