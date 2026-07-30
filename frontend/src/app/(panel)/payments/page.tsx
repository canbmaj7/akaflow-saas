"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Mail, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Field, inputClass } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment, PaymentStatus, ReminderCandidate, Student } from "@/types";
import { NOTIFY_TARGET_LABEL, PAYMENT_METHODS, PAYMENT_STATUS_LABEL } from "@/types";

type FormState = {
  student_id: string;
  amount: string;
  due_date: string;
  status: PaymentStatus;
  last_delay_days: string;
  total_fee: string;
  amount_paid: string;
  remaining_debt: string;
  installment_count: string;
  payment_method: string;
  notes: string;
};

const emptyForm: FormState = {
  student_id: "",
  amount: "",
  due_date: "",
  status: "pending",
  last_delay_days: "0",
  total_fee: "",
  amount_paid: "",
  remaining_debt: "",
  installment_count: "",
  payment_method: "",
  notes: "",
};

function paymentTone(status: PaymentStatus) {
  if (status === "paid") return "success" as const;
  if (status === "overdue") return "danger" as const;
  return "warning" as const;
}

export default function PaymentsPage() {
  const { accessToken } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [candidates, setCandidates] = useState<ReminderCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!accessToken) return;
    Promise.all([
      api.getPayments(accessToken),
      api.getStudents(accessToken),
      api.getReminderCandidates(accessToken).catch(() => [] as ReminderCandidate[]),
    ])
      .then(([p, s, c]) => {
        setPayments(p);
        setStudents(s);
        setCandidates(c);
      })
      .catch((err: Error) => setError(err.message));
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);

  const eligibleCount = useMemo(
    () => candidates.filter((c) => c.eligible).length,
    [candidates],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(payment: Payment) {
    setEditing(payment);
    setForm({
      student_id: payment.student_id,
      amount: payment.amount,
      due_date: payment.due_date,
      status: payment.status,
      last_delay_days: String(payment.last_delay_days),
      total_fee: payment.total_fee ?? "",
      amount_paid: payment.amount_paid ?? "",
      remaining_debt: payment.remaining_debt ?? "",
      installment_count: payment.installment_count != null ? String(payment.installment_count) : "",
      payment_method: payment.payment_method ?? "",
      notes: payment.notes ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setFormError(null);
    if (!form.payment_method) {
      setFormError("Ödeme yöntemi seçilmelidir.");
      setSubmitting(false);
      return;
    }
    const payload = {
      student_id: form.student_id,
      amount: form.amount ? parseFloat(form.amount) : 0,
      due_date: form.due_date,
      status: form.status,
      last_delay_days: form.last_delay_days ? parseInt(form.last_delay_days, 10) : 0,
      total_fee: form.total_fee ? parseFloat(form.total_fee) : null,
      amount_paid: form.amount_paid ? parseFloat(form.amount_paid) : null,
      remaining_debt: form.remaining_debt ? parseFloat(form.remaining_debt) : null,
      installment_count: form.installment_count ? parseInt(form.installment_count, 10) : null,
      payment_method: form.payment_method || null,
      notes: form.notes.trim() || null,
    };
    try {
      if (editing) await api.updatePayment(accessToken, editing.id, payload);
      else await api.createPayment(accessToken, payload);
      setModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Hata");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(payment: Payment) {
    if (!accessToken || !window.confirm("Silinsin mi?")) return;
    await api.deletePayment(accessToken, payment.id);
    loadData();
  }

  async function handleBulkReminders() {
    if (!accessToken) return;
    setBulkLoading(true);
    setMessage(null);
    try {
      const result = await api.runReminders(accessToken);
      setMessage(`${result.sent} hatırlatma e-postası gönderildi.`);
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gönderim başarısız");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleSingleReminder(paymentId: string) {
    if (!accessToken) return;
    setSendingId(paymentId);
    setMessage(null);
    try {
      const result = await api.sendPaymentReminder(accessToken, paymentId);
      setMessage(`${result.student_name ?? "Öğrenci"} → ${result.recipient} adresine gönderildi.`);
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gönderim başarısız");
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ödemeler</h1>
          <p className="text-sm text-slate-500">Taksit takibi, vade yönetimi ve e-posta hatırlatmaları</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Yeni ödeme
        </Button>
      </div>

      {error && <p className="text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

      <Card className="border-teal-100 bg-gradient-to-br from-teal-50/80 to-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-teal-800">
              <Bell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Ödeme hatırlatmaları</h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-600">
              Bekleyen veya geciken ödemeler için e-posta hatırlatması gönderilir.
              Kriterler: durum <strong>bekliyor/gecikti</strong>, vade <strong>bugün ile 3 gün içinde</strong>,
              daha önce hatırlatma gitmemiş, öğrenci/veli e-postası tanımlı.
            </p>
            <p className="text-sm font-medium text-teal-900">
              Gönderilmeye hazır: {eligibleCount} ödeme
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleBulkReminders}
            disabled={bulkLoading || eligibleCount === 0}
            className="shrink-0 border-teal-200 bg-white hover:bg-teal-50"
          >
            <Mail className="h-4 w-4" />
            {bulkLoading ? "Gönderiliyor..." : `Tümüne gönder (${eligibleCount})`}
          </Button>
        </div>

        <div className="mt-5">
          <DataTable
            data={candidates}
            rowKey={(row) => row.payment_id}
            emptyMessage="Hatırlatma adayı ödeme yok."
            columns={[
              {
                key: "student",
                header: "Öğrenci",
                className: "w-[22%]",
                render: (row) => row.student_name ?? "—",
              },
              {
                key: "due",
                header: "Vade",
                className: "w-[12%]",
                render: (row) => formatDate(row.due_date),
              },
              {
                key: "amount",
                header: "Tutar",
                className: "w-[12%]",
                align: "right",
                render: (row) => formatCurrency(row.amount),
              },
              {
                key: "days",
                header: "Kalan gün",
                className: "w-[10%]",
                align: "center",
                render: (row) => (
                  <span className={row.days_until_due <= 1 ? "font-semibold text-amber-700" : ""}>
                    {row.days_until_due >= 0 ? row.days_until_due : "Geçti"}
                  </span>
                ),
              },
              {
                key: "recipient",
                header: "Alıcı",
                className: "w-[22%]",
                render: (row) => (
                  <div className="truncate">
                    <p className="truncate">{row.recipient_email ?? "—"}</p>
                    {row.notify_target && (
                      <p className="text-xs text-slate-500">{NOTIFY_TARGET_LABEL[row.notify_target]}</p>
                    )}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Hatırlatma",
                className: "w-[12%]",
                render: (row) =>
                  row.reminder_sent ? (
                    <Badge tone="success">Gönderildi</Badge>
                  ) : row.eligible ? (
                    <Badge tone="warning">Bekliyor</Badge>
                  ) : (
                    <span className="text-xs text-slate-500">{row.ineligible_reason}</span>
                  ),
              },
              {
                key: "action",
                header: "İşlem",
                className: "w-[10%]",
                align: "right",
                render: (row) => (
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-teal-700"
                    disabled={!row.eligible || sendingId === row.payment_id}
                    onClick={() => handleSingleReminder(row.payment_id)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Tüm ödemeler</h2>
        <DataTable
          data={payments}
          rowKey={(p) => p.id}
          emptyMessage="Henüz ödeme kaydı yok."
          columns={[
            {
              key: "student",
              header: "Öğrenci",
              className: "w-[28%]",
              render: (p) => <span className="font-medium">{studentMap.get(p.student_id) ?? "—"}</span>,
            },
            {
              key: "due",
              header: "Vade",
              className: "w-[14%]",
              render: (p) => formatDate(p.due_date),
            },
            {
              key: "amount",
              header: "Tutar",
              className: "w-[14%]",
              align: "right",
              render: (p) => formatCurrency(p.amount),
            },
              {
                key: "method",
                header: "Yöntem",
                className: "w-[12%]",
                render: (p) => p.payment_method ?? "—",
              },
              {
                key: "status",
                header: "Durum",
                className: "w-[12%]",
              render: (p) => (
                <Badge tone={paymentTone(p.status)}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
              ),
            },
            {
              key: "reminder",
              header: "Hatırlatma",
              className: "w-[14%]",
              render: (p) =>
                p.reminder_sent ? (
                  <Badge tone="success">Gönderildi</Badge>
                ) : (
                  <span className="text-slate-400">—</span>
                ),
            },
            {
              key: "actions",
              header: "İşlem",
              className: "w-[16%]",
              align: "right",
              render: (p) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" className="h-8 px-2" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="h-8 px-2 text-rose-600" onClick={() => handleDelete(p)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Düzenle" : "Yeni ödeme"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Ödeme yöntemi ve tutar bilgileri churn analizinde kullanılır.
          </p>
          <Field label="Öğrenci" htmlFor="student_id">
            <select id="student_id" required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className={inputClass}>
              <option value="">Seçin</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Ödeme yöntemi" htmlFor="payment_method">
            <select id="payment_method" required value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className={inputClass}>
              <option value="">Seçin</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </Field>
          <Field label="Tutar" htmlFor="amount">
            <input id="amount" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Vade" htmlFor="due_date">
            <input id="due_date" type="date" required value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Durum" htmlFor="status">
            <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })} className={inputClass}>
              <option value="pending">Bekliyor</option>
              <option value="paid">Ödendi</option>
              <option value="overdue">Gecikti</option>
            </select>
          </Field>
          <Field label="Toplam ücret" htmlFor="total_fee">
            <input id="total_fee" type="number" min="0" value={form.total_fee} onChange={(e) => setForm({ ...form, total_fee: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Ödenen tutar" htmlFor="amount_paid">
            <input id="amount_paid" type="number" min="0" value={form.amount_paid} onChange={(e) => setForm({ ...form, amount_paid: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Kalan borç" htmlFor="remaining_debt">
            <input id="remaining_debt" type="number" min="0" value={form.remaining_debt} onChange={(e) => setForm({ ...form, remaining_debt: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Taksit sayısı" htmlFor="installment_count">
            <input id="installment_count" type="number" min="1" value={form.installment_count} onChange={(e) => setForm({ ...form, installment_count: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Son ödeme gecikmesi (gün)" htmlFor="last_delay_days">
            <input id="last_delay_days" type="number" min="0" value={form.last_delay_days} onChange={(e) => setForm({ ...form, last_delay_days: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Not" htmlFor="notes">
            <input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </Field>
          {formError && <p className="text-sm text-rose-700">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button type="submit" disabled={submitting}>Kaydet</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
