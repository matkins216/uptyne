"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";


export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = await createClient();
      // Poll for the session
      for (let i = 0; i < 10; i++) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Create Stripe customer for new user
          try {
            await fetch('/api/user/create-stripe-customer', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: user.id, email: user.email }),
            });
          } catch (error) {
            console.error('Error creating Stripe customer:', error);
          }
          
          // In production, redirect to app.uptyne.com
          // In development, redirect to /dashboard
          if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
            window.location.href = 'https://uptyne.com/dashboard';
          } else {
            router.replace("/dashboard");
          }
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
