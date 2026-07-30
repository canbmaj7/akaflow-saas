export function calculateAge(birthDate: string, today = new Date()): number | null {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function formatAgeLabel(birthDate: string | null | undefined, age: number | null | undefined) {
  if (birthDate) {
    const computed = calculateAge(birthDate);
    if (computed != null) return `${computed} yaş`;
  }
  if (age != null) return `${age} yaş`;
  return "—";
}
