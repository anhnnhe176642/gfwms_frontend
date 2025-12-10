'use client';

import { create } from 'zustand';
import type { CreateRoleFormData } from '@/schemas/role.schema';

type DuplicateRoleState = {
  duplicateData: Partial<CreateRoleFormData> | null;
  setDuplicateData: (data: Partial<CreateRoleFormData>) => void;
  clearDuplicateData: () => void;
};

export const useDuplicateRoleStore = create<DuplicateRoleState>((set) => ({
  duplicateData: null,
  setDuplicateData: (data) => set({ duplicateData: data }),
  clearDuplicateData: () => set({ duplicateData: null }),
}));
