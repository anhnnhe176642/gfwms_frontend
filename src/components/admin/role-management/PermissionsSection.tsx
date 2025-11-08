'use client';

import { useState } from 'react';
import { Loader, CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Permission } from '@/types/role';

type PermissionGroup = {
  group: string;
  permissions: Permission[];
};

type PermissionsSectionProps = {
  permissionGroups: PermissionGroup[];
  selectedPermissions: number[];
  isFetching: boolean;
  errors?: string;
  touched?: boolean;
  onTogglePermission: (permissionId: number) => void;
  onToggleGroup: (group: PermissionGroup) => void;
};

export function PermissionsSection({
  permissionGroups,
  selectedPermissions,
  isFetching,
  errors,
  touched,
  onTogglePermission,
  onToggleGroup,
}: PermissionsSectionProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroupExpanded = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const isGroupFullySelected = (group: PermissionGroup) => {
    return group.permissions.every(p => selectedPermissions.includes(p.id));
  };

  const isGroupPartiallySelected = (group: PermissionGroup) => {
    const groupPermissionIds = group.permissions.map(p => p.id);
    return groupPermissionIds.some(id => selectedPermissions.includes(id)) && !isGroupFullySelected(group);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quyền hạn</CardTitle>
        <CardDescription>Chọn những quyền cần gán cho vai trò này</CardDescription>
      </CardHeader>
      <CardContent>
        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Đang tải danh sách quyền...</span>
          </div>
        ) : permissionGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có quyền nào để hiển thị
          </div>
        ) : (
          <div className="space-y-3">
            {permissionGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.group);
              const selectedCount = group.permissions.filter(p =>
                selectedPermissions.includes(p.id)
              ).length;

              return (
                <div key={group.group} className="border rounded-lg overflow-hidden">
                  {/* Group Header - Collapsible */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      toggleGroupExpanded(group.group);
                    }}
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                    <div
                      className="relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleGroup(group);
                      }}
                    >
                      {isGroupFullySelected(group) ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : isGroupPartiallySelected(group) ? (
                        <div className="relative">
                          <Circle className="h-5 w-5 text-border" />
                          <div className="absolute inset-1 bg-primary rounded-full" />
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-border" />
                      )}
                    </div>
                    <h3 className="font-semibold flex-1">{group.group}</h3>
                    <span className="text-sm text-muted-foreground">
                      {selectedCount} / {group.permissions.length}
                    </span>
                  </div>

                  {/* Group Permissions - Collapsible Content */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.permissions.map((permission) => {
                          const isSelected = selectedPermissions.includes(permission.id);
                          return (
                            <div
                              key={permission.id}
                              className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-accent transition-colors"
                              onClick={() => onTogglePermission(permission.id)}
                            >
                              <div className="mt-1">
                                {isSelected ? (
                                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                ) : (
                                  <Circle className="h-4 w-4 text-border shrink-0" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {permission.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {permission.key}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {errors && touched && (
          <p className="text-sm text-destructive mt-4">{errors}</p>
        )}
      </CardContent>
    </Card>
  );
}
