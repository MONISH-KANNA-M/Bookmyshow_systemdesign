import "dotenv/config";
import mongoose from "mongoose";
import { connectMongo } from "../utils/db.js";
import { User } from "../models/User.js";
import { Movie } from "../models/Movie.js";
import { Theatre } from "../models/Theatre.js";
import { Screen } from "../models/Screen.js";
import { Show } from "../models/Show.js";

function genSeats(
  rows = ["A", "B", "C", "D", "E", "F", "G", "H"],
  perRow = 12
) {
  const labels = [];
  for (const r of rows) {
    for (let i = 1; i <= perRow; i++) labels.push(`${r}${i}`);
  }
  return labels;
}

async function run() {
  await connectMongo();

  // Create demo user
  const demoUser = await User.create({
    name: "Demo User",
    email: "demo@example.com",
  });

  // Create 3 movies
  const movie1 = await Movie.create({
    title: "Avatar: The Way of Water",
    durationMins: 192,
    language: "EN",
    certificate: "U/A",
  });
  const movie2 = await Movie.create({
    title: "Pathaan",
    durationMins: 146,
    language: "HI",
    certificate: "U/A",
  });
  const movie3 = await Movie.create({
    title: "Oppenheimer",
    durationMins: 180,
    language: "EN",
    certificate: "U/A",
  });

  // Create 2 theatres
  const theatre1 = await Theatre.create({
    name: "PVR Cinemas",
    city: "Mumbai",
  });
  const theatre2 = await Theatre.create({
    name: "IMAX Theater",
    city: "Delhi",
  });

  // Create screens
  const screen1 = await Screen.create({
    theatreId: theatre1._id,
    name: "Screen 1 (4K)",
    seatLabels: genSeats(),
  });
  const screen2 = await Screen.create({
    theatreId: theatre1._id,
    name: "Screen 2 (IMAX)",
    seatLabels: genSeats(["A", "B", "C", "D", "E"], 15),
  });
  const screen3 = await Screen.create({
    theatreId: theatre2._id,
    name: "Screen 1",
    seatLabels: genSeats(),
  });

  // Create shows (multiple times for each movie)
  const now = new Date();
  const times = [
    new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
    new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
    new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
  ];

  const shows = [];
  for (const movie of [movie1, movie2, movie3]) {
    for (const time of times) {
      shows.push(
        await Show.create({
          movieId: movie._id,
          screenId: screen1._id,
          startTime: time,
          basePrice: 200,
        })
      );
    }
  }

  // Add a few shows in other theatre
  shows.push(
    await Show.create({
      movieId: movie1._id,
      screenId: screen3._id,
      startTime: times[0],
      basePrice: 250,
    })
  );
  shows.push(
    await Show.create({
      movieId: movie2._id,
      screenId: screen3._id,
      startTime: times[1],
      basePrice: 250,
    })
  );

  console.log("✓ Seeded data:");
  console.log(`  Demo User: ${demoUser._id}`);
  console.log(`  Movies: ${movie1._id}, ${movie2._id}, ${movie3._id}`);
  console.log(`  Theatres: ${theatre1._id}, ${theatre2._id}`);
  console.log(`  Screens: ${screen1._id}, ${screen2._id}, ${screen3._id}`);
  console.log(`  Shows created: ${shows.length}`);
  console.log(
    "\n⚠️  IMPORTANT: Copy the Demo User ID above and paste it in frontend/src/App.jsx (line 13)"
  );
  console.log(
    "   Replace the crypto.randomUUID() with the ObjectId shown above"
  );
  console.log("\nTry in browser: http://localhost:5173");

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
