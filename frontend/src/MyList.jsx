import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "./useAuth";

function MyList() {
  const { token, isAuthenticated, apiUrl } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    let isMounted = true;

    fetch(`${apiUrl}/api/my-list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch your saved movies.");
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setMovies(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("My List fetch error:", err);
          setError("Failed to load your list. Please try again.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token, apiUrl]);

  const handleRemove = async (movieId) => {
    if (!token || removingId) return;

    setRemovingId(movieId);

    try {
      const response = await fetch(`${apiUrl}/api/my-list/${movieId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove movie from list.");
      }

      setMovies((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      console.error("Error removing from list:", err);
      alert("Could not remove movie from your list. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="movies-page">
      <Navbar />

      <main className="movies-content">
        <div className="movies-heading">
          <p className="details-label">YOUR COLLECTION</p>
          <h1>My List</h1>
          <p>Movies you have saved for later.</p>
        </div>

        {!isAuthenticated ? (
          <div className="empty-list">
            <h2>Sign in to access My List</h2>
            <p>Save movies and watchlists across all your devices.</p>
            <Link to="/login" className="watch-btn">
              Sign In Now
            </Link>
          </div>
        ) : loading ? (
          <p className="status-message">Loading your list...</p>
        ) : error ? (
          <p className="status-message error-message">{error}</p>
        ) : movies.length === 0 ? (
          <div className="empty-list">
            <h2>Your list is empty</h2>
            <p>Browse movies and add your favorites to My List.</p>
            <Link to="/movies" className="watch-btn">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <div className="movie-card-container" key={movie.id}>
                <Link to={`/movie/${movie.id}`} className="movie-card">
                  <div className="poster">
                    <img
                      src={
                        movie.poster_url ||
                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
                      }
                      alt={movie.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <p>
                      {movie.genre || "Movie"}
                      {movie.release_year ? ` • ${movie.release_year}` : ""}
                    </p>
                    {movie.rating != null && (
                      <span className="rating">⭐ {movie.rating}</span>
                    )}
                  </div>
                </Link>

                <button
                  className="remove-from-list-btn"
                  onClick={() => handleRemove(movie.id)}
                  disabled={removingId === movie.id}
                  title="Remove from My List"
                >
                  {removingId === movie.id ? "Removing..." : "✕ Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyList;