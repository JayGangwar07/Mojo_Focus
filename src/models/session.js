import mongoose, { Schema, models, model } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    remainingTime: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["RUNNING", "PAUSED", "COMPLETED", "FAILED"],
    },
    startedAt: {
      type: Date,
      default: Date.now(),
    },
    lastResumeAt: {
      type: Date,
      default: Date.now(),
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

const Session = models.Session || model("Session", SessionSchema);

export default Session;
