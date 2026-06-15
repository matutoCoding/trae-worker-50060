import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Crew, CrewSchedule } from '@/types';
import { mockCrews, mockCrewSchedules } from '@/data/mockCrew';

interface CrewState {
  crewList: Crew[];
  schedules: CrewSchedule[];
  addCrew: (crew: Crew) => void;
  updateCrew: (id: string, updates: Partial<Crew>) => void;
  deleteCrew: (id: string) => void;
  addSchedule: (schedule: CrewSchedule) => void;
  updateSchedule: (id: string, updates: Partial<CrewSchedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedulesByDate: (date: string) => CrewSchedule[];
  getCurrentWatch: () => CrewSchedule[];
  getCrewById: (id: string) => Crew | undefined;
}

export const useCrewStore = create<CrewState>()(
  persist(
    (set, get) => ({
      crewList: mockCrews,
      schedules: mockCrewSchedules,

      addCrew: (crew) =>
        set((state) => ({ crewList: [...state.crewList, crew] })),

      updateCrew: (id, updates) =>
        set((state) => ({
          crewList: state.crewList.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCrew: (id) =>
        set((state) => ({
          crewList: state.crewList.filter((c) => c.id !== id),
        })),

      addSchedule: (schedule) =>
        set((state) => ({ schedules: [...state.schedules, schedule] })),

      updateSchedule: (id, updates) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        })),

      deleteSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
        })),

      getSchedulesByDate: (date) =>
        get().schedules.filter((s) => s.date === date),

      getCurrentWatch: () => {
        const now = new Date();
        const hour = now.getHours();
        const isDayShift = hour >= 6 && hour < 18;
        const today = now.toISOString().split('T')[0];
        
        return get().schedules.filter((s) => {
          if (s.date !== today) return false;
          if (s.status === 'on_duty') return true;
          if (isDayShift && s.shiftType === 'day') return true;
          if (!isDayShift && s.shiftType === 'night') return true;
          return false;
        });
      },

      getCrewById: (id) => get().crewList.find((c) => c.id === id),
    }),
    {
      name: 'crew-store',
    }
  )
);
