import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number) {
  const amount = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR").format(new Date(value));
}

/** Ay seçiciden (YYYY-MM) dönem tarihine (YYYY-MM-01) */
export function monthToPeriodDate(month: string) {
  return `${month}-01`;
}

/** Dönem tarihinden (YYYY-MM-DD) ay seçici değerine (YYYY-MM) */
export function periodDateToMonth(periodDate: string) {
  return periodDate.slice(0, 7);
}
