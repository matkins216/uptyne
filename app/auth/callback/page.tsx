"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";


export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = await createClient();
        
        // Get the session from the URL hash if present
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          // If we have tokens in the URL, set them in Supabase
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
        }
        
        // Poll for the session
        for (let i = 0; i < 10; i++) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // In production, redirect to app.uptyne.com/dashboard
            // In development, redirect to /dashboard
            if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
              // Use window.location for cross-domain redirect
              window.location.href = 'https://app.uptyne.com/dashboard';
            } else {
              router.replace("/dashboard");
            }
            return;
          }
          await new Promise(res => setTimeout(res, 200));
        }
        
        // If no session after polling, redirect to login
        const loginPath = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' 
          ? 'https://app.uptyne.com/login'
          : '/login';
        window.location.href = loginPath;
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace("/login");
      }
    };
    
    checkSession();
  }, [router]);

  return <p>Signing you in...</p>;
}
