'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader, Send, Package } from 'lucide-react';
import type { ExportRequestItem } from './ExportRequestTable';

export interface ExportRequestPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ExportRequestItem[];
  storeName: string;
  note?: string;
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
  onSubmit: () => void;
}

export function ExportRequestPreviewDialog({
  open,
  onOpenChange,
  items,
  storeName,
  note,
  isSubmitting,
  fieldErrors,
  onSubmit,
}: ExportRequestPreviewDialogProps) {
  // Calculate totals
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity * (item.fabric.sellingPrice || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Xem trước yêu cầu xuất kho
          </DialogTitle>
          <DialogDescription>
            Kiểm tra lại danh sách vải trước khi gửi yêu cầu xuất kho cho cửa hàng{' '}
            <span className="font-medium">{storeName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Số mặt hàng</p>
              <p className="text-lg font-semibold">{items.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng số lượng</p>
              <p className="text-lg font-semibold">
                {new Intl.NumberFormat('vi-VN').format(totalQuantity)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Tổng giá trị ước tính</p>
              <p className="text-lg font-semibold text-primary">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(totalValue)}
              </p>
            </div>
          </div>

          {/* Note */}
          {note && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Ghi chú:</p>
              <p className="text-sm">{note}</p>
            </div>
          )}

          {/* Items table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Loại vải</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead className="text-right">Tồn kho</TableHead>
                  <TableHead className="text-right">Số lượng xuất</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const itemTotal = item.quantity * (item.fabric.sellingPrice || 0);
                  const hasError = fieldErrors[`exportItems.${index}.quantity`];
                  
                  return (
                    <TableRow key={item.fabricId} className={hasError ? 'bg-destructive/10' : ''}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{item.fabric.category.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.fabric.color.hexCode && (
                            <div
                              className="w-4 h-4 rounded border border-input"
                              style={{ backgroundColor: item.fabric.color.hexCode }}
                            />
                          )}
                          <span>{item.fabric.color.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.fabric.supplier.name}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('vi-VN').format(item.fabric.quantityInStock)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('vi-VN').format(item.quantity)}
                        {hasError && (
                          <p className="text-xs text-destructive mt-1">{hasError}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.fabric.sellingPrice || 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(itemTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Quay lại chỉnh sửa
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Xác nhận gửi yêu cầu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExportRequestPreviewDialog;
