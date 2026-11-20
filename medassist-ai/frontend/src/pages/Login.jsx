import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { errMsg } from "../api";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please enter your email and password");
    setBusy(true);
    try {
      await login(email.trim(), password, role);
      navigate("/");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Log in to MedAssist AI</h2>
      {location.state?.registered && <div className="alert success">Registration successful. Please log in.</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit}>
        <label>Login as</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="clinic">Clinic</option>
        <option value="admin">Administrator</option>
        </select>
        
        <label>Email Address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="actions">
          <button disabled={busy}>{busy ? "Signing in..." : "Login"}</button>
        </div>
      </form>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
