import type { UserStatus } from '@/types/user';
import type { RoleOption } from '@/types/role';
import { Badge } from '@/components/ui/badge';
import { USER_STATUS_CONFIG } from '@/constants/user';
import { IMPORT_FABRIC_STATUS_CONFIG } from '@/constants/importFabric';

type StatusBadgeProps = {
  status: UserStatus | string;
};

/**
 * Status badge component for users
 * Uses generic Badge component with user status config
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  // Try to use IMPORT_FABRIC_STATUS_CONFIG first, fallback to USER_STATUS_CONFIG
  const config = (IMPORT_FABRIC_STATUS_CONFIG as any)[status] 
    ? IMPORT_FABRIC_STATUS_CONFIG
    : USER_STATUS_CONFIG;
  
  return <Badge value={status} config={config as any} />;
}

type RoleBadgeProps = {
  role: string;
  roleOptions?: RoleOption[];
};

/**
 * Generate consistent hash from string
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Generate consistent color class based on role name
 * Predefined colors for basic roles: ADMIN, STAFF, USER
 * Random but consistent colors for other roles
 */
const getRoleColorClass = (roleName: string): string => {
  // Predefined colors for basic roles
  const predefinedColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    STAFF: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    USER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  // Check if role has predefined color
  if (predefinedColors[roleName]) {
    return predefinedColors[roleName];
  }

  // For other roles, use consistent random colors
  const colors = [
    // Green
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    // Yellow
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    // Red
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    // Indigo
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    // Pink
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    // Teal
    'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    // Orange
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    // Cyan
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    // Lime
    'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
    // Amber
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  ];
  
  // Use hash to pick a consistent color for this role
  const hash = hashCode(roleName);
  const colorIndex = hash % colors.length;
  return colors[colorIndex];
};

/**
 * Role badge component for users
 * Displays fullName if available, otherwise uses label (which may be description or name)
 * Colors are randomly assigned but consistent for each role name
 */
export function RoleBadge({ role, roleOptions }: RoleBadgeProps) {
  // Find the role label from API data
  const roleOption = roleOptions?.find(r => r.value === role);
  // Prefer fullName, then label, then role
  const label = roleOption?.fullName || roleOption?.label || role;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColorClass(role)}`}>
      {label}
    </span>
  );
}
