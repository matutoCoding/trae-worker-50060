import { useState, useMemo } from 'react';
import { Users, Plus, Calendar, Clock, Phone, Award, UserCheck, UserX, ChevronRight, Save, ChevronLeft, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatCard from '@/components/business/StatCard';
import StatusBadge from '@/components/business/StatusBadge';
import Modal from '@/components/business/Modal';
import { useCrewStore } from '@/store/useCrewStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Crew, CrewSchedule } from '@/types';

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
  const { crewList, schedules, getSchedulesByDate, addCrew, addSchedule } = useCrewStore();
  const { currentVoyage } = useVoyageStore();
  const [activeTab, setActiveTab] = useState<'crew' | 'schedule'>('crew');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());

  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [crewFormData, setCrewFormData] = useState({
    name: '',
    position: '',
    phone: '',
    skillLevel: '',
    joinDate: '',
    remark: '',
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    crewId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    shiftType: 'day' as const,
    duties: '',
    status: 'scheduled' as const,
  });
  const [scheduleError, setScheduleError] = useState('');

  const todaySchedules = getSchedulesByDate(selectedDate);
  const currentWatch = todaySchedules.filter(s => 
    s.status === 'on_duty' || (s.status === 'scheduled')
  );

  const existingSchedulesForDate = useMemo(() => {
    if (!scheduleFormData.date) return [];
    return getSchedulesByDate(scheduleFormData.date);
  }, [scheduleFormData.date, schedules, getSchedulesByDate]);

  const weekDays = useMemo(() => {
    const start = addDays(calendarBaseDate, -3);
    return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
  }, [calendarBaseDate]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(calendarBaseDate);
    const end = endOfMonth(calendarBaseDate);
    return eachDayOfInterval({ start, end });
  }, [calendarBaseDate]);

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

  const handleCrewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCrewFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCrewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCrew: Crew = {
      id: `c${Date.now()}`,
      name: crewFormData.name,
      position: crewFormData.position,
      idCard: '',
      phone: crewFormData.phone,
      skillLevel: crewFormData.skillLevel,
      joinDate: crewFormData.joinDate,
    };

    addCrew(newCrew);
    setIsCrewModalOpen(false);
    setCrewFormData({
      name: '',
      position: '',
      phone: '',
      skillLevel: '',
      joinDate: '',
      remark: '',
    });
  };

  const handleScheduleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setScheduleFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setScheduleError('');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const duplicateSchedule = existingSchedulesForDate.find(
      s => s.crewId === scheduleFormData.crewId
    );

    if (duplicateSchedule) {
      const crew = crewList.find(c => c.id === scheduleFormData.crewId);
      setScheduleError(`${crew?.name || '该船员'} 已在 ${scheduleFormData.date} 安排了 ${SHIFT_COLORS[duplicateSchedule.shiftType].label}，请勿重复排班`);
      return;
    }

    const newSchedule: CrewSchedule = {
      id: `s${Date.now()}`,
      voyageId: currentVoyage?.id || '',
      crewId: scheduleFormData.crewId,
      date: scheduleFormData.date,
      shiftType: scheduleFormData.shiftType,
      duties: scheduleFormData.duties,
      status: scheduleFormData.status,
    };

    addSchedule(newSchedule);
    setIsScheduleModalOpen(false);
    setScheduleError('');
    setScheduleFormData({
      crewId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      shiftType: 'day',
      duties: '',
      status: 'scheduled',
    });
  };

  return (
    <div>
      <PageHeader
        title="船员管理"
        subtitle="船员信息管理、排班调度与值更安排"
        icon={Users}
        actions={
          <button 
            onClick={() => setIsCrewModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5"
          >
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
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#3E92CC]" />
              排班看板
            </h3>
            <div className="flex items-center gap-1 bg-[#F5F5FA] rounded-lg p-1">
              <button
                onClick={() => setCalendarView('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  calendarView === 'week'
                    ? 'bg-white text-[#0A2463] shadow-sm'
                    : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
                }`}
              >
                周视图
              </button>
              <button
                onClick={() => setCalendarView('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  calendarView === 'month'
                    ? 'bg-white text-[#0A2463] shadow-sm'
                    : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
                }`}
              >
                月视图
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarBaseDate(addDays(calendarBaseDate, calendarView === 'week' ? -7 : -30))}
                className="p-2 rounded-lg hover:bg-[#F5F5FA] transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#4A4A6A]" />
              </button>
              <span className="text-sm font-medium text-[#1A1A2E] min-w-[150px] text-center">
                {calendarView === 'week'
                  ? `${format(addDays(calendarBaseDate, -3), 'MM月dd日', { locale: zhCN })} - ${format(addDays(calendarBaseDate, 3), 'MM月dd日', { locale: zhCN })}`
                  : format(calendarBaseDate, 'yyyy年MM月', { locale: zhCN })
                }
              </span>
              <button
                onClick={() => setCalendarBaseDate(addDays(calendarBaseDate, calendarView === 'week' ? 7 : 30))}
                className="p-2 rounded-lg hover:bg-[#F5F5FA] transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#4A4A6A]" />
              </button>
              <button
                onClick={() => setCalendarBaseDate(new Date())}
                className="px-3 py-1.5 text-sm text-[#3E92CC] hover:bg-[#3E92CC]/10 rounded-lg transition-colors"
              >
                今天
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setScheduleFormData(prev => ({ ...prev, date: selectedDate }));
                setIsScheduleModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#44AF69] to-[#2D7A4A] text-white rounded-lg font-medium shadow-lg shadow-[#44AF69]/30 hover:shadow-xl hover:shadow-[#44AF69]/40 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              新增排班
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#4A4A6A]">更新时间：</span>
              <span className="text-sm font-medium">{format(new Date(), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
            </div>
          </div>
        </div>

        {calendarView === 'week' && (
          <div className="mb-6">
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="p-2 text-center text-sm font-medium text-[#4A4A6A]">班次</div>
              {weekDays.map((date) => {
                const isSelected = date === selectedDate;
                const isTodayDate = isToday(new Date(date));
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 text-center rounded-lg transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white'
                        : isTodayDate
                        ? 'bg-[#3E92CC]/10 text-[#0A2463]'
                        : 'hover:bg-[#F5F5FA] text-[#1A1A2E]'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {format(new Date(date), 'MM/dd', { locale: zhCN })}
                    </div>
                    <div className="text-xs opacity-80">
                      {format(new Date(date), 'EEE', { locale: zhCN })}
                    </div>
                  </button>
                );
              })}
            </div>

            {(['day', 'night', 'standby'] as const).map((shift) => (
              <div key={shift} className="grid grid-cols-8 gap-2 mb-2">
                <div className={`p-3 rounded-lg ${SHIFT_COLORS[shift].bg} text-white flex items-center justify-between`}>
                  <span className="font-medium text-sm">{SHIFT_COLORS[shift].label}</span>
                  <span className="text-xs opacity-80">
                    {shift === 'day' ? '06-18' : shift === 'night' ? '18-06' : '待命'}
                  </span>
                </div>
                {weekDays.map((date) => {
                  const daySchedules = getSchedulesByDate(date).filter(s => s.shiftType === shift);
                  const isSelected = date === selectedDate;
                  return (
                    <div
                      key={`${date}-${shift}`}
                      onClick={() => {
                        setSelectedDate(date);
                        setScheduleFormData(prev => ({ ...prev, date, shiftType: shift }));
                        setIsScheduleModalOpen(true);
                      }}
                      className={`p-2 rounded-lg min-h-[80px] cursor-pointer transition-all ${
                        isSelected ? 'bg-[#3E92CC]/5 ring-1 ring-[#3E92CC]' : 'bg-[#F5F5FA]/50 hover:bg-[#F5F5FA]'
                      }`}
                    >
                      {daySchedules.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-[#4A4A6A]/50">
                          点击添加
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {daySchedules.map(schedule => {
                            const crew = crewList.find(c => c.id === schedule.crewId);
                            return (
                              <div
                                key={schedule.id}
                                className={`p-1.5 rounded text-xs font-medium text-white ${SHIFT_COLORS[shift].bg} flex items-center gap-1`}
                              >
                                <span className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-[10px]">
                                  {crew?.name.charAt(0)}
                                </span>
                                <span className="truncate">{crew?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {calendarView === 'month' && (
          <div className="mb-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, i) => (
                <div key={day} className="p-2 text-center text-xs font-medium text-[#4A4A6A]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const firstDay = monthDays[0].getDay();
                const prefixDays = Array(firstDay).fill(null);
                return [...prefixDays, ...monthDays].map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="min-h-[100px]" />;
                  
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const daySchedules = getSchedulesByDate(dateStr);
                  const isSelected = dateStr === selectedDate;
                  const isTodayDate = isToday(date);
                  const inMonth = isSameMonth(date, calendarBaseDate);
                  
                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setScheduleFormData(prev => ({ ...prev, date: dateStr }));
                        setIsScheduleModalOpen(true);
                      }}
                      className={`min-h-[100px] p-2 rounded-lg cursor-pointer transition-all ${
                        !inMonth ? 'opacity-30' : ''
                      } ${
                        isSelected
                          ? 'bg-[#3E92CC]/10 ring-2 ring-[#3E92CC]'
                          : isTodayDate
                          ? 'bg-[#3E92CC]/5'
                          : 'hover:bg-[#F5F5FA]'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isTodayDate ? 'text-[#3E92CC]' : 'text-[#1A1A2E]'
                      }`}>
                        {format(date, 'd')}
                      </div>
                      <div className="space-y-1">
                        {daySchedules.slice(0, 3).map(schedule => {
                          const crew = crewList.find(c => c.id === schedule.crewId);
                          return (
                            <div
                              key={schedule.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate ${SHIFT_COLORS[schedule.shiftType].bg}`}
                              title={`${crew?.name} - ${SHIFT_COLORS[schedule.shiftType].label}`}
                            >
                              {crew?.name}
                            </div>
                          );
                        })}
                        {daySchedules.length > 3 && (
                          <div className="text-[10px] text-[#4A4A6A]">
                            +{daySchedules.length - 3} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        <div className="border-t border-[#E8E8F0] pt-4">
          <h4 className="text-sm font-bold text-[#1A1A2E] mb-3">
            {format(new Date(selectedDate), 'MM月dd日 EEEE', { locale: zhCN })} 值班详情
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {todaySchedules.filter(s => s.shiftType === shift).length === 0 && (
                    <div className="text-sm text-[#4A4A6A]/50 text-center py-2">
                      暂无排班
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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

      <Modal
        isOpen={isCrewModalOpen}
        onClose={() => setIsCrewModalOpen(false)}
        title="新增船员"
        className="max-w-2xl"
      >
        <form onSubmit={handleCrewSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">姓名 *</label>
              <input
                type="text"
                name="name"
                value={crewFormData.name}
                onChange={handleCrewInputChange}
                placeholder="请输入船员姓名"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">职务 *</label>
              <select
                name="position"
                value={crewFormData.position}
                onChange={handleCrewInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              >
                <option value="">请选择职务</option>
                <option value="船长">船长</option>
                <option value="大副">大副</option>
                <option value="二副">二副</option>
                <option value="轮机长">轮机长</option>
                <option value="水手长">水手长</option>
                <option value="水手">水手</option>
                <option value="厨师">厨师</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">联系电话 *</label>
              <input
                type="tel"
                name="phone"
                value={crewFormData.phone}
                onChange={handleCrewInputChange}
                placeholder="请输入联系电话"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">技能等级</label>
              <select
                name="skillLevel"
                value={crewFormData.skillLevel}
                onChange={handleCrewInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
              >
                <option value="">请选择技能等级</option>
                <option value="一级">一级</option>
                <option value="二级">二级</option>
                <option value="三级">三级</option>
                <option value="四级">四级</option>
                <option value="五级">五级</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">入职日期 *</label>
            <input
              type="date"
              name="joinDate"
              value={crewFormData.joinDate}
              onChange={handleCrewInputChange}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">备注</label>
            <textarea
              name="remark"
              value={crewFormData.remark}
              onChange={handleCrewInputChange}
              placeholder="请输入备注信息"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#E8E8F0]">
            <button
              type="button"
              onClick={() => setIsCrewModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-[#E8E8F0] text-[#4A4A6A] font-medium hover:bg-[#F5F5FA] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              保存船员
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setScheduleError('');
        }}
        title="新增排班"
        className="max-w-2xl"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-6">
          {scheduleError && (
            <div className="p-4 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-[#FF6B35] mb-1">排班冲突</div>
                <div className="text-sm text-[#1A1A2E]">{scheduleError}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">选择船员 *</label>
              <select
                name="crewId"
                value={scheduleFormData.crewId}
                onChange={handleScheduleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              >
                <option value="">请选择船员</option>
                {crewList.map(crew => {
                  const hasExistingShift = existingSchedulesForDate.some(s => s.crewId === crew.id);
                  const existingShift = existingSchedulesForDate.find(s => s.crewId === crew.id);
                  return (
                    <option 
                      key={crew.id} 
                      value={crew.id}
                      disabled={hasExistingShift}
                    >
                      {crew.name} - {crew.position}
                      {hasExistingShift ? ` (已有${SHIFT_COLORS[existingShift!.shiftType].label})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">排班日期 *</label>
              <input
                type="date"
                name="date"
                value={scheduleFormData.date}
                onChange={handleScheduleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="bg-[#F5F5FA] rounded-xl p-4">
            <div className="text-sm font-medium text-[#4A4A6A] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(scheduleFormData.date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })} 已有排班
            </div>
            {existingSchedulesForDate.length === 0 ? (
              <div className="text-sm text-[#4A4A6A]/50 text-center py-2">
                该日期暂无排班
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(['day', 'night', 'standby'] as const).map((shift) => {
                  const shiftSchedules = existingSchedulesForDate.filter(s => s.shiftType === shift);
                  return (
                    <div key={shift} className="bg-white rounded-lg p-3">
                      <div className={`text-xs font-medium mb-2 flex items-center gap-1 ${
                        shift === 'day' ? 'text-[#D4A80B]' : shift === 'night' ? 'text-[#0A2463]' : 'text-[#2D7A4A]'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${SHIFT_COLORS[shift].bg}`}></span>
                        {SHIFT_COLORS[shift].label} ({shiftSchedules.length})
                      </div>
                      <div className="space-y-1">
                        {shiftSchedules.length === 0 ? (
                          <div className="text-xs text-[#4A4A6A]/40">暂无</div>
                        ) : (
                          shiftSchedules.map(s => {
                            const crew = crewList.find(c => c.id === s.crewId);
                            return (
                              <div key={s.id} className="text-xs text-[#1A1A2E] flex items-center gap-1">
                                <span className="w-4 h-4 rounded bg-gradient-to-br from-[#3E92CC] to-[#0A2463] flex items-center justify-center text-white text-[9px]">
                                  {crew?.name.charAt(0)}
                                </span>
                                <span className="truncate">{crew?.name}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">班次类型 *</label>
            <div className="flex gap-4">
              {(['day', 'night', 'standby'] as const).map((shift) => (
                <label key={shift} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shiftType"
                    value={shift}
                    checked={scheduleFormData.shiftType === shift}
                    onChange={handleScheduleInputChange}
                    className="w-4 h-4 text-[#3E92CC] focus:ring-[#3E92CC]"
                    required
                  />
                  <span className="text-[#1A1A2E] font-medium">{SHIFT_COLORS[shift].label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">状态</label>
            <select
              name="status"
              value={scheduleFormData.status}
              onChange={handleScheduleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
            >
              <option value="scheduled">待值班</option>
              <option value="on_duty">值班中</option>
              <option value="off_duty">已下班</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">工作职责</label>
            <textarea
              name="duties"
              value={scheduleFormData.duties}
              onChange={handleScheduleInputChange}
              placeholder="请输入工作职责"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#E8E8F0]">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-[#E8E8F0] text-[#4A4A6A] font-medium hover:bg-[#F5F5FA] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              保存排班
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
