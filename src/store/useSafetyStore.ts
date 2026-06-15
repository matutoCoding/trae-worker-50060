import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SafetyCheck, EmergencyPlan } from '@/types';
import { mockSafetyChecks, mockEmergencyPlans } from '@/data/mockSafety';

interface SafetyState {
  checks: SafetyCheck[];
  emergencyPlans: EmergencyPlan[];
  addCheck: (check: SafetyCheck) => void;
  updateCheck: (id: string, updates: Partial<SafetyCheck>) => void;
  deleteCheck: (id: string) => void;
  addEmergencyPlan: (plan: EmergencyPlan) => void;
  updateEmergencyPlan: (id: string, updates: Partial<EmergencyPlan>) => void;
  deleteEmergencyPlan: (id: string) => void;
  getChecksByType: (type: string) => SafetyCheck[];
  getPlanByType: (type: string) => EmergencyPlan | undefined;
  getWarningCount: (voyageId: string) => number;
}

export const useSafetyStore = create<SafetyState>()(
  persist(
    (set, get) => ({
      checks: mockSafetyChecks,
      emergencyPlans: mockEmergencyPlans,

      addCheck: (check) =>
        set((state) => ({ checks: [...state.checks, check] })),

      updateCheck: (id, updates) =>
        set((state) => ({
          checks: state.checks.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCheck: (id) =>
        set((state) => ({
          checks: state.checks.filter((c) => c.id !== id),
        })),

      addEmergencyPlan: (plan) =>
        set((state) => ({ emergencyPlans: [...state.emergencyPlans, plan] })),

      updateEmergencyPlan: (id, updates) =>
        set((state) => ({
          emergencyPlans: state.emergencyPlans.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deleteEmergencyPlan: (id) =>
        set((state) => ({
          emergencyPlans: state.emergencyPlans.filter((p) => p.id !== id),
        })),

      getChecksByType: (type) =>
        get().checks.filter((c) => c.checkType === type),

      getPlanByType: (type) =>
        get().emergencyPlans.find((p) => p.type === type),

      getWarningCount: (voyageId) =>
        get().checks.filter(
          (c) => c.voyageId === voyageId && c.result !== 'pass'
        ).length,
    }),
    {
      name: 'safety-store',
    }
  )
);
