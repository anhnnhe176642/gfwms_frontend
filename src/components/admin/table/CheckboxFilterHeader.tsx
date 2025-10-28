"use client";

import { useState, useEffect, useId, useRef } from "react";
import { Column } from "@tanstack/react-table";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SortButton } from "./SortButton";

export type CheckboxFilterOption = {
  value: string;
  label: string;
};

type CheckboxFilterHeaderProps<TData> = {
  column: Column<TData, unknown>;
  title: string;
  options: CheckboxFilterOption[];
};

/**
 * Generic checkbox filter header component
 * Supports multi-select filtering with checkboxes and optional sorting
 */
export function CheckboxFilterHeader<TData>({
  column,
  title,
  options,
}: CheckboxFilterHeaderProps<TData>) {
  const [open, setOpen] = useState(false);
  const filterValue = (column.getFilterValue() as string[]) || [];
  const [tempFilterValue, setTempFilterValue] = useState<string[]>([]);
  const componentId = useId();

  // Sync temp value when popover opens - using ref to avoid infinite loop
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Only sync when popover is opened (transition from closed to open)
      setTempFilterValue([...filterValue]);
    }
    prevOpenRef.current = open;
  }, [open]); // Remove filterValue from deps to prevent loop

  const toggleTempFilter = (value: string) => {
    setTempFilterValue((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const applyFilter = () => {
    column.setFilterValue(tempFilterValue.length > 0 ? tempFilterValue : undefined);
    setOpen(false);
  };

  const clearFilter = () => {
    setTempFilterValue([]);
    column.setFilterValue(undefined);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="p-0 hover:bg-transparent font-medium">
            {title}
            <Filter
              className={`ml-2 h-4 w-4 ${
                filterValue.length > 0 ? "text-blue-600" : "opacity-50"
              }`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Lọc {title.toLowerCase()}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {options.map((option) => {
                const checkboxId = `${componentId}-${option.value}`;
                return (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={tempFilterValue.includes(option.value)}
                      onCheckedChange={() => toggleTempFilter(option.value)}
                    />
                    <Label
                      htmlFor={checkboxId}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-3 pt-2 border-t">
              {(tempFilterValue.length > 0 || filterValue.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  className="flex-1"
                >
                  Xóa
                </Button>
              )}
              <Button size="sm" onClick={applyFilter} className="flex-1">
                Áp dụng
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <SortButton
        column={column}
        label={`Sắp xếp theo ${title.toLowerCase()}`}
      />
    </div>
  );
}
