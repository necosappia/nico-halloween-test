import type { Metadata } from "next";
import AdminPanel from "./panel";
import "./private.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Halloween · Panel privado", robots: { index: false, follow: false } };
export default function Page() { return <AdminPanel />; }
