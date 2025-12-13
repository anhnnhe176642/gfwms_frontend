import api from '@/lib/api';

export interface FabricInfo {
  id: number;
  category: string;
  categoryId: number;
  color: string;
  colorId: string;
  gloss: string;
  glossId: number;
  thickness: number;
  width: number;
  length: number;
}

export interface Pricing {
  sellingPricePerRoll: number;
  sellingPricePerMeter: number;
  estimatedValue: number;
}

export interface Allocation {
  fabricId: number;
  fabricInfo: FabricInfo;
  pricing: Pricing;
  quantity: number;
  unit: 'ROLL' | 'METER';
  available: number;
  uncutRolls: number;
  totalMeters: number;
  cuttingRollMeters: number;
}

export interface AllocateResponse {
  message: string;
  allocations: Allocation[];
  totalQuantity: number;
  unit: string;
  totalValue: number;
  storeId: number;
  storeName: string;
}

export interface AllocateRequest {
  categoryId?: number;
  quantity: number;
  unit: 'ROLL' | 'METER';
  storeId: number;
  colorId?: string;
  glossId?: number;
  thickness?: number;
  width?: number;
  length?: number;
}

const BASE_PATH = '/v1/fabric-store';

const fabricStoreService = {
  allocate: async (data: AllocateRequest): Promise<AllocateResponse> => {
    const res = await api.post<AllocateResponse>(`${BASE_PATH}/allocate`, data);
    return res.data;
  },
};

export default fabricStoreService;
