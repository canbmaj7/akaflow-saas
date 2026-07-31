"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api/client";
import { formatAgeLabel } from "@/lib/age";
import type { NotifyTarget, Student, StudentStatus } from "@/types";
import { COURSE_TYPES, EDUCATION_LEVELS, STUDENT_STATUS_LABEL } from "@/types";

type FormState = {
  name: string;
  email: string;
  parent_email: string;
  notify_target: NotifyTarget;
  birth_date: string;
  enrollment_date: string;
  course_type: string;
  education_level: string;
  status: StudentStatus;
  days_since_last_login: string;
  logins_last_30_days: string;
  ai_interactions_last_30_days: string;
  satisfaction_score: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  parent_email: "",
  notify_target: "student",
  birth_date: "",
  enrollment_date: "",
  course_type: "",
  education_level: "",
  status: "active",
  days_since_last_login: "",
  logins_last_30_days: "",
  ai_interactions_last_30_days: "",
  satisfaction_score: "",
};

export default function StudentsPage() {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>("all");
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(() => {
    if (!accessToken) return;
    api
      .getStudents(accessToken)
      .then(setStudents)
      .catch((err: Error) => setError(err.message));
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        (s.email?.toLowerCase().includes(query) ?? false) ||
        (s.parent_email?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [students, search, statusFilter]);

  const previewAge = useMemo(
    () => formatAgeLabel(form.birth_date || null, null),
    [form.birth_date],
  );

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
      birth_date: student.birth_date ?? "",
      enrollment_date: student.enrollment_date ?? "",
      course_type: student.course_type ?? "",
      education_level: student.education_level ?? "",
      status: student.status,
      days_since_last_login:
        student.days_since_last_login != null ? String(student.days_since_last_login) : "",
      logins_last_30_days:
        student.logins_last_30_days != null ? String(student.logins_last_30_days) : "",
      ai_interactions_last_30_days:
        student.ai_interactions_last_30_days != null
          ? String(student.ai_interactions_last_30_days)
          : "",
      satisfaction_score:
        student.satisfaction_score != null ? String(student.satisfaction_score) : "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setFormError(null);
    if (!form.course_type) {
      setFormError("Kurs türü seçilmelidir.");
      setSubmitting(false);
      return;
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      parent_email: form.parent_email.trim() || null,
      notify_target: form.notify_target,
      birth_date: form.birth_date || null,
      enrollment_date: form.enrollment_date || null,
      course_type: form.course_type,
      education_level: form.education_level || null,
      status: form.status,
      days_since_last_login: form.days_since_last_login
        ? parseInt(form.days_since_last_login, 10)
        : null,
      logins_last_30_days: form.logins_last_30_days
        ? parseInt(form.logins_last_30_days, 10)
        : null,
      ai_interactions_last_30_days: form.ai_interactions_last_30_days
        ? parseInt(form.ai_interactions_last_30_days, 10)
        : null,
      satisfaction_score: form.satisfaction_score
        ? parseFloat(form.satisfaction_score)
        : null,
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

  async function handleToggleStatus(student: Student) {
    if (!accessToken) return;
    const next: StudentStatus = student.status === "active" ? "inactive" : "active";
    try {
      await api.updateStudent(accessToken, student.id, { status: next });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi");
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
          <p className="text-sm text-zinc-500">
            Kayıt, kurs, profil ve churn analizi verileri. Durum sütunundaki rozete tıklayarak aktif/pasif değiştirebilirsiniz.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Yeni öğrenci
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara..."
            className={`w-full sm:max-w-xs ${inputClass}`}
          />
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map((value) => (
              <Button
                key={value}
                variant={statusFilter === value ? "primary" : "secondary"}
                className="h-8 px-3 text-xs"
                onClick={() => setStatusFilter(value)}
              >
                {value === "all" ? "Tümü" : STUDENT_STATUS_LABEL[value]}
              </Button>
            ))}
          </div>
        </div>
        {error && <p className="mb-4 text-sm text-rose-700">{error}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-zinc-500">
              <tr>
                <th className="px-2 py-2">Ad</th>
                <th className="px-2 py-2">Yaş</th>
                <th className="px-2 py-2">Kurs</th>
                <th className="px-2 py-2">Eğitim</th>
                <th className="px-2 py-2">Durum</th>
                <th className="px-2 py-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-b border-zinc-100">
                  <td className="px-2 py-3 font-medium">{student.name}</td>
                  <td className="px-2 py-3">
                    {formatAgeLabel(student.birth_date, student.age)}
                  </td>
                  <td className="px-2 py-3">{student.course_type ?? "—"}</td>
                  <td className="px-2 py-3">{student.education_level ?? "—"}</td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(student)}
                      title="Tıklayarak aktif ↔ pasif değiştir"
                      className="cursor-pointer rounded-full transition hover:opacity-80"
                    >
                      <Badge tone={student.status === "active" ? "success" : "default"}>
                        {STUDENT_STATUS_LABEL[student.status]}
                      </Badge>
                    </button>
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
          <Field label="Doğum tarihi" htmlFor="birth_date">
            <input
              id="birth_date"
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className={inputClass}
            />
            {form.birth_date && (
              <p className="mt-1 text-xs text-slate-500">Yaş: {previewAge}</p>
            )}
          </Field>
          <Field label="Eğitim durumu" htmlFor="education_level">
            <select
              id="education_level"
              value={form.education_level}
              onChange={(e) => setForm({ ...form, education_level: e.target.value })}
              className={inputClass}
            >
              <option value="">Seçin</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </Field>
          <Field label="Kurs türü" htmlFor="course_type">
            <select
              id="course_type"
              required
              value={form.course_type}
              onChange={(e) => setForm({ ...form, course_type: e.target.value })}
              className={inputClass}
            >
              <option value="">Seçin</option>
              {COURSE_TYPES.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </Field>
          <Field label="Kayıt tarihi" htmlFor="enrollment_date">
            <input
              id="enrollment_date"
              type="date"
              value={form.enrollment_date}
              onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Platform ve akademik alanlar</h3>
              <p className="mt-1 text-xs text-slate-500">
                Churn analizinde kullanılır. Devamsızlık ve ödev oranı diğer sayfalardan otomatik hesaplanır.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Son girişten beri (gün)" htmlFor="days_since_last_login">
                <input
                  id="days_since_last_login"
                  type="number"
                  min="0"
                  value={form.days_since_last_login}
                  onChange={(e) => setForm({ ...form, days_since_last_login: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Son 30 gün giriş" htmlFor="logins_last_30_days">
                <input
                  id="logins_last_30_days"
                  type="number"
                  min="0"
                  value={form.logins_last_30_days}
                  onChange={(e) => setForm({ ...form, logins_last_30_days: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Son 30 gün AI etkileşimi" htmlFor="ai_interactions_last_30_days">
                <input
                  id="ai_interactions_last_30_days"
                  type="number"
                  min="0"
                  value={form.ai_interactions_last_30_days}
                  onChange={(e) => setForm({ ...form, ai_interactions_last_30_days: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Memnuniyet skoru (1-5)" htmlFor="satisfaction_score">
                <input
                  id="satisfaction_score"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={form.satisfaction_score}
                  onChange={(e) => setForm({ ...form, satisfaction_score: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
          {editing && (
            <Field label="Öğrenci durumu" htmlFor="status">
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StudentStatus })}
                className={inputClass}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Pasif öğrenciler churn analizinde listelenmez.
              </p>
            </Field>
          )}
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
