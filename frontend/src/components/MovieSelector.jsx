import React, { useEffect, useState } from "react";
import { getMovies } from "../api.js";

export default function MovieSelector({ onSelect }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading movies...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="component-container">
      <h2 className="component-title">🎥 Select a Movie</h2>
      {movies.length === 0 ? (
        <p>No movies available. Please seed the database.</p>
      ) : (
        <div className="items-grid">
          {movies.map((m) => (
            <div key={m._id} className="item-card" onClick={() => onSelect(m)}>
              <div className="item-title">{m.title}</div>
              <div className="item-detail">
                {m.durationMins} mins • {m.language}
              </div>
              <div className="item-detail">{m.certificate}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
