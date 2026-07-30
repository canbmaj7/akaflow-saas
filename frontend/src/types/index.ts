export type StudentStatus = "active" | "inactive";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type NotifyTarget = "student" | "parent";
export type AttendanceStatus = "present" | "absent" | "late";
export type HomeworkStatus = "completed" | "not_completed" | "late";

export type EducationLevel = "Lise" | "Üniversite" | "Mezun" | "Çalışan";

export type CourseType =
  | "Yapay Zeka"
  | "Veri Bilimi"
  | "Web Geliştirme"
  | "Siber Güvenlik"
  | "İngilizce";

export type PaymentMethod = "Kredi Kartı" | "Havale" | "Elden";

export interface StudentMlFields {
  birth_date: string | null;
  age: number | null;
  education_level: string | null;
  course_type: string | null;
  course_duration_weeks: number | null;
  enrolled_weeks: number | null;
  weekly_class_hours: number | null;
  total_class_hours: number | null;
  days_since_last_login: number | null;
  logins_last_30_days: number | null;
  ai_interactions_last_30_days: number | null;
  homework_completion_rate: number | null;
  satisfaction_score: number | null;
  absence_hours: number | null;
  absence_rate: number | null;
  consecutive_absences: number | null;
}

export interface Student extends StudentMlFields {
  id: string;
  academy_id: string;
  name: string;
  email: string | null;
  parent_email: string | null;
  notify_target: NotifyTarget;
  enrollment_date: string | null;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentCreate {
  name: string;
  email?: string | null;
  parent_email?: string | null;
  notify_target?: NotifyTarget;
  enrollment_date?: string | null;
  birth_date?: string | null;
  status?: StudentStatus;
  education_level?: string | null;
  course_type?: string | null;
  course_duration_weeks?: number | null;
  enrolled_weeks?: number | null;
  weekly_class_hours?: number | null;
  total_class_hours?: number | null;
  days_since_last_login?: number | null;
  logins_last_30_days?: number | null;
  ai_interactions_last_30_days?: number | null;
  homework_completion_rate?: number | null;
  satisfaction_score?: number | null;
  absence_hours?: number | null;
  absence_rate?: number | null;
  consecutive_absences?: number | null;
}

export interface StudentUpdate extends Partial<StudentCreate> {
  name?: string;
}

export interface Payment {
  id: string;
  academy_id: string;
  student_id: string;
  amount: string;
  due_date: string;
  status: PaymentStatus;
  last_delay_days: number;
  reminder_sent: boolean;
  total_fee: string | null;
  amount_paid: string | null;
  remaining_debt: string | null;
  installment_count: number | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreate {
  student_id: string;
  amount?: number;
  due_date: string;
  status?: PaymentStatus;
  last_delay_days?: number;
  total_fee?: number | null;
  amount_paid?: number | null;
  remaining_debt?: number | null;
  installment_count?: number | null;
  payment_method?: string | null;
  notes?: string | null;
}

export interface PaymentUpdate {
  student_id?: string;
  amount?: number;
  due_date?: string;
  status?: PaymentStatus;
  last_delay_days?: number;
  total_fee?: number | null;
  amount_paid?: number | null;
  remaining_debt?: number | null;
  installment_count?: number | null;
  payment_method?: string | null;
  notes?: string | null;
  reminder_sent?: boolean;
}

export interface AcademyCreate {
  name: string;
  admin_email: string;
  student_limit: number;
  package_name: string;
}

export interface AcademyUpdate {
  name?: string;
  admin_email?: string;
}

export interface Academy {
  id: string;
  name: string;
  admin_email: string;
  student_limit: number;
  package_name: string;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  academy_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  created_at: string;
}

export interface AttendanceCreate {
  student_id: string;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceUpdate {
  student_id?: string;
  date?: string;
  status?: AttendanceStatus;
}

export interface Homework {
  id: string;
  academy_id: string;
  student_id: string;
  title: string;
  due_date: string;
  status: HomeworkStatus;
  created_at: string;
}

export interface HomeworkCreate {
  student_id: string;
  title?: string;
  due_date: string;
  status: HomeworkStatus;
}

export interface HomeworkUpdate {
  student_id?: string;
  title?: string;
  due_date?: string;
  status?: HomeworkStatus;
}

export interface ChurnPrediction {
  student_id: string;
  student_name: string | null;
  churn_probability: number;
  risk_status: "Riskli" | "Güvenli";
  risk_level: "Düşük" | "Orta" | "Yüksek";
  reasons: string[];
  features: Record<string, number | string>;
}

export interface AgentResponse {
  answer: string;
}

export interface ReminderCandidate {
  payment_id: string;
  student_id: string;
  student_name: string | null;
  amount: string;
  due_date: string;
  status: PaymentStatus;
  reminder_sent: boolean;
  days_until_due: number;
  recipient_email: string | null;
  notify_target: NotifyTarget | null;
  eligible: boolean;
  ineligible_reason: string | null;
}

export const STUDENT_STATUS_LABEL: Record<StudentStatus, string> = {
  active: "Aktif",
  inactive: "Pasif",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: "Ödendi",
  pending: "Bekliyor",
  overdue: "Gecikti",
};

export const NOTIFY_TARGET_LABEL: Record<NotifyTarget, string> = {
  student: "Öğrenci",
  parent: "Veli",
};

export const HOMEWORK_STATUS_LABEL: Record<HomeworkStatus, string> = {
  completed: "Tamamlandı",
  not_completed: "Yapılmadı",
  late: "Geç teslim",
};

export const COURSE_TYPES: CourseType[] = [
  "Yapay Zeka",
  "Veri Bilimi",
  "Web Geliştirme",
  "Siber Güvenlik",
  "İngilizce",
];

export const EDUCATION_LEVELS: EducationLevel[] = [
  "Lise",
  "Üniversite",
  "Mezun",
  "Çalışan",
];

export const PAYMENT_METHODS: PaymentMethod[] = ["Kredi Kartı", "Havale", "Elden"];

export const CHURN_FEATURE_LABELS: Record<string, string> = {
  yas: "Yaş",
  dogum_tarihi: "Doğum tarihi",
  egitim_durumu: "Eğitim durumu",
  kurs_turu: "Kurs türü",
  kurs_suresi_hafta: "Kurs süresi (hafta)",
  kayitli_oldugu_hafta_sayisi: "Kayıtlı olunan hafta",
  haftalik_ders_saati: "Haftalık ders saati",
  toplam_ders_saati: "Toplam ders saati",
  devamsizlik_saati: "Devamsızlık saati",
  devamsizlik_orani: "Devamsızlık oranı",
  ust_uste_devamsizlik_sayisi: "Üst üste devamsızlık",
  toplam_ucret: "Toplam ücret",
  odenen_tutar: "Ödenen tutar",
  kalan_borc: "Kalan borç",
  taksit_sayisi: "Taksit sayısı",
  son_odeme_gecikme_gun_sayisi: "Son ödeme gecikmesi (gün)",
  odeme_yontemi: "Ödeme yöntemi",
  son_giristen_beri_gun_sayisi: "Son girişten beri (gün)",
  son_30_gun_giris_sayisi: "Son 30 gün giriş",
  son_30_gun_ai_etkilesim_sayisi: "Son 30 gün AI etkileşimi",
  tamamlanan_odev_orani: "Ödev tamamlama oranı",
  memnuniyet_skoru: "Memnuniyet skoru",
};
