import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data?: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  renderCard?: (row: T, index: number) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No data available',
  onRowClick,
  renderCard,
}: DataTableProps<T>) {
  return (
    <>
      {/* Mobile Card View (shown if renderCard is provided and on screen < md) */}
      {renderCard && (
        <div className="md:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-surface space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between pt-2 border-t border-border/40">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          ) : data && data.length > 0 ? (
            data.map((row, idx) => (
              <div key={idx} onClick={() => onRowClick && onRowClick(row)}>
                {renderCard(row, idx)}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-text-secondary rounded-xl border border-border bg-surface">
              {emptyMessage}
            </div>
          )}
        </div>
      )}

      {/* Desktop / Full Table View (hidden on mobile if renderCard is provided) */}
      <div
        className={`w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-sm ${
          renderCard ? 'hidden md:block' : 'block'
        }`}
      >
        <table className="w-full text-left text-sm text-text-primary">
          <thead className="border-b border-border bg-slate-800/40 uppercase text-xs font-semibold text-text-secondary tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 sm:px-6 py-3.5 font-medium ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-4 sm:px-6 py-3.5">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-slate-800/30 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 sm:px-6 py-3.5 ${col.className || ''}`}
                    >
                      {typeof col.accessorKey === 'function'
                        ? col.accessorKey(row)
                        : (row[col.accessorKey] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
