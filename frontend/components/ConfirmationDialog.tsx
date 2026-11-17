"use client";
import { Icon } from "./Icon";
import { DlgHead, useDialog } from "./ui";

export function ConfirmationDialog({ open, message, busy, onConfirm, onCancel }: { open: boolean; message: string; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  const ref = useDialog(open);
  return (
    <dialog ref={ref} className="sm" aria-labelledby="confTitle" onClose={onCancel}>
      <div className="dlg">
        <DlgHead id="confTitle" title="Delete this record?" onClose={onCancel} />
        <div className="dlg-body"><p>{message}</p></div>
        <div className="dlg-foot">
          <button className="btn" onClick={onCancel} autoFocus>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}><Icon name="trash" />{busy ? "Deleting…" : "Delete record"}</button>
        </div>
      </div>
    </dialog>
  );
}

export function ViewDialog({ record, onClose, onEdit }: { record: import("@/lib/medicalHistory").MedicalRecord | null; onClose: () => void; onEdit: ((r: import("@/lib/medicalHistory").MedicalRecord) => void) | null }) {
  const ref = useDialog(!!record);
  const r = record;
  return (
    <dialog ref={ref} aria-labelledby="viewTitle" onClose={onClose}>
      {r && <div className="dlg">
        <DlgHead id="viewTitle" title={r.name} onClose={onClose} />
        <div className="dlg-body"><dl className="detail">
          <dt>Category</dt><dd>{r.category}</dd><dt>Status</dt><dd>{r.status}</dd><dt>Date</dt><dd>{r.onset_date}</dd>
          <dt>Provider</dt><dd>{r.provider || "Not recorded"}</dd><dt>Notes</dt><dd>{r.notes || "No notes"}</dd>
        </dl></div>
        <div className="dlg-foot"><button className="btn" onClick={onClose}>Close</button>{onEdit && <button className="btn btn-primary" onClick={() => onEdit(r)}><Icon name="edit" />Edit record</button>}</div>
      </div>}
    </dialog>
  );
}
