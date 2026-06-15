import { useState } from 'react';
import { Fish, Plus, Scale, Package, Star, TrendingUp, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatCard from '@/components/business/StatCard';
import { useFishingStore } from '@/store/useFishingStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const SPECIES_LIST = ['大黄鱼', '带鱼', '鱿鱼', '墨鱼', '小黄鱼', '金枪鱼', '鲅鱼', '鲳鱼', '鳗鱼', '石斑鱼'];
const QUALITY_OPTIONS = [
  { value: 'A', label: 'A级', color: 'text-[#44AF69]', stars: 3 },
  { value: 'B', label: 'B级', color: 'text-[#F9C80E]', stars: 2 },
  { value: 'C', label: 'C级', color: 'text-[#FF6B35]', stars: 1 },
];
const STORAGE_LOCATIONS = [
  '冷冻舱A-01', '冷冻舱A-02', '冷冻舱A-03', '冷冻舱A-04', '冷冻舱A-05', '冷冻舱A-06',
  '保鲜舱B-01', '保鲜舱B-02', '保鲜舱B-03',
  '超低温舱C-01', '超低温舱C-02',
];

const CHART_COLORS = ['#0A2463', '#3E92CC', '#44AF69', '#FF6B35', '#F9C80E', '#E63946', '#7C3AED', '#EC4899', '#06B6D4', '#84CC16'];

export default function CatchPage() {
  const { catchRecords, getCatchBySpecies, operations } = useFishingStore();
  const { currentVoyage } = useVoyageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuality, setFilterQuality] = useState<string>('all');

  const catchBySpecies = getCatchBySpecies();
  const voyageCatch = currentVoyage
    ? catchRecords.filter(c => c.voyageId === currentVoyage.id)
    : catchRecords;

  const filteredCatch = voyageCatch.filter(c => {
    const matchesSearch = c.species.includes(searchTerm);
    const matchesQuality = filterQuality === 'all' || c.quality === filterQuality;
    return matchesSearch && matchesQuality;
  });

  const totalWeight = voyageCatch.reduce((sum, c) => sum + c.weight, 0);
  const totalValue = voyageCatch.reduce((sum, c) => sum + c.weight * c.unitPrice, 0);
  const avgWeight = voyageCatch.length > 0 ? Math.round(totalWeight / voyageCatch.length) : 0;

  const storageStats = STORAGE_LOCATIONS.slice(0, 6).map(loc => ({
    location: loc.split('-')[0] + '-' + loc.split('-')[1],
    used: voyageCatch.filter(c => c.storageLocation === loc).reduce((sum, c) => sum + c.weight, 0),
    capacity: 5000,
  }));

  const columns = [
    {
      key: 'species',
      header: '种类',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0A2463] to-[#3E92CC] rounded-xl flex items-center justify-center">
            <Fish className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-[#1A1A2E]">{row.species}</span>
        </div>
      ),
    },
    {
      key: 'operationId',
      header: '所属网次',
      accessor: (row: any) => {
        const op = operations.find(o => o.id === row.operationId);
        return op ? `第${op.netNo}网` : '-';
      },
    },
    {
      key: 'weight',
      header: '重量(kg)',
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <Scale className="w-4 h-4 text-[#3E92CC]" />
          <span className="font-bold">{row.weight.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'quality',
      header: '品质',
      accessor: (row: any) => {
        const quality = QUALITY_OPTIONS.find(q => q.value === row.quality);
        return (
          <div className="flex items-center gap-1">
            {[...Array(quality?.stars || 0)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${quality?.color} fill-current`} />
            ))}
            <span className={`ml-1 font-medium ${quality?.color}`}>{quality?.label}</span>
          </div>
        );
      },
    },
    {
      key: 'storageLocation',
      header: '存放舱位',
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-[#FF6B35]" />
          <span className="font-mono text-sm">{row.storageLocation}</span>
        </div>
      ),
    },
    {
      key: 'unitPrice',
      header: '单价(元/kg)',
      accessor: (row: any) => <span className="font-medium">¥{row.unitPrice}</span>,
    },
    {
      key: 'totalValue',
      header: '总值(元)',
      accessor: (row: any) => (
        <span className="font-bold text-[#44AF69]">
          ¥{(row.weight * row.unitPrice).toLocaleString()}
        </span>
      ),
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
        title="渔获登记"
        subtitle="渔获种类、重量统计与保鲜冷冻舱位分配"
        icon={Fish}
        actions={
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            登记渔获
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="总渔获量"
          value={totalWeight.toLocaleString()}
          unit="kg"
          icon={Fish}
          color="blue"
          trend={8.2}
          trendLabel="较上航次"
        />
        <StatCard
          title="总价值"
          value={`¥${(totalValue / 10000).toFixed(1)}`}
          unit="万"
          icon={TrendingUp}
          color="green"
          trend={12.5}
          trendLabel="较上航次"
        />
        <StatCard
          title="记录条数"
          value={voyageCatch.length}
          unit="条"
          icon={Package}
          color="orange"
        />
        <StatCard
          title="平均单条重量"
          value={avgWeight}
          unit="kg"
          icon={Scale}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">渔获种类分布</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catchBySpecies}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8F0" />
                <XAxis dataKey="species" stroke="#4A4A6A" tick={{ fontSize: 12 }} />
                <YAxis stroke="#4A4A6A" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="weight" name="重量(kg)" radius={[8, 8, 0, 0]}>
                  {catchBySpecies.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#FF6B35]" />
            舱位使用情况
          </h3>
          <div className="space-y-4">
            {storageStats.map((stat, index) => {
              const percentage = Math.round((stat.used / stat.capacity) * 100);
              return (
                <div key={stat.location}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#4A4A6A]">{stat.location}</span>
                    <span className="font-medium text-[#1A1A2E]">
                      {stat.used.toLocaleString()} / {stat.capacity.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="h-3 bg-[#E8E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F9C80E] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-[#1A1A2E]">渔获记录列表</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A4A6A]" />
              <input
                type="text"
                placeholder="搜索鱼种..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[#E8E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30 focus:border-[#3E92CC] w-full sm:w-auto"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterQuality('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterQuality === 'all'
                    ? 'bg-[#0A2463] text-white'
                    : 'bg-[#F5F5FA] text-[#4A4A6A] hover:bg-[#E8E8F0]'
                }`}
              >
                全部
              </button>
              {QUALITY_OPTIONS.map(q => (
                <button
                  key={q.value}
                  onClick={() => setFilterQuality(q.value)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterQuality === q.value
                      ? 'bg-[#0A2463] text-white'
                      : 'bg-[#F5F5FA] text-[#4A4A6A] hover:bg-[#E8E8F0]'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCatch.slice().reverse()}
          emptyMessage="暂无渔获记录"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {SPECIES_LIST.slice(0, 5).map((species, index) => {
          const speciesCatch = voyageCatch.filter(c => c.species === species);
          const weight = speciesCatch.reduce((sum, c) => sum + c.weight, 0);
          const value = speciesCatch.reduce((sum, c) => sum + c.weight * c.unitPrice, 0);
          return (
            <div
              key={species}
              className="bg-white rounded-2xl shadow-lg shadow-black/5 p-5 border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${CHART_COLORS[index]}, ${CHART_COLORS[(index + 1) % CHART_COLORS.length]})` }}
                >
                  <Fish className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A2E]">{species}</p>
                  <p className="text-xs text-[#4A4A6A]">{speciesCatch.length}条记录</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-[#4A4A6A]">重量</p>
                  <p className="text-lg font-bold text-[#1A1A2E]">{weight.toLocaleString()}<span className="text-sm font-normal">kg</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#4A4A6A]">产值</p>
                  <p className="text-lg font-bold text-[#44AF69]">¥{(value / 1000).toFixed(1)}<span className="text-sm font-normal">k</span></p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
