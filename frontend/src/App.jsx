import React, { useEffect, useState } from "react";
import Auth from "./components/Auth.jsx";
import MovieSelector from "./components/MovieSelector.jsx";
import TheatreSelector from "./components/TheatreSelector.jsx";
import ShowSelector from "./components/ShowSelector.jsx";
import SeatGrid from "./components/SeatGrid.jsx";
import PaymentGateway from "./components/PaymentGateway.jsx";
import BookingConfirm from "./components/BookingConfirm.jsx";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState("movie"); // movie -> theatre -> show -> seats -> payment -> confirm
  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holdId, setHoldId] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [ticketNumber, setTicketNumber] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const userName = localStorage.getItem("user_name");
    const userEmail = localStorage.getItem("user_email");

    if (userId && userName && userEmail) {
      setUser({ userId, name: userName, email: userEmail });
    }
  }, []);

  const handleMovieSelect = (m) => {
    setMovie(m);
    setStep("theatre");
  };

  const handleTheatreSelect = (t) => {
    setTheatre(t);
    setStep("show");
  };

  const handleShowSelect = (s) => {
    setShow(s);
    setStep("seats");
  };

  const handleSeatsSelected = (seats, hId) => {
    setSelectedSeats(seats);
    setHoldId(hId);
    setStep("payment");
  };

  const handlePaymentSuccess = (payId, bId, tNum) => {
    setPaymentId(payId);
    setBookingId(bId);
    setTicketNumber(tNum);
    setStep("confirm");
  };

  const handleRestart = () => {
    setStep("movie");
    setMovie(null);
    setTheatre(null);
    setShow(null);
    setSelectedSeats([]);
    setHoldId(null);
    setBookingId(null);
    setPaymentId(null);
    setTicketNumber(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    setUser(null);
    setStep("movie");
    setMovie(null);
    setTheatre(null);
    setShow(null);
    setSelectedSeats([]);
    setHoldId(null);
    setBookingId(null);
    setPaymentId(null);
    setTicketNumber(null);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setStep("movie");
  };

  const handlePrevious = () => {
    const steps = ["movie", "theatre", "show", "seats", "payment", "confirm"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const steps = ["movie", "theatre", "show", "seats", "payment", "confirm"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      // Only allow next if required data is available
      if (step === "movie" && !movie) return;
      if (step === "theatre" && !theatre) return;
      if (step === "show" && !show) return;
      if (step === "seats" && selectedSeats.length === 0) return;
      if (step === "payment" && !paymentId) return;

      setStep(steps[currentIndex + 1]);
    }
  };

  const canGoPrevious = () => {
    return ["theatre", "show", "seats"].includes(step);
  };

  const canGoNext = () => {
    if (step === "movie") return movie !== null;
    if (step === "theatre") return theatre !== null;
    if (step === "show") return show !== null;
    return false;
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎬 BookMyShow</h1>
        <div className="user-info">
          Welcome, <strong>{user.name}</strong>
          <button
            className="btn-logout"
            onClick={handleLogout}
            style={{
              marginLeft: "20px",
              padding: "8px 16px",
              background: "#ff6b6b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9em",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="step-indicator">
        {["movie", "theatre", "show", "seats", "payment", "confirm"].map(
          (s) => (
            <div
              key={s}
              className={`step ${step === s ? "active" : ""} ${
                [
                  "movie",
                  "theatre",
                  "show",
                  "seats",
                  "payment",
                  "confirm",
                ].indexOf(s) <
                [
                  "movie",
                  "theatre",
                  "show",
                  "seats",
                  "payment",
                  "confirm",
                ].indexOf(step)
                  ? "done"
                  : ""
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          )
        )}
      </div>

      <div className="step-content">
        {step === "movie" && <MovieSelector onSelect={handleMovieSelect} />}
        {step === "theatre" && (
          <TheatreSelector movie={movie} onSelect={handleTheatreSelect} />
        )}
        {step === "show" && (
          <ShowSelector movie={movie} onSelect={handleShowSelect} />
        )}
        {step === "seats" && (
          <SeatGrid
            showId={show._id}
            userId={user.userId}
            onSeatsLocked={handleSeatsSelected}
          />
        )}
        {step === "payment" && (
          <PaymentGateway
            showId={show._id}
            userId={user.userId}
            seats={selectedSeats}
            holdId={holdId}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
        {step === "confirm" && (
          <BookingConfirm
            movie={movie}
            show={show}
            theatre={theatre}
            seats={selectedSeats}
            bookingId={bookingId}
            paymentId={paymentId}
            ticketNumber={ticketNumber}
            onRestart={handleRestart}
          />
        )}

        {/* Navigation buttons */}
        {step !== "confirm" && step !== "payment" && (
          <div className="navigation-buttons">
            {canGoPrevious() && (
              <button className="btn btn-secondary" onClick={handlePrevious}>
                ← Previous
              </button>
            )}
            {canGoNext() && (
              <button
                className="btn btn-primary"
                onClick={handleNext}
                style={{ marginLeft: "auto" }}
              >
                Next →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
