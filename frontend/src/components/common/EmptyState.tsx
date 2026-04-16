"use client";

import { FileText } from "lucide-react";
import { IEmptyStateProps } from "@/types/components";
import { TableRow, TableCell } from "@/components/ui/Table";

export function EmptyState({ message, colSpan = 5 }: IEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-48 text-center border-none">
        <div className="flex flex-col items-center justify-center space-y-2 opacity-50 animate-in fade-in duration-500">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
