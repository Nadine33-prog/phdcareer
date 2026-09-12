import { cn } from "@/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: React.ReactNode;
  className?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  empty,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-line bg-paper shadow-card", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
        <thead className="sticky top-0 bg-bg">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn("border-b border-line px-4 py-2.5 font-semibold text-ink-2", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-ink-3">
                {empty ?? "暂无数据"}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-line last:border-b-0 hover:bg-primary-wash/50">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 text-ink-2", col.className)}>
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
