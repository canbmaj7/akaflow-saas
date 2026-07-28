import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <span className="text-xl font-semibold">AkaFlow</span>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Giriş
          </Link>
          <Link href="/signup">
            <Button>Ücretsiz dene</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-12">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Eğitim akademileri için akıllı operasyon platformu
          </h1>
          <p className="mt-6 text-lg text-zinc-600">
            Öğrenci takibi, ödeme yönetimi, devamsızlık analizi ve yapay zeka destekli
            churn tahmini — tek panelde.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button className="px-6 py-3 text-base">14 gün ücretsiz dene</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary" className="px-6 py-3 text-base">
                Paketleri incele
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Multi-tenant güvenlik",
              desc: "Her akademi yalnızca kendi verisini görür.",
            },
            {
              title: "Otomatik hatırlatma",
              desc: "Vadesi yaklaşan ödemeler için e-posta bildirimi.",
            },
            {
              title: "Churn analizi",
              desc: "ML modeli ile riskli öğrencileri erken tespit edin.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-zinc-200 p-6">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
