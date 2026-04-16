"use client";

import { ITableSkeletonProps } from "@/types/components";

import { TableRow, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";

export function TableSkeleton({ rows = 5, columns = 5 }: ITableSkeletonProps) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={`skeleton-${i}`} className="border-border/40">
      {Array.from({ length: columns }).map((_, colIdx) => (
        <TableCell key={`col-${colIdx}`} className="py-4">
          <Skeleton
            className={`h-6 ${colIdx === 0 ? 'h-10 w-full' : colIdx === columns - 1 ? 'h-8 w-8 rounded-full ml-auto' : 'w-24'}`}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}
