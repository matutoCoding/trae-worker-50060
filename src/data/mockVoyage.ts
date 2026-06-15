import type { Voyage } from '@/types';

export const mockVoyages: Voyage[] = [
  {
    id: 'v1',
    voyageNo: 'HY-2026-001',
    startDate: '2026-06-01',
    endDate: '2026-06-20',
    status: 'in_progress',
    targetGround: '东海渔区123海区',
    plannedDays: 20,
    captain: '张海洋',
    route: '宁波港 -> 东海渔区 -> 舟山渔场 -> 宁波港',
    createdAt: '2026-05-28T08:00:00Z',
    updatedAt: '2026-06-15T10:30:00Z',
  },
  {
    id: 'v2',
    voyageNo: 'HY-2026-002',
    startDate: '2026-07-01',
    endDate: '2026-07-25',
    status: 'planning',
    targetGround: '南海珠江口渔场',
    plannedDays: 25,
    captain: '张海洋',
    route: '宁波港 -> 南海珠江口 -> 北部湾渔场 -> 三亚港',
    createdAt: '2026-06-10T14:00:00Z',
    updatedAt: '2026-06-12T09:00:00Z',
  },
  {
    id: 'v3',
    voyageNo: 'HY-2026-003',
    startDate: '2026-05-10',
    endDate: '2026-05-30',
    status: 'completed',
    targetGround: '黄渤海渔场',
    plannedDays: 21,
    captain: '李远航',
    route: '青岛港 -> 黄渤海渔场 -> 烟威渔场 -> 青岛港',
    createdAt: '2026-05-05T08:00:00Z',
    updatedAt: '2026-05-30T16:00:00Z',
  },
];

export const mockCurrentVoyage = mockVoyages[0];
