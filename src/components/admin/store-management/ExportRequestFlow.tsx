'use client';

import { useExportRequestStore } from '@/store/useExportRequestStore';
import { ExportRequestTable, ExportRequestTableProps } from './ExportRequestTable';
import { ExportWarehouseAllocation } from './ExportWarehouseAllocation';

export function ExportRequestFlow(props: ExportRequestTableProps) {
  const { currentStep } = useExportRequestStore();

  if (currentStep === 2) {
    return <ExportWarehouseAllocation />;
  }

  return <ExportRequestTable {...props} />;
}

export default ExportRequestFlow;
