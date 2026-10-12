# StreamVault 🎬

A Netflix-inspired movie streaming web application built with React, Node.js, Express, and PostgreSQL. StreamVault lets users explore movies, register and log in securely, and maintain a personal watchlist.

## Features

- **Movie Catalog:** Browse available movies and view individual movie details.
- **Authentication:** User registration and login with password hashing and JWT-based authentication.
- **My List:** Add and remove movies from a personal watchlist.
- **Protected APIs:** Authenticated users can access and manage only their own watchlist.
- **Database Integration:** PostgreSQL stores user accounts, movies, and watchlist data.
- **Health Check:** Backend endpoint for checking API and database connectivity.
- **Responsive UI:** React-based interface with search, filtering, loading states, and error handling.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, bcryptjs |
| Development Tools | Git, GitHub, VS Code |

## Architecture

```text
User / Browser
      |
      v
React Frontend (Vite)
      |
      v
Express REST API
      |
      v
PostgreSQL Database
```

## Prerequisites

Install the following before running the application:

- Node.js and npm
- PostgreSQL
- Git

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/akshayshendurkar55-dot/StreamVault.git
cd StreamVault
```

### 2. Configure the backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create your local environment file by copying the example:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and replace the placeholder values with your local PostgreSQL credentials and a strong, random JWT secret.

Example variable names:

```dotenv
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=streamvault
DB_PASSWORD=your_local_database_password
DB_PORT=5432
JWT_SECRET=your_long_random_secret
```

Do not commit `.env` or expose real credentials.

### 3. Configure PostgreSQL

Ensure PostgreSQL is running and the `streamvault` database exists.

The database must contain the required application tables: `users`, `movies`, and `my_list`. Use the project's database SQL files or your existing database setup to create the required schema.

**Important:** Do not reset or drop an existing database containing your data.

### 4. Start the backend

From the `backend` directory:

```bash
npm run dev
```

The backend should run at:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

### 5. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

`http://localhost:5173`

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API welcome message |
| GET | `/api/health` | Check API and database health |
| GET | `/api/movies` | Retrieve all movies |
| GET | `/api/movies/:id` | Retrieve movie details |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get the authenticated user's profile |
| GET | `/api/my-list` | Retrieve the current user's watchlist |
| POST | `/api/my-list` | Add a movie to the watchlist |
| DELETE | `/api/my-list/:movieId` | Remove a movie from the watchlist |

Authentication-protected endpoints require a valid JWT according to the backend's authentication middleware.

## Security Considerations

- Passwords are hashed using bcryptjs.
- JWTs are used to authenticate protected requests.
- SQL queries use parameterized values.
- Watchlist operations derive the user identity from the verified token.
- Environment files and secrets should never be committed to Git.

## DevOps Roadmap

Planned improvements for this project:

- Containerize the frontend, backend, and database using Docker and Docker Compose.
- Add automated checks through GitHub Actions.
- Improve environment-based configuration.
- Evaluate deployment options and hosting costs before deploying.
- Add monitoring, health checks, and deployment documentation.

## Project Status

The project is under active development. Features and deployment configuration may evolve as development and testing continue.

## Author

**Laxmikant Shendurkar**

B.Tech Computer Science Engineering student focused on Cloud Computing, AWS, Linux, and DevOps.

GitHub: [akshayshendurkar55-dot](https://github.com/akshayshendurkar55-dot)