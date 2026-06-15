import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  emptyMessage = '暂无数据',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn(
      'bg-white rounded-2xl shadow-lg shadow-black/5 overflow-hidden border border-white/50',
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#0A2463] to-[#1A1A2E] text-white">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={cn(
                    'px-6 py-4 text-left text-sm font-semibold whitespace-nowrap',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8F0]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-[#4A4A6A]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-[#F5F5FA] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      className={cn(
                        'px-6 py-4 text-sm text-[#1A1A2E] whitespace-nowrap',
                        col.className
                      )}
                    >
                      {col.accessor ? col.accessor(row) : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
