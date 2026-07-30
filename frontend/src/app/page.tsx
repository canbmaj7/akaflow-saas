import Link from "next/link";
import {
  BarChart3,
  Bell,
  Bot,
  Brain,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Users,
    title: "Öğrenci yönetimi",
    desc: "Kayıt, veli bilgisi, durum takibi ve bildirim hedefi — tek ekranda.",
  },
  {
    icon: Wallet,
    title: "Ödeme & taksit",
    desc: "Vade takibi, geciken ödemeler ve otomatik e-posta hatırlatmaları.",
  },
  {
    icon: BarChart3,
    title: "Devamsızlık analizi",
    desc: "Günlük katılım kayıtları ile öğrenci devam performansını izleyin.",
  },
  {
    icon: Brain,
    title: "Churn tahmini",
    desc: "ML modeli ile riskli öğrencileri erken tespit edin, müdahale edin.",
  },
  {
    icon: Bell,
    title: "Akıllı hatırlatmalar",
    desc: "Vadesi yaklaşan ödemeler için öğrenci veya veliye otomatik e-posta.",
  },
  {
    icon: Bot,
    title: "AI asistan",
    desc: "Doğal dilde sorun — öğrenci, ödeme ve devamsızlık verilerinizden anında yanıt alın.",
  },
];

const steps = [
  { step: "1", title: "Kayıt ol", desc: "14 gün ücretsiz deneme ile akademinizi oluşturun." },
  { step: "2", title: "Öğrenci ekle", desc: "Kayıt, ödeme ve devamsızlık verilerini girin." },
  { step: "3", title: "Yönet & analiz et", desc: "Dashboard, churn analizi ve AI asistan ile karar alın." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AkaFlow</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#ozellikler" className="hover:text-teal-700">Özellikler</a>
            <a href="#nasil-calisir" className="hover:text-teal-700">Nasıl çalışır</a>
            <Link href="/pricing" className="hover:text-teal-700">Fiyatlandırma</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Giriş
            </Link>
            <Link href="/signup">
              <Button className="bg-teal-700 hover:bg-teal-800">Ücretsiz dene</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-200">
              Eğitim kurumları için modern yönetim platformu
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Akademinizi tek panelden
              <span className="block text-teal-300">akıllıca yönetin</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              Öğrenci kayıtları, ödeme takibi, devamsızlık analizi, otomatik hatırlatmalar
              ve yapay zeka destekli churn tahmini — Excel&apos;den kurtulun.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-amber-500 px-8 py-3 text-base font-semibold text-slate-900 hover:bg-amber-400">
                  14 gün ücretsiz dene
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" className="border-white/20 bg-white/10 px-8 py-3 text-base text-white hover:bg-white/20">
                  Paketleri incele
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:gap-8">
            {[
              { value: "3-in-1", label: "Öğrenci · Ödeme · Devamsızlık" },
              { value: "ML", label: "Churn risk analizi" },
              { value: "AI", label: "Doğal dil asistan" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-teal-300 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Akademiniz için ihtiyacınız olan her şey</h2>
          <p className="mt-3 text-slate-600">Kurs merkezleri, dil okulları ve sanat akademileri için tasarlandı</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-teal-700 group-hover:bg-teal-100">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">3 adımda başlayın</h2>
            <p className="mt-3 text-slate-600">Kurulum dakikalar sürer, hemen kullanmaya başlayın</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-lg font-bold text-white">
                  {step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-teal-900 px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold">Akademinizi dijitalleştirmeye hazır mısınız?</h2>
          <p className="mx-auto mt-4 max-w-xl text-teal-100">
            14 gün boyunca tüm özellikleri ücretsiz deneyin. Kredi kartı gerekmez.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button className="bg-amber-500 px-8 py-3 text-base font-semibold text-slate-900 hover:bg-amber-400">
              Hemen başla
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <GraduationCap className="h-4 w-4 text-teal-700" />
            © {new Date().getFullYear()} AkaFlow
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/pricing" className="hover:text-teal-700">Fiyatlandırma</Link>
            <Link href="/login" className="hover:text-teal-700">Giriş</Link>
            <Link href="/signup" className="hover:text-teal-700">Kayıt ol</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
