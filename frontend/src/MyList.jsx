import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/my-list/1")
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
          <Link to="/my-list">My List</Link>
        </div>

        <button className="login-btn">Sign In</button>
      </nav>

      <main className="movies-content">
        <div className="movies-heading">
          <p className="details-label">YOUR COLLECTION</p>
          <h1>My List</h1>
          <p>Movies you have saved for later.</p>
        </div>

        {movies.length === 0 ? (
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
        )}
      </main>
    </div>
  );
}

export default MyList;