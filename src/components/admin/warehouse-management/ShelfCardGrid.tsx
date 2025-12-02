'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useServerTable } from '@/hooks/useServerTable';
import { useNavigation } from '@/hooks/useNavigation';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import { warehouseService } from '@/services/warehouse.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ShelfCard } from './ShelfCard';
import { CreateShelfForm } from './CreateShelfForm';
import { EditShelfForm } from './EditShelfForm';
import type { 
  ShelfListItem, 
  ShelfListParams, 
  ShelfWithFabricListItem, 
  ShelfWithGroups,
  ShelfGroupByField,
  FabricShelfItem,
  FabricGroup
} from '@/types/warehouse';
import {
  Search,
  ArrowLeft,
  Plus,
  Loader,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Grid3X3,
  RefreshCw,
  Layers,
  Palette,
  Sparkles,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Type for sort criteria
export type SortCriteria = {
  field: string;
  order: 'asc' | 'desc';
};

export interface ShelfCardGridProps {
  warehouseId: string | number;
}

// Sort options
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Ngày cập nhật' },
  { value: 'code', label: 'Mã kệ' },
  { value: 'currentQuantity', label: 'Số lượng hiện tại' },
  { value: 'maxQuantity', label: 'Sức chứa tối đa' },
  { value: 'id', label: 'ID' },
];

// Group by options
const GROUP_BY_OPTIONS: { value: ShelfGroupByField; label: string; icon: React.ReactNode }[] = [
  { value: 'categoryId', label: 'Loại vải', icon: <Layers className="h-4 w-4" /> },
  { value: 'colorId', label: 'Màu sắc', icon: <Palette className="h-4 w-4" /> },
  { value: 'glossId', label: 'Độ bóng', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'supplierId', label: 'Nhà cung cấp', icon: <Building2 className="h-4 w-4" /> },
];

// Type guard for ShelfWithGroups
function isShelfWithGroups(shelf: ShelfListItem | ShelfWithFabricListItem | ShelfWithGroups): shelf is ShelfWithGroups {
  return 'fabricGroups' in shelf;
}

// Type guard for ShelfWithFabricListItem
function isShelfWithFabric(shelf: ShelfListItem | ShelfWithFabricListItem | ShelfWithGroups): shelf is ShelfWithFabricListItem {
  return 'fabricShelf' in shelf;
}

