'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import type { UserListParams } from '@/types/user';
import { Search, X, Filter } from 'lucide-react';

export type UserManagementFiltersProps = {
  onFilterChange: (filters: UserListParams) => void;
  initialFilters?: UserListParams;
};

export function UserManagementFilters({
  onFilterChange,
  initialFilters,
}: UserManagementFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<UserListParams>(initialFilters || {});

  const handleInputChange = (key: keyof UserListParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectChange = (key: keyof UserListParams, value: string, isChecked: boolean) => {
    setFilters((prev) => {
      const current = prev[key] as string || '';
      const values = current ? current.split(',') : [];
      
      if (isChecked) {
        return { ...prev, [key]: [...values, value].join(',') };
      } else {
        return { ...prev, [key]: values.filter(v => v !== value).join(',') || undefined };
      }
    });
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  const isFiltered = Object.keys(filters).some(key => filters[key as keyof UserListParams]);

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Bộ lọc</h3>
          {isFiltered && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              Đang lọc
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Thu gọn' : 'Mở rộng'}
        </Button>
      </div>

      {/* Search bar - always visible */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Advanced filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status filter */}
            <div>
              <Label className="mb-2 block">Trạng thái</Label>
              <div className="space-y-2">
                {[
                  { value: 'ACTIVE', label: 'Hoạt động' },
                  { value: 'INACTIVE', label: 'Không hoạt động' },
                  { value: 'SUSPENDED', label: 'Bị cấm' },
                ].map((status) => (
                  <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(filters.status || '').split(',').includes(status.value)}
                      onChange={(e) =>
                        handleMultiSelectChange('status', status.value, e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Role filter */}
            <div>
              <Label className="mb-2 block">Vai trò</Label>
              <div className="space-y-2">
                {[
                  { value: 'ADMIN', label: 'Quản trị viên' },
                  { value: 'MANAGER', label: 'Quản lý' },
                  { value: 'USER', label: 'Người dùng' },
                ].map((role) => (
                  <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(filters.role || '').split(',').includes(role.value)}
                      onChange={(e) =>
                        handleMultiSelectChange('role', role.value, e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender filter */}
            <div>
              <Label className="mb-2 block">Giới tính</Label>
              <div className="space-y-2">
                {[
                  { value: 'MALE', label: 'Nam' },
                  { value: 'FEMALE', label: 'Nữ' },
                  { value: 'OTHER', label: 'Khác' },
                ].map((gender) => (
                  <label key={gender.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(filters.gender || '').split(',').includes(gender.value)}
                      onChange={(e) =>
                        handleMultiSelectChange('gender', gender.value, e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{gender.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort options */}
            <div>
              <Label className="mb-2 block">Sắp xếp</Label>
              <Select
                value={filters.sortBy || ''}
                onValueChange={(value) => handleInputChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cách sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  <SelectItem value="username">Tên người dùng</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="fullname">Họ tên</SelectItem>
                </SelectContent>
              </Select>
              {filters.sortBy && (
                <div className="mt-2 flex gap-2">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="order"
                      value="asc"
                      checked={filters.order === 'asc'}
                      onChange={(e) => handleInputChange('order', e.target.value)}
                    />
                    <span className="text-sm">Tăng dần</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="order"
                      value="desc"
                      checked={filters.order === 'desc'}
                      onChange={(e) => handleInputChange('order', e.target.value)}
                    />
                    <span className="text-sm">Giảm dần</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="createdFrom">Từ ngày</Label>
              <Input
                id="createdFrom"
                type="date"
                value={filters.createdFrom || ''}
                onChange={(e) => handleInputChange('createdFrom', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="createdTo">Đến ngày</Label>
              <Input
                id="createdTo"
                type="date"
                value={filters.createdTo || ''}
                onChange={(e) => handleInputChange('createdTo', e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Áp dụng
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default UserManagementFilters;
