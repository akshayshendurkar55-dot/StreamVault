const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./auth");
const authenticateToken = require("./authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error.message);
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

// Root welcome endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to StreamVault API 🎬",
    version: "1.0.0",
  });
});

// GET /api/movies - Retrieve all movies
app.get("/api/movies", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM movies ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    res.status(500).json({
      message: "Failed to fetch movies",
    });
  }
});

// GET /api/movies/:id - Retrieve movie by ID
app.get("/api/movies/:id", async (req, res) => {
  const movieId = parseInt(req.params.id, 10);

  if (isNaN(movieId)) {
    return res.status(400).json({
      message: "Invalid movie ID",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM movies WHERE id = $1",
      [movieId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch movie:", error);
    res.status(500).json({
      message: "Failed to fetch movie",
    });
  }
});

// GET /api/my-list - Retrieve movies saved to My List for the authenticated user
app.get("/api/my-list", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT movies.*
       FROM my_list
       JOIN movies ON my_list.movie_id = movies.id
       WHERE my_list.user_id = $1
       ORDER BY my_list.added_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch My List:", error);
    res.status(500).json({
      message: "Failed to fetch My List",
    });
  }
});

// GET /api/my-list/:userId - Backward compatibility with strict authorization check
app.get("/api/my-list/:userId", authenticateToken, async (req, res) => {
  const requestedUserId = parseInt(req.params.userId, 10);

  if (isNaN(requestedUserId)) {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }

  // Prevent IDOR: users can only access their own list
  if (req.user.id !== requestedUserId) {
    return res.status(403).json({
      message: "Access denied: you cannot view another user's list",
    });
  }

  try {
    const result = await pool.query(
      `SELECT movies.*
       FROM my_list
       JOIN movies ON my_list.movie_id = movies.id
       WHERE my_list.user_id = $1
       ORDER BY my_list.added_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch My List:", error);
    res.status(500).json({
      message: "Failed to fetch My List",
    });
  }
});

// POST /api/my-list - Add a movie to My List (authenticated)
app.post("/api/my-list", authenticateToken, async (req, res) => {
  const { movie_id } = req.body || {};
  const movieId = parseInt(movie_id, 10);

  if (isNaN(movieId)) {
    return res.status(400).json({
      message: "movie_id must be a valid number",
    });
  }

  const userId = req.user.id; // Securely derived from verified JWT

  try {
    // Check if the movie actually exists
    const movieCheck = await pool.query(
      "SELECT id FROM movies WHERE id = $1",
      [movieId]
    );

    if (movieCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Movie does not exist",
      });
    }

    const result = await pool.query(
      `INSERT INTO my_list (user_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, movie_id) DO NOTHING
       RETURNING *`,
      [userId, movieId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "Movie is already in My List",
        data: null,
      });
    }

    res.status(201).json({
      message: "Movie added to My List",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to add movie to My List:", error);
    res.status(500).json({
      message: "Failed to add movie to My List",
    });
  }
});

// DELETE /api/my-list/:movieId - Remove a movie from My List (authenticated)
app.delete("/api/my-list/:movieId", authenticateToken, async (req, res) => {
  const movieId = parseInt(req.params.movieId, 10);

  if (isNaN(movieId)) {
    return res.status(400).json({
      message: "movieId must be a valid number",
    });
  }

  const userId = req.user.id; // Securely derived from verified JWT

  try {
    const result = await pool.query(
      `DELETE FROM my_list
       WHERE user_id = $1 AND movie_id = $2
       RETURNING *`,
      [userId, movieId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found in My List",
      });
    }

    res.json({
      message: "Movie removed from My List",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to remove movie from My List:", error);
    res.status(500).json({
      message: "Failed to remove movie from My List",
    });
  }
});

// DELETE /api/my-list/:userId/:movieId - Backward compatibility with authorization check
app.delete("/api/my-list/:userId/:movieId", authenticateToken, async (req, res) => {
  const requestedUserId = parseInt(req.params.userId, 10);
  const movieId = parseInt(req.params.movieId, 10);

  if (isNaN(requestedUserId) || isNaN(movieId)) {
    return res.status(400).json({
      message: "userId and movieId must be valid numbers",
    });
  }

  if (req.user.id !== requestedUserId) {
    return res.status(403).json({
      message: "Access denied: you cannot modify another user's list",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM my_list
       WHERE user_id = $1 AND movie_id = $2
       RETURNING *`,
      [req.user.id, movieId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found in My List",
      });
    }

    res.json({
      message: "Movie removed from My List",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to remove movie from My List:", error);
    res.status(500).json({
      message: "Failed to remove movie from My List",
    });
  }
});

// Fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`StreamVault backend running on http://localhost:${PORT}`);
});