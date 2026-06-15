import { create } from 'zustand';
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
  addOperation: (operation: FishingOperation) => void;
  updateOperation: (id: string, updates: Partial<FishingOperation>) => void;
  addCatchRecord: (record: CatchRecord) => void;
  updateWeather: (weather: WeatherData) => void;
  getCatchBySpecies: () => { species: string; weight: number }[];
  getCatchByDate: (voyageId: string) => { date: string; weight: number }[];
}

export const useFishingStore = create<FishingState>((set, get) => ({
  grounds: mockFishingGrounds,
  operations: mockFishingOperations,
  catchRecords: mockCatchRecords,
  currentWeather: mockCurrentWeather,
  weatherData: generateWeatherHistory(),
  ports: mockPorts,
  currentOperation: mockFishingOperations.find((o) => o.status === 'in_progress') || null,

  addGround: (ground) =>
    set((state) => ({ grounds: [...state.grounds, ground] })),

  addOperation: (operation) =>
    set((state) => ({ operations: [...state.operations, operation] })),

  updateOperation: (id, updates) =>
    set((state) => ({
      operations: state.operations.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
      currentOperation:
        get().currentOperation?.id === id
          ? { ...get().currentOperation!, ...updates }
          : get().currentOperation,
    })),

  addCatchRecord: (record) =>
    set((state) => ({ catchRecords: [...state.catchRecords, record] })),

  updateWeather: (weather) => set({ currentWeather: weather }),

  getCatchBySpecies: () => {
    const records = get().catchRecords;
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
}));
