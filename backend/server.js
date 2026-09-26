const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./auth");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to StreamVault API 🎬",
  });
});

app.get("/api/movies", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM movies ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch movies",
    });
  }
});

app.get("/api/movies/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM movies WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }
app.post("/api/my-list", async (req, res) => {
  const { user_id, movie_id } = req.body;
app.get("/api/my-list/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT movies.*
       FROM my_list
       JOIN movies ON my_list.movie_id = movies.id
       WHERE my_list.user_id = $1
       ORDER BY my_list.added_at DESC`,
      [req.params.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch My List",
    });
  }
});
  try {
    const result = await pool.query(
      `INSERT INTO my_list (user_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, movie_id) DO NOTHING
       RETURNING *`,
      [user_id, movie_id]
    );

    res.status(201).json({
      message: "Movie added to My List",
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to add movie to My List",
    });
  }
});
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch movie",
    });
  }
});

app.listen(PORT, () => {
  console.log(`StreamVault backend running on http://localhost:${PORT}`);
});