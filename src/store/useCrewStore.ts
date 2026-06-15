import { create } from 'zustand';
import type { Crew, CrewSchedule } from '@/types';
import { mockCrews, mockCrewSchedules } from '@/data/mockCrew';

interface CrewState {
  crewList: Crew[];
  schedules: CrewSchedule[];
  addCrew: (crew: Crew) => void;
  updateCrew: (id: string, updates: Partial<Crew>) => void;
  addSchedule: (schedule: CrewSchedule) => void;
  updateSchedule: (id: string, updates: Partial<CrewSchedule>) => void;
  getSchedulesByDate: (date: string) => CrewSchedule[];
  getCurrentWatch: () => CrewSchedule[];
  getCrewById: (id: string) => Crew | undefined;
}

export const useCrewStore = create<CrewState>((set, get) => ({
  crewList: mockCrews,
  schedules: mockCrewSchedules,

  addCrew: (crew) =>
    set((state) => ({ crewList: [...state.crewList, crew] })),

  updateCrew: (id, updates) =>
    set((state) => ({
      crewList: state.crewList.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  addSchedule: (schedule) =>
    set((state) => ({ schedules: [...state.schedules, schedule] })),

  updateSchedule: (id, updates) =>
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  getSchedulesByDate: (date) =>
    get().schedules.filter((s) => s.date === date),

  getCurrentWatch: () =>
    get().schedules.filter((s) => s.status === 'on_duty'),

  getCrewById: (id) => get().crewList.find((c) => c.id === id),
}));
