import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    startTime: { type: Date, required: true },
    basePrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Show = mongoose.model("Show", showSchema);
