import mongoose from "mongoose";

export async function connectMongo() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/bookmyshow?replicaSet=rs0";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("Connected to MongoDB");
}
