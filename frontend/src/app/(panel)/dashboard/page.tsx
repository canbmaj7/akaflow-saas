"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useAcademy } from "@/components/academy-provider";
import { Badge, Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
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
  const { academy } = useAcademy();
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

    return {
      activeStudents,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
      pendingAmount,
      upcoming,
    };
  }, [students, payments]);

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s.name])),
    [students],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          {academy?.name ? `${academy.name} — ` : ""}
          akademi özeti ve yaklaşan ödemeler
        </p>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-slate-500">Aktif öğrenci</p><p className="mt-2 text-3xl font-semibold">{stats.activeStudents}</p></Card>
        <Card><p className="text-sm text-slate-500">Bekleyen</p><p className="mt-2 text-3xl font-semibold">{stats.pendingCount}</p></Card>
        <Card><p className="text-sm text-slate-500">Geciken</p><p className="mt-2 text-3xl font-semibold">{stats.overdueCount}</p></Card>
        <Card><p className="text-sm text-slate-500">Bekleyen tutar</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(stats.pendingAmount)}</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Yaklaşan ödemeler (7 gün)</h2>
        <div className="mt-4">
          <DataTable
            data={stats.upcoming}
            rowKey={(p) => p.id}
            emptyMessage="Kayıt yok."
            columns={[
              {
                key: "student",
                header: "Öğrenci",
                className: "w-[35%]",
                render: (p) => studentMap.get(p.student_id) ?? "—",
              },
              {
                key: "due",
                header: "Vade",
                className: "w-[20%]",
                render: (p) => formatDate(p.due_date),
              },
              {
                key: "amount",
                header: "Tutar",
                className: "w-[20%]",
                align: "right",
                render: (p) => formatCurrency(p.amount),
              },
              {
                key: "status",
                header: "Durum",
                className: "w-[25%]",
                render: (p) => (
                  <Badge tone={paymentTone(p.status)}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                ),
              },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
