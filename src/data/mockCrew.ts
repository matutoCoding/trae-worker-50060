import type { Crew, CrewSchedule } from '@/types';

export const mockCrews: Crew[] = [
  {
    id: 'c1',
    name: '张海洋',
    position: '船长',
    idCard: '330203198001011234',
    phone: '13800138001',
    skillLevel: '高级船长',
    joinDate: '2015-03-15',
  },
  {
    id: 'c2',
    name: '王涛',
    position: '渔捞长',
    idCard: '330203198505055678',
    phone: '13800138002',
    skillLevel: '高级渔捞员',
    joinDate: '2016-06-20',
  },
  {
    id: 'c3',
    name: '刘动力',
    position: '轮机长',
    idCard: '330203198208089012',
    phone: '13800138003',
    skillLevel: '高级轮机员',
    joinDate: '2014-09-10',
  },
  {
    id: 'c4',
    name: '陈导航',
    position: '大副',
    idCard: '330203198803033456',
    phone: '13800138004',
    skillLevel: '一级驾驶员',
    joinDate: '2017-02-28',
  },
  {
    id: 'c5',
    name: '赵网工',
    position: '船员',
    idCard: '330203199007077890',
    phone: '13800138005',
    skillLevel: '中级船员',
    joinDate: '2018-11-05',
  },
  {
    id: 'c6',
    name: '孙水手',
    position: '船员',
    idCard: '330203199212122345',
    phone: '13800138006',
    skillLevel: '中级船员',
    joinDate: '2019-04-18',
  },
  {
    id: 'c7',
    name: '周渔工',
    position: '船员',
    idCard: '330203199406066789',
    phone: '13800138007',
    skillLevel: '初级船员',
    joinDate: '2020-08-22',
  },
  {
    id: 'c8',
    name: '吴机工',
    position: '机工',
    idCard: '330203198604040123',
    phone: '13800138008',
    skillLevel: '高级机工',
    joinDate: '2015-12-10',
  },
];

const today = new Date();
export const mockCrewSchedules: CrewSchedule[] = mockCrews.flatMap((crew, index) => {
  const schedules: CrewSchedule[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - 3 + i);
    const shiftTypes: ('day' | 'night' | 'standby')[] = ['day', 'night', 'standby'];
    const statuses: ('scheduled' | 'on_duty' | 'off_duty')[] = i < 3 ? ['off_duty'] : i === 3 ? ['on_duty'] : ['scheduled'];
    
    schedules.push({
      id: `s-${crew.id}-${i}`,
      voyageId: 'v1',
      crewId: crew.id,
      date: date.toISOString().split('T')[0],
      shiftType: shiftTypes[(index + i) % 3],
      duties: index === 0 ? '船舶驾驶与管理' : index === 1 ? '捕捞作业指挥' : index === 2 ? '设备维护' : '捕捞作业',
      status: statuses[0],
    });
  }
  return schedules;
});
