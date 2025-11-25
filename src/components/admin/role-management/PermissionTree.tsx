'use client';

import { useState } from 'react';
import { ChevronDown, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildPermissionTree,
  addParentPermissions,
  validatePermissionHierarchy,
  findPermissionByKey,
  type PermissionTreeNode,
} from '@/constants/permissions';

type PermissionTreeProps = {
  selectedPermissions: string[];
  isFetching: boolean;
  errors?: string;
  touched?: boolean;
  onTogglePermission: (permissionKey: string) => void;
};

/**
 * Recursive component to render permission tree nodes
 */
function PermissionTreeItem({
  node,
  selectedPermissions,
  expandedNodes,
  onToggleExpand,
  onTogglePermission,
  isParentDisabled,
}: {
  node: PermissionTreeNode;
  selectedPermissions: Set<string>;
  expandedNodes: Set<string>;
  onToggleExpand: (key: string) => void;
  onTogglePermission: (key: string) => void;
  isParentDisabled: boolean;
}) {
  const isExpanded = expandedNodes.has(node.key);
  const isSelected = selectedPermissions.has(node.key);
  const hasChildren = node.children.length > 0;

  // Check if all children are selected (for partial selection indicator)
  const selectedChildCount = node.children.filter(child =>
    selectedPermissions.has(child.key)
  ).length;
  const isPartiallySelected = selectedChildCount > 0 && selectedChildCount < node.children.length;

  // Parent is disabled if it doesn't exist in selected permissions and has a parent
  const isDisabled = node.parentKey && !selectedPermissions.has(node.parentKey);
  const isDisabledBool = !!isDisabled;

  return (
    <div className="space-y-1">
      {/* Node Header - Make entire row clickable */}
      <div
        className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
          isDisabledBool ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/50'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDisabledBool) {
            onTogglePermission(node.key);
          }
        }}
      >
        {/* Expand/Collapse Button - Stop propagation to prevent toggle on expand click */}
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleExpand(node.key);
            }}
            disabled={isDisabledBool}
            className="p-2 -ml-2 hover:bg-accent rounded-md transition-colors shrink-0"
          >
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                isExpanded ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        )}
        {!hasChildren && <div className="w-9" />}

        {/* Checkbox Display */}
        <div className="flex items-center shrink-0">
          <div className="relative h-5 w-5">
            {isSelected ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : isPartiallySelected ? (
              <>
                <Circle className="h-5 w-5 text-border" />
                <div className="absolute inset-1.5 bg-primary/50 rounded-full" />
              </>
            ) : (
              <Circle className="h-5 w-5 text-border" />
            )}
          </div>
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDisabledBool ? 'text-muted-foreground' : 'text-foreground'}`}>
            {node.description}
          </p>
          <p className="text-xs text-muted-foreground">{node.key}</p>
        </div>
      </div>

      {/* Children - Level 1 children show horizontally */}
      {hasChildren && isExpanded && node.level === 0 && (
        <div className="ml-4 border-l border-border/50 pl-3 space-y-3">
          {/* First level children in horizontal grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-x-auto">
            {node.children.map(child => (
              <PermissionTreeItem
                key={child.key}
                node={child}
                selectedPermissions={selectedPermissions}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
                onTogglePermission={onTogglePermission}
                isParentDisabled={isDisabledBool}
              />
            ))}
          </div>
        </div>
      )}

      {/* Children - Deeper levels (2+) show vertically like normal tree */}
      {hasChildren && isExpanded && (node.level ?? 0) > 0 && (
        <div className="ml-4 border-l border-border/50 pl-3 space-y-1">
          {node.children.map(child => (
            <PermissionTreeItem
              key={child.key}
              node={child}
              selectedPermissions={selectedPermissions}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onTogglePermission={onTogglePermission}
              isParentDisabled={isDisabledBool}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PermissionTree({
  selectedPermissions,
  isFetching,
  errors,
  touched,
  onTogglePermission: onTogglePermissionProp,
}: PermissionTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['system:admin']) // Expand system by default
  );

  const selectedSet = new Set(selectedPermissions);

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedNodes(newExpanded);
    // Important: This function should NOT trigger any form changes
  };

  const handleTogglePermission = (key: string) => {
    const perm = findPermissionByKey(key);
    if (!perm) return;

    // Just pass the key to toggle - let the parent handle all logic
    onTogglePermissionProp(key);
  };

  const tree = buildPermissionTree(selectedPermissions);

  // Validate hierarchy and show warnings
  const missingParents = validatePermissionHierarchy(selectedPermissions);
  const hasWarning = missingParents.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân quyền theo cấu trúc</CardTitle>
        <CardDescription>
          Chọn quyền cần gán cho vai trò. Quyền cha phải được chọn trước khi có thể chọn quyền con.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning Alert */}
        {hasWarning && (
          <div className="flex items-start gap-2 p-4 rounded-md bg-destructive/10 border border-destructive/30">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive text-sm">Cấu hình quyền không hợp lệ</p>
              <p className="text-sm text-destructive/90 mt-1">
                Thiếu quyền cha: {missingParents.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Đang tải danh sách quyền...</div>
          </div>
        ) : tree.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có quyền nào để hiển thị
          </div>
        ) : (
          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
            {tree.map(node => (
              <PermissionTreeItem
                key={node.key}
                node={node}
                selectedPermissions={selectedSet}
                expandedNodes={expandedNodes}
                onToggleExpand={toggleExpand}
                onTogglePermission={handleTogglePermission}
                isParentDisabled={false}
              />
            ))}
          </div>
        )}

        {/* Error Message */}
        {errors && touched && (
          <p className="text-sm text-destructive mt-4">{errors}</p>
        )}

        {/* Summary */}
        {selectedPermissions.length > 0 && !isFetching && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Đã chọn <span className="font-semibold text-foreground">{selectedPermissions.length}</span> quyền
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
