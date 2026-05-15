import mongoose, { Schema, models, model } from "mongoose";

const ShameSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // time +- penalty
    data: {
      type: Number,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Shame = models.Shame || model("Shame", ShameSchema);

export default Shame;
