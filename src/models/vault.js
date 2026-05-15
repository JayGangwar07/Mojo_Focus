import mongoose, { Schema } from "mongoose";

const VaultSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    study_time: {
      week: Number,
      today: Number,
      month: Number,
    },
    position: Number,
    penalty: Number,
  },
  {
    timestamps: true,
  },
);

const Vault = models.Vault || model("Vault", VaultSchema);

export default Vault;
