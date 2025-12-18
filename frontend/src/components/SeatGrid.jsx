import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { apiBase, getSeats, createHold } from "../api";

export default function SeatGrid({ showId, userId, onSeatsLocked }) {
  const [seatLabels, setSeatLabels] = useState([]);
  const [booked, setBooked] = useState(new Set());
  const [held, setHeld] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [holdResp, setHoldResp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const socket = useMemo(() => io(apiBase, { transports: ["websocket"] }), []);

  async function refresh() {
    setError("");
    try {
      const data = await getSeats(showId);
      setSeatLabels(data.seatLabels || []);
      setBooked(new Set(data.bookedSeats || []));
      setHeld(new Set(data.heldSeats || []));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh();
    socket.emit("join_show", showId);
    socket.on("seat_hold_created", (p) => {
      if (p?.showId === showId) refresh();
    });
    socket.on("seat_booked", (p) => {
      if (p?.showId === showId) refresh();
    });
    return () => {
      socket.emit("leave_show", showId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  function toggleSeat(seat) {
    if (booked.has(seat) || held.has(seat)) return;
    const next = new Set(selected);
    if (next.has(seat)) next.delete(seat);
    else next.add(seat);
    setSelected(next);
  }

  async function holdSeats() {
    if (selected.size === 0) return;
    setLoading(true);
    setError("");
    try {
      const resp = await createHold({
        userId,
        showId,
        seats: Array.from(selected),
      });
      setHoldResp(resp);
      await refresh();
      // Call the callback to proceed to payment step
      onSeatsLocked(Array.from(selected), resp.holdId);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="component-title">🎫 Select Seats</h2>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <button className="btn btn-primary" onClick={refresh}>
          Refresh
        </button>
        <button
          className="btn btn-success"
          onClick={holdSeats}
          disabled={loading || selected.size === 0}
        >
          Lock {selected.size} Seat{selected.size !== 1 ? "s" : ""}
        </button>
        {holdResp && (
          <span style={{ color: "#4caf50", fontWeight: 600 }}>
            ✓ Seats locked until{" "}
            {new Date(holdResp.expiresAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="seat-grid">
        {seatLabels.map((s) => {
          const isBooked = booked.has(s);
          const isHeld = held.has(s);
          const isSelected = selected.has(s);
          return (
            <div
              key={s}
              onClick={() => toggleSeat(s)}
              className={`seat ${isBooked ? "booked" : ""} ${
                isHeld ? "held" : ""
              } ${isSelected ? "selected" : ""}`}
              title={isBooked ? "Booked" : isHeld ? "Held" : "Available"}
            >
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}
