'use client';

import { useCreateOrderStore } from '@/store/useCreateOrderStore';
import { CreateOrderFabricTable } from './CreateOrderFabricTable';
import { CreateOrderForm } from './CreateOrderForm';
import type { StoreFabricListParams } from '@/types/storeFabric';

export type CreateOrderFlowProps = {
  storeId: number;
  storeName: string;
  initialParams?: StoreFabricListParams;
};

export function CreateOrderFlow({
  storeId,
  storeName,
  initialParams,
}: CreateOrderFlowProps) {
  const { currentStep } = useCreateOrderStore();

  if (currentStep === 2) {
    return <CreateOrderForm />;
  }

  return (
    <CreateOrderFabricTable
      storeId={storeId}
      storeName={storeName}
      initialParams={initialParams}
    />
  );
}

export default CreateOrderFlow;
