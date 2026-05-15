const mongoose = require("mongoose");

// Sub-schema for individual revision slots to keep code DRY
const revisionSlotSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
); // _id: false prevents Mongoose from creating sub-IDs for every slot

const plannerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sno: {
    type: Number,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  revision: {
    fiveMin: { type: revisionSlotSchema },
    day1: { type: revisionSlotSchema },
    day2: { type: revisionSlotSchema },
    day4: { type: revisionSlotSchema },
    day7: { type: revisionSlotSchema },
    day15: { type: revisionSlotSchema },
    day30: { type: revisionSlotSchema },
  },
});

// Compound index to ensure a user doesn't have duplicate serial numbers
plannerSchema.index({ user: 1, sno: 1 }, { unique: true });

const Planner = mongoose.model("Planner", plannerSchema);

module.exports = Planner;
