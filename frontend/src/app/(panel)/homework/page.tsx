"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Field, inputClass } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { Homework, HomeworkStatus, Student } from "@/types";
import { HOMEWORK_STATUS_LABEL } from "@/types";

function statusTone(status: HomeworkStatus) {
  if (status === "completed") return "success" as const;
  if (status === "not_completed") return "danger" as const;
  return "warning" as const;
}

export default function HomeworkPage() {
  const { accessToken } = useAuth();
  const [records, setRecords] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Homework | null>(null);
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("Ödev");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<HomeworkStatus>("completed");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) return;
    Promise.all([api.getHomework(accessToken), api.getStudents(accessToken)])
      .then(([homeworkRows, studentRows]) => {
        setRecords(homeworkRows);
        setStudents(studentRows);
      })
      .catch((e: Error) => setError(e.message));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "active"),
    [students],
  );

  function resetForm() {
    setStudentId("");
    setTitle("Ödev");
    setDueDate("");
    setStatus("completed");
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setError(null);
    setModalOpen(true);
  }

  function openEdit(record: Homework) {
    setEditing(record);
    setStudentId(record.student_id);
    setTitle(record.title);
    setDueDate(record.due_date);
    setStatus(record.status);
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    resetForm();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        student_id: studentId,
        title: title.trim() || "Ödev",
        due_date: dueDate,
        status,
      };
      if (editing) {
        await api.updateHomework(accessToken, editing.id, payload);
      } else {
        await api.createHomework(accessToken, payload);
      }
      closeModal();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(record: Homework) {
    if (!accessToken) return;
    const name = studentMap.get(record.student_id)?.name ?? "Öğrenci";
    if (!window.confirm(`"${record.title}" (${name}) silinsin mi?`)) return;
    setError(null);
    try {
      await api.deleteHomework(accessToken, record.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silme başarısız");
    }
  }

  const formStudents = editing ? students : activeStudents;

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ödevler</h1>
          <p className="text-sm text-slate-500">
            Ödev kayıtlarından tamamlama oranı otomatik hesaplanır (churn modeli için)
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Ödev ekle
        </Button>
      </div>

      <Card className="border-teal-100 bg-teal-50/50 p-4">
        <p className="text-sm text-teal-900">
          Her ödev kaydı öğrencinin <strong>tamamlanan_odev_orani</strong> değerini günceller.
          Tamamlandı = 1, geç teslim = 0.5, yapılmadı = 0 puan.
        </p>
      </Card>

      <Card>
        {error && !modalOpen && <p className="mb-4 text-sm text-rose-700">{error}</p>}
        <DataTable
          data={records}
          rowKey={(r) => r.id}
          emptyMessage="Henüz ödev kaydı yok."
          columns={[
            {
              key: "student",
              header: "Öğrenci",
              className: "w-[25%]",
              render: (r) => (
                <span className="font-medium">{studentMap.get(r.student_id)?.name ?? "—"}</span>
              ),
            },
            {
              key: "title",
              header: "Başlık",
              className: "w-[20%]",
              render: (r) => r.title,
            },
            {
              key: "due",
              header: "Vade",
              className: "w-[15%]",
              render: (r) => formatDate(r.due_date),
            },
            {
              key: "rate",
              header: "Öğrenci oranı",
              className: "w-[15%]",
              align: "center",
              render: (r) => {
                const rate = studentMap.get(r.student_id)?.homework_completion_rate;
                return rate != null ? `%${Math.round(rate * 100)}` : "—";
              },
            },
            {
              key: "status",
              header: "Durum",
              className: "w-[15%]",
              render: (r) => (
                <Badge tone={statusTone(r.status)}>{HOMEWORK_STATUS_LABEL[r.status]}</Badge>
              ),
            },
            {
              key: "actions",
              header: "İşlem",
              className: "w-[10%]",
              render: (r) => (
                <div className="flex gap-1">
                  <Button variant="ghost" className="h-8 px-2" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="h-8 px-2 text-rose-600" onClick={() => handleDelete(r)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Ödev düzenle" : "Ödev kaydı"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && modalOpen && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <Field label="Öğrenci" htmlFor="student">
            <select
              id="student"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={inputClass}
            >
              <option value="">Seçin</option>
              {formStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Ödev başlığı" htmlFor="title">
            <input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Vade tarihi" htmlFor="due_date">
            <input
              id="due_date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Durum" htmlFor="status">
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as HomeworkStatus)}
              className={inputClass}
            >
              <option value="completed">Tamamlandı</option>
              <option value="late">Geç teslim</option>
              <option value="not_completed">Yapılmadı</option>
            </select>
          </Field>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Kaydediliyor..." : editing ? "Güncelle" : "Kaydet"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
