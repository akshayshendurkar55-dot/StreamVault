import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Movies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/movies")
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div className="movies-page">
      <nav className="navbar">
        <Link to="/" className="logo">
          STREAMVAULT
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          <span>My List</span>
        </div>

        <button className="login-btn">Sign In</button>
      </nav>

      <main className="movies-content">
        <div className="movies-heading">
          <p className="details-label">STREAMVAULT LIBRARY</p>
          <h1>All Movies</h1>
          <p>Explore the complete StreamVault collection.</p>
        </div>

        <div className="movie-grid">
          {movies.map((movie) => (
            <Link
              to={`/movie/${movie.id}`}
              className="movie-card"
              key={movie.id}
            >
              <div className="poster">
                <img src={movie.poster_url} alt={movie.title} />
              </div>

              <div className="movie-info">
                <h3>{movie.title}</h3>

                <p>
                  {movie.genre} • {movie.release_year}
                </p>

                <span className="rating">⭐ {movie.rating}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Movies;