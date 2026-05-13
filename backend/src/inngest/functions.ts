import type _class from "../models/class.ts";
import { inngest } from "./index.ts";
import Class from "../models/user.ts";
import User from "../models/user.ts";
import Timetable from "../models/timetable.ts";
import Exam from "../models/exam.ts";
import Submission from "../models/submission.ts";

import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

interface GenSettings {
  startTime: string;
  endTime: string;
  periods: number;
}

export const generateTimetable = inngest.createFunction(
  { id: "Generate-timetable" },
  { event: "generate/timetable" },
  async ({ event, step }) => {
    const { classId, academicYearId, settings } = event.data as {
      classId: string;
      academicYearId: string;
      settings: GenSettings;
    };

    const contextData = await step.run("fetch-class-context", async () => {
      const classData = await Class.findById(classId).populate("subjects");

      if (!classData) throw new NonRetriableError("Class not found!");

      const allTeacher = await User.find({ role: "teacher" });

      const classSubjectsIds = classData;
    });
  },
);
