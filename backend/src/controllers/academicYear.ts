import { type Request, type Response } from "express";
import AcademicYear from "../models/academicYear.ts";
import { logActivity } from "../utils/activitieslog.ts";
import mongoose from "mongoose";

// @desc    Create a new Academic Year
// @route   POST /api/academic-years
// @access  Private/Admin
export const createAcademicYear = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, fromYear, toYear, isCurrent } = req.body;

    const existingYear = await AcademicYear.findOne({ fromYear, toYear });
    if (existingYear) {
      res.status(400).json({ message: "Academic year already exists" });
      return;
    }

    if (isCurrent) {
      await AcademicYear.updateMany(
        { _id: { $ne: null } },
        { isCurrent: false },
      );
    }

    const academicYear = await AcademicYear.create({
      name,
      fromYear,
      toYear,
      isCurrent: isCurrent || false,
    });

    await logActivity({
      userId: (req as any).user._id,
      action: `Created academic year ${name}`,
    });
    res.status(201).json(academicYear);
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating academic year details",
      error,
    });
  }
};

// @desc    Get the current active Academic Year
// @route   GET /api/academic-years/current
// @access  Public or Protected
export const getCurrentAcademicYear = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const currentYear = await AcademicYear.findOne({ isCurrent: true });
    if (!currentYear) {
      res.status(404).json({ message: "No current academic year found" });
      return;
    } else {
      res.status(200).json(currentYear);
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error while getting academic year details",
      error,
    });
  }
};

// @desc    Update Academic Year
// @route   PUT /api/academic-years/:id
// @access  Private/Admin
export const updateAcademicYear = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { isCurrent } = req.body;
    if (isCurrent) {
      await AcademicYear.updateMany(
        { _id: { $ne: new mongoose.Types.ObjectId(req.params.id as string) } },
        { isCurrent: false },
      );
    }

    const updatedYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedYear) {
      res.status(404).json({ message: "Academic year not found" });
    }

    await logActivity({
      userId: (req as any).user._id,
      action: `Created academic year ${updatedYear?.name}`,
    });

    res.status(200).json(updatedYear);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while updating academic year", error });
  }
};

// @desc    Delete Academic Year
// @route   DELETE /api/academic-years/:id
// @access  Private/Admin
export const deleteAcademicYear = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const year = await AcademicYear.findById(req.params.id);

    if (!year) {
      res.status(404).json({ message: "Academic year not found" });
      return;
    }

    if (year) {
      if (year.isCurrent) {
        res
          .status(400)
          .json({ message: "Cannot delete the current academic year" });
        return;
      }
    }

    await year.deleteOne();

    await logActivity({
      userId: (req as any).user._id,
      action: `Deleted academic year ${year.name}`,
    });

    res.status(200).json({ message: "Academic year deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while deleting academic year", error });
  }
};