export function ShelfCardGrid({ warehouseId }: ShelfCardGridProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { handleGoBack } = useNavigation();

  // Local states for UI
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria[]>([
    { field: 'createdAt', order: 'desc' }
  ]);
  const [selectedGroupBy, setSelectedGroupBy] = useState<ShelfGroupByField[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pageLimit, setPageLimit] = useState('9');

  // Dialog states
  const [createShelfOpen, setCreateShelfOpen] = useState(false);
  const [editShelfOpen, setEditShelfOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<ShelfListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shelfToDelete, setShelfToDelete] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Build initial params with groupBy support
  const buildParams = useCallback((baseParams: ShelfListParams): ShelfListParams => {
    const params: ShelfListParams = {
      ...baseParams,
      warehouseId: String(warehouseId),
    };
    
    // Build sortBy and order from multiple sort criteria
    if (sortCriteria.length > 0) {
      params.sortBy = sortCriteria.map(c => c.field).join(',');
      params.order = sortCriteria.map(c => c.order).join(',');
    }
    
    if (selectedGroupBy.length > 0) {
      params.groupBy = selectedGroupBy.join(',');
    }
    
    return params;
  }, [warehouseId, sortCriteria, selectedGroupBy]);

  // Use custom hook for data fetching
  const {
    data: shelves,
    loading,
    error,
    pagination,
    handlePaginationChange,
    handleSearch,
    refresh,
    reset,
  } = useServerTable<ShelfListItem | ShelfWithFabricListItem | ShelfWithGroups, ShelfListParams>({
    fetchData: async (params: ShelfListParams) => {
      const fullParams = buildParams(params);
      return await warehouseService.getShelves(fullParams);
    },
    initialParams: { 
      page: 1,
      limit: 6,
      warehouseId: String(warehouseId),
      sortBy: sortCriteria.map(c => c.field).join(','),
      order: sortCriteria.map(c => c.order).join(','),
      groupBy: selectedGroupBy.length > 0 ? selectedGroupBy.join(',') : undefined,
    },
    filterConfig: {
      dateRangeFilters: {
        createdAt: {
          from: 'createdFrom',
          to: 'createdTo',
        },
      },
    },
    onError: (err) => {
      console.error('Failed to fetch shelves:', err);
    },
  });

  /**
   * Handle search
   */
  const handleSearchClick = useCallback(() => {
    handleSearch(tempSearchQuery);
  }, [tempSearchQuery, handleSearch]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleClearSearch = useCallback(() => {
    setTempSearchQuery('');
    handleSearch('');
  }, [handleSearch]);

  /**
   * Handle sort field change - add new sort criteria
   */
  const handleSortFieldChange = useCallback((field: string) => {
    setSortCriteria(prev => {
      // Check if this field already exists
      const exists = prev.some(c => c.field === field);
      if (exists) {
        return prev;
      }
      return [...prev, { field, order: 'asc' }];
    });
    refresh();
  }, [refresh]);

  /**
   * Handle adding another sort criteria
   */
  const handleAddSortCriteria = useCallback((field: string) => {
    setSortCriteria(prev => {
      const exists = prev.some(c => c.field === field);
      if (exists) {
        return prev;
      }
      return [...prev, { field, order: 'asc' }];
    });
    refresh();
  }, [refresh]);

  /**
   * Handle removing sort criteria by index
   */
  const handleRemoveSortCriteria = useCallback((index: number) => {
    setSortCriteria(prev => {
      const newCriteria = prev.filter((_, i) => i !== index);
      return newCriteria.length === 0 ? [{ field: 'createdAt', order: 'desc' }] : newCriteria;
    });
    refresh();
  }, [refresh]);

  /**
   * Handle toggling sort order for a criteria
   */
  const handleToggleSortOrder = useCallback((index: number) => {
    setSortCriteria(prev =>
      prev.map((c, i) =>
        i === index ? { ...c, order: c.order === 'asc' ? 'desc' : 'asc' } : c
      )
    );
    refresh();
  }, [refresh]);

  /**
   * Handle page limit change
   */
  const handlePageLimitChange = useCallback((limit: string) => {
    setPageLimit(limit);
    handlePaginationChange(0, Number(limit));
  }, [handlePaginationChange]);

  /**
   * Handle group by change
   */
  const handleGroupByChange = useCallback((field: ShelfGroupByField, checked: boolean) => {
    setSelectedGroupBy(prev => {
      if (checked) {
        return [...prev, field];
      }
      return prev.filter(f => f !== field);
    });
  }, []);

  const handleApplyGroupBy = useCallback(() => {
    setFilterOpen(false);
    refresh();
  }, [refresh]);

  const handleClearGroupBy = useCallback(() => {
    setSelectedGroupBy([]);
    setFilterOpen(false);
    refresh();
  }, [refresh]);

  /**
   * Handle shelf actions
   */
  const handleViewShelf = (shelfId: number) => {
    router.push(`/admin/warehouses/${warehouseId}/shelves/${shelfId}`);
  };

  const handleEditShelf = (shelfId: number) => {
    const shelf = shelves.find(s => s.id === shelfId);
    if (shelf) {
      setSelectedShelf(shelf);
      setEditShelfOpen(true);
    }
  };

  const handleDeleteClick = (shelfId: number) => {
    setShelfToDelete(shelfId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!shelfToDelete) return;

    setActionLoading(true);
    try {
      await warehouseService.deleteShelf(shelfToDelete);
      toast.success('Xóa kệ thành công');
      setDeleteDialogOpen(false);
      setShelfToDelete(null);
      await refresh();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể xóa kệ';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle pagination
   */
  const handlePageChange = useCallback((newPage: number) => {
    handlePaginationChange(newPage - 1, pagination.limit);
  }, [handlePaginationChange, pagination.limit]);

  // Normalize shelf data for ShelfCard
  const normalizedShelves = useMemo(() => {
    return shelves.map(shelf => {
      const normalized: ShelfListItem & {
        fabricShelf?: FabricShelfItem[];
        fabricGroups?: FabricGroup[];
      } = {
        id: shelf.id,
        code: shelf.code,
        currentQuantity: shelf.currentQuantity,
        maxQuantity: shelf.maxQuantity,
        warehouseId: shelf.warehouseId,
        createdAt: shelf.createdAt,
        updatedAt: shelf.updatedAt,
      };

      if (isShelfWithGroups(shelf)) {
        normalized.fabricGroups = shelf.fabricGroups;
      } else if (isShelfWithFabric(shelf)) {
        normalized.fabricShelf = shelf.fabricShelf;
      }

      return normalized;
    });
  }, [shelves]);

  // Loading state
  if (loading && shelves.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Header onBack={handleGoBack} />
        <Card className="bg-card">
          <CardContent className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Header onBack={handleGoBack} />
        <Card className="bg-card">
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={() => { reset(); refresh(); }} variant="outline">
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Header onBack={handleGoBack} />

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Danh sách kệ</CardTitle>
          <CardDescription>
            Quản lý các kệ trong kho - hiển thị dạng thẻ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã kệ..."
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10"
                disabled={loading}
              />
            </div>
            <Button onClick={handleSearchClick} disabled={loading} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Tìm
            </Button>
            {tempSearchQuery && (
              <Button onClick={handleClearSearch} disabled={loading} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            )}

            <Separator orientation="vertical" className="h-8" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select value="" onValueChange={handleSortFieldChange}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.filter(option => !sortCriteria.some(c => c.field === option.value)).map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sortCriteria.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleToggleSortOrder(0)}
                  title={sortCriteria[0]?.order === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                >
                  {sortCriteria[0]?.order === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Page Limit */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Hiển thị:</span>
              <Select value={pageLimit} onValueChange={handlePageLimitChange}>
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Group By Filter */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Nhóm theo
                  {selectedGroupBy.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {selectedGroupBy.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div className="font-medium text-sm">Nhóm vải theo</div>
                  <div className="space-y-2">
                    {GROUP_BY_OPTIONS.map(option => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={option.value}
                          checked={selectedGroupBy.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleGroupByChange(option.value, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={option.value}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          {option.icon}
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleClearGroupBy}
                    >
                      Xóa
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleApplyGroupBy}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => refresh()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Create button */}
            {hasPermission(PERMISSIONS.SHELVES.CREATE.key) && (
              <Button onClick={() => setCreateShelfOpen(true)} className="ml-auto gap-2">
                <Plus className="h-4 w-4" />
                Tạo kệ
              </Button>
            )}
          </div>

          {/* Active filters display - Sort criteria */}
          {sortCriteria.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Sắp xếp theo:</span>
              {sortCriteria.map((criteria, index) => {
                const option = SORT_OPTIONS.find(o => o.value === criteria.field);
                return (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {option?.label}
                    <button
                      onClick={() => handleToggleSortOrder(index)}
                      className="ml-1 hover:text-blue-900 dark:hover:text-blue-200"
                      title={criteria.order === 'asc' ? 'Nhấp để sắp xếp giảm dần' : 'Nhấp để sắp xếp tăng dần'}
                    >
                      {criteria.order === 'asc' ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      )}
                    </button>
                    {sortCriteria.length > 1 && (
                      <button
                        onClick={() => handleRemoveSortCriteria(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {/* Active filters display - Group by */}
          {selectedGroupBy.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Nhóm theo:</span>
              {selectedGroupBy.map(field => {
                const option = GROUP_BY_OPTIONS.find(o => o.value === field);
                return (
                  <span key={field} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {option?.icon}
                    {option?.label}
                    <button
                      onClick={() => handleGroupByChange(field, false)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Info bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tổng: <span className="font-medium">{pagination.total}</span> kệ
              {selectedGroupBy.length > 0 && (
                <span className="ml-2">
                  (Nhóm theo: {selectedGroupBy.map(f => 
                    GROUP_BY_OPTIONS.find(o => o.value === f)?.label
                  ).join(', ')})
                </span>
              )}
            </p>
          </div>

          {/* Shelf Cards Grid */}
          {normalizedShelves.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Không tìm thấy kệ nào</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {normalizedShelves.map((shelf) => (
                <ShelfCard
                  key={shelf.id}
                  shelf={shelf}
                  groupBy={selectedGroupBy.length > 0 ? selectedGroupBy : undefined}
                  onView={hasPermission(PERMISSIONS.SHELVES.VIEW_DETAIL.key) ? handleViewShelf : undefined}
                  onEdit={hasPermission(PERMISSIONS.SHELVES.UPDATE.key) ? handleEditShelf : undefined}
                  onDelete={hasPermission(PERMISSIONS.SHELVES.DELETE.key) ? handleDeleteClick : undefined}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Shelf Form */}
      <CreateShelfForm
        warehouseId={Number(warehouseId)}
        open={createShelfOpen}
        onOpenChange={setCreateShelfOpen}
        onSuccess={refresh}
      />

      {/* Edit Shelf Form */}
      <EditShelfForm
        shelf={selectedShelf}
        warehouseId={Number(warehouseId)}
        open={editShelfOpen}
        onOpenChange={setEditShelfOpen}
        onSuccess={refresh}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa kệ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa kệ này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Header component
function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="h-9 w-9"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Danh sách kệ</h1>
        <p className="text-muted-foreground mt-1">Quản lý các kệ trong kho</p>
      </div>
    </div>
  );
}

export default ShelfCardGrid;
