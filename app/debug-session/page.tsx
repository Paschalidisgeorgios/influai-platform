import { redirect } from "next/navigation";
import DebugSessionClient from "./DebugSessionClient";

export default function DebugSessionPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return <DebugSessionClient />;
}
