"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Field, inputClass } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api/client";
import { formatAgeLabel } from "@/lib/age";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ChurnPrediction, Payment, Student } from "@/types";
import {
  CHURN_FEATURE_LABELS,
  COURSE_TYPES,
  EDUCATION_LEVELS,
} from "@/types";

type RiskFilter = "all" | "risky" | "safe";

type DetailForm = {
  birth_date: string;
  education_level: string;
  course_type: string;
  days_since_last_login: string;
  logins_last_30_days: string;
  ai_interactions_last_30_days: string;
  satisfaction_score: string;
};

function riskTone(status: ChurnPrediction["risk_status"]) {
  return status === "Riskli" ? ("danger" as const) : ("success" as const);
}

function levelTone(level: ChurnPrediction["risk_level"]) {
  if (level === "Yüksek") return "danger" as const;
  if (level === "Orta") return "warning" as const;
  return "success" as const;
}

function formatFeatureValue(key: string, value: number | string | null | undefined) {
  if (value == null || value === "") return "—";
  if (key === "devamsizlik_orani" || key === "tamamlanan_odev_orani") {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    return `%${Math.round(num * 100)}`;
  }
  if (key === "toplam_ucret" || key === "odenen_tutar" || key === "kalan_borc") {
    return formatCurrency(String(value));
  }
  if (typeof value === "number" && !Number.isInteger(value)) {
    return value.toFixed(2);
  }
  return String(value);
}

function studentToForm(student: Student | undefined): DetailForm {
  return {
    birth_date: student?.birth_date ?? "",
    education_level: student?.education_level ?? "",
    course_type: student?.course_type ?? "",
    days_since_last_login:
      student?.days_since_last_login != null ? String(student.days_since_last_login) : "",
    logins_last_30_days:
      student?.logins_last_30_days != null ? String(student.logins_last_30_days) : "",
    ai_interactions_last_30_days:
      student?.ai_interactions_last_30_days != null
        ? String(student.ai_interactions_last_30_days)
        : "",
    satisfaction_score:
      student?.satisfaction_score != null ? String(student.satisfaction_score) : "",
  };
}

