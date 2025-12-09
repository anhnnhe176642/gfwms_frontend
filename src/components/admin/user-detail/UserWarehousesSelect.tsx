'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { warehouseService } from '@/services/warehouse.service';
import type { WarehouseListItem, WarehouseManagerAssignment } from '@/types/warehouse';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface UserWarehousesSelectProps {
  userId: string;
  onWarehousesChange?: (warehouses: WarehouseManagerAssignment[]) => void;
}

export function UserWarehousesSelect({ userId, onWarehousesChange }: UserWarehousesSelectProps) {
  const [allWarehouses, setAllWarehouses] = useState<WarehouseListItem[]>([]);
  const [assignedWarehouses, setAssignedWarehouses] = useState<WarehouseManagerAssignment[]>([]);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([]);

  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Lấy danh sách tất cả kho
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsLoadingWarehouses(true);
        const response = await warehouseService.getWarehouses({ limit: 100 });
        setAllWarehouses(response.data);
      } catch (error) {
        toast.error(getServerErrorMessage(error) || 'Không thể tải danh sách kho');
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, []);

  // Lấy danh sách kho được phân công cho user
  useEffect(() => {
    const fetchUserWarehouses = async () => {
      try {
        setIsLoadingAssigned(true);
        const response = await userService.getUserWarehouses(userId);
        setAssignedWarehouses(response.data);
        // Cập nhật danh sách kho được chọn từ những kho đã phân công
        setSelectedWarehouseIds(response.data.map((item) => item.warehouseId));
      } catch (error) {
        toast.error(getServerErrorMessage(error) || 'Không thể tải danh sách kho được phân công');
      } finally {
        setIsLoadingAssigned(false);
      }
    };

    fetchUserWarehouses();
  }, [userId]);

  const handleWarehouseToggle = (warehouseId: number) => {
    setSelectedWarehouseIds((prev) => {
      if (prev.includes(warehouseId)) {
        return prev.filter((id) => id !== warehouseId);
      } else {
        return [...prev, warehouseId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Nếu không chọn kho nào, gọi API xóa tất cả
      if (selectedWarehouseIds.length === 0) {
        await userService.removeAllUserWarehouses(userId);
        setAssignedWarehouses([]);
        onWarehousesChange?.([]);
        toast.success('Xóa tất cả quyền kho thành công');
      } else {
        // Nếu chọn kho, gọi API phân công
        const response = await userService.assignUserWarehouses({
          userId,
          warehouseIds: selectedWarehouseIds,
        });
        // Cập nhật danh sách kho được phân công
        const freshResponse = await userService.getUserWarehouses(userId);
        setAssignedWarehouses(freshResponse.data);
        onWarehousesChange?.(freshResponse.data);
        toast.success('Cập nhật danh sách kho thành công');
      }
    } catch (error) {
      toast.error(getServerErrorMessage(error) || 'Không thể cập nhật danh sách kho');
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingWarehouses || isLoadingAssigned;
  const hasChanges = JSON.stringify(selectedWarehouseIds.sort()) !== JSON.stringify(assignedWarehouses.map((a) => a.warehouseId).sort());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quản lý Kho</span>
          {assignedWarehouses.length > 0 && (
            <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
              {assignedWarehouses.length} kho
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Phân công các kho cho user này
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Danh sách chọn kho */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Chọn kho:</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Đang tải...</span>
            </div>
          ) : allWarehouses.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="text-sm">Không có kho nào</span>
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto border rounded-lg p-4">
              {allWarehouses.map((warehouse) => {
                const isSelected = selectedWarehouseIds.includes(warehouse.id);

                return (
                  <label
                    key={warehouse.id}
                    className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleWarehouseToggle(warehouse.id)}
                      className="h-4 w-4 mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{warehouse.name}</p>
                        {warehouse.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                            Không hoạt động
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{warehouse.address}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges || isLoading}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Cập nhật kho
              </>
            )}
          </Button>
        </div>

        {/* Ghi chú */}
        {selectedWarehouseIds.length === 0 && assignedWarehouses.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Nếu bạn không chọn kho nào và nhấn "Cập nhật", tất cả quyền kho sẽ bị xóa.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
