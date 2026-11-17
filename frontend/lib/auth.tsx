"use client";
// INTEGRATION: swap for the team's real auth context. Needs { id, role, name } and a token in localStorage("token").
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { BASE } from "./medicalHistory";

export type Role = "patient" | "doctor" | "admin";
export interface User { id: number; role: Role; name: string }
const Ctx = createContext<{ user: User | null; switchRole: (r: Role) => Promise<void> }>({ user: null, switchRole: async () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const login = useCallback(async (role: Role) => {
    const r = await fetch(`${BASE}/auth/dev-login?role=${role}`, { method: "POST" });
    const d = await r.json();
    localStorage.setItem("token", d.token); localStorage.setItem("role", role); setUser(d.user);
  }, []);
  useEffect(() => { login((localStorage.getItem("role") as Role) || "patient").catch(() => {}); }, [login]);
  return <Ctx.Provider value={{ user, switchRole: login }}>{children}</Ctx.Provider>;
}
