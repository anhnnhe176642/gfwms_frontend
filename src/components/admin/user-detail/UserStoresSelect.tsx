'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { storeService } from '@/services/store.service';
import type { StoreListItem, UserStoreAssignment } from '@/types/store';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface UserStoresSelectProps {
  userId: string;
  onStoresChange?: (stores: UserStoreAssignment[]) => void;
}

export function UserStoresSelect({ userId, onStoresChange }: UserStoresSelectProps) {
  const [allStores, setAllStores] = useState<StoreListItem[]>([]);
  const [assignedStores, setAssignedStores] = useState<UserStoreAssignment[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);

  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Lấy danh sách tất cả cửa hàng
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoadingStores(true);
        const response = await storeService.getStores({ limit: 100 });
        setAllStores(response.data);
      } catch (error) {
        toast.error(getServerErrorMessage(error) || 'Không thể tải danh sách cửa hàng');
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  // Lấy danh sách cửa hàng được phân công cho user
  useEffect(() => {
    const fetchUserStores = async () => {
      try {
        setIsLoadingAssigned(true);
        const response = await userService.getUserStores(userId);
        setAssignedStores(response.data);
        // Cập nhật danh sách store được chọn từ những cửa hàng đã phân công
        setSelectedStoreIds(response.data.map((item) => item.storeId));
      } catch (error) {
        toast.error(getServerErrorMessage(error) || 'Không thể tải danh sách cửa hàng được phân công');
      } finally {
        setIsLoadingAssigned(false);
      }
    };

    fetchUserStores();
  }, [userId]);

  const handleStoreToggle = (storeId: number) => {
    setSelectedStoreIds((prev) => {
      if (prev.includes(storeId)) {
        return prev.filter((id) => id !== storeId);
      } else {
        return [...prev, storeId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Nếu không chọn cửa hàng nào, gọi API xóa tất cả
      if (selectedStoreIds.length === 0) {
        await userService.removeAllUserStores(userId);
        setAssignedStores([]);
        onStoresChange?.([]);
        toast.success('Xóa tất cả quyền cửa hàng thành công');
      } else {
        // Nếu chọn cửa hàng, gọi API phân công
        const response = await userService.assignUserStores({
          userId,
          storeIds: selectedStoreIds,
        });
        setAssignedStores(response.data);
        onStoresChange?.(response.data);
        toast.success('Cập nhật danh sách cửa hàng thành công');
      }
    } catch (error) {
      toast.error(getServerErrorMessage(error) || 'Không thể cập nhật danh sách cửa hàng');
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingStores || isLoadingAssigned;
  const hasChanges = JSON.stringify(selectedStoreIds.sort()) !== JSON.stringify(assignedStores.map((a) => a.storeId).sort());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quản lý Cửa hàng</span>
          {assignedStores.length > 0 && (
            <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
              {assignedStores.length} cửa hàng
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Phân công các cửa hàng cho user này
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Danh sách chọn cửa hàng */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Chọn cửa hàng:</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Đang tải...</span>
            </div>
          ) : allStores.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="text-sm">Không có cửa hàng nào</span>
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto border rounded-lg p-4">
              {allStores.map((store) => {
                const isSelected = selectedStoreIds.includes(store.id);

                return (
                  <label
                    key={store.id}
                    className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStoreToggle(store.id)}
                      className="h-4 w-4 mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{store.name}</p>
                        {store.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                            Không hoạt động
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{store.address}</p>
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
                Cập nhật cửa hàng
              </>
            )}
          </Button>
        </div>

        {/* Ghi chú */}
        {selectedStoreIds.length === 0 && assignedStores.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Nếu bạn không chọn cửa hàng nào và nhấn "Cập nhật", tất cả quyền cửa hàng sẽ bị xóa.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
