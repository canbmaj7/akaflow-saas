export type PackageTier = {
  name: string;
  slug: string;
  min: number;
  max: number;
  pricePerStudent: number;
};

export const PACKAGES: PackageTier[] = [
  { name: "Başlangıç", slug: "starter", min: 0, max: 50, pricePerStudent: 15 },
  { name: "Pro", slug: "pro", min: 51, max: 200, pricePerStudent: 12 },
  { name: "Enterprise", slug: "enterprise", min: 201, max: Infinity, pricePerStudent: 10 },
];

export function getPackageForStudentCount(count: number): PackageTier {
  return (
    PACKAGES.find((pkg) => count >= pkg.min && count <= pkg.max) ??
    PACKAGES[PACKAGES.length - 1]
  );
}

export function calculateMonthlyPrice(studentCount: number): number {
  const pkg = getPackageForStudentCount(studentCount);
  return studentCount * pkg.pricePerStudent;
}
