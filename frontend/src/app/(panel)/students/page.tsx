"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api/client";
import type { NotifyTarget, Student, StudentStatus } from "@/types";
import { NOTIFY_TARGET_LABEL, STUDENT_STATUS_LABEL } from "@/types";

type FormState = {
  name: string;
  email: string;
  parent_email: string;
  notify_target: NotifyTarget;
  enrollment_date: string;
  status: StudentStatus;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  parent_email: "",
  notify_target: "student",
  enrollment_date: "",
  status: "active",
};

export default function StudentsPage() {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(() => {
    if (!accessToken) return;
    api.getStudents(accessToken)
      .then(setStudents)
      .catch((err: Error) => setError(err.message));
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.email?.toLowerCase().includes(query) ?? false) ||
        (s.parent_email?.toLowerCase().includes(query) ?? false),
    );
  }, [students, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    setForm({
      name: student.name,
      email: student.email ?? "",
      parent_email: student.parent_email ?? "",
      notify_target: student.notify_target,
      enrollment_date: student.enrollment_date ?? "",
      status: student.status,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setFormError(null);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      parent_email: form.parent_email.trim() || null,
      notify_target: form.notify_target,
      enrollment_date: form.enrollment_date || null,
      status: form.status,
    };
    try {
      if (editing) {
        await api.updateStudent(accessToken, editing.id, payload);
      } else {
        await api.createStudent(accessToken, payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Kayıt başarısız");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(student: Student) {
    if (!accessToken || !window.confirm(`"${student.name}" silinsin mi?`)) return;
    try {
      await api.deleteStudent(accessToken, student.id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silme başarısız");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Öğrenciler</h1>
          <p className="text-sm text-zinc-500">Kayıt, veli bilgisi ve bildirim hedefi</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Yeni öğrenci
        </Button>
      </div>

      <Card>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara..."
          className={`mb-4 w-full ${inputClass}`}
        />
        {error && <p className="mb-4 text-sm text-rose-700">{error}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-zinc-500">
              <tr>
                <th className="px-2 py-2">Ad</th>
                <th className="px-2 py-2">E-posta</th>
                <th className="px-2 py-2">Veli</th>
                <th className="px-2 py-2">Bildirim</th>
                <th className="px-2 py-2">Durum</th>
                <th className="px-2 py-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-b border-zinc-100">
                  <td className="px-2 py-3 font-medium">{student.name}</td>
                  <td className="px-2 py-3">{student.email ?? "—"}</td>
                  <td className="px-2 py-3">{student.parent_email ?? "—"}</td>
                  <td className="px-2 py-3">{NOTIFY_TARGET_LABEL[student.notify_target]}</td>
                  <td className="px-2 py-3">
                    <Badge tone={student.status === "active" ? "success" : "default"}>
                      {STUDENT_STATUS_LABEL[student.status]}
                    </Badge>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" className="h-8 px-2" onClick={() => openEdit(student)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" className="h-8 px-2 text-rose-600" onClick={() => handleDelete(student)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Düzenle" : "Yeni öğrenci"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Ad soyad" htmlFor="name">
            <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Öğrenci e-posta" htmlFor="email">
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Veli e-posta" htmlFor="parent_email">
            <input id="parent_email" type="email" value={form.parent_email} onChange={(e) => setForm({ ...form, parent_email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Hatırlatma gönder" htmlFor="notify_target">
            <select id="notify_target" value={form.notify_target} onChange={(e) => setForm({ ...form, notify_target: e.target.value as NotifyTarget })} className={inputClass}>
              <option value="student">Öğrenci</option>
              <option value="parent">Veli</option>
            </select>
          </Field>
          {formError && <p className="text-sm text-rose-700">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "..." : "Kaydet"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
