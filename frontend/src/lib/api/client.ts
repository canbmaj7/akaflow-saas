import type {
  Academy,
  AcademyCreate,
  AcademyUpdate,
  AgentResponse,
  Attendance,
  AttendanceCreate,
  AttendanceUpdate,
  ChurnPrediction,
  Homework,
  HomeworkCreate,
  HomeworkUpdate,
  Payment,
  PaymentCreate,
  PaymentUpdate,
  ReminderCandidate,
  Student,
  StudentCreate,
  StudentUpdate,
} from "@/types";

const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  token: string,
  path: string,
  options: RequestInit = {},
  timeoutMs = 30_000,
): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // JSON değilse statusText yeterli
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  createAcademy: (token: string, body: AcademyCreate) =>
    request<Academy>(token, "/academies", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMyAcademy: (token: string) => request<Academy>(token, "/academies/me"),

  updateMyAcademy: (token: string, body: AcademyUpdate) =>
    request<Academy>(token, "/academies/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getStudents: (token: string) => request<Student[]>(token, "/students"),
  createStudent: (token: string, body: StudentCreate) =>
    request<Student>(token, "/students", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateStudent: (token: string, id: string, body: StudentUpdate) =>
    request<Student>(token, `/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteStudent: (token: string, id: string) =>
    request<void>(token, `/students/${id}`, { method: "DELETE" }),

  getPayments: (token: string) => request<Payment[]>(token, "/payments"),
  createPayment: (token: string, body: PaymentCreate) =>
    request<Payment>(token, "/payments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePayment: (token: string, id: string, body: PaymentUpdate) =>
    request<Payment>(token, `/payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deletePayment: (token: string, id: string) =>
    request<void>(token, `/payments/${id}`, { method: "DELETE" }),

  getAttendance: (token: string) => request<Attendance[]>(token, "/attendance"),
  createAttendance: (token: string, body: AttendanceCreate) =>
    request<Attendance>(token, "/attendance", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateAttendance: (token: string, id: string, body: AttendanceUpdate) =>
    request<Attendance>(token, `/attendance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteAttendance: (token: string, id: string) =>
    request<void>(token, `/attendance/${id}`, { method: "DELETE" }),

  getHomework: (token: string) => request<Homework[]>(token, "/homework"),
  createHomework: (token: string, body: HomeworkCreate) =>
    request<Homework>(token, "/homework", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateHomework: (token: string, id: string, body: HomeworkUpdate) =>
    request<Homework>(token, `/homework/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteHomework: (token: string, id: string) =>
    request<void>(token, `/homework/${id}`, { method: "DELETE" }),

  getAllPredictions: (token: string) =>
    request<ChurnPrediction[]>(token, "/predict/all"),

  getRiskyStudents: (token: string) =>
    request<ChurnPrediction[]>(token, "/predict/risky"),

  predictStudent: (token: string, studentId: string) =>
    request<ChurnPrediction>(token, `/predict/${studentId}`),

  askAgent: (token: string, question: string) =>
    request<AgentResponse>(
      token,
      "/agent/ask",
      {
        method: "POST",
        body: JSON.stringify({ question }),
      },
      120_000,
    ),

  runReminders: (token: string) =>
    request<{ sent: number }>(token, "/reminders/run", { method: "POST" }),

  getReminderCandidates: (token: string) =>
    request<ReminderCandidate[]>(token, "/reminders/candidates"),

  sendPaymentReminder: (token: string, paymentId: string) =>
    request<{ payment_id: string; recipient: string; student_name: string | null }>(
      token,
      `/reminders/payment/${paymentId}`,
      { method: "POST" },
    ),
};
