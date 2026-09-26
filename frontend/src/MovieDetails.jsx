import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/movies/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="details-loading">
        <p>Loading movie...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="details-loading">
        <h2>Movie not found</h2>
        <Link to="/">← Back to StreamVault</Link>
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      <div
        className="details-backdrop"
        style={{
          backgroundImage: `linear-gradient(
            to right,
            #0b0b0b 15%,
            rgba(11, 11, 11, 0.75),
            rgba(11, 11, 11, 0.25)
          ),
          linear-gradient(
            to top,
            #0b0b0b 5%,
            transparent 60%
          ),
          url(${movie.poster_url})`,
        }}
      >
        <Link to="/" className="back-button">
          ← Back
        </Link>

        <div className="details-content">
          <p className="details-label">STREAMVAULT MOVIE</p>

          <h1>{movie.title}</h1>

          <div className="movie-meta">
            <span>⭐ {movie.rating}</span>
            <span>{movie.release_year}</span>
            <span>{movie.genre}</span>
          </div>

          <p className="details-description">
            {movie.description}
          </p>

          <div className="details-actions">
            <button className="watch-btn">▶ Watch Now</button>
            <button
  className="list-btn"
  onClick={() => {
    fetch("http://localhost:5000/api/my-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1,
        movie_id: movie.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Movie added to My List ✅");
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to add movie ❌");
      });
  }}
>
  ＋ My List
</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;