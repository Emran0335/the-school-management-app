import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  createdAt: Date;
}

const activitiesLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    action: { type: String, required: true },
    details: { type: String },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IActivityLog>(
  "ActivitiesLog",
  activitiesLogSchema,
);
