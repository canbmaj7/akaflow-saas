"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment, PaymentStatus, Student } from "@/types";
import { PAYMENT_STATUS_LABEL } from "@/types";

type FormState = {
  student_id: string;
  amount: string;
  due_date: string;
  status: PaymentStatus;
  notes: string;
};

const emptyForm: FormState = {
  student_id: "",
  amount: "",
  due_date: "",
  status: "pending",
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
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(() => {
    if (!accessToken) return;
    Promise.all([api.getPayments(accessToken), api.getStudents(accessToken)])
      .then(([p, s]) => { setPayments(p); setStudents(s); })
      .catch((err: Error) => setError(err.message));
  }, [accessToken]);

  useEffect(() => { loadData(); }, [loadData]);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);

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
      notes: payment.notes ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    const payload = {
      student_id: form.student_id,
      amount: form.amount ? parseFloat(form.amount) : 0,
      due_date: form.due_date,
      status: form.status,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Ödemeler</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Yeni</Button>
      </div>
      <Card>
        {error && <p className="mb-4 text-rose-700">{error}</p>}
        <table className="min-w-full text-sm">
          <thead className="text-zinc-500"><tr><th className="py-2 text-left">Öğrenci</th><th>Vade</th><th>Tutar</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2">{studentMap.get(p.student_id) ?? "—"}</td>
                <td>{formatDate(p.due_date)}</td>
                <td>{formatCurrency(p.amount)}</td>
                <td><Badge tone={paymentTone(p.status)}>{PAYMENT_STATUS_LABEL[p.status]}</Badge></td>
                <td className="py-2">
                  <Button variant="ghost" className="h-8 px-2" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" className="h-8 px-2 text-rose-600" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Düzenle" : "Yeni ödeme"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Öğrenci" htmlFor="student_id">
            <select id="student_id" required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className={inputClass}>
              <option value="">Seçin</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
