import { create } from 'zustand';
import type { FuelRecord } from '@/types';
import { mockFuelRecords, mockFuelStock, mockFuelCapacity } from '@/data/mockFuel';

interface FuelState {
  records: FuelRecord[];
  currentStock: number;
  fuelCapacity: number;
  addRecord: (record: FuelRecord) => void;
  getConsumptionByDate: (voyageId: string) => { date: string; consumption: number; refuel: number }[];
  getTotalConsumption: (voyageId: string) => number;
  getTotalRefuel: (voyageId: string) => number;
  getFuelPercentage: () => number;
}

export const useFuelStore = create<FuelState>((set, get) => ({
  records: mockFuelRecords,
  currentStock: mockFuelStock,
  fuelCapacity: mockFuelCapacity,

  addRecord: (record) => {
    set((state) => {
      const newStock = record.type === 'refuel'
        ? state.currentStock + record.amount
        : state.currentStock - record.amount;
      return {
        records: [...state.records, record],
        currentStock: newStock,
      };
    });
  },

  getConsumptionByDate: (voyageId) => {
    const records = get().records.filter((r) => r.voyageId === voyageId);
    const dateMap = new Map<string, { consumption: number; refuel: number }>();
    
    records.forEach((r) => {
      const date = r.recordTime.split('T')[0];
      const current = dateMap.get(date) || { consumption: 0, refuel: 0 };
      if (r.type === 'consumption') {
        current.consumption += r.amount;
      } else {
        current.refuel += r.amount;
      }
      dateMap.set(date, current);
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  getTotalConsumption: (voyageId) =>
    get().records
      .filter((r) => r.voyageId === voyageId && r.type === 'consumption')
      .reduce((sum, r) => sum + r.amount, 0),

  getTotalRefuel: (voyageId) =>
    get().records
      .filter((r) => r.voyageId === voyageId && r.type === 'refuel')
      .reduce((sum, r) => sum + r.amount, 0),

  getFuelPercentage: () =>
    Math.round((get().currentStock / get().fuelCapacity) * 100),
}));
