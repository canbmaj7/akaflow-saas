# **Takım İsmi**

Takım 117

# Ürün İle İlgili Bilgiler

## Takım Elemanları

- [Ad Soyad]: Product Owner / Frontend Developer
- Ahmet Can Otlu: Scrum Master / Full-Stack Developer
- [Ad Soyad]: Data Science Developer
- [Ad Soyad]: Data Science Developer
- [Ad Soyad]: AI Agent & LLM Developer

## Ürün İsmi

--AkaFlow--

## Ürün Açıklaması

- AkaFlow; eğitim akademileri, kurs merkezleri ve butik eğitim kurumları için geliştirilmiş yapay zeka destekli akıllı bir operasyon, ödeme ve devamsızlık yönetim SaaS platformudur. Sistem, geleneksel kurs otomasyonlarından farklı olarak, arka planda çalışan makine öğrenmesi modelleriyle öğrencilerin kursu bırakma (churn) risklerini önceden tahmin eder. Aynı zamanda bünyesindeki hafızalı AI Agent altyapısı sayesinde yöneticilerin ve öğrencilerin finansal/operasyonel verilere doğal dilde erişmesini sağlar.

## Ürün Özellikleri

- Öğrenci ve kursiyer kayıt yönetimi, devamlılık takibi.
- Akademinin ödeme, taksit ve finansal nakit akışı lojistiğinin izlenmesi.
- Devamsızlık ve ödeme alışkanlıklarına göre öğrenci terk (churn) riskinin makine öğrenmesiyle tahmin edilmesi.
- Veritabanıyla entegre, doğal dildeki soruları anlayan ve yanıtlayan AI Agent asistanı.

## Hedef Kitle

- Özel kurslar ve dil okulları
- Yazılım ve teknoloji akademileri
- Butik eğitim merkezleri ve etüt salonları
- Kurs yöneticileri, eğitmenler ve öğrenciler

## Product Backlog URL

[Taiga Backlog Panomuz](Buraya Taiga linkinizi yapıştırın)

---

# Sprint 1

- **Backlog düzeni ve Story seçimleri**: 1. Sprint Backlog'umuz projenin temel altyapısını ayağa kaldıracak en öncelikli işlere (Epic ve Story'lere) göre düzenlenmiştir. Sprint puan planlaması ekibin kapasitesini aşmayacak şekilde yapılmış olup[cite: 1], kılavuz kurallarına uygun olarak tek bir Story'nin puanı toplam sprint puanının yarısından az olacak şekilde task'lere bölünmüştür[cite: 1]. Taiga panomuzda görev atamaları ve iş süreçleri şeffaf şekilde takip edilmektedir[cite: 1].

- **Daily Scrum**: Zamansal senkronizasyonu optimize etmek ve zamanı verimli kullanmak adına Daily Scrum toplantılarının Slack üzerinden yazılı olarak yapılmasına karar verilmiştir[cite: 1]. Günlük ilerlemeler, engeller (blocker) ve yapılacak işler her gün düzenli olarak raporlanmıştır[cite: 1]. Rapor örnekleri repo içerisindeki dökümantasyon klasöründe yer almaktadır[cite: 1].

- **Sprint board update**: Sprint 1 sonu güncel Taiga Kanban Board ekran görüntümüz:
![Taiga Board](ProjectManagement/Sprint1Documents/image_54511c.png)

- **Ürün Durumu**: 1. Sprint çıktısı olarak projenin teknik temelleri atılmıştır[cite: 1]. Bu sprintte **Veri Bilimi** tarafında makine öğrenmesi modelini eğitmek için sentetik veri seti üretilmiş ve bu veriyle ilk tahminleme modeli oluşturulmuştur. **AI Agent** tarafında ise LLM entegrasyonu tamamlanarak doğal dildeki soruları API üzerinden yanıtlayabilen çalışan ilk `/api/v1/agent/ask` endpoint prototipi ayağa kaldırılmıştır. Backend tarafında FastAPI ve veritabanı şemaları kurulmuştur.

  #### Veri Bilimi - Model Özellik Önem Sırası (Feature Importance)
  ![Data Science Model](ProjectManagement/Sprint1Documents/image_545848.png)
  *Eğitilen Churn modelimizde kurs türü, eğitim durumu ve ödeme yöntemi gibi metriklerin öğrencilerin kursa devamlılığı üzerindeki etkisi matematiksel olarak doğrulanmıştır.*

  #### Backend & AI Agent API Arayüzü (Swagger UI)
  ![FastAPI Swagger UI](ProjectManagement/Sprint1Documents/image_5458a4.png)
  *AkaFlow AI Agent Platformu üzerinden `/api/v1/agent/ask` endpoint'i aktif olarak sorguları kabul etmektedir.*

- **Sprint Review**: 
Yapılan toplantıda 1. Sprint hedeflerine başarıyla ulaşıldığı görülmüştür[cite: 1]. Üretilen sentetik veri setinin doğruluğu ve eğitilen modelin ilk metrikleri (Feature Importance grafiğinde görüldüğü üzere) veri bilimi ekibince doğrulanmıştır[cite: 1]. AI Agent'ın FastAPI üzerindeki ilk soru-cevap prototipinin stabil çalıştığı test edilmiştir[cite: 1]. Önümüzdeki 2. Sprint için bu ajan yapısının veritabanı şemasına (SQL Agent) bağlanması ve hafıza (memory) yönetiminin entegre edilmesi kararlaştırılmıştır[cite: 1]. Sprint Review Katılımcıları: Tüm ekip üyeleri[cite: 1].

- **Sprint Retrospective:**
  - Full-stack ve altyapı yükünün dengelenmesi adına sonraki sprintlerde frontend entegrasyonlarına daha fazla kaynak ayrılması kararlaştırılmıştır[cite: 1].
  - Veri bilimi ekibinin eğittiği modelin backend API ile entegrasyon senaryoları şimdiden netleştirilmiştir[cite: 1].
  - Daily Scrum yazışmalarının netliği ve takım içi teknik iletişim hızı oldukça verimli bulunmuş, aynı düzende devam edilmesine karar verilmiştir[cite: 1].

---

# Sprint 2


---

# Sprint 3
