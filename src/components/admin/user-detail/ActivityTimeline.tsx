'use client';

import { UserActivity } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatters } from '@/lib/formatters';
import {
  Package,
  Upload,
  Download,
  CreditCard,
  ArrowRight,
  Clock,
} from 'lucide-react';

const activityTypeIcons: Record<string, React.ReactNode> = {
  ORDER_CREATED: <Package className="h-4 w-4" />,
  ORDER_COMPLETED: <Package className="h-4 w-4" />,
  EXPORT_CREATED: <Upload className="h-4 w-4" />,
  EXPORT_COMPLETED: <Upload className="h-4 w-4" />,
  IMPORT_CREATED: <Download className="h-4 w-4" />,
  IMPORT_COMPLETED: <Download className="h-4 w-4" />,
  PAYMENT_MADE: <CreditCard className="h-4 w-4" />,
  PAYMENT_COMPLETED: <CreditCard className="h-4 w-4" />,
};

interface ActivityTimelineProps {
  activities: UserActivity[];
  isLoading?: boolean;
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Không có hoạt động nào</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Chưa có hoạt động được ghi nhận</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Tổng {activities.length} hoạt động được ghi nhận</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4 pb-6 border-b last:border-b-0 last:pb-0">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {activityTypeIcons[activity.activityType] || (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.entityType} #{activity.entityId}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex-shrink-0">
                    {activity.activityType}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{formatters.formatDate(activity.createdAt)}</span>
                  <span>{formatters.formatTime(activity.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
