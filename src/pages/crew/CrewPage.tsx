import { useState } from 'react';
import { Users, Plus, Calendar, Clock, Phone, Award, UserCheck, UserX, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatCard from '@/components/business/StatCard';
import StatusBadge from '@/components/business/StatusBadge';
import { useCrewStore } from '@/store/useCrewStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const SHIFT_COLORS = {
  day: { bg: 'bg-gradient-to-r from-[#F9C80E] to-[#FF6B35]', label: '白班' },
  night: { bg: 'bg-gradient-to-r from-[#0A2463] to-[#3E92CC]', label: '夜班' },
  standby: { bg: 'bg-gradient-to-r from-[#44AF69] to-[#2D7A4A]', label: '备班' },
};

const STATUS_VARIANTS = {
  on_duty: { variant: 'success' as const, label: '值班中' },
  off_duty: { variant: 'default' as const, label: '已下班' },
  scheduled: { variant: 'info' as const, label: '待值班' },
};

export default function CrewPage() {
  const { crewList, schedules, getCurrentWatch, getSchedulesByDate } = useCrewStore();
  const { currentVoyage } = useVoyageStore();
  const [activeTab, setActiveTab] = useState<'crew' | 'schedule'>('crew');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const currentWatch = getCurrentWatch();
  const todaySchedules = getSchedulesByDate(selectedDate);

  const crewColumns = [
    {
      key: 'avatar',
      header: '人员',
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3E92CC] to-[#0A2463] flex items-center justify-center text-white font-bold text-lg">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[#1A1A2E]">{row.name}</div>
            <div className="text-sm text-[#4A4A6A]">{row.position}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'skillLevel',
      header: '技能等级',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#F9C80E]" />
          <span className="font-medium">{row.skillLevel}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: '联系电话',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#44AF69]" />
          <span>{row.phone}</span>
        </div>
      ),
    },
    {
      key: 'joinDate',
      header: '入职日期',
      accessor: (row: any) => format(new Date(row.joinDate), 'yyyy-MM-dd', { locale: zhCN }),
    },
    {
      key: 'status',
      header: '当前状态',
      accessor: (row: any) => {
        const crewSchedule = currentWatch.find(s => s.crewId === row.id);
        if (crewSchedule) {
          return <StatusBadge status={STATUS_VARIANTS.on_duty.label} variant={STATUS_VARIANTS.on_duty.variant} />;
        }
        const todaySchedule = todaySchedules.find(s => s.crewId === row.id);
        if (todaySchedule) {
          return <StatusBadge 
            status={STATUS_VARIANTS[todaySchedule.status].label} 
            variant={STATUS_VARIANTS[todaySchedule.status].variant} 
          />;
        }
        return <StatusBadge status="休息" variant="default" />;
      },
    },
    {
      key: 'action',
      header: '操作',
      accessor: () => (
        <button className="text-[#3E92CC] hover:text-[#0A2463] font-medium flex items-center gap-1">
          详情 <ChevronRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const scheduleColumns = [
    {
      key: 'crewId',
      header: '人员',
      accessor: (row: any) => {
        const crew = crewList.find(c => c.id === row.crewId);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3E92CC] to-[#0A2463] flex items-center justify-center text-white font-bold">
              {crew?.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-[#1A1A2E]">{crew?.name}</div>
              <div className="text-sm text-[#4A4A6A]">{crew?.position}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'shiftType',
      header: '班次',
      accessor: (row: any) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-white text-sm font-medium ${SHIFT_COLORS[row.shiftType].bg}`}>
          {SHIFT_COLORS[row.shiftType].label}
        </span>
      ),
    },
    {
      key: 'duties',
      header: '工作职责',
      accessor: (row: any) => <span className="text-[#1A1A2E]">{row.duties}</span>,
    },
    {
      key: 'status',
      header: '状态',
      accessor: (row: any) => (
        <StatusBadge 
          status={STATUS_VARIANTS[row.status].label} 
          variant={STATUS_VARIANTS[row.status].variant} 
        />
      ),
    },
  ];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 3 + i);
    return format(date, 'yyyy-MM-dd');
  });

  return (
    <div>
      <PageHeader
        title="船员管理"
        subtitle="船员信息管理、排班调度与值更安排"
        icon={Users}
        actions={
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            添加船员
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="船员总数"
          value={crewList.length.toString()}
          unit="人"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="当前值班"
          value={currentWatch.length.toString()}
          unit="人"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="休息人员"
          value={(crewList.length - currentWatch.length).toString()}
          unit="人"
          icon={UserX}
          color="orange"
        />
        <StatCard
          title="今日排班"
          value={todaySchedules.length.toString()}
          unit="条"
          icon={Calendar}
          color="blue"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3E92CC]" />
            当前值更表
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#4A4A6A]">更新时间：</span>
            <span className="text-sm font-medium">{format(new Date(), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(['day', 'night', 'standby'] as const).map((shift) => (
            <div key={shift} className={`p-4 rounded-xl ${shift === 'day' ? 'bg-[#F9C80E]/10' : shift === 'night' ? 'bg-[#0A2463]/10' : 'bg-[#44AF69]/10'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-3 h-3 rounded-full ${SHIFT_COLORS[shift].bg}`}></span>
                <span className="font-bold text-[#1A1A2E]">{SHIFT_COLORS[shift].label}</span>
                <span className="text-sm text-[#4A4A6A] ml-auto">
                  {shift === 'day' ? '06:00 - 18:00' : shift === 'night' ? '18:00 - 06:00' : '随时待命'}
                </span>
              </div>
              <div className="space-y-2">
                {todaySchedules
                  .filter(s => s.shiftType === shift)
                  .map(schedule => {
                    const crew = crewList.find(c => c.id === schedule.crewId);
                    return (
                      <div key={schedule.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3E92CC] to-[#0A2463] flex items-center justify-center text-white text-sm font-bold">
                            {crew?.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{crew?.name}</div>
                            <div className="text-xs text-[#4A4A6A]">{crew?.position}</div>
                          </div>
                        </div>
                        <StatusBadge 
                          status={STATUS_VARIANTS[schedule.status].label} 
                          variant={STATUS_VARIANTS[schedule.status].variant}
                          size="sm"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {weekDays.map((date) => {
            const daySchedules = getSchedulesByDate(date);
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white shadow-lg'
                    : 'bg-[#F5F5FA] hover:bg-[#E8E8F0] text-[#1A1A2E]'
                }`}
              >
                <div className="text-sm font-medium">
                  {format(new Date(date), 'MM月dd日', { locale: zhCN })}
                </div>
                <div className="text-xs opacity-80">
                  {format(new Date(date), 'EEEE', { locale: zhCN })} · {daySchedules.length}个排班
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-white/50 overflow-hidden">
        <div className="flex border-b border-[#E8E8F0]">
          <button
            onClick={() => setActiveTab('crew')}
            className={`px-6 py-4 font-medium transition-all ${
              activeTab === 'crew'
                ? 'text-[#0A2463] border-b-2 border-[#0A2463] bg-[#0A2463]/5'
                : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
            }`}
          >
            船员信息
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-4 font-medium transition-all ${
              activeTab === 'schedule'
                ? 'text-[#0A2463] border-b-2 border-[#0A2463] bg-[#0A2463]/5'
                : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
            }`}
          >
            排班记录
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'crew' ? (
            <DataTable
              columns={crewColumns}
              data={crewList}
              emptyMessage="暂无船员信息"
            />
          ) : (
            <DataTable
              columns={scheduleColumns}
              data={schedules.slice().reverse()}
              emptyMessage="暂无排班记录"
            />
          )}
        </div>
      </div>
    </div>
  );
}
