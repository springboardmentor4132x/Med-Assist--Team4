import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const CARDS = {
  patient: [
    ["/profile", "My Profile", "View and update your personal details"],
    ["/history", "Medical History", "Record conditions, allergies, medications"],
    ["/sharing", "Share Records", "Choose which doctors/clinics can see your history"],
  ],
  doctor: [
    ["/profile", "My Profile", "View and update your details"],
    ["/patients", "My Patients", "Patients who have authorised you"],
  ],
  clinic: [
    ["/profile", "Clinic Profile", "View and update your details"],
    ["/patients", "My Patients", "Patients who have authorised you"],
  ],
  admin: [
    ["/profile", "My Profile", "View and update your details"],
    ["/admin", "Administration", "Manage users, roles and monitor the system"],
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="container">
      <div className="card">
        <h2>Welcome, {user.full_name}</h2>
        <p className="muted">Signed in as <span className="badge">{user.role}</span></p>
      </div>
      <div className="grid">
        {(CARDS[user.role] || []).map(([to, title, text]) => (
          <Link to={to} key={to} className="card">
            <h3>{title}</h3>
            <p className="muted">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
