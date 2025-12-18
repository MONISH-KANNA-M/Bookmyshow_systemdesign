import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  durationMins: { type: Number, required: true },
  language: { type: String },
  certificate: { type: String },
}, { timestamps: true });

export const Movie = mongoose.model('Movie', movieSchema);
