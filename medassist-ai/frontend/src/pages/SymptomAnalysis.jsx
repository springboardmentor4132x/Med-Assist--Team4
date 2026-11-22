import MedicalContextCard from "../components/MedicalContextCard";

export default function SymptomAnalysis() {
  return (
    <div className="container">
      <h2>Symptom Analysis</h2>
      <p className="muted" style={{ marginBottom: 16 }}>
        Review your clinical history context before proceeding to symptom assessment.
      </p>

      {/* Bhanu's Medical History Integration Component */}
      <MedicalContextCard />

      {/* Teammates' Symptom Selection & Correlation Placeholder */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Symptom Selection & Correlation</h3>
        <p className="muted">
          Your teammates' searchable symptom selector and correlation engine will plug in here.
          The medical context above will be combined with their selected symptoms for Module 3.
        </p>
      </div>
    </div>
  );
}
