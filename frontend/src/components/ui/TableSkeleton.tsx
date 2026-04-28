import { Skeleton } from "./Skeleton";

interface TableSkeletonProps {
  rows?: number;
  cols: string[];
}

export function TableSkeleton({ rows = 5, cols }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {cols.map((width, idx) => (
            <td key={idx} className="px-6 py-4">
              <Skeleton className={`h-4 ${width}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
