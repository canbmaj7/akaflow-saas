"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, KeyRound, Mail, Package } from "lucide-react";
import { useAcademy } from "@/components/academy-provider";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { api } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";

const PACKAGE_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

export default function SettingsPage() {
  const { accessToken, session, updatePassword } = useAuth();
  const { academy, setAcademy } = useAcademy();

  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [academyMessage, setAcademyMessage] = useState<string | null>(null);
  const [academyError, setAcademyError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingAcademy, setSavingAcademy] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (academy) {
      setName(academy.name);
      setAdminEmail(academy.admin_email);
    }
  }, [academy]);

  async function handleAcademySubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setSavingAcademy(true);
    setAcademyMessage(null);
    setAcademyError(null);
    try {
      const updated = await api.updateMyAcademy(accessToken, {
        name: name.trim(),
        admin_email: adminEmail.trim(),
      });
      setAcademy(updated);
      setAcademyMessage("Kurum bilgileri güncellendi.");
    } catch (err) {
      setAcademyError(err instanceof Error ? err.message : "Güncelleme başarısız");
    } finally {
      setSavingAcademy(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Şifreler eşleşmiyor.");
      return;
    }

    setSavingPassword(true);
    const error = await updatePassword(newPassword);
    if (error) {
      setPasswordError(error);
    } else {
      setPasswordMessage("Şifreniz güncellendi.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ayarlar</h1>
        <p className="text-sm text-slate-500">
          {academy?.name ? `${academy.name} — ` : ""}
          kurum ve hesap yönetimi
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center gap-2 text-teal-800">
            <Building2 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Kurum bilgileri</h2>
          </div>
          <form onSubmit={handleAcademySubmit} className="space-y-4">
            <Field label="Kurum / akademi adı" htmlFor="academy_name">
              <input
                id="academy_name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Örn: Anadolu Sanat Akademisi"
              />
            </Field>
            <Field label="Yönetici e-posta" htmlFor="admin_email">
              <input
                id="admin_email"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
            {academyError && <p className="text-sm text-rose-700">{academyError}</p>}
            {academyMessage && <p className="text-sm text-emerald-700">{academyMessage}</p>}
            <Button type="submit" disabled={savingAcademy}>
              {savingAcademy ? "Kaydediliyor..." : "Kurum bilgilerini kaydet"}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-2 text-teal-800">
            <KeyRound className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Şifre değiştir</h2>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field label="Giriş e-postası" htmlFor="login_email">
              <input
                id="login_email"
                type="email"
                value={session?.user.email ?? ""}
                disabled
                className={`${inputClass} bg-slate-50 text-slate-500`}
              />
            </Field>
            <Field label="Yeni şifre" htmlFor="new_password">
              <input
                id="new_password"
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Yeni şifre (tekrar)" htmlFor="confirm_password">
              <input
                id="confirm_password"
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </Field>
            {passwordError && <p className="text-sm text-rose-700">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-emerald-700">{passwordMessage}</p>}
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? "Güncelleniyor..." : "Şifreyi güncelle"}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <div className="mb-5 flex items-center gap-2 text-teal-800">
          <Package className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Abonelik</h2>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Paket</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {PACKAGE_LABEL[academy?.package_name ?? ""] ?? academy?.package_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Öğrenci limiti</dt>
            <dd className="mt-1 font-semibold text-slate-900">{academy?.student_limit ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Deneme bitişi</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {academy?.trial_ends_at ? formatDate(academy.trial_ends_at.slice(0, 10)) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Kayıt tarihi</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {academy?.created_at ? formatDate(academy.created_at.slice(0, 10)) : "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-slate-500">
          Paket yükseltme için{" "}
          <a href="/pricing" className="font-medium text-teal-700 hover:underline">
            fiyatlandırma
          </a>{" "}
          sayfasını inceleyin.
        </p>
      </Card>

      <Card className="border-slate-200 bg-slate-50/50">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-800">Giriş e-postası değişikliği</p>
            <p className="mt-1">
              Giriş e-postanızı değiştirmek için Supabase hesap doğrulaması gerekir.
              Şimdilik yalnızca şifre ve kurum bilgileri bu sayfadan güncellenebilir.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
