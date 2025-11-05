import { useState, useEffect } from 'react';
import { roleService } from '@/services/role.service';
import type { RoleOption } from '@/types/role';

/**
 * Hook để lấy danh sách roles từ API và convert sang format options
 */
export function useRoles() {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await roleService.getAllRoles();
        
        // Convert API response to options format
        const options: RoleOption[] = response.data.map((role) => ({
          value: role.name,
          label: role.fullName || role.name, 
          fullName: role.fullName,
          description: role.description,
        }));
        
        setRoles(options);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Không thể tải danh sách roles';
        setError(errorMessage);
        console.error('Failed to fetch roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, loading, error };
}
