import { create } from 'zustand';
import { mockApi } from '../services/mock';
import type { Warning, WarningStatus, WarningType } from '../types';

interface WarningState {
  warnings: Warning[];
  selectedWarning: Warning | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;

  loadWarnings: (params?: {
    status?: WarningStatus;
    type?: WarningType;
    regionId?: string;
    page?: number;
    pageSize?: number;
  }) => Promise<void>;
  loadWarningById: (id: string) => Promise<void>;
  confirmWarning: (id: string, opinion: string) => Promise<Warning>;
  reviewWarning: (id: string, opinion: string) => Promise<Warning>;
  approveWarning: (id: string, opinion: string) => Promise<Warning>;
  rejectWarning: (id: string, opinion: string) => Promise<Warning>;
  closeWarning: (id: string) => Promise<Warning>;
  setPage: (page: number) => void;
  clearSelectedWarning: () => void;
  clearError: () => void;
}

export const useWarningStore = create<WarningState>((set, get) => ({
  warnings: [],
  selectedWarning: null,
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,

  loadWarnings: async (params = {}) => {
    set({ loading: true });
    try {
      const { data, total } = await mockApi.warning.getWarnings({
        page: get().page,
        pageSize: get().pageSize,
        ...params,
      });
      set({ warnings: data, total, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadWarningById: async (id) => {
    set({ loading: true });
    try {
      const data = await mockApi.warning.getWarningById(id);
      set({ selectedWarning: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  confirmWarning: async (id, opinion) => {
    set({ loading: true });
    try {
      const warning = await mockApi.warning.confirmWarning(id, opinion);
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? warning : w)),
        selectedWarning: warning,
        loading: false,
      }));
      return warning;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reviewWarning: async (id, opinion) => {
    set({ loading: true });
    try {
      const warning = await mockApi.warning.reviewWarning(id, opinion);
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? warning : w)),
        selectedWarning: warning,
        loading: false,
      }));
      return warning;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  approveWarning: async (id, opinion) => {
    set({ loading: true });
    try {
      const warning = await mockApi.warning.approveWarning(id, opinion);
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? warning : w)),
        selectedWarning: warning,
        loading: false,
      }));
      return warning;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  rejectWarning: async (id, opinion) => {
    set({ loading: true });
    try {
      const warning = await mockApi.warning.rejectWarning(id, opinion);
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? warning : w)),
        selectedWarning: warning,
        loading: false,
      }));
      return warning;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  closeWarning: async (id) => {
    set({ loading: true });
    try {
      const warning = await mockApi.warning.closeWarning(id);
      set((state) => ({
        warnings: state.warnings.map((w) => (w.id === id ? warning : w)),
        selectedWarning: warning,
        loading: false,
      }));
      return warning;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setPage: (page) => set({ page }),

  clearSelectedWarning: () => set({ selectedWarning: null }),

  clearError: () => set({ error: null }),
}));
