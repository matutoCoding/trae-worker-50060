import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinanceRecord, FinanceSummary } from '@/types';
import { mockFinanceRecords } from '@/data/mockFinance';

interface FinanceState {
  records: FinanceRecord[];
  addRecord: (record: FinanceRecord) => void;
  updateRecord: (id: string, updates: Partial<FinanceRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordsByType: (voyageId: string, type: 'income' | 'expense') => FinanceRecord[];
  getRecordsByCategory: (voyageId: string) => { category: string; income: number; expense: number }[];
  getSummaryByVoyage: (voyageId: string) => FinanceSummary;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      records: mockFinanceRecords,

      addRecord: (record) =>
        set((state) => ({ records: [...state.records, record] })),

      updateRecord: (id, updates) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),

      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      getRecordsByType: (voyageId, type) =>
        get().records.filter(
          (r) => r.voyageId === voyageId && r.type === type
        ),

      getRecordsByCategory: (voyageId) => {
        const records = get().records.filter((r) => r.voyageId === voyageId);
        const categoryMap = new Map<string, { income: number; expense: number }>();

        records.forEach((r) => {
          const current = categoryMap.get(r.category) || { income: 0, expense: 0 };
          if (r.type === 'income') {
            current.income += r.amount;
          } else {
            current.expense += r.amount;
          }
          categoryMap.set(r.category, current);
        });

        return Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          ...data,
        }));
      },

      getSummaryByVoyage: (voyageId) => {
        const records = get().records.filter((r) => r.voyageId === voyageId);
        const totalIncome = records
          .filter((r) => r.type === 'income')
          .reduce((sum, r) => sum + r.amount, 0);
        const totalExpense = records
          .filter((r) => r.type === 'expense')
          .reduce((sum, r) => sum + r.amount, 0);

        const costBreakdown = records
          .filter((r) => r.type === 'expense')
          .reduce((acc, r) => {
            const existing = acc.find((c) => c.category === r.category);
            if (existing) {
              existing.amount += r.amount;
            } else {
              acc.push({ category: r.category, amount: r.amount });
            }
            return acc;
          }, [] as { category: string; amount: number }[]);

        return {
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense,
          costBreakdown,
        };
      },
    }),
    {
      name: 'finance-store',
    }
  )
);
