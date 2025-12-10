import { toast } from 'sonner';
import { geminiService } from '@/services/gemini.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import {
  getAllPermissions,
  addParentPermissions,
  getAllDescendants,
  getPermissionState,
} from '@/constants/permissions';

type SetFieldValue = (field: string, value: any) => void;

/**
 * Lấy tất cả permission keys từ các children node (recursive)
 */
const getAllPermissionKeysFromNodes = (nodes: any[]): string[] => {
  const keys: string[] = [];
  
  const traverse = (nodeList: any[]) => {
    nodeList.forEach(node => {
      // Chỉ thêm nếu có key thực (không phải group node)
      if (node.key && node.key !== null && !node.isGroupNode) {
        keys.push(node.key);
      }
      // Recursively traverse children
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  
  traverse(nodes);
  return keys;
};

/**
 * Hook để quản lý logic quyền trong role form
 * - Toggle permission với 3 trạng thái: none → partial → full → none
 * - Tự động tóm tắt mô tả từ quyền được chọn
 */
export const useRolePermissions = (setFieldValue: SetFieldValue) => {
  /**
   * Toggle permission giữa 3 trạng thái
   * none → partial: chỉ bật parent
   * partial → full: bật tất cả con
   * full → none: tắt parent + con
   */
  const togglePermission = (permissionKey: string, currentPermissions: string[]) => {
    const state = getPermissionState(permissionKey, currentPermissions);

    // Lấy tất cả descendants
    const descendants = getAllDescendants(permissionKey);
    const descendantKeys = new Set(descendants.map((p) => p.key));

    if (state === 'none') {
      // none -> partial: chỉ bật parent (không bật con)
      const withParents = addParentPermissions([...currentPermissions, permissionKey]);
      setFieldValue('permissions', withParents);
    } else if (state === 'partial') {
      // partial -> full: bật tất cả con
      const withChildren = [...currentPermissions];
      descendants.forEach(d => {
        if (!withChildren.includes(d.key)) {
          withChildren.push(d.key);
        }
      });
      setFieldValue('permissions', withChildren);
    } else {
      // full -> none: tắt parent + tất cả con
      const updated = currentPermissions.filter(
        (key: string) => key !== permissionKey && !descendantKeys.has(key)
      );
      setFieldValue('permissions', updated);
    }
  };

  /**
   * Toggle tất cả permissions trong một group
   * - Nếu chưa có quyền nào được chọn trong group: chọn tất cả
   * - Nếu đã có một số quyền được chọn: chọn tất cả
   * - Nếu đã chọn hết: bỏ chọn tất cả
   */
  const toggleGroupPermissions = (groupNodes: any[], currentPermissions: string[]) => {
    const permissionKeysInGroup = getAllPermissionKeysFromNodes(groupNodes);
    const selectedKeysInGroup = currentPermissions.filter(key => permissionKeysInGroup.includes(key));
    
    let updated: string[];
    
    if (selectedKeysInGroup.length === permissionKeysInGroup.length) {
      // Tất cả đã được chọn -> bỏ chọn tất cả
      updated = currentPermissions.filter(key => !permissionKeysInGroup.includes(key));
    } else {
      // Chưa chọn hết hoặc chưa có gì -> chọn tất cả + thêm parent permissions
      const newPermissions = [
        ...currentPermissions,
        ...permissionKeysInGroup.filter(key => !currentPermissions.includes(key))
      ];
      updated = addParentPermissions(newPermissions);
    }
    
    setFieldValue('permissions', updated);
  };

  /**
   * Tóm tắt mô tả vai trò từ các quyền được chọn bằng AI
   * Truyền cả quyền được bật và quyền chưa được bật để AI có bối cảnh đầy đủ
   */
  const generateDescriptionFromPermissions = async (selectedPermissionKeys: string[]) => {
    if (selectedPermissionKeys.length === 0) {
      toast.error('Vui lòng chọn ít nhất một quyền để tóm tắt');
      return false;
    }

    try {
      // Lấy tất cả permissions
      const allPerms = getAllPermissions();
      
      // Lấy descriptions của quyền được chọn
      const selectedDescriptions = selectedPermissionKeys
        .map((key: string) => allPerms.find(p => p.key === key)?.description)
        .filter(Boolean);

      // Lấy descriptions của quyền chưa được chọn
      const notSelectedPerms = allPerms.filter(p => !selectedPermissionKeys.includes(p.key));
      const notSelectedDescriptions = notSelectedPerms
        .map(p => p.description)
        .filter(Boolean);

      const selectedText = selectedDescriptions.join(', ');
      const notSelectedText = notSelectedDescriptions.join(', ');

      const prompt = `
Vai trò này CÓ các quyền: ${selectedText}

Vai trò này KHÔNG CÓ các quyền: ${notSelectedText}

Hãy giải thích vai trò này có thể làm được những gì và không thể làm gì, dựa vào các quyền có thể và các quyền không thể đưa ra góc nhìn tổng quan về vai trò này. Tóm tắt dưới 300 kí tự.
`.trim();

      const response = await geminiService.prompt({
        prompt,
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 2000,
      });

      setFieldValue('description', response.data.text);
      toast.success('Tóm tắt mô tả thành công');
      return true;
    } catch (err) {
      const message = getServerErrorMessage(err);
      toast.error(message || 'Không thể tóm tắt mô tả');
      return false;
    }
  };

  return {
    togglePermission,
    toggleGroupPermissions,
    generateDescriptionFromPermissions,
  };
};
