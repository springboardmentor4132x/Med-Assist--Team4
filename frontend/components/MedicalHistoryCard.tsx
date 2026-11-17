import { Icon } from "./Icon";
import { StatusBadge } from "./ui";
import { CATS, MedicalRecord, fmtDate } from "@/lib/medicalHistory";

export function MedicalHistoryCard({ r, canEdit, canDelete, onView, onEdit, onDelete }:
  { r: MedicalRecord; canEdit: boolean; canDelete: boolean; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const [label, icon] = CATS[r.category];
  return (
    <article className="card record">
      <div>
        <h3>{r.name}</h3>
        <div className="meta">
          <span className="cat"><Icon name={icon} />{label}</span><StatusBadge status={r.status} /><span>{fmtDate(r.onset_date)}</span>
          {r.provider && <span>{r.provider}</span>}{r.created_by_role === "doctor" && <span className="by">Added by doctor</span>}
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-ghost btn-sm" onClick={onView} aria-label={`View ${r.name}`}><Icon name="eye" /></button>
        {canEdit && <button className="btn btn-ghost btn-sm" onClick={onEdit} aria-label={`Edit ${r.name}`}><Icon name="edit" /></button>}
        {canDelete && <button className="btn btn-ghost btn-sm del" onClick={onDelete} aria-label={`Delete ${r.name}`}><Icon name="trash" /></button>}
      </div>
      {r.notes && <p className="notes">{r.notes}</p>}
    </article>
  );
}

export function MedicalHistoryTimeline({ records, render }: { records: MedicalRecord[]; render: (r: MedicalRecord) => React.ReactNode }) {
  const years = [...new Set(records.map((r) => r.onset_date.slice(0, 4)))];
  return <>{years.map((y) => (
    <section key={y} aria-labelledby={`y${y}`}>
      <h2 className="year" id={`y${y}`}>{y}</h2>
      <ol className="timeline">{records.filter((r) => r.onset_date.startsWith(y)).map((r) => <li key={r.id}>{render(r)}</li>)}</ol>
    </section>
  ))}</>;
}
