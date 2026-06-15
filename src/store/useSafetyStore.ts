import { create } from 'zustand';
import type { SafetyCheck, EmergencyPlan } from '@/types';
import { mockSafetyChecks, mockEmergencyPlans } from '@/data/mockSafety';

interface SafetyState {
  checks: SafetyCheck[];
  emergencyPlans: EmergencyPlan[];
  addCheck: (check: SafetyCheck) => void;
  updateCheck: (id: string, updates: Partial<SafetyCheck>) => void;
  getChecksByType: (type: string) => SafetyCheck[];
  getPlanByType: (type: string) => EmergencyPlan | undefined;
  getWarningCount: (voyageId: string) => number;
}

export const useSafetyStore = create<SafetyState>((set, get) => ({
  checks: mockSafetyChecks,
  emergencyPlans: mockEmergencyPlans,

  addCheck: (check) =>
    set((state) => ({ checks: [...state.checks, check] })),

  updateCheck: (id, updates) =>
    set((state) => ({
      checks: state.checks.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  getChecksByType: (type) =>
    get().checks.filter((c) => c.checkType === type),

  getPlanByType: (type) =>
    get().emergencyPlans.find((p) => p.type === type),

  getWarningCount: (voyageId) =>
    get().checks.filter(
      (c) => c.voyageId === voyageId && c.result !== 'pass'
    ).length,
}));
