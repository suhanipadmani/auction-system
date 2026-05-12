import { Skeleton } from "@/components/ui/Skeleton";
import { TableRow, TableCell } from "@/components/ui/Table";
import { ITableSkeletonProps } from "@/types/components";

export function TableSkeleton({ rows = 5, columns, cols }: ITableSkeletonProps) {
  // If specific column widths are provided, map over them
  if (cols && cols.length > 0) {
    return (
      <>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i} className="animate-pulse border-border/40 hover:bg-transparent">
            {cols.map((width, idx) => (
              <TableCell key={idx} className="px-6 py-4">
                <Skeleton className={`h-4 ${width}`} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  }

  // Otherwise, fallback to the opinionated layout based on column count
  const colCount = columns || 5;
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="border-border/40 hover:bg-transparent">
          {Array.from({ length: colCount }).map((_, colIdx) => (
            <TableCell key={`col-${colIdx}`} className="py-4">
              <Skeleton
                className={`h-6 ${
                  colIdx === 0
                    ? "h-10 w-full"
                    : colIdx === colCount - 1
                    ? "h-8 w-8 rounded-full ml-auto"
                    : "w-24"
                }`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
