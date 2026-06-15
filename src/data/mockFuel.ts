import type { FuelRecord } from '@/types';

export const mockFuelRecords: FuelRecord[] = [
  {
    id: 'f1',
    voyageId: 'v1',
    type: 'refuel',
    amount: 80000,
    unitPrice: 7.85,
    portId: 'p1',
    operator: '宁波港燃料公司',
    recordTime: '2026-06-01T08:00:00Z',
    remark: '出海前加满柴油',
  },
  {
    id: 'f2',
    voyageId: 'v1',
    type: 'consumption',
    amount: 4500,
    unitPrice: 7.85,
    operator: '刘动力',
    recordTime: '2026-06-05T08:00:00Z',
    remark: '航行至渔场，日均消耗约900升',
  },
  {
    id: 'f3',
    voyageId: 'v1',
    type: 'consumption',
    amount: 3200,
    unitPrice: 7.85,
    operator: '刘动力',
    recordTime: '2026-06-10T08:00:00Z',
    remark: '捕捞作业期间，日均消耗约640升',
  },
  {
    id: 'f4',
    voyageId: 'v1',
    type: 'consumption',
    amount: 2800,
    unitPrice: 7.85,
    operator: '刘动力',
    recordTime: '2026-06-15T08:00:00Z',
    remark: '转场航行+作业消耗',
  },
];

export const mockFuelStock = 69500;
export const mockFuelCapacity = 100000;
