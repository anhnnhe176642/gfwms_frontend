'use client';

import { useState } from 'react';
import { ChevronDown, CheckCircle2, Circle, MinusCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildPermissionTree,
  addParentPermissions,
  validatePermissionHierarchy,
  findPermissionByKey,
  getPermissionState,
  type PermissionTreeNode,
} from '@/constants/permissions';
import { PERMISSIONS_TREE } from '@/constants/permissions-tree';

type PermissionTreeProps = {
  selectedPermissions: string[];
  isFetching: boolean;
  errors?: string;
  touched?: boolean;
  onTogglePermission: (permissionKey: string) => void;
  onToggleGroupPermissions?: (groupNodes: any[], groupKey?: string) => void;
  isReadOnly?: boolean; // New: true for view-only mode
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
  onToggleGroupNodes,
  isParentDisabled,
  isReadOnly,
}: {
  node: any; // Can be from PERMISSIONS_TREE or PermissionTreeNode
  selectedPermissions: Set<string>;
  expandedNodes: Set<string>;
  onToggleExpand: (key: string) => void;
  onTogglePermission: (key: string) => void;
  onToggleGroupNodes?: (groupNodes: any[], groupKey?: string) => void;
  isParentDisabled: boolean;
  isReadOnly?: boolean;
}) {
  // Check if this is a group node (no actual permission key)
  const isGroupNode = node.key === null || node.isGroupNode === true;
  const nodeKey = isGroupNode ? `group-${node.groupKey || node.description}` : node.key;
  
  const isExpanded = expandedNodes.has(nodeKey);
  const hasChildren = node.children && node.children.length > 0;

  // Get permission state (none, partial, full) - for actual permission nodes and group nodes
  const selectedArray = Array.from(selectedPermissions);
  const permissionState = !isGroupNode ? getPermissionState(node.key, selectedArray) : getGroupNodePermissionState(node.children, selectedPermissions);

  // Parent is disabled if it doesn't exist in selected permissions and has a parent
  const isDisabled = !isGroupNode && node.parentKey && !selectedPermissions.has(node.parentKey);
  const isDisabledBool = !!isDisabled;

  return (
    <div className="space-y-1">
      {/* Node Header */}
      <div
        className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
          isDisabledBool ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/50'
        }`}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleExpand(nodeKey);
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

        {/* Checkbox Display - Show for actual permission nodes and group nodes */}
        <button
          type="button"
          onClick={(e) => {
            if (isReadOnly) return;
            e.stopPropagation();
            if (isGroupNode && onToggleGroupNodes && hasChildren) {
              // Toggle group node (pass possible node.key if it represents a permission)
              onToggleGroupNodes(node.children, node.key);
            } else if (!isGroupNode && !isDisabledBool) {
              // Toggle regular permission node
              onTogglePermission(node.key);
            }
          }}
          className={`flex items-center shrink-0 -ml-1 ${!isReadOnly && !isDisabledBool ? 'cursor-pointer' : ''}`}
          disabled={isDisabledBool || isReadOnly}
        >
          <div className="relative h-5 w-5">
            {permissionState === 'full' ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : permissionState === 'partial' ? (
              <MinusCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <Circle className="h-5 w-5 text-border" />
            )}
          </div>
        </button>

        {/* Label */}
        <div 
          className={`flex-1 min-w-0 ${hasChildren && !isReadOnly ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (hasChildren && !isReadOnly) {
              onToggleExpand(nodeKey);
            }
          }}
        >
          <p className={`text-sm font-medium ${isDisabledBool ? 'text-muted-foreground' : isGroupNode ? 'text-foreground font-semibold' : 'text-foreground'}`}>
            {node.groupTitle || node.description}
          </p>
          {isGroupNode && node.groupDescription && <p className="text-xs text-muted-foreground">{node.groupDescription}</p>}
          {!isGroupNode && <p className="text-xs text-muted-foreground">{node.key}</p>}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-border/50 pl-3 space-y-1">
          {node.children.map((child: any, index: number) => (
            <PermissionTreeItem
              key={child.key || `group-${child.description}-${index}`}
              node={child}
              selectedPermissions={selectedPermissions}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onTogglePermission={onTogglePermission}
              onToggleGroupNodes={onToggleGroupNodes}
              isParentDisabled={isDisabledBool}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Recursive function to count all permissions including nested children
 */
function countAllPermissions(nodes: any[]): number {
  return nodes.reduce((total, node) => {
    // Count this node if it has a real permission key (not a group node)
    const nodeCount = node.key !== null && !node.isGroupNode ? 1 : 0;
    // Add children count recursively
    const childrenCount = node.children ? countAllPermissions(node.children) : 0;
    return total + nodeCount + childrenCount;
  }, 0);
}

/**
 * Recursive function to count selected permissions including nested children
 */
function countSelectedPermissions(nodes: any[], selectedSet: Set<string>): number {
  return nodes.reduce((total, node) => {
    // Count this node if it has a real permission key and is selected
    const nodeCount = node.key !== null && !node.isGroupNode && selectedSet.has(node.key) ? 1 : 0;
    // Add children count recursively
    const childrenCount = node.children ? countSelectedPermissions(node.children, selectedSet) : 0;
    return total + nodeCount + childrenCount;
  }, 0);
}

/**
 * Lấy state của group node (bao gồm children)
 */
function getGroupNodePermissionState(nodes: any[], selectedSet: Set<string>): 'none' | 'partial' | 'full' {
  if (!nodes || nodes.length === 0) return 'none';
  const totalPermissions = countAllPermissions(nodes);
  const selectedPermissions = countSelectedPermissions(nodes, selectedSet);
  
  if (selectedPermissions === 0) return 'none';
  if (selectedPermissions === totalPermissions) return 'full';
  return 'partial';
}

/**
 * Lấy state của group: none (không có gì được chọn), partial (một số được chọn), full (tất cả được chọn)
 */
function getGroupPermissionState(nodes: any[], selectedSet: Set<string>): 'none' | 'partial' | 'full' {
  const totalPermissions = countAllPermissions(nodes);
  const selectedPermissions = countSelectedPermissions(nodes, selectedSet);
  
  if (selectedPermissions === 0) return 'none';
  if (selectedPermissions === totalPermissions) return 'full';
  return 'partial';
}

export function PermissionTree({
  selectedPermissions,
  isFetching,
  errors,
  touched,
  onTogglePermission: onTogglePermissionProp,
  onToggleGroupPermissions,
  isReadOnly = false,
}: PermissionTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set() // Không auto-expand, để người dùng tự mở
  );

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set() // Trạng thái mở/thu gọn các nhóm
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
  };

  const toggleGroupExpand = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const handleTogglePermission = (key: string) => {
    const perm = findPermissionByKey(key);
    if (!perm) return;

    onTogglePermissionProp(key);
  };

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
          <div className="flex items-center justify-center py-12">
            <div className="space-y-3 text-center">
              <div className="inline-block">
                <div className="h-8 w-8 border-4 border-muted-foreground border-t-primary rounded-full animate-spin" />
              </div>
              <div className="text-muted-foreground text-sm">Đang tải danh sách quyền từ backend...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Indicator */}
            {isReadOnly && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Chế độ xem - Không thể chỉnh sửa quyền</span>
              </div>
            )}
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Render PERMISSIONS_TREE groups */}
            {Object.entries(PERMISSIONS_TREE).map(([groupKey, group]: any) => {
              const isGroupExpanded = expandedGroups.has(group.groupKey);
              // Include group's own permission key (if any) when calculating state and counts
              const ownKeyCount = group.key ? 1 : 0;
              const ownSelectedCount = group.key && selectedSet.has(group.key) ? 1 : 0;
              const totalPermissions = ownKeyCount + countAllPermissions(group.children);
              const selectedPermissions = ownSelectedCount + countSelectedPermissions(group.children, selectedSet);
              const groupState = selectedPermissions === 0 ? 'none' : selectedPermissions === totalPermissions ? 'full' : 'partial';

              return (
                <div key={group.groupKey} className="border rounded-lg overflow-hidden">
                  {/* Group Header - Collapsible */}
                  <div className={`flex items-center gap-3 p-4 transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-50 dark:bg-gray-900' 
                      : 'bg-accent/50 hover:bg-accent'
                  }`}
                  >
                    {/* Expand/Collapse Button */}
                    <button
                      type="button"
                      onClick={() => toggleGroupExpand(group.groupKey)}
                      className="p-2 -ml-2 hover:bg-accent rounded-md transition-colors shrink-0"
                    >
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          isGroupExpanded ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </button>

                    {/* Group Checkbox */}
                            <button
                      type="button"
                      onClick={(e) => {
                        if (isReadOnly) return;
                        e.stopPropagation();
                        if (onToggleGroupPermissions) {
                          onToggleGroupPermissions(group.children, group.key);
                        }
                      }}
                      className={`flex items-center shrink-0 -ml-1 ${!isReadOnly ? 'cursor-pointer' : ''}`}
                      disabled={isReadOnly}
                    >
                      <div className="relative h-5 w-5">
                        {groupState === 'full' ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : groupState === 'partial' ? (
                          <MinusCircle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-border" />
                        )}
                      </div>
                    </button>

                    {/* Group Info */}
                    <div 
                      className={`flex-1 cursor-pointer ${!isReadOnly ? 'hover:opacity-80' : ''}`}
                      onClick={() => toggleGroupExpand(group.groupKey)}
                    >
                      <h3 className={`text-sm font-semibold ${isReadOnly ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {group.groupTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{group.groupDescription}</p>
                    </div>

                    {/* Counter */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        isReadOnly
                          ? 'text-muted-foreground bg-gray-100 dark:bg-gray-800'
                          : 'text-muted-foreground bg-background'
                      }`}>
                        {selectedPermissions}/{totalPermissions}
                      </span>
                    </div>
                  </div>

                  {/* Group Children - Collapsible Content */}
                  {isGroupExpanded && (
                    <div className={`p-4 space-y-1 border-t ${isReadOnly ? 'bg-gray-50 dark:bg-gray-900' : 'bg-card'}`}>
                      {group.children.map((node: any, index: number) => (
                        <PermissionTreeItem
                          key={node.key || `group-${node.description}-${index}`}
                          node={node}
                          selectedPermissions={selectedSet}
                          expandedNodes={expandedNodes}
                          onToggleExpand={toggleExpand}
                          onTogglePermission={handleTogglePermission}
                          onToggleGroupNodes={onToggleGroupPermissions}
                          isParentDisabled={false}
                          isReadOnly={isReadOnly}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </>
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
