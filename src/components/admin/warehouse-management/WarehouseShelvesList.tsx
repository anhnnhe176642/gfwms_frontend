'use client';

import { ShelfCardGrid } from './ShelfCardGrid';

export interface WarehouseShelvesListProps {
  warehouseId: string | number;
}

/**
 * WarehouseShelvesList - Now uses the ShelfCardGrid component for a card-based view
 * with enhanced search, sorting, and groupBy functionality
 */
export function WarehouseShelvesList({ warehouseId }: WarehouseShelvesListProps) {
  return <ShelfCardGrid warehouseId={warehouseId} />;
}

export default WarehouseShelvesList;
