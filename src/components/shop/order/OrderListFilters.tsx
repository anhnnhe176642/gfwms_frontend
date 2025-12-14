'use client';

import React, { useState } from 'react';
import { OrderListParams } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';

interface OrderListFiltersProps {
  onFilterChange: (params: OrderListParams) => void;
  isLoading?: boolean;
}

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELED', label: 'Đã hủy' },
  { value: 'FAILED', label: 'Thất bại' },
];

const PAYMENT_TYPES = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'CREDIT', label: 'Công nợ' },
];

export function OrderListFilters({ onFilterChange, isLoading }: OrderListFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [paymentType, setPaymentType] = useState<string>('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');

  const handleApplyFilters = () => {
    const params: OrderListParams = {};
    
    if (search) params.search = search;
    if (status) params.status = status;
    if (paymentType) params.paymentType = paymentType;
    if (createdFrom) params.createdFrom = createdFrom;
    if (createdTo) params.createdTo = createdTo;

    onFilterChange(params);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPaymentType('');
    setCreatedFrom('');
    setCreatedTo('');
    onFilterChange({});
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Tìm kiếm ghi chú</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nhập từ khóa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Loại thanh toán</Label>
              <Select value={paymentType} onValueChange={setPaymentType} disabled={isLoading}>
                <SelectTrigger id="paymentType">
                  <SelectValue placeholder="Chọn loại thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Created From Date */}
            <div className="space-y-2">
              <Label htmlFor="createdFrom">Từ ngày</Label>
              <Input
                id="createdFrom"
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Created To Date */}
            <div className="space-y-2">
              <Label htmlFor="createdTo">Đến ngày</Label>
              <Input
                id="createdTo"
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
            <Button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
