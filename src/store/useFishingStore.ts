import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FishingGround, FishingOperation, CatchRecord, WeatherData, Port } from '@/types';
import {
  mockFishingGrounds,
  mockFishingOperations,
  mockCatchRecords,
  mockCurrentWeather,
  mockPorts,
} from '@/data/mockFishing';

const generateWeatherHistory = (): WeatherData[] => {
  const history: WeatherData[] = [];
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i * 6);
    history.push({
      timestamp: date.toISOString(),
      temperature: 24 + Math.random() * 4,
      humidity: 70 + Math.random() * 15,
      windSpeed: 8 + Math.random() * 10,
      windDirection: ['东风', '南风', '西风', '北风', '东南风', '西北风'][Math.floor(Math.random() * 6)],
      waveHeight: 0.5 + Math.random() * 2.5,
      seaState: Math.floor(Math.random() * 5) + 1,
      visibility: 8 + Math.random() * 12,
      weatherCondition: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
    });
  }
  return history;
};

interface FishingState {
  grounds: FishingGround[];
  operations: FishingOperation[];
  catchRecords: CatchRecord[];
  currentWeather: WeatherData;
  weatherData: WeatherData[];
  ports: Port[];
  currentOperation: FishingOperation | null;
  addGround: (ground: FishingGround) => void;
  updateGround: (id: string, updates: Partial<FishingGround>) => void;
  deleteGround: (id: string) => void;
  addOperation: (operation: FishingOperation) => void;
  updateOperation: (id: string, updates: Partial<FishingOperation>) => void;
  deleteOperation: (id: string) => void;
  addCatchRecord: (record: CatchRecord) => void;
  updateCatchRecord: (id: string, updates: Partial<CatchRecord>) => void;
  deleteCatchRecord: (id: string) => void;
  updateWeather: (weather: WeatherData) => void;
  getCatchBySpecies: (voyageId?: string) => { species: string; weight: number }[];
  getCatchByDate: (voyageId: string) => { date: string; weight: number }[];
  getCatchByStorage: (voyageId: string) => { storage: string; used: number; total: number }[];
}

export const useFishingStore = create<FishingState>()(
  persist(
    (set, get) => ({
      grounds: mockFishingGrounds,
      operations: mockFishingOperations,
      catchRecords: mockCatchRecords,
      currentWeather: mockCurrentWeather,
      weatherData: generateWeatherHistory(),
      ports: mockPorts,
      currentOperation: mockFishingOperations.find((o) => o.status === 'in_progress') || null,

      addGround: (ground) =>
        set((state) => ({ grounds: [...state.grounds, ground] })),

      updateGround: (id, updates) =>
        set((state) => ({
          grounds: state.grounds.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        })),

      deleteGround: (id) =>
        set((state) => ({
          grounds: state.grounds.filter((g) => g.id !== id),
        })),

      addOperation: (operation) =>
        set((state) => ({ operations: [...state.operations, operation] })),

      updateOperation: (id, updates) =>
        set((state) => ({
          operations: state.operations.map((o) =>
            o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
          ),
          currentOperation:
            get().currentOperation?.id === id
              ? { ...get().currentOperation!, ...updates, updatedAt: new Date().toISOString() }
              : get().currentOperation,
        })),

      deleteOperation: (id) =>
        set((state) => ({
          operations: state.operations.filter((o) => o.id !== id),
          currentOperation: get().currentOperation?.id === id ? null : get().currentOperation,
        })),

      addCatchRecord: (record) =>
        set((state) => ({ catchRecords: [...state.catchRecords, record] })),

      updateCatchRecord: (id, updates) =>
        set((state) => ({
          catchRecords: state.catchRecords.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCatchRecord: (id) =>
        set((state) => ({
          catchRecords: state.catchRecords.filter((c) => c.id !== id),
        })),

      updateWeather: (weather) => set({ currentWeather: weather }),

      getCatchBySpecies: (voyageId) => {
        let records = get().catchRecords;
        if (voyageId) {
          records = records.filter((r) => r.voyageId === voyageId);
        }
        const speciesMap = new Map<string, number>();
        records.forEach((r) => {
          const current = speciesMap.get(r.species) || 0;
          speciesMap.set(r.species, current + r.weight);
        });
        return Array.from(speciesMap.entries()).map(([species, weight]) => ({ species, weight }));
      },

      getCatchByDate: (voyageId) => {
        const records = get().catchRecords.filter((r) => r.voyageId === voyageId);
        const dateMap = new Map<string, number>();
        records.forEach((r) => {
          const date = r.recordTime.split('T')[0];
          const current = dateMap.get(date) || 0;
          dateMap.set(date, current + r.weight);
        });
        return Array.from(dateMap.entries())
          .map(([date, weight]) => ({ date, weight }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getCatchByStorage: (voyageId) => {
        const records = get().catchRecords.filter((r) => r.voyageId === voyageId);
        const storageMap = new Map<string, number>();
        records.forEach((r) => {
          const current = storageMap.get(r.storageLocation) || 0;
          storageMap.set(r.storageLocation, current + r.weight);
        });
        
        const totalCapacity: Record<string, number> = {
          '保鲜舱A': 5000,
          '保鲜舱B': 5000,
          '冷冻舱A': 8000,
          '冷冻舱B': 8000,
          '速冻舱': 3000,
        };
        
        return Array.from(storageMap.entries()).map(([storage, used]) => ({
          storage,
          used,
          total: totalCapacity[storage] || 5000,
        }));
      },
    }),
    {
      name: 'fishing-store',
    }
  )
);
