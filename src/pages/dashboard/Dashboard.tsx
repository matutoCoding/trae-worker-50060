import { Anchor, Fish, Fuel, Users, AlertTriangle, Ship } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useVoyageStore } from '@/store/useVoyageStore';
import { useFishingStore } from '@/store/useFishingStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useCrewStore } from '@/store/useCrewStore';
import { useSafetyStore } from '@/store/useSafetyStore';
import StatCard from '@/components/business/StatCard';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatusBadge from '@/components/business/StatusBadge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const CHART_COLORS = ['#0A2463', '#3E92CC', '#44AF69', '#FF6B35', '#F9C80E'];

export default function Dashboard() {
  const { getDashboardStats, currentVoyage } = useVoyageStore();
  const { getCatchByDate, getCatchBySpecies } = useFishingStore();
  const { getFuelPercentage, currentStock, fuelCapacity } = useFuelStore();
  const { getCrewById } = useCrewStore();
  const { getWarningCount } = useSafetyStore();

  const stats = getDashboardStats();
  const catchByDate = currentVoyage ? getCatchByDate(currentVoyage.id) : [];
  const catchBySpecies = getCatchBySpecies();
  const fuelPercent = getFuelPercentage();
  const warnings = currentVoyage ? getWarningCount(currentVoyage.id) : 0;

  const operationColumns = [
    {
      key: 'netNo',
      header: '网次',
      accessor: (row: any) => `第${row.netNo}网`,
    },
    {
      key: 'startTime',
      header: '作业时间',
      accessor: (row: any) =>
        format(new Date(row.startTime), 'MM-dd HH:mm', { locale: zhCN }),
    },
    {
      key: 'estimatedCatch',
      header: '预估产量(kg)',
    },
    {
      key: 'actualCatch',
      header: '实际产量(kg)',
    },
    {
      key: 'status',
      header: '状态',
      accessor: (row: any) => (
        <StatusBadge
          status={
            row.status === 'completed'
              ? '已完成'
              : row.status === 'in_progress'
              ? '进行中'
              : '计划中'
          }
          variant={
            row.status === 'completed'
              ? 'success'
              : row.status === 'in_progress'
              ? 'info'
              : 'default'
          }
        />
      ),
    },
  ];

  const catchColumns = [
    {
      key: 'species',
      header: '种类',
    },
    {
      key: 'weight',
      header: '重量(kg)',
    },
    {
      key: 'quality',
      header: '品质',
      accessor: (row: any) => (
        <span className={`font-bold ${
          row.quality === 'A' ? 'text-[#44AF69]' :
          row.quality === 'B' ? 'text-[#F9C80E]' : 'text-[#FF6B35]'
        }`}>
          {row.quality}级
        </span>
      ),
    },
    {
      key: 'storageLocation',
      header: '舱位',
    },
    {
      key: 'recordTime',
      header: '登记时间',
      accessor: (row: any) =>
        format(new Date(row.recordTime), 'MM-dd HH:mm', { locale: zhCN }),
    },
  ];

  return (
    <div>
      <PageHeader
        title="总览仪表盘"
        subtitle={currentVoyage ? `当前航次: ${currentVoyage.voyageNo}` : '暂无进行中航次'}
        icon={Ship}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="航次进度"
          value={stats.voyageProgress}
          unit="%"
          icon={Anchor}
          color="blue"
          progress={stats.voyageProgress}
        />
        <StatCard
          title="今日渔获"
          value={stats.todayCatch.toLocaleString()}
          unit="kg"
          icon={Fish}
          color="green"
          trend={12.5}
          trendLabel="较昨日"
        />
        <StatCard
          title="油料存量"
          value={`${(currentStock / 1000).toFixed(1)}`}
          unit="吨"
          icon={Fuel}
          color="orange"
          progress={fuelPercent}
        />
        <StatCard
          title="值班船员"
          value={`${stats.crewOnDuty}/${stats.totalCrew}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="安全预警"
          value={warnings}
          unit="项"
          icon={AlertTriangle}
          color={warnings > 0 ? 'orange' : 'green'}
        />
        <StatCard
          title="作业网次"
          value={stats.recentOperations.filter(o => o.status === 'completed').length}
          unit="次"
          icon={Fish}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">渔获趋势</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={catchByDate}>
                <defs>
                  <linearGradient id="colorCatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3E92CC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3E92CC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8F0" />
                <XAxis dataKey="date" stroke="#4A4A6A" tick={{ fontSize: 12 }} />
                <YAxis stroke="#4A4A6A" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#3E92CC"
                  strokeWidth={2}
                  fill="url(#colorCatch)"
                  name="渔获重量(kg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">渔获种类分布</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catchBySpecies}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="weight"
                  label={({ species, percent }) => `${species} ${(percent * 100).toFixed(0)}%`}
                >
                  {catchBySpecies.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">近期作业</h3>
          <DataTable
            columns={operationColumns}
            data={stats.recentOperations.slice().reverse()}
            emptyMessage="暂无作业记录"
          />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">最新渔获</h3>
          <DataTable
            columns={catchColumns}
            data={stats.recentCatch.slice().reverse()}
            emptyMessage="暂无渔获记录"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">当前值班</h3>
          <div className="space-y-3">
            {useCrewStore.getState().getCurrentWatch().slice(0, 4).map((schedule) => {
              const crew = getCrewById(schedule.crewId);
              return (
                <div key={schedule.id} className="flex items-center gap-3 p-3 bg-[#F5F5FA] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#44AF69] to-[#0A2463] flex items-center justify-center text-white font-bold">
                    {crew?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A2E] truncate">{crew?.name}</p>
                    <p className="text-xs text-[#4A4A6A] truncate">{crew?.position}</p>
                  </div>
                  <StatusBadge
                    status={schedule.shiftType === 'day' ? '白班' : '夜班'}
                    variant={schedule.shiftType === 'day' ? 'info' : 'warning'}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">油料消耗趋势</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={currentVoyage ? useFuelStore.getState().getConsumptionByDate(currentVoyage.id) : []}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8F0" />
                <XAxis dataKey="date" stroke="#4A4A6A" tick={{ fontSize: 11 }} />
                <YAxis stroke="#4A4A6A" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  dot={{ fill: '#FF6B35' }}
                  name="消耗(升)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-[#4A4A6A]">总消耗量</p>
            <p className="text-2xl font-bold text-[#1A1A2E]">
              {currentVoyage ? useFuelStore.getState().getTotalConsumption(currentVoyage.id).toLocaleString() : 0}
              <span className="text-sm font-normal text-[#4A4A6A] ml-1">升</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">油料存量</h3>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#E8E8F0"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#fuelGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${fuelPercent * 4.4} 440`}
                />
                <defs>
                  <linearGradient id="fuelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="100%" stopColor="#F9C80E" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#1A1A2E]">{fuelPercent}%</span>
                <span className="text-sm text-[#4A4A6A]">剩余</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-[#FF6B35]" />
              <span className="text-sm text-[#4A4A6A]">
                {currentStock.toLocaleString()} / {fuelCapacity.toLocaleString()} 升
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
