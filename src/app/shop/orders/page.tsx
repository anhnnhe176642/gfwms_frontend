'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { IsLoading } from '@/components/common/IsLoading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderCard, OrderListFilters } from '@/components/shop/order';
import { orderService } from '@/services/order.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import type { OrderListItem, OrderListParams } from '@/types/order';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<OrderListParams>({});

  const fetchOrders = useCallback(async (page: number = 1, filterParams?: OrderListParams) => {
    setIsLoading(true);
    try {
      const params: OrderListParams = {
        page,
        limit,
        ...filterParams,
      };

      const response = await orderService.getMyOrders(params);
      setOrders(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err: any) {
      const errorMsg = getServerErrorMessage(err) || 'Không thể tải danh sách đơn hàng';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchOrders(1, filters);
  }, [filters, fetchOrders]);

  const handleFilterChange = (newFilters: OrderListParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchOrders(page, filters);
    }
  };

  const handleViewDetails = (orderId: number) => {
    router.push(`/shop/order/${orderId}`);
  };

  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      if (currentPage > 3) {
        items.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!items.includes(i)) {
          items.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        items.push('...');
      }

      items.push(totalPages);
    }

    return items;
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
              </div>
              <p className="text-muted-foreground">
                Xem lịch sử mua hàng và trạng thái các đơn hàng của bạn
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <OrderListFilters
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />
          </div>

          {/* Summary */}
          {!isLoading && total > 0 && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Tổng số đơn hàng: <span className="font-semibold text-foreground">{total}</span>
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Đang tải đơn hàng...</p>
            </div>
          )}

          {/* Orders Grid */}
          {!isLoading && orders.length > 0 && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />

                      {getPaginationItems().map((page, index) => (
                        page === '...' ? (
                          <PaginationEllipsis key={`ellipsis-${index}`} />
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page as number)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      ))}

                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && orders.length === 0 && (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Không có đơn hàng</h3>
                  <p className="text-muted-foreground max-w-md">
                    {Object.keys(filters).length > 0
                      ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc của bạn. Vui lòng thay đổi tiêu chí tìm kiếm.'
                      : 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua hàng ngay!'}
                  </p>
                </div>
                {Object.keys(filters).length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({});
                      setCurrentPage(1);
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
