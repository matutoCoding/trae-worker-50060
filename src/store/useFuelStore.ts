import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FuelRecord } from '@/types';
import { mockFuelRecords, mockFuelStock, mockFuelCapacity } from '@/data/mockFuel';

interface FuelState {
  records: FuelRecord[];
  currentStock: number;
  fuelCapacity: number;
  addRecord: (record: FuelRecord) => void;
  updateRecord: (id: string, updates: Partial<FuelRecord>) => void;
  deleteRecord: (id: string) => void;
  getConsumptionByDate: (voyageId: string) => { date: string; consumption: number; refuel: number }[];
  getTotalConsumption: (voyageId: string) => number;
  getTotalRefuel: (voyageId: string) => number;
  getFuelPercentage: () => number;
}

export const useFuelStore = create<FuelState>()(
  persist(
    (set, get) => ({
      records: mockFuelRecords,
      currentStock: mockFuelStock,
      fuelCapacity: mockFuelCapacity,

      addRecord: (record) => {
        set((state) => {
          const newStock = record.type === 'refuel'
            ? Math.min(state.currentStock + record.amount, state.fuelCapacity)
            : Math.max(state.currentStock - record.amount, 0);
          return {
            records: [...state.records, record],
            currentStock: newStock,
          };
        });
      },

      updateRecord: (id, updates) => {
        set((state) => {
          const oldRecord = state.records.find((r) => r.id === id);
          if (!oldRecord) return state;
          
          let stockAdjustment = 0;
          if (oldRecord.type === 'refuel') {
            stockAdjustment -= oldRecord.amount;
          } else {
            stockAdjustment += oldRecord.amount;
          }
          if (updates.type === 'refuel') {
            stockAdjustment += updates.amount || 0;
          } else if (updates.type === 'consumption') {
            stockAdjustment -= updates.amount || 0;
          } else {
            if (oldRecord.type === 'refuel') {
              stockAdjustment += updates.amount || 0;
            } else {
              stockAdjustment -= updates.amount || 0;
            }
          }
          
          const newStock = Math.max(0, Math.min(state.currentStock + stockAdjustment, state.fuelCapacity));
          
          return {
            records: state.records.map((r) =>
              r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            ),
            currentStock: newStock,
          };
        });
      },

      deleteRecord: (id) => {
        set((state) => {
          const record = state.records.find((r) => r.id === id);
          if (!record) return state;
          
          const stockAdjustment = record.type === 'refuel'
            ? -record.amount
            : record.amount;
          const newStock = Math.max(0, Math.min(state.currentStock + stockAdjustment, state.fuelCapacity));
          
          return {
            records: state.records.filter((r) => r.id !== id),
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
    }),
    {
      name: 'fuel-store',
    }
  )
);
