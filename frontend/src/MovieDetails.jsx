import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

// Legally usable, open-source sample video stream sources for testing
const DEFAULT_SAMPLE_VIDEO = "https://vjs.zencdn.net/v/oceans.mp4";
const FALLBACK_SAMPLE_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, apiUrl } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // My List state
  const [isInList, setIsInList] = useState(false);
  const [listActionLoading, setListActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Video playback states
  const [isWatching, setIsWatching] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Fetch movie details
  useEffect(() => {
    let isMounted = true;

    fetch(`${apiUrl}/api/movies/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Movie not found");
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setMovie(data);
          setError("");
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error fetching movie details:", err);
          setError("Movie not found or failed to load.");
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
  }, [id, apiUrl]);

  // Check if this movie is in the user's My List
  useEffect(() => {
    if (!isAuthenticated || !token || !id) {
      return;
    }

    let isMounted = true;

    fetch(`${apiUrl}/api/my-list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((list) => {
        if (isMounted && Array.isArray(list)) {
          const movieIdNum = parseInt(id, 10);
          const found = list.some((item) => item.id === movieIdNum);
          setIsInList(found);
        }
      })
      .catch((err) => {
        console.warn("Could not check My List status:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, token, apiUrl]);

  // Handle Escape key to gracefully exit playback
  useEffect(() => {
    if (!isWatching) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsWatching(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWatching]);

  const handleStartWatching = () => {
    setIsWatching(true);
    setVideoError(null);
    setVideoLoading(true);
  };

  const handleClosePlayer = () => {
    setIsWatching(false);
    setVideoError(null);
    setVideoLoading(false);
  };

  const handleRetryVideo = () => {
    setVideoError(null);
    setVideoLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  const handleToggleMyList = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!movie || listActionLoading) return;

    setListActionLoading(true);
    setFeedbackMessage("");

    try {
      if (isInList) {
        // Remove from list
        const res = await fetch(`${apiUrl}/api/my-list/${movie.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to remove from My List");

        setIsInList(false);
        setFeedbackMessage("Removed from My List");
      } else {
        // Add to list
        const res = await fetch(`${apiUrl}/api/my-list`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            movie_id: movie.id,
          }),
        });

        if (!res.ok) throw new Error("Failed to add to My List");

        setIsInList(true);
        setFeedbackMessage("Added to My List");
      }
    } catch (err) {
      console.error("My List toggle error:", err);
      setFeedbackMessage(err.message || "Action failed");
    } finally {
      setListActionLoading(false);
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="details-loading">
        <p>Loading movie...</p>
      </div>
    );
  }

  if (error || !movie || movie.message) {
    return (
      <div className="details-loading">
        <h2>Movie not found</h2>
        <Link to="/">← Back to StreamVault</Link>
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      {/* Video Player Modal / View */}
      {isWatching && (
        <div className="player-overlay" role="dialog" aria-label="StreamVault Video Player">
          <div className="player-header">
            <button
              className="player-back-btn"
              onClick={handleClosePlayer}
              aria-label="Back to movie details"
            >
              ← Back to Details
            </button>

            <div className="player-title-info">
              <h2>{movie.title}</h2>
              <p>
                {movie.genre || "Streaming"}
                {movie.release_year ? ` • ${movie.release_year}` : ""}
              </p>
            </div>
          </div>

          <div className="player-video-wrapper">
            {videoLoading && !videoError && (
              <div className="player-status-overlay">
                <div className="player-spinner" aria-hidden="true"></div>
                <p>Loading stream...</p>
              </div>
            )}

            {videoError ? (
              <div className="player-status-overlay">
                <p className="player-error-text">⚠️ {videoError}</p>
                <div className="player-error-actions">
                  <button className="player-retry-btn" onClick={handleRetryVideo}>
                    Retry Playback
                  </button>
                  <button className="player-close-btn" onClick={handleClosePlayer}>
                    Close Player
                  </button>
                </div>
              </div>
            ) : (
              <video
                key={retryKey}
                className="player-video"
                controls
                autoPlay
                playsInline
                poster={movie.poster_url}
                onLoadStart={() => setVideoLoading(true)}
                onCanPlay={() => setVideoLoading(false)}
                onWaiting={() => setVideoLoading(true)}
                onPlaying={() => setVideoLoading(false)}
                onError={() => {
                  setVideoLoading(false);
                  setVideoError(
                    "Unable to load video stream. Please check your internet connection or try again."
                  );
                }}
              >
                {movie.video_url && (
                  <source src={movie.video_url} type="video/mp4" />
                )}
                <source src={DEFAULT_SAMPLE_VIDEO} type="video/mp4" />
                <source src={FALLBACK_SAMPLE_VIDEO} type="video/mp4" />
                Your browser does not support HTML5 video playback.
              </video>
            )}
          </div>
        </div>
      )}

      {/* Movie Details Backdrop & Info */}
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
        <Link to="/movies" className="back-button">
          ← Back to Catalog
        </Link>

        <div className="details-content">
          <p className="details-label">STREAMVAULT MOVIE</p>

          <h1>{movie.title}</h1>

          <div className="movie-meta">
            {movie.rating != null && <span>⭐ {movie.rating}</span>}
            {movie.release_year != null && <span>{movie.release_year}</span>}
            {movie.genre && <span>{movie.genre}</span>}
          </div>

          <p className="details-description">{movie.description}</p>

          <div className="details-actions">
            <button className="watch-btn" onClick={handleStartWatching}>
              ▶ Watch Now
            </button>
            <button
              className={`list-btn ${isInList ? "active-in-list" : ""}`}
              onClick={handleToggleMyList}
              disabled={listActionLoading}
              title={
                !isAuthenticated
                  ? "Sign in to add to My List"
                  : isInList
                  ? "Remove from My List"
                  : "Add to My List"
              }
            >
              {listActionLoading
                ? "Updating..."
                : isInList
                ? "✓ In My List"
                : "＋ My List"}
            </button>
          </div>

          {feedbackMessage && (
            <div className="action-feedback-toast">{feedbackMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;