import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "./useAuth";

function Movies() {
  const { apiUrl } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch(`${apiUrl}/api/movies`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load movies catalog.");
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setMovies(Array.isArray(data) ? data : []);
          setError("");
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error fetching movies:", err);
          setError("Failed to load movies. Please check whether the backend is running.");
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
  }, [apiUrl]);

  const filteredMovies = movies.filter((movie) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (movie.title && movie.title.toLowerCase().includes(q)) ||
      (movie.genre && movie.genre.toLowerCase().includes(q))
    );
  });

  return (
    <div className="movies-page">
      <Navbar />

      <main className="movies-content">
        <div className="movies-heading">
          <p className="details-label">STREAMVAULT LIBRARY</p>
          <h1>All Movies</h1>
          <p>Explore the complete StreamVault collection.</p>

          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search by title or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search movies"
            />
          </div>
        </div>

        {loading && (
          <p className="status-message">Loading movie catalog...</p>
        )}

        {!loading && error && (
          <p className="status-message error-message">{error}</p>
        )}

        {!loading && !error && filteredMovies.length === 0 && (
          <div className="empty-list">
            <h2>No movies found</h2>
            <p>
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different title or genre.`
                : "No movies available in the catalog yet."}
            </p>
          </div>
        )}

        {!loading && !error && filteredMovies.length > 0 && (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <Link
                to={`/movie/${movie.id}`}
                className="movie-card"
                key={movie.id}
              >
                <div className="poster">
                  <img
                    src={
                      movie.poster_url ||
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
                    }
                    alt={`${movie.title} poster`}
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Movies;