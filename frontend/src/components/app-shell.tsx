"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useAcademy } from "@/components/academy-provider";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Panel", icon: LayoutDashboard },
  { href: "/students", label: "Öğrenciler", shortLabel: "Öğrenci", icon: Users },
  { href: "/payments", label: "Ödemeler", shortLabel: "Ödeme", icon: Wallet },
  { href: "/attendance", label: "Devamsızlık", shortLabel: "Yoklama", icon: CalendarCheck },
  { href: "/homework", label: "Ödevler", shortLabel: "Ödev", icon: BookOpen },
  { href: "/assistant", label: "AI Asistan", shortLabel: "Asistan", icon: Bot },
  { href: "/analysis", label: "Churn Analizi", shortLabel: "Analiz", icon: LineChart },
  { href: "/settings", label: "Ayarlar", shortLabel: "Ayar", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { academy } = useAcademy();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 lg:gap-3 lg:px-6">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menü"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="hidden min-w-[5rem] sm:block">
              <p className="text-sm font-bold leading-tight text-slate-900">AkaFlow</p>
              {academy?.name && (
                <p className="max-w-[8rem] truncate text-xs font-medium text-teal-700 xl:max-w-[12rem]">
                  {academy.name}
                </p>
              )}
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-1 lg:block">
            <div className="flex items-center justify-center gap-0.5 overflow-x-auto xl:gap-1">
              {navItems.map(({ href, label, shortLabel, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors xl:gap-2 xl:px-3 xl:py-2 xl:text-sm",
                      active
                        ? "bg-teal-700 text-white"
                        : "text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="xl:hidden">{shortLabel}</span>
                    <span className="hidden xl:inline">{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden max-w-[10rem] text-right xl:block 2xl:max-w-[14rem]">
              <p className="truncate text-sm font-medium text-slate-700">
                {session?.user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs hover:bg-slate-100 xl:gap-2 xl:px-3 xl:py-2 xl:text-sm"
              title="Çıkış"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden xl:inline">Çıkış</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-slate-200 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === href
                      ? "bg-teal-700 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
