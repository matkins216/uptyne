// File: app/(auth)/register/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    console.log('Register result:', { data, error });
    if (!error) {
      console.log('Registration successful, redirecting to login');
      router.push("/login");
    } else {
      console.log('Registration error:', error);
    }
  };

  const handleGoogleRegister = async () => {
    console.log('handleGoogleRegister clicked');
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Google OAuth error:', error);
    } else {
      console.log('Google OAuth initiated successfully');
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>Register</h1>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: 300 }}>
        <Label>Email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <Label>Password</Label>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        <Button onClick={handleRegister}>Register</Button>
      </form>
      <Button onClick={handleGoogleRegister} type="button" style={{ marginTop: 16, width: 300 }}>
        Register with Google
      </Button>
    </div>
  );
}