function FeatureGrid({
  title,
  items,
  readOnly = false,
  defaultKeys = [],
}: {
  title: string;
  items: { key: string; value: number | string | null | undefined }[];
  readOnly?: boolean;
  defaultKeys?: string[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {readOnly && <span className="text-xs text-slate-500">Otomatik hesaplanır</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(({ key, value }) => (
          <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
            <p className="text-xs text-slate-500">{CHURN_FEATURE_LABELS[key] ?? key}</p>
            <p className="text-sm font-medium text-slate-900">{formatFeatureValue(key, value)}</p>
            {defaultKeys.includes(key) && (
              <p className="mt-1 text-xs text-amber-700">Varsayılan değer kullanılıyor</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [predictions, setPredictions] = useState<ChurnPrediction[]>([]);
  const [filter, setFilter] = useState<RiskFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChurnPrediction | null>(null);
  const [detailForm, setDetailForm] = useState<DetailForm>(studentToForm(undefined));
  const [showDetails, setShowDetails] = useState(false);
  const [showExtendedEdit, setShowExtendedEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    Promise.all([
      api.getStudents(accessToken),
      api.getPayments(accessToken),
      api.getAllPredictions(accessToken),
    ])
      .then(([studentRows, paymentRows, predictionRows]) => {
        setStudents(studentRows.filter((s) => s.status === "active"));
        setPayments(paymentRows);
        setPredictions(predictionRows);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  );

  const paymentMethodByStudent = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const payment of payments) {
      if (payment.payment_method) {
        map.set(payment.student_id, payment.payment_method);
      }
    }
    return map;
  }, [payments]);

  const missingCourseCount = useMemo(
    () => students.filter((s) => !s.course_type).length,
    [students],
  );

  const missingPaymentMethodCount = useMemo(() => {
    let count = 0;
    for (const student of students) {
      if (!paymentMethodByStudent.get(student.id)) count += 1;
    }
    return count;
  }, [students, paymentMethodByStudent]);

  const filtered = useMemo(() => {
    if (filter === "risky") return predictions.filter((p) => p.risk_status === "Riskli");
    if (filter === "safe") return predictions.filter((p) => p.risk_status === "Güvenli");
    return predictions;
  }, [predictions, filter]);

  const stats = useMemo(() => {
    const risky = predictions.filter((p) => p.risk_status === "Riskli");
    const avg =
      predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.churn_probability, 0) / predictions.length
        : 0;
    return { active: predictions.length, riskyCount: risky.length, avgProbability: avg };
  }, [predictions]);

  function openDetail(prediction: ChurnPrediction) {
    setSelected(prediction);
    setDetailForm(studentToForm(studentMap.get(prediction.student_id)));
    setShowDetails(false);
    setShowExtendedEdit(false);
    setSaveError(null);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !selected) return;
    setSaving(true);
    setSaveError(null);
    if (!detailForm.course_type) {
      setSaveError("Kurs türü seçilmelidir.");
      setSaving(false);
      return;
    }
    try {
      await api.updateStudent(accessToken, selected.student_id, {
        birth_date: detailForm.birth_date || null,
        education_level: detailForm.education_level || null,
        course_type: detailForm.course_type || null,
        days_since_last_login: detailForm.days_since_last_login
          ? parseInt(detailForm.days_since_last_login, 10)
          : null,
        logins_last_30_days: detailForm.logins_last_30_days
          ? parseInt(detailForm.logins_last_30_days, 10)
          : null,
        ai_interactions_last_30_days: detailForm.ai_interactions_last_30_days
          ? parseInt(detailForm.ai_interactions_last_30_days, 10)
          : null,
        satisfaction_score: detailForm.satisfaction_score
          ? parseFloat(detailForm.satisfaction_score)
          : null,
      });
      const updated = await api.predictStudent(accessToken, selected.student_id);
      setSelected(updated);
      loadData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Kayıt başarısız");
    } finally {
      setSaving(false);
    }
  }

  const selectedStudent = selected ? studentMap.get(selected.student_id) : undefined;
  const selectedPaymentMethod = selected
    ? paymentMethodByStudent.get(selected.student_id)
    : undefined;
  const previewAge = formatAgeLabel(detailForm.birth_date || selectedStudent?.birth_date, selectedStudent?.age);

  const profileDefaultKeys = !selectedStudent?.course_type ? ["kurs_turu"] : [];
  const paymentDefaultKeys = !selectedPaymentMethod ? ["odeme_yontemi"] : [];

  const allDetailGroups = selected
    ? [
        {
          title: "Profil",
          items: [
            { key: "yas", value: formatAgeLabel(selectedStudent?.birth_date, selectedStudent?.age) },
            { key: "dogum_tarihi", value: selectedStudent?.birth_date ? formatDate(selectedStudent.birth_date) : null },
            { key: "egitim_durumu", value: selectedStudent?.education_level ?? null },
            { key: "kurs_turu", value: selectedStudent?.course_type ?? selected.features.kurs_turu },
            { key: "kurs_suresi_hafta", value: selected.features.kurs_suresi_hafta },
            { key: "kayitli_oldugu_hafta_sayisi", value: selected.features.kayitli_oldugu_hafta_sayisi },
          ],
          defaultKeys: profileDefaultKeys,
        },
        {
          title: "Devamsızlık",
          items: [
            { key: "haftalik_ders_saati", value: selected.features.haftalik_ders_saati },
            { key: "toplam_ders_saati", value: selected.features.toplam_ders_saati },
            { key: "devamsizlik_saati", value: selected.features.devamsizlik_saati },
            { key: "devamsizlik_orani", value: selected.features.devamsizlik_orani },
            { key: "ust_uste_devamsizlik_sayisi", value: selected.features.ust_uste_devamsizlik_sayisi },
          ],
          readOnly: true,
        },
        {
          title: "Ödeme",
          items: [
            { key: "toplam_ucret", value: selected.features.toplam_ucret },
            { key: "odenen_tutar", value: selected.features.odenen_tutar },
            { key: "kalan_borc", value: selected.features.kalan_borc },
            { key: "taksit_sayisi", value: selected.features.taksit_sayisi },
            { key: "son_odeme_gecikme_gun_sayisi", value: selected.features.son_odeme_gecikme_gun_sayisi },
            { key: "odeme_yontemi", value: selected.features.odeme_yontemi },
          ],
          defaultKeys: paymentDefaultKeys,
          readOnly: true,
        },
        {
          title: "Platform",
          items: [
            { key: "son_giristen_beri_gun_sayisi", value: selected.features.son_giristen_beri_gun_sayisi },
            { key: "son_30_gun_giris_sayisi", value: selected.features.son_30_gun_giris_sayisi },
            { key: "son_30_gun_ai_etkilesim_sayisi", value: selected.features.son_30_gun_ai_etkilesim_sayisi },
          ],
        },
        {
          title: "Akademik",
          items: [
            { key: "tamamlanan_odev_orani", value: selected.features.tamamlanan_odev_orani },
            { key: "memnuniyet_skoru", value: selected.features.memnuniyet_skoru },
          ],
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Churn Analizi</h1>
        <p className="text-sm text-slate-500">Öğrenci kaybı riski ve model verileri</p>
      </div>

      {error && <p className="text-sm text-rose-700">{error}</p>}

      <Card className="border-amber-100 bg-amber-50/60">
        <h2 className="text-sm font-semibold text-amber-950">Veriler nereden geliyor?</h2>
        <ul className="mt-2 space-y-1 text-sm text-amber-900/90">
          <li><strong>Doğum tarihi → Yaş</strong> otomatik hesaplanır (<Link href="/students" className="underline">Öğrenciler</Link>)</li>
          <li><strong>Kurs / eğitim</strong> → Öğrenci kaydında seçilir</li>
          <li><strong>Ödeme yöntemi</strong> → <Link href="/payments" className="underline">Ödemeler</Link> sayfasında seçilir</li>
          <li><strong>Devamsızlık</strong> → <Link href="/attendance" className="underline">Yoklama</Link> kayıtlarından hesaplanır</li>
          <li><strong>Ödev tamamlama</strong> → <Link href="/homework" className="underline">Ödevler</Link> sayfasından kaydedilir</li>
        </ul>
        {(missingCourseCount > 0 || missingPaymentMethodCount > 0) && (
          <p className="mt-3 text-sm font-medium text-amber-800">
            {missingCourseCount > 0 && `${missingCourseCount} öğrencide kurs türü eksik. `}
            {missingPaymentMethodCount > 0 &&
              `${missingPaymentMethodCount} öğrencide ödeme yöntemi tanımlı değil.`}
          </p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Aktif öğrenci</p><p className="mt-2 text-3xl font-semibold">{stats.active}</p></Card>
        <Card><p className="text-sm text-slate-500">Riskli öğrenci</p><p className="mt-2 text-3xl font-semibold text-rose-600">{stats.riskyCount}</p></Card>
        <Card><p className="text-sm text-slate-500">Ortalama churn olasılığı</p><p className="mt-2 text-3xl font-semibold">{Math.round(stats.avgProbability * 100)}%</p></Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Öğrenci risk listesi</h2>
          <div className="flex gap-2">
            {(["all", "risky", "safe"] as RiskFilter[]).map((value) => (
              <Button key={value} variant={filter === value ? "primary" : "secondary"} className="h-8 px-3 text-xs" onClick={() => setFilter(value)}>
                {value === "all" ? "Tümü" : value === "risky" ? "Riskli" : "Güvenli"}
              </Button>
            ))}
            <Button variant="ghost" className="h-8 px-3 text-xs" onClick={loadData}>Yenile</Button>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Tahminler yükleniyor...</p>
        ) : (
          <DataTable
            data={filtered}
            rowKey={(item) => item.student_id}
            onRowClick={openDetail}
            emptyMessage="Gösterilecek öğrenci yok."
            columns={[
              {
                key: "name",
                header: "Öğrenci",
                className: "w-[22%]",
                render: (item) => (
                  <span className="font-medium">
                    {item.student_name ?? studentMap.get(item.student_id)?.name ?? "—"}
                  </span>
                ),
              },
              {
                key: "course",
                header: "Kurs",
                className: "w-[14%]",
                render: (item) => {
                  const student = studentMap.get(item.student_id);
                  return student?.course_type ?? <span className="text-amber-700">Belirtilmedi</span>;
                },
              },
              {
                key: "age",
                header: "Yaş",
                className: "w-[8%]",
                align: "center",
                render: (item) => {
                  const student = studentMap.get(item.student_id);
                  return formatAgeLabel(student?.birth_date, student?.age);
                },
              },
              {
                key: "prob",
                header: "Olasılık",
                className: "w-[10%]",
                align: "center",
                render: (item) => `${Math.round(item.churn_probability * 100)}%`,
              },
              {
                key: "status",
                header: "Durum",
                className: "w-[10%]",
                render: (item) => <Badge tone={riskTone(item.risk_status)}>{item.risk_status}</Badge>,
              },
              {
                key: "level",
                header: "Seviye",
                className: "w-[10%]",
                render: (item) => <Badge tone={levelTone(item.risk_level)}>{item.risk_level}</Badge>,
              },
              {
                key: "reasons",
                header: "Özet neden",
                className: "w-[26%]",
                render: (item) => <span className="line-clamp-2 text-slate-600">{item.reasons[0] ?? "—"}</span>,
              },
            ]}
          />
        )}
      </Card>

      <Modal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.student_name ?? "Öğrenci detayı"}
        className="max-w-3xl"
      >
        {selected && selectedStudent && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-rose-50 px-4 py-3">
                <p className="text-xs text-rose-700">Churn olasılığı</p>
                <p className="text-2xl font-semibold text-rose-800">{Math.round(selected.churn_probability * 100)}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Risk durumu</p>
                <div className="mt-1"><Badge tone={riskTone(selected.risk_status)}>{selected.risk_status}</Badge></div>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Risk seviyesi</p>
                <div className="mt-1"><Badge tone={levelTone(selected.risk_level)}>{selected.risk_level}</Badge></div>
              </div>
            </div>

            <Card className="border-slate-200 bg-white p-4 shadow-none">
              <h3 className="text-sm font-semibold text-slate-900">Önemli göstergeler</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Yaş</p>
                  <p className="font-medium">{formatAgeLabel(selectedStudent.birth_date, selectedStudent.age)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Kurs</p>
                  <p className="font-medium">{selectedStudent.course_type ?? "Belirtilmedi"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Eğitim</p>
                  <p className="font-medium">{selectedStudent.education_level ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Devamsızlık</p>
                  <p className="font-medium">{formatFeatureValue("devamsizlik_orani", selected.features.devamsizlik_orani)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Ödeme gecikmesi</p>
                  <p className="font-medium">{selected.features.son_odeme_gecikme_gun_sayisi ?? 0} gün</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Ödev tamamlama</p>
                  <p className="font-medium">
                    {selectedStudent.homework_completion_rate != null
                      ? `%${Math.round(selectedStudent.homework_completion_rate * 100)}`
                      : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Memnuniyet</p>
                  <p className="font-medium">{selected.features.memnuniyet_skoru ?? "—"}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500">Risk açıklaması</p>
                <p className="mt-1 text-sm text-slate-700">{selected.reasons[0] ?? "—"}</p>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="mt-4 w-full justify-center gap-2"
                onClick={() => setShowDetails((open) => !open)}
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showDetails ? "Detayları gizle" : "Detaylı bilgiler (tüm kolonlar)"}
              </Button>

              {showDetails && (
                <div className="mt-4 space-y-5 border-t border-slate-100 pt-4">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">Tüm risk açıklamaları</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                      {selected.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  {allDetailGroups.map((group) => (
                    <FeatureGrid
                      key={group.title}
                      title={group.title}
                      items={group.items}
                      readOnly={group.readOnly}
                      defaultKeys={group.defaultKeys}
                    />
                  ))}
                </div>
              )}
            </Card>

            <form onSubmit={handleSave} className="space-y-4 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-900">Profil düzenle</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Doğum tarihi" htmlFor="birth_date">
                  <input
                    id="birth_date"
                    type="date"
                    value={detailForm.birth_date}
                    onChange={(e) => setDetailForm({ ...detailForm, birth_date: e.target.value })}
                    className={inputClass}
                  />
                  {(detailForm.birth_date || selectedStudent.birth_date) && (
                    <p className="mt-1 text-xs text-slate-500">Yaş: {previewAge}</p>
                  )}
                </Field>
                <Field label="Eğitim durumu" htmlFor="education_level">
                  <select
                    id="education_level"
                    value={detailForm.education_level}
                    onChange={(e) => setDetailForm({ ...detailForm, education_level: e.target.value })}
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
                    value={detailForm.course_type}
                    onChange={(e) => setDetailForm({ ...detailForm, course_type: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Seçin</option>
                    {COURSE_TYPES.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={() => setShowExtendedEdit((open) => !open)}
              >
                {showExtendedEdit ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Platform ve akademik alanlar
              </Button>

              {showExtendedEdit && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Son girişten beri (gün)" htmlFor="days_since_last_login">
                    <input id="days_since_last_login" type="number" min="0" value={detailForm.days_since_last_login} onChange={(e) => setDetailForm({ ...detailForm, days_since_last_login: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Son 30 gün giriş" htmlFor="logins_last_30_days">
                    <input id="logins_last_30_days" type="number" min="0" value={detailForm.logins_last_30_days} onChange={(e) => setDetailForm({ ...detailForm, logins_last_30_days: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Son 30 gün AI etkileşimi" htmlFor="ai_interactions_last_30_days">
                    <input id="ai_interactions_last_30_days" type="number" min="0" value={detailForm.ai_interactions_last_30_days} onChange={(e) => setDetailForm({ ...detailForm, ai_interactions_last_30_days: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Memnuniyet skoru (1-5)" htmlFor="satisfaction_score">
                    <input id="satisfaction_score" type="number" min="1" max="5" step="0.1" value={detailForm.satisfaction_score} onChange={(e) => setDetailForm({ ...detailForm, satisfaction_score: e.target.value })} className={inputClass} />
                  </Field>
                </div>
              )}

              {saveError && <p className="text-sm text-rose-700">{saveError}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setSelected(null)}>Kapat</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Kaydediliyor..." : "Kaydet ve yeniden tahmin et"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
