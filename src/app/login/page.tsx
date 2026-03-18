// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // เรียกใช้งาน NextAuth เพื่อตรวจสอบรหัสผ่าน
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else {
      router.push("/"); // ล็อกอินผ่าน ให้เด้งกลับไปหน้าร้าน
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-100">
      <Card className="w-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-zinc-800">
            เข้าสู่ระบบ POS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label>อีเมล</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <Label>รหัสผ่าน</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
            >
              เข้าสู่ระบบ
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
