"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export default function AttendancePage() {
  const { accessToken } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<AttendanceStatus>("present");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!accessToken) return;
    Promise.all([api.getAttendance(accessToken), api.getStudents(accessToken)])
      .then(([a, s]) => { setRecords(a); setStudents(s); })
      .catch((e: Error) => setError(e.message));
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    try {
      await api.createAttendance(accessToken, { student_id: studentId, date, status });
      setModalOpen(false);
      setStudentId("");
      setDate("");
      setStatus("present");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    }
  }

  function openModal() {
    setError(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Devamsızlık</h1>
        <Button onClick={openModal}><Plus className="h-4 w-4" /> Kayıt ekle</Button>
      </div>
      <Card>
        {error && <p className="mb-4 text-rose-700">{error}</p>}
        <table className="min-w-full text-sm">
          <thead className="text-zinc-500"><tr><th className="py-2 text-left">Öğrenci</th><th>Tarih</th><th>Durum</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{studentMap.get(r.student_id) ?? "—"}</td>
                <td>{formatDate(r.date)}</td>
                <td><Badge>{STATUS_LABEL[r.status]}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Devamsızlık kaydı">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && modalOpen && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <Field label="Öğrenci" htmlFor="student">
            <select id="student" required value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass}>
              <option value="">Seçin</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
          <Button type="submit" className="w-full">Kaydet</Button>
        </form>
      </Modal>
    </div>
  );
}
