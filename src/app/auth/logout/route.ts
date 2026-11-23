import { redirect } from "next/navigation";
import { signOut } from "@/server/auth";

// POST only, from the header's sign-out form, so a link or image can't sign someone out. Then
// authentik's "Sign out" page signs out of every app (see signOut).
export async function POST() {
  redirect(await signOut());
}
