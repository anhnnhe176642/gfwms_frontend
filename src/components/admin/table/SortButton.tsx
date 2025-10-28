"use client";

import { Column } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortButtonProps<TData> = {
  column: Column<TData, unknown>;
  label: string;
  className?: string;
};

/**
 * Reusable sort button component
 * Click to toggle between: asc → desc → asc → ...
 * Small X button appears when sorted to clear sorting
 */
export function SortButton<TData>({
  column,
  label,
  className,
}: SortButtonProps<TData>) {
  const isSorted = column.getIsSorted();
  const sortIndex = column.getSortIndex();

  const handleSort = () => {
    const currentSorting = column.getIsSorted();

    if (currentSorting === "asc") {
      column.toggleSorting(true, true); // desc, keep existing
    } else if (currentSorting === "desc") {
      column.toggleSorting(false, true); // asc, keep existing
    } else {
      column.toggleSorting(false, true); // asc, keep existing
    }
  };

  const handleClearSort = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleSort
    column.clearSorting();
  };

  return (
    <div className="relative inline-flex">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSort}
        className={className || "h-8 w-8 p-0"}
        aria-label={label}
      >
        <div className="flex items-center">
          {isSorted === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
          {isSorted && sortIndex !== -1 && (
            <span className="ml-0.5 text-xs font-bold">{sortIndex + 1}</span>
          )}
        </div>
      </Button>
      
      {/* Clear sort button - only shows when column is sorted */}
      {isSorted && (
        <button
          onClick={handleClearSort}
          className="absolute -top-0 -right-1.5 h-2.5 w-2.5 rounded-full bg-gray-400 hover:bg-gray-600 flex items-center justify-center text-white shadow-sm transition-colors"
          aria-label="Xóa sắp xếp"
          title="Xóa sắp xếp"
        >
          <X className="h-2 w-2" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
