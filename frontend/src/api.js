export const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Movies
export async function getMovies() {
  const res = await fetch(`${apiBase}/api/movies`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}

export async function getMovie(movieId) {
  const res = await fetch(`${apiBase}/api/movies/${movieId}`);
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

// Theatres
export async function getTheatres(city) {
  const url = city
    ? `${apiBase}/api/theatres?city=${city}`
    : `${apiBase}/api/theatres`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch theatres");
  return res.json();
}

// Shows
export async function getShowsByMovie(movieId) {
  const res = await fetch(`${apiBase}/api/shows-list/by-movie/${movieId}`);
  if (!res.ok) throw new Error("Failed to fetch shows");
  return res.json();
}

export async function getShow(showId) {
  const res = await fetch(`${apiBase}/api/shows-list/${showId}`);
  if (!res.ok) throw new Error("Failed to fetch show");
  return res.json();
}

// Seats
export async function getSeats(showId) {
  const res = await fetch(`${apiBase}/api/shows/${showId}/seats`);
  if (!res.ok) throw new Error("Failed to fetch seats");
  return res.json();
}

// Holds
export async function createHold({ userId, showId, seats }) {
  const res = await fetch(`${apiBase}/api/holds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, showId, seats }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Hold failed");
  return res.json();
}

// Bookings
export async function createBooking({ userId, showId, holdId }) {
  const res = await fetch(`${apiBase}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, showId, holdId }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Booking failed");
  return res.json();
}

// Payments
export async function createPaymentOrder(bookingId, amount) {
  const res = await fetch(`${apiBase}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, amount }),
  });
  if (!res.ok)
    throw new Error(
      (await res.json()).error || "Payment order creation failed"
    );
  return res.json();
}

export async function verifyPayment(paymentId, razorpayPaymentId) {
  const res = await fetch(`${apiBase}/api/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, razorpayPaymentId }),
  });
  if (!res.ok)
    throw new Error((await res.json()).error || "Payment verification failed");
  return res.json();
}

export async function getPayment(paymentId) {
  const res = await fetch(`${apiBase}/api/payments/${paymentId}`);
  if (!res.ok) throw new Error("Failed to fetch payment");
  return res.json();
}
