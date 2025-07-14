"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      // Poll for the session
      for (let i = 0; i < 10; i++) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.replace("/dashboard");
          return;
        }
        await new Promise(res => setTimeout(res, 200));
      }
      // If no session after polling, redirect to login
      router.replace("/login");
    };
    checkSession();
  }, [router]);

  return <p>Signing you in...</p>;
}
