import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import { Server as SocketIOServer } from "socket.io";
import "./utils/asyncErrors.js";
import { connectMongo } from "./utils/db.js";
import authRouter from "./routes/auth.js";
import seatsRouter from "./routes/seats.js";
import holdsRouter from "./routes/holds.js";
import bookingsRouter from "./routes/bookings.js";
import healthRouter from "./routes/health.js";
import moviesRouter from "./routes/movies.js";
import theatresRouter from "./routes/theatres.js";
import showsRouter from "./routes/shows.js";
import paymentsRouter from "./routes/payments.js";
import { attachSockets, setIO } from "./utils/io.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
});
setIO(io);

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/health", healthRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/theatres", theatresRouter);
app.use("/api/shows-list", showsRouter);
app.use("/api/shows", seatsRouter);
app.use("/api/holds", holdsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);

// Error handler (basic)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    code: status,
  });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await connectMongo();
  attachSockets(io);
  server.listen(PORT, () =>
    console.log(`API running on http://localhost:${PORT}`)
  );
}

start().catch((e) => {
  console.error("Failed to start server", e);
  process.exit(1);
});
