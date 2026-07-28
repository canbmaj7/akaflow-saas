import type {
  Academy,
  AcademyCreate,
  Attendance,
  AttendanceCreate,
  Payment,
  PaymentCreate,
  PaymentUpdate,
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
): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
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
};
