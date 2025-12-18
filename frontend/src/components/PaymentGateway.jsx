import React, { useState, useEffect } from "react";
import { createBooking, createPaymentOrder, verifyPayment } from "../api.js";

export default function PaymentGateway({
  showId,
  userId,
  seats,
  holdId,
  onPaymentSuccess,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStep, setPaymentStep] = useState("order"); // order -> verify -> done

  const amount = seats.length * 200; // base price per seat

  // Auto-initiate payment flow on component mount
  useEffect(() => {
    initializePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initializePayment() {
    setLoading(true);
    setError("");
    try {
      // Step 1: Create booking (will reserve seats)
      const bookingResp = await createBooking({ userId, showId, holdId });
      setBookingId(bookingResp.bookingId);

      // Step 2: Create payment order
      const orderResp = await createPaymentOrder(bookingResp.bookingId, amount);
      setPaymentId(orderResp.orderId);
      setPaymentStep("verify");
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setPaymentStep("error");
      setLoading(false);
    }
  }

  async function handleVerifyPayment() {
    setLoading(true);
    setError("");
    try {
      // Step 3: Mock payment - simulate user paying
      const mockPaymentId = `pay_${Date.now()}`;
      await verifyPayment(paymentId, mockPaymentId);
      setPaymentStep("done");
      setLoading(false);
      // Call success callback
      onPaymentSuccess(paymentId, bookingId);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="component-container">
      <h2 className="component-title">💳 Payment</h2>
      {error && <div className="error">{error}</div>}

      <div className="confirmation-box">
        <div className="confirmation-item">
          <span className="confirmation-label">Seats</span>
          <span className="confirmation-value">{seats.join(", ")}</span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">Price per seat</span>
          <span className="confirmation-value">₹200</span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">Total amount</span>
          <span className="confirmation-value" style={{ fontSize: "1.3em" }}>
            ₹{amount}
          </span>
        </div>
      </div>

      {paymentStep === "order" && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div className="success">
            ✓ Booking confirmed! Preparing payment...
          </div>
          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "inline-block",
                borderRadius: "50%",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #667eea",
                width: "40px",
                height: "40px",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        </div>
      )}

      {paymentStep === "verify" && (
        <div>
          <div className="success">✓ Payment order created.</div>
          <div className="confirmation-box">
            <div className="confirmation-item">
              <span className="confirmation-label">Order ID</span>
              <span
                className="confirmation-value"
                style={{ fontSize: "0.9em", wordBreak: "break-all" }}
              >
                {paymentId}
              </span>
            </div>
          </div>
          <p style={{ margin: "20px 0", fontSize: "0.95em", color: "#666" }}>
            Click "Complete Payment" to confirm your payment.
          </p>
          <div className="button-group">
            <button
              className="btn btn-success"
              onClick={handleVerifyPayment}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Complete Payment"}
            </button>
          </div>
        </div>
      )}

      {paymentStep === "done" && (
        <div
          className="success"
          style={{ padding: "30px", textAlign: "center", fontSize: "1.2em" }}
        >
          ✓ Payment successful! Redirecting to confirmation...
        </div>
      )}

      {paymentStep === "error" && (
        <div>
          <div className="error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={initializePayment}
              disabled={loading}
            >
              {loading ? "Retrying..." : "Retry Payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
