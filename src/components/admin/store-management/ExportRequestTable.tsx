'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createExportRequestColumns } from './exportRequestColumns';
import { fabricService } from '@/services/fabric.service';
import { exportFabricService } from '@/services/exportFabric.service';
import { useServerTable } from '@/hooks/useServerTable';
import { getServerErrorMessage, extractFieldErrors } from '@/lib/errorHandler';
import type { FabricListItem, FabricListParams } from '@/types/fabric';
import { Search, RefreshCw, ArrowLeft, Send, ShoppingCart } from 'lucide-react';
import { ExportRequestPreviewDialog } from './ExportRequestPreviewDialog';

export type ExportRequestItem = {
  fabricId: number;
  quantity: number;
  fabric: FabricListItem;
};

type QuantityError = {
  message: string;
  type: 'empty' | 'invalid' | 'exceeds_stock';
};

export type ExportRequestTableProps = {
  storeId: number;
  storeName: string;
  initialParams?: FabricListParams;
  onSuccess?: () => void;
};

export function ExportRequestTable({
  storeId,
  storeName,
  initialParams,
  onSuccess,
}: ExportRequestTableProps) {
  const router = useRouter();
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<number, ExportRequestItem>>(new Map());
  const [quantityInputs, setQuantityInputs] = useState<Map<number, string>>(new Map());
  const [quantityErrors, setQuantityErrors] = useState<Map<number, QuantityError>>(new Map());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    weight: false,
    thickness: false,
    width: false,
    glossId: false,
    createdAt: false,
  });

  // Use refs to avoid re-creating columns on every state change
  const selectedItemsRef = useRef(selectedItems);
  const quantityInputsRef = useRef(quantityInputs);
  const quantityErrorsRef = useRef(quantityErrors);
  
  // Keep refs in sync
  selectedItemsRef.current = selectedItems;
  quantityInputsRef.current = quantityInputs;
  quantityErrorsRef.current = quantityErrors;

  // Use custom hook for table state and data fetching
  const {
    data: fabrics,
    loading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    pagination,
    handlePaginationChange,
    handleSearch,
    refresh,
    reset
  } = useServerTable<FabricListItem, FabricListParams>({
    fetchData: fabricService.getFabrics,
    initialParams,
    filterConfig: {
      arrayFilters: {
        categoryId: 'categoryId',
        colorId: 'colorId',
        glossId: 'glossId',
        supplierId: 'supplierId',
      },
      dateRangeFilters: {
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
      sortingFieldMap: {
        categoryId: 'category.name',
        colorId: 'color.name',
        glossId: 'gloss.description',
        supplierId: 'supplier.name',
      },
    },
    onError: (err) => {
      console.error('Failed to fetch fabrics:', err);
    },
  });

  // Keep fabrics ref in sync for validation
  const fabricsRef = useRef(fabrics);
  fabricsRef.current = fabrics;

  /**
   * Get quantity error for a fabric - uses ref to avoid re-render
   */
  const getQuantityError = useCallback((fabricId: number): string | undefined => {
    const error = quantityErrorsRef.current.get(fabricId);
    return error?.message;
  }, []);

  /**
   * Handle checkbox toggle for a fabric item - stable callback
   */
  const handleToggleSelect = useCallback((fabric: FabricListItem, checked: boolean) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (checked) {
        const qty = parseInt(quantityInputsRef.current.get(fabric.id) || '1') || 1;
        newMap.set(fabric.id, {
          fabricId: fabric.id,
          quantity: qty,
          fabric,
        });
      } else {
        newMap.delete(fabric.id);
      }
      return newMap;
    });
  }, []);

  /**
   * Handle quantity change for a fabric item with validation
   */
  const handleQuantityChange = useCallback((fabricId: number, value: string) => {
    setQuantityInputs((prev) => {
      const newMap = new Map(prev);
      newMap.set(fabricId, value);
      return newMap;
    });

    // Find the fabric to get max stock - use ref
    const fabric = fabricsRef.current.find((f) => f.id === fabricId);
    if (!fabric) return;

    const maxStock = fabric.quantityInStock;

    // Validate quantity and update errors
    setQuantityErrors((prevErrors) => {
      const newErrors = new Map(prevErrors);
      
      if (!value.trim()) {
        // Empty input - only error if selected
        if (selectedItemsRef.current.has(fabricId)) {
          newErrors.set(fabricId, {
            message: 'Vui lòng nhập số lượng',
            type: 'empty',
          });
        } else {
          newErrors.delete(fabricId);
        }
      } else {
        const qty = parseInt(value);
        
        if (isNaN(qty)) {
          newErrors.set(fabricId, {
            message: 'Số lượng phải là số nguyên',
            type: 'invalid',
          });
        } else if (qty <= 0) {
          newErrors.set(fabricId, {
            message: 'Số lượng phải lớn hơn 0',
            type: 'invalid',
          });
        } else if (qty > maxStock) {
          newErrors.set(fabricId, {
            message: `Vượt quá tồn kho (${maxStock})`,
            type: 'exceeds_stock',
          });
        } else {
          newErrors.delete(fabricId);
        }
      }
      
      return newErrors;
    });

    // Update selected items if already selected
    setSelectedItems((prev) => {
      if (prev.has(fabricId)) {
        const newMap = new Map(prev);
        const item = newMap.get(fabricId)!;
        const qtyNum = parseInt(value) || 0;
        newMap.set(fabricId, {
          ...item,
          quantity: qtyNum,
        });
        return newMap;
      }
      return prev;
    });
  }, []);

  /**
   * Check if a fabric is selected - uses ref
   */
  const isSelected = useCallback((fabricId: number) => {
    return selectedItemsRef.current.has(fabricId);
  }, []);

  /**
   * Get quantity value for a fabric - uses ref
   */
  const getQuantity = useCallback((fabricId: number) => {
    return quantityInputsRef.current.get(fabricId) || '';
  }, []);

  /**
   * Handle search button click
   */
  const handleSearchClick = () => {
    handleSearch(tempSearchQuery);
  };

  /**
   * Handle search on Enter key
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  /**
   * Open preview dialog
   */
  const handleOpenPreview = () => {
    // Validate selection
    const items = Array.from(selectedItems.values());
    if (items.length === 0) {
      toast.error('Vui lòng chọn ít nhất một mặt hàng');
      return;
    }

    // Validate quantities - check for errors
    const hasErrors = Array.from(quantityErrors.values()).length > 0;
    if (hasErrors) {
      toast.error('Vui lòng sửa lỗi nhập liệu');
      return;
    }

    // Validate quantities - all selected items must have valid quantity
    const invalidItems = items.filter((item) => !item.quantity || item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ cho tất cả mặt hàng đã chọn');
      return;
    }

    setPreviewDialogOpen(true);
  };

  /**
   * Handle submit request
   */
  const handleSubmit = async () => {
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const items = Array.from(selectedItems.values());
      
      await exportFabricService.createExportRequest({
        storeId,
        note: note || undefined,
        exportItems: items.map((item) => ({
          fabricId: item.fabricId,
          quantity: item.quantity,
        })),
      });

      toast.success('Tạo yêu cầu xuất kho thành công');
      setPreviewDialogOpen(false);
      
      // Reset form
      setSelectedItems(new Map());
      setQuantityInputs(new Map());
      setQuantityErrors(new Map());
      setNote('');
      
      onSuccess?.();
      
      // Navigate back
      router.back();
    } catch (err) {
      const fieldErrs = extractFieldErrors(err);
      setFieldErrors(fieldErrs);

      const message = getServerErrorMessage(err) || 'Không thể tạo yêu cầu xuất kho';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get selected items as array
   */
  const getSelectedItemsArray = () => {
    return Array.from(selectedItems.values());
  };

  // Memoize columns to avoid re-creating on every render
  // Only re-create when fabrics change (new data loaded)
  const columns = useMemo(() => createExportRequestColumns({
    isSelected,
    getQuantity,
    getQuantityError,
    onToggleSelect: handleToggleSelect,
    onQuantityChange: handleQuantityChange,
  }), [isSelected, getQuantity, getQuantityError, handleToggleSelect, handleQuantityChange]);

  if (loading && fabrics.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={() => { reset(); refresh(); }} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tạo yêu cầu xuất kho</h1>
            <p className="text-muted-foreground">
              Cửa hàng: <span className="font-medium">{storeName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            <span>Đã chọn: <span className="font-medium text-foreground">{selectedItems.size}</span> mặt hàng</span>
          </div>
          <Button
            onClick={handleOpenPreview}
            disabled={selectedItems.size === 0}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Xem trước & Gửi yêu cầu
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, màu, loại, độ bóng, nhà cung cấp..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button onClick={handleSearchClick} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Tìm kiếm
        </Button>
      </div>

      {/* Note input */}
      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="note"
          placeholder="Nhập ghi chú cho yêu cầu xuất kho..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng: <span className="font-medium">{pagination.total}</span> vải
        </p>
        <p className="text-sm text-muted-foreground">
          Chọn vải và nhập số lượng cần xuất, sau đó nhấn "Xem trước & Gửi yêu cầu"
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={fabrics}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        manualSorting={true}
        manualFiltering={true}
        manualPagination={true}
        pageCount={pagination.totalPages}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPaginationChange={handlePaginationChange}
      />

      {/* Preview Dialog */}
      <ExportRequestPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        items={getSelectedItemsArray()}
        storeName={storeName}
        note={note}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default ExportRequestTable;
