"use client";

import Link from "next/link";
import { useState } from "react";
import { PACKAGES, calculateMonthlyPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PricingPage() {
  const [studentCount, setStudentCount] = useState(30);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Ana sayfa
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Paketler</h1>
          <p className="mt-2 text-zinc-600">Öğrenci sayınıza göre dinamik fiyatlandırma</p>
        </div>

        <Card className="mb-8">
          <label htmlFor="count" className="text-sm font-medium">
            Öğrenci sayısı: {studentCount}
          </label>
          <input
            id="count"
            type="range"
            min={1}
            max={300}
            value={studentCount}
            onChange={(e) => setStudentCount(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <p className="mt-4 text-2xl font-semibold">
            Tahmini aylık: {formatCurrency(calculateMonthlyPrice(studentCount))}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <Card key={pkg.slug} className="flex flex-col">
              <h2 className="text-lg font-semibold">{pkg.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {pkg.min}–{pkg.max === Infinity ? "∞" : pkg.max} öğrenci
              </p>
              <p className="mt-4 text-2xl font-bold">
                {formatCurrency(pkg.pricePerStudent)}
                <span className="text-sm font-normal text-zinc-500"> / öğrenci</span>
              </p>
              <Link href={`/signup?students=${studentCount}&package=${pkg.slug}`} className="mt-auto pt-6">
                <Button className="w-full">Seç</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
