import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import MovieDetails from "./MovieDetails";
import Movies from "./Movies";
import MyList from "./MyList";
import Login from "./Login";
import Register from "./Register";
import Navbar from "./Navbar";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";

import "./index.css";

function Home() {
  const { apiUrl } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch(`${apiUrl}/api/movies`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load movies.");
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
          console.error("Movie loading error:", err);
          setError(
            "Unable to load movies. Please check whether the backend is running."
          );
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

  return (
    <div className="app">
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">STREAMVAULT ORIGINAL</p>

          <h1>Beyond the Screen</h1>

          <p className="hero-description">
            Discover movies, explore new worlds and experience
            entertainment built on a cloud-native 3-tier architecture.
          </p>

          <div className="hero-buttons">
            <Link to="/movies" className="play-btn">
              ▶ Explore Movies
            </Link>

            <Link to="/movies" className="info-btn">
              ⓘ Discover More
            </Link>
          </div>
        </div>
      </section>

      <main className="content">
        <div className="section-heading">
          <h2>Trending Now</h2>
          <Link to="/movies">Explore All →</Link>
        </div>

        {loading && (
          <p className="status-message">Loading movies...</p>
        )}

        {!loading && error && (
          <p className="status-message error-message">{error}</p>
        )}

        {!loading && !error && movies.length === 0 && (
          <p className="status-message">
            No movies available yet. Check back soon.
          </p>
        )}

        {!loading && !error && movies.length > 0 && (
          <div className="movie-grid">
            {movies.map((movie) => (
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
                    {movie.release_year
                      ? ` • ${movie.release_year}`
                      : ""}
                  </p>

                  {movie.rating != null && (
                    <span className="rating">
                      ⭐ {movie.rating}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer>
        <p>
          © 2026 StreamVault. Built as a Cloud & DevOps portfolio project.
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
