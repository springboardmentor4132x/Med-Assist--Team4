import type { IconName } from "@/components/Icon";

export type Category = "chronic" | "surgery" | "allergy" | "immunization" | "injury" | "other";
export type Status = "active" | "managed" | "resolved";
export type GrantStatus = "pending" | "approved" | "denied" | "revoked";
export interface MedicalRecord {
  id: number; patient_id: number; name: string; category: Category; status: Status; onset_date: string;
  provider?: string | null; notes?: string | null; created_by: number; created_by_role: string;
}
export type RecordInput = Omit<MedicalRecord, "id" | "patient_id" | "created_by" | "created_by_role">;
export interface AccessGrant {
  id: number; patient_id: number; doctor_id: number; doctor_name?: string | null; status: GrantStatus;
  categories: Category[] | null; message?: string | null; created_at: string;
}

export const CATS: Record<Category, [string, IconName]> = {
  chronic: ["Chronic condition", "pulse"], surgery: ["Surgery", "scalpel"], allergy: ["Allergy", "alert"],
  immunization: ["Immunization", "shield"], injury: ["Injury", "heart"], other: ["Other", "list"],
};
export const STATUS: Record<Status, [string, string, IconName]> = {
  active: ["Active", "b-active", "dot"], managed: ["Managed", "b-managed", "clock"], resolved: ["Resolved", "b-resolved", "check"],
};
export const ALL_CATS = Object.keys(CATS) as Category[];
export const catNames = (c: Category[] | null) => (c ? c.map((x) => CATS[x][0]).join(", ") : "all record types");
export const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";
export class ApiError extends Error { constructor(msg: string, public status: number) { super(msg); } }

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null; // INTEGRATION: your auth module's token
  const res = await fetch(`${BASE}${path}`, {
    ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new ApiError(typeof d.detail === "string" ? d.detail : d.detail?.[0]?.msg ?? `Request failed (${res.status})`, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
const body = (b: unknown) => JSON.stringify(b);
export const api = {
  list: (pid: number) => req<MedicalRecord[]>(`/patients/${pid}/medical-history`),
  create: (pid: number, b: RecordInput) => req<MedicalRecord>(`/patients/${pid}/medical-history`, { method: "POST", body: body(b) }),
  update: (id: number, b: RecordInput) => req<MedicalRecord>(`/medical-history/${id}`, { method: "PUT", body: body(b) }),
  remove: (id: number) => req<void>(`/medical-history/${id}`, { method: "DELETE" }),
  requests: () => req<AccessGrant[]>("/access-requests"),
  requestAccess: (pid: number, message = "") => req<AccessGrant>(`/patients/${pid}/access-requests`, { method: "POST", body: body({ message: message || null }) }),
  decide: (id: number, action: "approve" | "deny" | "revoke", categories: Category[] | null = null) =>
    req<AccessGrant>(`/access-requests/${id}/decision`, { method: "POST", body: body({ action, categories }) }),
};
