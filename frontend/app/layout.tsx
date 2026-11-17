import "@fontsource-variable/inter";
import "./globals.css";
import type { Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export const metadata = { title: "Medical history | MedAssist AI" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body><AuthProvider><AppShell>{children}</AppShell></AuthProvider></body></html>
  );
}
