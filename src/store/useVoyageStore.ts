import { create } from 'zustand';
import type { Voyage, DashboardStats } from '@/types';
import { mockVoyages, mockCurrentVoyage } from '@/data/mockVoyage';
import { mockFishingOperations, mockCatchRecords } from '@/data/mockFishing';
import { mockCrews, mockCrewSchedules } from '@/data/mockCrew';
import { mockFuelStock } from '@/data/mockFuel';
import { mockSafetyChecks } from '@/data/mockSafety';

interface VoyageState {
  currentVoyage: Voyage | null;
  voyageList: Voyage[];
  status: 'idle' | 'loading' | 'error';
  setCurrentVoyage: (voyage: Voyage | null) => void;
  addVoyage: (voyage: Voyage) => void;
  updateVoyage: (id: string, updates: Partial<Voyage>) => void;
  getDashboardStats: () => DashboardStats;
}

export const useVoyageStore = create<VoyageState>((set, get) => ({
  currentVoyage: mockCurrentVoyage,
  voyageList: mockVoyages,
  status: 'idle',

  setCurrentVoyage: (voyage) => set({ currentVoyage: voyage }),

  addVoyage: (voyage) =>
    set((state) => ({ voyageList: [...state.voyageList, voyage] })),

  updateVoyage: (id, updates) =>
    set((state) => ({
      voyageList: state.voyageList.map((v) =>
        v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
      ),
      currentVoyage:
        get().currentVoyage?.id === id
          ? { ...get().currentVoyage!, ...updates, updatedAt: new Date().toISOString() }
          : get().currentVoyage,
    })),

  getDashboardStats: () => {
    const currentVoyage = get().currentVoyage;
    if (!currentVoyage) {
      return {
        voyageProgress: 0,
        todayCatch: 0,
        fuelStock: 0,
        crewOnDuty: 0,
        totalCrew: 0,
        safetyWarnings: 0,
        recentOperations: [],
        recentCatch: [],
      };
    }

    const startDate = new Date(currentVoyage.startDate);
    const endDate = new Date(currentVoyage.endDate);
    const today = new Date();
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const voyageProgress = Math.min(Math.round((elapsedDays / totalDays) * 100), 100);

    const todayStr = today.toISOString().split('T')[0];
    const todayCatch = mockCatchRecords
      .filter((c) => c.recordTime.split('T')[0] === todayStr)
      .reduce((sum, c) => sum + c.weight, 0);

    const crewOnDuty = mockCrewSchedules.filter(
      (s) => s.voyageId === currentVoyage.id && s.status === 'on_duty'
    ).length;

    const safetyWarnings = mockSafetyChecks.filter(
      (c) => c.voyageId === currentVoyage.id && c.result === 'warning'
    ).length;

    return {
      voyageProgress,
      todayCatch,
      fuelStock: mockFuelStock,
      crewOnDuty,
      totalCrew: mockCrews.length,
      safetyWarnings,
      recentOperations: mockFishingOperations
        .filter((o) => o.voyageId === currentVoyage.id)
        .slice(-5),
      recentCatch: mockCatchRecords
        .filter((c) => c.voyageId === currentVoyage.id)
        .slice(-5),
    };
  },
}));
