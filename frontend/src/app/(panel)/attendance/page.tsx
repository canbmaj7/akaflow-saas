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
import type { Attendance, AttendanceStatus, Student } from "@/types";

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Katıldı",
  absent: "Devamsız",
  late: "Geç kaldı",
};

function statusTone(status: AttendanceStatus) {
  if (status === "present") return "success" as const;
  if (status === "absent") return "danger" as const;
  return "warning" as const;
}

export default function AttendancePage() {
  const { accessToken } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<AttendanceStatus>("present");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) return;
    Promise.all([api.getAttendance(accessToken), api.getStudents(accessToken)])
      .then(([a, s]) => {
        setRecords(a);
        setStudents(s);
      })
      .catch((e: Error) => setError(e.message));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);
  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "active"),
    [students],
  );

  function resetForm() {
    setStudentId("");
    setDate("");
    setStatus("present");
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setError(null);
    setModalOpen(true);
  }

  function openEdit(record: Attendance) {
    setEditing(record);
    setStudentId(record.student_id);
    setDate(record.date);
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
      const payload = { student_id: studentId, date, status };
      if (editing) {
        await api.updateAttendance(accessToken, editing.id, payload);
      } else {
        await api.createAttendance(accessToken, payload);
      }
      closeModal();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(record: Attendance) {
    if (!accessToken) return;
    const name = studentMap.get(record.student_id) ?? "Öğrenci";
    if (!window.confirm(`${name} — ${formatDate(record.date)} kaydı silinsin mi?`)) return;
    setError(null);
    try {
      await api.deleteAttendance(accessToken, record.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silme başarısız");
    }
  }

  const formStudents = editing ? students : activeStudents;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Devamsızlık</h1>
          <p className="text-sm text-slate-500">Günlük katılım kayıtları</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Kayıt ekle
        </Button>
      </div>

      <Card>
        {error && !modalOpen && <p className="mb-4 text-sm text-rose-700">{error}</p>}
        <DataTable
          data={records}
          rowKey={(r) => r.id}
          emptyMessage="Henüz devamsızlık kaydı yok."
          columns={[
            {
              key: "student",
              header: "Öğrenci",
              className: "w-[35%]",
              render: (r) => <span className="font-medium">{studentMap.get(r.student_id) ?? "—"}</span>,
            },
            {
              key: "date",
              header: "Tarih",
              className: "w-[25%]",
              render: (r) => formatDate(r.date),
            },
            {
              key: "status",
              header: "Durum",
              className: "w-[25%]",
              render: (r) => <Badge tone={statusTone(r.status)}>{STATUS_LABEL[r.status]}</Badge>,
            },
            {
              key: "actions",
              header: "İşlem",
              className: "w-[15%]",
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
        title={editing ? "Devamsızlık düzenle" : "Devamsızlık kaydı"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && modalOpen && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <Field label="Öğrenci" htmlFor="student">
            <select id="student" required value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass}>
              <option value="">Seçin</option>
              {formStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Tarih" htmlFor="date">
            <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Durum" htmlFor="status">
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as AttendanceStatus)} className={inputClass}>
              <option value="present">Katıldı</option>
              <option value="absent">Devamsız</option>
              <option value="late">Geç kaldı</option>
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
