import { notFound } from "next/navigation";
import LabClient from "./LabClient";

// Model scratch page used while building and by scripts/turntable.mjs. Dev only.
export default function Lab() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LabClient />;
}
