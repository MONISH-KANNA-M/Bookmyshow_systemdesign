import React from 'react'

export default function BookingConfirm({ movie, show, theatre, seats, bookingId, paymentId, onRestart }) {
  const showTime = new Date(show.startTime).toLocaleString('en-IN')
  const amount = seats.length * 200

  return (
    <div className="component-container">
      <h2 className="component-title" style={{ color: '#4caf50' }}>✓ Booking Confirmed!</h2>
      
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
          <span className="confirmation-value">{seats.join(', ')}</span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">💰 Total Amount</span>
          <span className="confirmation-value" style={{ fontSize: '1.2em' }}>₹{amount}</span>
        </div>
      </div>

      <div className="confirmation-box" style={{ background: '#e3f2fd' }}>
        <div className="confirmation-item">
          <span className="confirmation-label">Booking ID</span>
          <span className="confirmation-value" style={{ fontSize: '0.85em', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {bookingId}
          </span>
        </div>
        <div className="confirmation-item">
          <span className="confirmation-label">Payment ID</span>
          <span className="confirmation-value" style={{ fontSize: '0.85em', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {paymentId}
          </span>
        </div>
      </div>

      <div style={{ background: '#fff9c4', padding: '16px', borderRadius: '6px', margin: '20px 0', borderLeft: '4px solid #fbc02d' }}>
        <p style={{ margin: 0, color: '#333' }}>
          📧 A confirmation email has been sent to your registered email address with ticket details and QR codes.
        </p>
      </div>

      <div className="button-group" style={{ marginTop: '40px' }}>
        <button className="btn btn-success" onClick={onRestart} style={{ flex: 1 }}>
          Book Another Ticket
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '0.9em' }}>
        <p>Thank you for booking with BookMyShow!</p>
        <p>Save your booking ID for future reference.</p>
      </div>
    </div>
  )
}
