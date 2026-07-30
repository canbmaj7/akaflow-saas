from typing import Any


def get_risk_level(probability: float, threshold: float) -> str:
    if probability < threshold:
        return "Düşük"
    if probability < 0.60:
        return "Orta"
    return "Yüksek"


def generate_risk_reasons(student: dict[str, Any]) -> list[str]:
    reasons: list[str] = []

    son_giris_gun = int(student["son_giristen_beri_gun_sayisi"])
    ust_uste_devamsizlik = int(student["ust_uste_devamsizlik_sayisi"])
    devamsizlik_orani = float(student["devamsizlik_orani"]) * 100
    odeme_gecikmesi = int(student["son_odeme_gecikme_gun_sayisi"])
    odev_orani = float(student["tamamlanan_odev_orani"]) * 100
    memnuniyet = float(student["memnuniyet_skoru"])

    toplam_ucret = float(student["toplam_ucret"])
    kalan_borc = float(student["kalan_borc"])

    if son_giris_gun >= 30:
        reasons.append(f"Öğrenci {son_giris_gun} gündür sisteme giriş yapmamış.")
    elif son_giris_gun >= 14:
        reasons.append(f"Öğrenci {son_giris_gun} gündür sisteme giriş yapmamış.")

    if ust_uste_devamsizlik >= 5:
        reasons.append(f"Üst üste devamsızlık sayısı {ust_uste_devamsizlik}.")
    elif ust_uste_devamsizlik >= 3:
        reasons.append(f"Üst üste devamsızlık sayısı {ust_uste_devamsizlik} seviyesinde.")

    if devamsizlik_orani >= 50:
        reasons.append(f"Devamsızlık oranı %{devamsizlik_orani:.0f} seviyesinde.")
    elif devamsizlik_orani >= 30:
        reasons.append(f"Devamsızlık oranı %{devamsizlik_orani:.0f} seviyesinde.")
    elif devamsizlik_orani >= 20:
        reasons.append(f"Devamsızlık oranı %{devamsizlik_orani:.0f} seviyesinde.")

    if odeme_gecikmesi >= 60:
        reasons.append(f"Son ödeme gecikmesi {odeme_gecikmesi} gün.")
    elif odeme_gecikmesi >= 30:
        reasons.append(f"Son ödeme gecikmesi {odeme_gecikmesi} gün.")
    elif odeme_gecikmesi >= 15:
        reasons.append(f"Son ödeme gecikmesi {odeme_gecikmesi} gün.")

    if odev_orani < 60:
        reasons.append(f"Ödev tamamlama oranı %{odev_orani:.0f} ile hedef seviyenin altında.")

    if memnuniyet < 2.5:
        reasons.append(f"Memnuniyet skoru {memnuniyet:.1f}/5 seviyesinde.")
    elif memnuniyet < 3:
        reasons.append(f"Memnuniyet skoru {memnuniyet:.1f}/5 seviyesinde.")

    if toplam_ucret > 0:
        kalan_borc_orani = (kalan_borc / toplam_ucret) * 100

        if kalan_borc_orani >= 50:
            reasons.append(
                f"Toplam kurs ücretinin %{kalan_borc_orani:.0f}'si hâlâ ödenmemiş durumda."
            )
        elif kalan_borc_orani >= 25:
            reasons.append(
                f"Toplam kurs ücretinin %{kalan_borc_orani:.0f}'si hâlâ ödenmemiş durumda."
            )

    if not reasons:
        reasons.append("Belirgin yüksek risk açıklaması bulunamadı.")

    return reasons
