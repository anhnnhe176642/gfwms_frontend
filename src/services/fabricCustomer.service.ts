import api from '@/lib/api';

export interface FilterOption<T> {
  count: number;
  totalUncut: number;
  totalMeters: number;
}

export interface CategoryFilterOption extends FilterOption<unknown> {
  id: number;
  name: string;
}

export interface ColorFilterOption extends FilterOption<unknown> {
  id: string;
  name: string;
  hexCode: string;
}

export interface GlossFilterOption extends FilterOption<unknown> {
  id: number;
  description: string;
}

export interface NumericFilterOption extends FilterOption<unknown> {
  value: number;
}

export interface StoreFilterOption {
  id: number;
  name: string;
  address: string;
  fabricCount: number;
  totalUncutRolls: number;
  totalCuttingMeters: number;
  totalMeters: number;
  latitude: number | null;
  longitude: number | null;
}

export interface FabricFilterOptionsResponse {
  message: string;
  data: {
    categories: CategoryFilterOption[];
    colors: ColorFilterOption[];
    glosses: GlossFilterOption[];
    thicknesses: NumericFilterOption[];
    widths: NumericFilterOption[];
    lengths: NumericFilterOption[];
    stores: StoreFilterOption[];
  };
}

export interface FabricFilterParams {
  categoryId?: number;
  colorId?: string;
  glossId?: number;
  thickness?: number;
  width?: number;
  length?: number;
}

const BASE_PATH = '/v1/fabric-customers/filter-options';

export const fabricCustomerService = {
  /**
   * Get filter options (categories, colors, glosses, thicknesses, widths, lengths, stores)
   * Returns available options based on provided filters
   */
  getFilterOptions: async (
    params?: FabricFilterParams
  ): Promise<FabricFilterOptionsResponse['data']> => {
    const response = await api.get<FabricFilterOptionsResponse>(BASE_PATH, { params });
    return response.data.data;
  },
};

export default fabricCustomerService;
