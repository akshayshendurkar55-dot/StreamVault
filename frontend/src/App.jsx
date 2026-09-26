import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MovieDetails from "./MovieDetails";
import Movies from "./Movies";
import MyList from "./MyList";
import "./index.css";

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/movies")
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">STREAMVAULT</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
         <Link to="/movies">Movies</Link>
         <Link to="/my-list">My List</Link>
        </div>

        <button className="login-btn">Sign In</button>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">STREAMVAULT ORIGINAL</p>

          <h1>Beyond the Screen</h1>

          <p className="hero-description">
            Discover movies, explore new worlds and experience entertainment
            built on a cloud-native 3-tier architecture.
          </p>

          <div className="hero-buttons">
            <button className="play-btn">▶ Play</button>
            <button className="info-btn">ⓘ More Info</button>
          </div>
        </div>
      </section>

      <main className="content">
        <h2>Trending Now</h2>

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
                  alt={movie.title}
                />
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

      <footer>
        <p>© 2026 StreamVault. Built as a Cloud & DevOps project.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
    <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/movies" element={<Movies />} />
  <Route path="/my-list" element={<MyList />} />
  <Route path="/movie/:id" element={<MovieDetails />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;