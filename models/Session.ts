import mongoose from "mongoose";
import { SessionType } from "../types";

const sessionSchema = new mongoose.Schema<SessionType>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    valid: {
      type: Boolean,
      default: true,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<SessionType>("Session", sessionSchema);
