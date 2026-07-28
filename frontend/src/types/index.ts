export type StudentStatus = "active" | "inactive";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type NotifyTarget = "student" | "parent";
export type AttendanceStatus = "present" | "absent" | "late";

export interface Student {
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
  status?: StudentStatus;
}

export interface StudentUpdate {
  name?: string;
  email?: string | null;
  parent_email?: string | null;
  notify_target?: NotifyTarget;
  enrollment_date?: string | null;
  status?: StudentStatus;
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
  notes?: string | null;
}

export interface PaymentUpdate {
  student_id?: string;
  amount?: number;
  due_date?: string;
  status?: PaymentStatus;
  last_delay_days?: number;
  notes?: string | null;
  reminder_sent?: boolean;
}

export interface AcademyCreate {
  name: string;
  admin_email: string;
  student_limit: number;
  package_name: string;
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
