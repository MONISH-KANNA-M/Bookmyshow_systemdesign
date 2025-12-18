# BookMyShow — MERN (HLD + LLD) with Concurrency Control

This project is a reference implementation of a ticket-booking platform (like BookMyShow) built with the MERN stack, designed with both High-Level Design (HLD) and Low-Level Design (LLD) artifacts, and a backend that enforces safe concurrent seat booking.

It demonstrates:

- HLD and LLD docs with architecture and sequence diagrams.
- Backend: Node.js + Express + MongoDB (Mongoose), Socket.IO.
- Concurrency control for seat booking using:
  - Unique per-seat reservation records (`SeatReservation`) with a compound unique index.
  - MongoDB multi-document transactions (requires replica set) with retry on transient errors.
  - Temporary seat holds (`SeatHold`) with TTL expiry to reduce conflicts.
  - Optimistic updates via re-checks and conflict handling.
- Frontend: React + Vite with a minimal seat grid and live updates.

## Quick Start

Prerequisites:

- Node.js 18+
- MongoDB 6+ (enable single-node replica set for transactions)

Enable MongoDB replica set (local, Windows example):

```powershell
# Stop any running mongod first
# Replace the db path as needed
mkdir C:\data\db -ea 0
"replication:\n  replSetName: rs0" | Out-File -FilePath C:\data\mongod.conf -Encoding ascii
# Start mongod in a separate terminal (run as admin if needed)
& mongod --config C:\data\mongod.conf
# Initialize replica set (only once)
& mongosh --eval "rs.initiate()"
```

### Backend

```powershell
cd bookmyshow\backend
copy .env.example .env
# edit .env to set MONGODB_URI if needed
npm install
npm run dev
```

### Frontend

```powershell
cd bookmyshow\frontend
npm install
npm run dev
```

- Backend default: http://localhost:4000
- Frontend default: http://localhost:5173

## Documents

- HLD: See [HLD.md](HLD.md)
- LLD: See [LLD.md](LLD.md)

## Concurrency Strategy (Summary)

- Seat holds: short-lived `SeatHold` docs with TTL index prevent soft collisions.
- Seat reservations: one doc per (showId, seat) with unique compound index enforces hard exclusivity.
- Booking transaction: atomically inserts `SeatReservation` docs + `Booking` doc; on conflict, aborts.
- Real-time: Socket.IO broadcasts `seat_hold_created` and `seat_booked` for UI updates.

## Notes

- TTL expiration does not emit events automatically; UI will refresh periodically and react to booking events.
- Transactions require a replica set—even for single-node development.
