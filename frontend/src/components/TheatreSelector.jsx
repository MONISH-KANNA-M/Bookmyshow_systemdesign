import React, { useEffect, useState } from "react";
import { getTheatres } from "../api.js";

export default function TheatreSelector({ movie, onSelect }) {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getTheatres();
        setTheatres(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading theatres...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="component-container">
      <h2 className="component-title">🏢 Select a Theatre</h2>
      <div className="item-detail">
        Movie: <strong>{movie?.title}</strong>
      </div>
      {theatres.length === 0 ? (
        <p>No theatres available.</p>
      ) : (
        <div className="items-grid">
          {theatres.map((t) => (
            <div key={t._id} className="item-card" onClick={() => onSelect(t)}>
              <div className="item-title">{t.name}</div>
              <div className="item-detail">📍 {t.city}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
