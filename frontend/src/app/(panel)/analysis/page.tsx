"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api/client";
import { formatAgeLabel } from "@/lib/age";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ChurnPrediction, Payment, Student } from "@/types";
import { CHURN_FEATURE_LABELS } from "@/types";

type RiskFilter = "all" | "risky" | "safe";

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
  const [showDetails, setShowDetails] = useState(false);

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
    setShowDetails(false);
  }

  const selectedStudent = selected ? studentMap.get(selected.student_id) : undefined;
  const selectedPaymentMethod = selected
    ? paymentMethodByStudent.get(selected.student_id)
    : undefined;

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

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" type="button" onClick={() => setSelected(null)}>
                Kapat
              </Button>
              <Link href="/students">
                <Button type="button">Öğrenciyi düzenle</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
