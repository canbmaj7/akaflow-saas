"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment, Student } from "@/types";
import { PAYMENT_STATUS_LABEL } from "@/types";

function paymentTone(status: Payment["status"]) {
  if (status === "paid") return "success" as const;
  if (status === "overdue") return "danger" as const;
  return "warning" as const;
}

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([api.getStudents(accessToken), api.getPayments(accessToken)])
      .then(([studentRows, paymentRows]) => {
        setStudents(studentRows);
        setPayments(paymentRows);
      })
      .catch((err: Error) => setError(err.message));
  }, [accessToken]);

  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.status === "active").length;
    const pendingPayments = payments.filter((p) => p.status === "pending");
    const overduePayments = payments.filter((p) => p.status === "overdue");
    const pendingAmount = pendingPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );
    const today = new Date();
    const upcoming = payments
      .filter((p) => {
        if (p.status === "paid") return false;
        const diff = (new Date(p.due_date).getTime() - today.getTime()) / 86400000;
        return diff >= 0 && diff <= 7;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    return { activeStudents, pendingCount: pendingPayments.length, overdueCount: overduePayments.length, pendingAmount, upcoming };
  }, [students, payments]);

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s.name])),
    [students],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-500">Akademi özeti ve yaklaşan ödemeler</p>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-zinc-500">Aktif öğrenci</p><p className="mt-2 text-3xl font-semibold">{stats.activeStudents}</p></Card>
        <Card><p className="text-sm text-zinc-500">Bekleyen</p><p className="mt-2 text-3xl font-semibold">{stats.pendingCount}</p></Card>
        <Card><p className="text-sm text-zinc-500">Geciken</p><p className="mt-2 text-3xl font-semibold">{stats.overdueCount}</p></Card>
        <Card><p className="text-sm text-zinc-500">Bekleyen tutar</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(stats.pendingAmount)}</p></Card>
      </div>
      <Card>
        <h2 className="text-lg font-semibold">Yaklaşan ödemeler (7 gün)</h2>
        {stats.upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Kayıt yok.</p>
        ) : (
          <table className="mt-4 min-w-full text-sm">
            <thead><tr className="text-zinc-500"><th className="py-2 text-left">Öğrenci</th><th>Vade</th><th>Tutar</th><th>Durum</th></tr></thead>
            <tbody>
              {stats.upcoming.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{studentMap.get(p.student_id) ?? "—"}</td>
                  <td>{formatDate(p.due_date)}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td><Badge tone={paymentTone(p.status)}>{PAYMENT_STATUS_LABEL[p.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
