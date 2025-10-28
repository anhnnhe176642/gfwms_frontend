"use client";

import { useState, useEffect, useRef } from "react";
import { Column } from "@tanstack/react-table";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SortButton } from "./SortButton";

type DateRangeFilterHeaderProps<TData> = {
  column: Column<TData, unknown>;
  title: string;
};

type DateRangeValue = {
  from?: string;
  to?: string;
};

/**
 * Generic date range filter header component
 * Supports filtering by date range and optional sorting
 */
export function DateRangeFilterHeader<TData>({
  column,
  title,
}: DateRangeFilterHeaderProps<TData>) {
  const [open, setOpen] = useState(false);
  const filterValue = (column.getFilterValue() as DateRangeValue) || {};
  const [tempFilterValue, setTempFilterValue] = useState<DateRangeValue>({});

  // Sync temp value when popover opens - using ref to avoid infinite loop
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Only sync when popover is opened (transition from closed to open)
      setTempFilterValue({ ...filterValue });
    }
    prevOpenRef.current = open;
  }, [open]); // Remove filterValue from deps to prevent loop

  const handleDateChange = (field: "from" | "to", value: string) => {
    setTempFilterValue((prev) => {
      const newFilter = { ...prev };
      
      if (value) {
        newFilter[field] = value;
      } else {
        delete newFilter[field];
      }
      
      return newFilter;
    });
  };

  const applyFilter = () => {
    const hasValues = tempFilterValue.from || tempFilterValue.to;
    column.setFilterValue(hasValues ? tempFilterValue : undefined);
    setOpen(false);
  };

  const clearFilter = () => {
    setTempFilterValue({});
    column.setFilterValue(undefined);
    setOpen(false);
  };

  const hasFilter = filterValue.from || filterValue.to;

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="p-0 hover:bg-transparent font-medium">
            {title}
            <Calendar
              className={`ml-2 h-4 w-4 ${hasFilter ? "text-blue-600" : "opacity-50"}`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Lọc theo khoảng thời gian</h4>
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

            <div className="space-y-2">
              <Label htmlFor="date-from" className="text-sm">
                Từ ngày
              </Label>
              <Input
                id="date-from"
                type="date"
                value={tempFilterValue.from || ""}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to" className="text-sm">
                Đến ngày
              </Label>
              <Input
                id="date-to"
                type="date"
                value={tempFilterValue.to || ""}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t">
              {(tempFilterValue.from ||
                tempFilterValue.to ||
                filterValue.from ||
                filterValue.to) && (
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
