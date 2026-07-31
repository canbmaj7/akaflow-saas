"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AcademyProvider } from "@/components/academy-provider";
import { AssistantProvider } from "@/components/assistant-provider";
import { AppShell } from "@/components/app-shell";
import { api, ApiError } from "@/lib/api/client";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, session, accessToken } = useAuth();
  const router = useRouter();
  const [academyChecked, setAcademyChecked] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (!accessToken || !session) return;

    api
      .getMyAcademy(accessToken)
      .then(() => setAcademyChecked(true))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 403) {
          router.replace("/setup-academy");
          return;
        }
        setAcademyChecked(true);
      });
  }, [accessToken, session, router]);

  if (loading || (session && !academyChecked)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Yükleniyor...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AcademyProvider>
      <AssistantProvider>
        <AppShell>{children}</AppShell>
      </AssistantProvider>
    </AcademyProvider>
  );
}
