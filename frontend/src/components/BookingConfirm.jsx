import React, { useState, useEffect } from "react";
import { apiBase } from "../api";

export default function BookingConfirm({
  movie,
  show,
  theatre,
  seats,
  bookingId,
  paymentId,
  ticketNumber,
  onRestart,
}) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const showTime = new Date(show.startTime).toLocaleString("en-IN");
  const amount = seats.length * 200;

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${apiBase}/api/bookings/${bookingId}/ticket`);
        if (res.ok) {
          const data = await res.json();
          setTicket(data);
        }
      } catch (err) {
        console.error("Failed to fetch ticket:", err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchTicket();
    }
  }, [bookingId]);

  return (
    <div className="component-container">
      <h2 className="component-title" style={{ color: "#4caf50" }}>
        ✓ Booking Confirmed!
      </h2>

      {/* Ticket Number Display */}
      <div
        className="confirmation-box"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          marginBottom: "20px",
        }}
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontSize: "0.9em", opacity: 0.9, marginBottom: "8px" }}>
            🎫 TICKET NUMBER
          </div>
          <div
            style={{
              fontSize: "1.5em",
              fontWeight: "bold",
              letterSpacing: "2px",
              fontFamily: "monospace",
            }}
          >
            {ticketNumber || (loading ? "Loading..." : "N/A")}
          </div>
        </div>
      </div>

      <div className="confirmation-box">
        <div className="confirmation-item">
          <span className="confirmation-label">🎬 Movie</span>
          <span className="confirmation-value">{movie?.title}</span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">🏢 Theatre</span>
          <span className="confirmation-value">{theatre?.name}</span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">📍 City</span>
          <span className="confirmation-value">{theatre?.city}</span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">🕐 Show Time</span>
          <span className="confirmation-value">{showTime}</span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">🎫 Seats</span>
          <span className="confirmation-value">{seats.join(", ")}</span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">💰 Total Amount</span>
          <span className="confirmation-value" style={{ fontSize: "1.2em" }}>
            ₹{amount}
          </span>
        </div>
      </div>

      <div className="confirmation-box" style={{ background: "#e3f2fd" }}>
        <div className="confirmation-item">
          <span className="confirmation-label">Ticket Number</span>
          <span
            className="confirmation-value"
            style={{
              fontSize: "1em",
              wordBreak: "break-all",
              fontFamily: "monospace",
              color: "#1976d2",
              fontWeight: "bold",
            }}
          >
            {ticketNumber}
          </span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">Booking ID</span>
          <span
            className="confirmation-value"
            style={{
              fontSize: "0.85em",
              wordBreak: "break-all",
              fontFamily: "monospace",
            }}
          >
            {bookingId}
          </span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">Payment ID</span>
          <span
            className="confirmation-value"
            style={{
              fontSize: "0.85em",
              wordBreak: "break-all",
              fontFamily: "monospace",
            }}
          >
            {paymentId}
          </span>
        </div>
      </div>

      <div
        style={{
          background: "#fff9c4",
          padding: "16px",
          borderRadius: "6px",
          margin: "20px 0",
          borderLeft: "4px solid #fbc02d",
        }}
      >
        <p style={{ margin: 0, color: "#333" }}>
          📧 A confirmation email with your ticket (Ticket No:{" "}
          <strong>{ticketNumber}</strong>) has been sent to your registered
          email address.
        </p>
      </div>

      <div className="button-group" style={{ marginTop: "40px" }}>
        <button
          className="btn btn-success"
          onClick={onRestart}
          style={{ flex: 1 }}
        >
          Book Another Ticket
        </button>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          color: "#666",
          fontSize: "0.9em",
        }}
      >
        <p>Thank you for booking with BookMyShow!</p>
        <p>
          Your ticket number: <strong>{ticketNumber}</strong>
        </p>
        <p>Please show this ticket number at the theatre entrance.</p>
      </div>
    </div>
  );
}
