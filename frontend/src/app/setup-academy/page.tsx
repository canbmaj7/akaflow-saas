"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

export default function SetupAcademyPage() {
  const { accessToken, session } = useAuth();
  const router = useRouter();
  const [academyName, setAcademyName] = useState("");
  const [studentLimit, setStudentLimit] = useState(50);
  const [packageName, setPackageName] = useState("starter");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !session?.user.email) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.createAcademy(accessToken, {
        name: academyName.trim(),
        admin_email: session.user.email,
        student_limit: studentLimit,
        package_name: packageName,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Akademi oluşturulamadı");
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Giriş yapmanız gerekiyor.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Akademi kurulumu</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Hesabınız var ama akademi kaydı eksik. Bilgileri tamamlayın.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">Akademi adı</label>
            <input
              id="name"
              required
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="limit" className="text-sm font-medium">Öğrenci limiti</label>
              <input
                id="limit"
                type="number"
                min={1}
                value={studentLimit}
                onChange={(e) => setStudentLimit(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="package" className="text-sm font-medium">Paket</label>
              <select
                id="package"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
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
            {submitting ? "Kaydediliyor..." : "Akademiyi oluştur"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
