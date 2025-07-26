// File: app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { loginWithPassword } from "@/app/(auth)/login/action"; // adjust path if needed

export default function LoginPage() {
  
  const router = useRouter();
  const supabase = createClient();


  const handleGoogleLogin = async () => {
    // For production, use app.uptyne.com as the redirect domain
    const redirectDomain = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' 
      ? 'https://uptyne.com' 
      : window.location.origin;
      
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectDomain}/auth/callback`
      }
    });
    if (data?.url) {
      window.location.href = data.url; // Redirect to the OAuth provider
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>Login</h1>
      <form className="flex gap-2 flex-col" action={loginWithPassword}>
        <Label>Email</Label>
        <Input name="email" />
        <Label>Password</Label>
        <Input name="password" type="password" />
        <Button type="submit">Login</Button>
      </form>
      <Button onClick={handleGoogleLogin} type="button" style={{ marginTop: 16, width: 300 }}>
        Login with Google
      </Button>
    </div>
  );
}