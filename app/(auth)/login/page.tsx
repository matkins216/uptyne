// File: app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { loginWithPassword } from "@/app/(auth)/login/action"; // adjust path if needed

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    const result = await loginWithPassword(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      // handle error, e.g. show a message
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>Login</h1>
      <form action={loginWithPassword}>
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