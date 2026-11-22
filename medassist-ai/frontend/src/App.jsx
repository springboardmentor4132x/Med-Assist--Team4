import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MedicalHistory from "./pages/MedicalHistory";
import Sharing from "./pages/Sharing";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import AdminUsers from "./pages/AdminUsers";
import SymptomAnalysis from "./pages/SymptomAnalysis";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/symptoms" element={<ProtectedRoute><SymptomAnalysis /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute roles={["patient"]}><MedicalHistory /></ProtectedRoute>} />
        <Route path="/sharing" element={<ProtectedRoute roles={["patient"]}><Sharing /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute roles={["doctor", "clinic"]}><Patients /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute roles={["doctor", "clinic"]}><PatientDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
