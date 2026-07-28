"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { getPackageForStudentCount } from "@/lib/pricing";
import { supabase } from "@/lib/supabase/client";

async function resolveAccessToken(initialSession: { access_token: string } | null) {
  if (initialSession?.access_token) {
    return initialSession.access_token;
  }
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    return data.session.access_token;
  }
  await new Promise((r) => setTimeout(r, 500));
  const retry = await supabase.auth.getSession();
  return retry.data.session?.access_token ?? null;
}

export default function SignupForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const initialStudents = Number(params.get("students") ?? "30");
  const initialPackage = params.get("package") ?? getPackageForStudentCount(initialStudents).slug;

  const [academyName, setAcademyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentLimit, setStudentLimit] = useState(initialStudents);
  const [packageName, setPackageName] = useState(initialPackage);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signUpError, session } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError);
      setSubmitting(false);
      return;
    }

    const token = await resolveAccessToken(session);
    if (!token) {
      setError(
        "E-posta onayı gerekli olabilir. Supabase → Authentication → Email → Confirm email kapalı olmalı (geliştirme). Onayladıktan sonra giriş yapıp /setup-academy sayfasını kullanın.",
      );
      setSubmitting(false);
      return;
    }

    try {
      await api.createAcademy(token, {
        name: academyName.trim(),
        admin_email: email.trim(),
        student_limit: studentLimit,
        package_name: packageName,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Akademi oluşturulamadı");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold">Akademi kaydı</h1>
          <p className="text-sm text-zinc-500">14 gün ücretsiz deneme ile başlayın</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="academy" className="text-sm font-medium">Akademi adı</label>
            <input
              id="academy"
              required
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Admin e-posta</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Şifre</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="limit" className="text-sm font-medium">Öğrenci limiti</label>
              <input
                id="limit"
                type="number"
                min={1}
                value={studentLimit}
                onChange={(e) => setStudentLimit(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="package" className="text-sm font-medium">Paket</label>
              <select
                id="package"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2"
              >
                <option value="starter">Başlangıç</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Kaydediliyor..." : "Kayıt ol"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Hesabınız var mı?{" "}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline">
            Giriş yap
          </Link>
        </p>
      </Card>
    </div>
  );
}
