import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Voyage, DashboardStats } from '@/types';
import { mockVoyages, mockCurrentVoyage } from '@/data/mockVoyage';
import { useFishingStore } from './useFishingStore';
import { useCrewStore } from './useCrewStore';
import { useFuelStore } from './useFuelStore';
import { useSafetyStore } from './useSafetyStore';

interface VoyageState {
  currentVoyage: Voyage | null;
  voyageList: Voyage[];
  status: 'idle' | 'loading' | 'error';
  setCurrentVoyage: (voyage: Voyage | null) => void;
  addVoyage: (voyage: Voyage) => void;
  updateVoyage: (id: string, updates: Partial<Voyage>) => void;
  deleteVoyage: (id: string) => void;
  getDashboardStats: () => DashboardStats;
}

export const useVoyageStore = create<VoyageState>()(
  persist(
    (set, get) => ({
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

      deleteVoyage: (id) =>
        set((state) => ({
          voyageList: state.voyageList.filter((v) => v.id !== id),
          currentVoyage: get().currentVoyage?.id === id ? null : get().currentVoyage,
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
        const voyageProgress = Math.min(Math.max(Math.round((elapsedDays / totalDays) * 100), 0), 100);

        const todayStr = today.toISOString().split('T')[0];
        const catchRecords = useFishingStore.getState().catchRecords;
        const todayCatch = catchRecords
          .filter((c) => c.voyageId === currentVoyage.id && c.recordTime.split('T')[0] === todayStr)
          .reduce((sum, c) => sum + c.weight, 0);

        const schedules = useCrewStore.getState().schedules;
        const crewList = useCrewStore.getState().crewList;
        const crewOnDuty = schedules.filter(
          (s) => s.voyageId === currentVoyage.id && s.status === 'on_duty'
        ).length;

        const checks = useSafetyStore.getState().checks;
        const safetyWarnings = checks.filter(
          (c) => c.voyageId === currentVoyage.id && c.result === 'warning'
        ).length;

        const currentStock = useFuelStore.getState().currentStock;
        const fuelCapacity = useFuelStore.getState().fuelCapacity;
        const fuelPercentage = Math.round((currentStock / fuelCapacity) * 100);

        const operations = useFishingStore.getState().operations;

        return {
          voyageProgress,
          todayCatch,
          fuelStock: fuelPercentage,
          crewOnDuty,
          totalCrew: crewList.length,
          safetyWarnings,
          recentOperations: operations
            .filter((o) => o.voyageId === currentVoyage.id)
            .slice(-5),
          recentCatch: catchRecords
            .filter((c) => c.voyageId === currentVoyage.id)
            .slice(-5),
        };
      },
    }),
    {
      name: 'voyage-store',
    }
  )
);
