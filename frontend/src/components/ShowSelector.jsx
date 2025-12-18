import React, { useEffect, useState } from "react";
import { getShowsByMovie } from "../api.js";

export default function ShowSelector({ movie, onSelect }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getShowsByMovie(movie._id);
        setShows(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [movie._id]);

  if (loading) return <div className="loading">Loading shows...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="component-container">
      <h2 className="component-title">🕐 Select Show Time</h2>
      <div className="item-detail">
        Movie: <strong>{movie?.title}</strong>
      </div>
      {shows.length === 0 ? (
        <p>No shows available for this movie.</p>
      ) : (
        <div className="items-grid">
          {shows.map((s) => {
            const startTime = new Date(s.startTime).toLocaleString("en-IN");
            return (
              <div
                key={s._id}
                className="item-card"
                onClick={() => onSelect(s)}
              >
                <div className="item-title">{startTime}</div>
                <div className="item-detail">Price: ₹{s.basePrice}</div>
                <div className="item-detail">
                  Screen: {s.screenId?.name || "N/A"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
