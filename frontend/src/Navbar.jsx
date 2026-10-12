import { Link } from "react-router-dom";
import { useAuth } from "./useAuth";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        STREAMVAULT
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/my-list">My List</Link>
      </div>

      <div className="nav-auth">
        {isAuthenticated ? (
          <div className="user-profile-menu">
            <span className="user-name">
              👤 {user?.name ? user.name.split(" ")[0] : "Account"}
            </span>
            <button
              onClick={logout}
              className="signout-btn"
              title="Sign out of StreamVault"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-btn">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
