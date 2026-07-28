import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2";

export function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
