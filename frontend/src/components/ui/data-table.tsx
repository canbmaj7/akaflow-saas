import { cn } from "@/lib/utils";

export type TableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  className?: string;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
};

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = "Kayıt yok.",
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] table-fixed text-sm">
        <colgroup>
          {columns.map((col) => (
            <col key={col.key} className={col.className} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500",
                  alignClass[col.align ?? "left"],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(
                "border-b border-zinc-100 last:border-0",
                onRowClick && "cursor-pointer hover:bg-zinc-50",
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-3 py-3 align-middle text-zinc-800",
                    alignClass[col.align ?? "left"],
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
