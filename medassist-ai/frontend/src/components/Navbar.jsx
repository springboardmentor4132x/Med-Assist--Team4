import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">MedAssist AI</Link>
      {user ? (
        <>
          <Link to="/">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/symptoms">Symptoms</Link>
          {user.role === "patient" && <Link to="/history">Medical History</Link>}
          {user.role === "patient" && <Link to="/sharing">Sharing</Link>}
          {(user.role === "doctor" || user.role === "clinic") && <Link to="/patients">My Patients</Link>}
          {user.role === "admin" && <Link to="/admin">Admin</Link>}
          <span className="badge">{user.role}</span>
          <button className="secondary small" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
