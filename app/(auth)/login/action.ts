"use server";
import { createClient } from "@/lib/supabase/server";

export async function loginWithPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });
  // Optionally, redirect here if needed
}
