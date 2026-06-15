import { useState } from 'react';
import { Fuel, Plus, TrendingDown, TrendingUp, MapPin, DollarSign, Droplets, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatCard from '@/components/business/StatCard';
import StatusBadge from '@/components/business/StatusBadge';
import { useFuelStore } from '@/store/useFuelStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { useFishingStore } from '@/store/useFishingStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const CHART_COLORS = ['#FF6B35', '#44AF69'];

export default function FuelPage() {
  const { records, currentStock, fuelCapacity, getTotalConsumption, getTotalRefuel, getConsumptionByDate, getFuelPercentage } = useFuelStore();
  const { currentVoyage } = useVoyageStore();
  const { ports } = useFishingStore();
  const [activeTab, setActiveTab] = useState<'records' | 'stats'>('records');

  const fuelPercent = getFuelPercentage();
  const totalConsumption = currentVoyage ? getTotalConsumption(currentVoyage.id) : 0;
  const totalRefuel = currentVoyage ? getTotalRefuel(currentVoyage.id) : 0;
  const consumptionByDate = currentVoyage ? getConsumptionByDate(currentVoyage.id) : [];
  const voyageRecords = currentVoyage ? records.filter(r => r.voyageId === currentVoyage.id) : records;

  const columns = [
    {
      key: 'type',
      header: '类型',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            row.type === 'refuel'
              ? 'bg-gradient-to-br from-[#44AF69] to-[#2D7A4A]'
              : 'bg-gradient-to-br from-[#FF6B35] to-[#C44D27]'
          }`}>
            {row.type === 'refuel' ? (
              <TrendingUp className="w-5 h-5 text-white" />
            ) : (
              <TrendingDown className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="font-medium">
            {row.type === 'refuel' ? '油料补给' : '消耗记录'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: '数量(升)',
      accessor: (row: any) => (
        <span className={`font-bold ${
          row.type === 'refuel' ? 'text-[#44AF69]' : 'text-[#FF6B35]'
        }`}>
          {row.type === 'refuel' ? '+' : '-'}{row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      header: '单价(元/升)',
      accessor: (row: any) => <span>¥{row.unitPrice.toFixed(2)}</span>,
    },
    {
      key: 'totalPrice',
      header: '总金额(元)',
      accessor: (row: any) => (
        <span className="font-bold">
          ¥{(row.amount * row.unitPrice).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'portId',
      header: '港口',
      accessor: (row: any) => {
        if (!row.portId) return '-';
        const port = ports.find(p => p.id === row.portId);
        return (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-[#3E92CC]" />
            <span>{port?.name}</span>
          </div>
        );
      },
    },
    {
      key: 'operator',
      header: '经办人',
    },
    {
      key: 'recordTime',
      header: '记录时间',
      accessor: (row: any) =>
        format(new Date(row.recordTime), 'yyyy-MM-dd HH:mm', { locale: zhCN }),
    },
    {
      key: 'remark',
      header: '备注',
      accessor: (row: any) => (
        <span className="text-[#4A4A6A] text-sm max-w-[200px] truncate block">
          {row.remark}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="油料补给"
        subtitle="油料消耗记录、补给港口管理与成本核算"
        icon={Fuel}
        actions={
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            新增记录
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="当前存量"
          value={`${(currentStock / 1000).toFixed(1)}`}
          unit="吨"
          icon={Droplets}
          color="orange"
          progress={fuelPercent}
        />
        <StatCard
          title="已消耗量"
          value={`${(totalConsumption / 1000).toFixed(1)}`}
          unit="吨"
          icon={TrendingDown}
          color="blue"
        />
        <StatCard
          title="补给总量"
          value={`${(totalRefuel / 1000).toFixed(1)}`}
          unit="吨"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="油料成本"
          value={`¥${((totalRefuel - currentStock) * 7.85 / 10000).toFixed(1)}`}
          unit="万"
          icon={DollarSign}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#FF6B35]" />
            油舱存量监控
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F9C80E]"></div>
              <span className="text-sm text-[#4A4A6A]">当前存量</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E8E8F0]"></div>
              <span className="text-sm text-[#4A4A6A]">剩余容量</span>
            </div>
          </div>
        </div>
        <div className="relative h-48 flex items-end justify-center gap-8">
          {['主燃油舱', '副燃油舱', '备用油舱'].map((name, index) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-36 bg-[#E8E8F0] rounded-xl overflow-hidden border-2 border-[#0A2463]/20">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#FF6B35] to-[#F9C80E] transition-all duration-1000"
                  style={{ height: `${fuelPercent - index * 10}%` }}
                >
                  <div className="absolute inset-0 opacity-30">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-px bg-white/50"
                        style={{ bottom: `${i * 25}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute top-2 right-2 text-xs font-bold text-[#1A1A2E]">
                  {fuelPercent - index * 10}%
                </div>
              </div>
              <span className="text-sm font-medium text-[#1A1A2E]">{name}</span>
            </div>
          ))}
          <div className="flex-1 max-w-md">
            <div className="bg-[#F5F5FA] rounded-xl p-4 h-full">
              <h4 className="font-bold text-[#1A1A2E] mb-3">油料容量参数</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4A4A6A]">总容量</span>
                  <span className="font-medium">{(fuelCapacity / 1000).toFixed(1)} 吨</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A6A]">当前存量</span>
                  <span className="font-medium text-[#FF6B35]">{(currentStock / 1000).toFixed(1)} 吨</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A6A]">可用空间</span>
                  <span className="font-medium">{((fuelCapacity - currentStock) / 1000).toFixed(1)} 吨</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A6A]">日均消耗</span>
                  <span className="font-medium">~0.7 吨/天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A6A]">续航天数</span>
                  <span className="font-medium text-[#44AF69]">~99 天</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#3E92CC]" />
            油料消耗趋势
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionByDate}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', r: 5 }}
                  name="消耗量(升)"
                />
                <Line
                  type="monotone"
                  dataKey="refuel"
                  stroke="#44AF69"
                  strokeWidth={3}
                  dot={{ fill: '#44AF69', r: 5 }}
                  name="补给量(升)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#3E92CC]" />
            补给港口信息
          </h3>
          <div className="space-y-3">
            {ports.slice(0, 4).map((port, index) => (
              <div
                key={port.id}
                className="flex items-center gap-4 p-4 bg-[#F5F5FA] rounded-xl hover:bg-[#E8E8F0] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${CHART_COLORS[index % 2]}, ${CHART_COLORS[(index + 1) % 2]})` }}
                >
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#1A1A2E]">{port.name}</h4>
                  <p className="text-sm text-[#4A4A6A]">{port.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#4A4A6A]">设施</p>
                  <p className="text-sm font-medium text-[#1A1A2E] max-w-[150px] truncate">
                    {port.facilities}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-white/50 overflow-hidden">
        <div className="flex border-b border-[#E8E8F0]">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-6 py-4 font-medium transition-all ${
              activeTab === 'records'
                ? 'text-[#0A2463] border-b-2 border-[#0A2463] bg-[#0A2463]/5'
                : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
            }`}
          >
            油料记录
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-4 font-medium transition-all ${
              activeTab === 'stats'
                ? 'text-[#0A2463] border-b-2 border-[#0A2463] bg-[#0A2463]/5'
                : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
            }`}
          >
            统计分析
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'records' ? (
            <DataTable
              columns={columns}
              data={voyageRecords.slice().reverse()}
              emptyMessage="暂无油料记录"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <h4 className="font-bold text-[#1A1A2E] mb-4">月度消耗对比</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { month: '6月', consumption: 10500, refuel: 80000 },
                      { month: '5月', consumption: 9800, refuel: 0 },
                      { month: '4月', consumption: 11200, refuel: 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8F0" />
                    <XAxis dataKey="month" stroke="#4A4A6A" />
                    <YAxis stroke="#4A4A6A" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consumption" name="消耗量(升)" radius={[4, 4, 0, 0]}>
                      <Cell fill="#FF6B35" />
                    </Bar>
                    <Bar dataKey="refuel" name="补给量(升)" radius={[4, 4, 0, 0]}>
                      <Cell fill="#44AF69" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#F5F5FA] rounded-xl p-6">
                <h4 className="font-bold text-[#1A1A2E] mb-4">成本构成分析</h4>
                <div className="space-y-4">
                  {[
                    { label: '燃料费用', value: 628000, percent: 81.6, color: '#FF6B35' },
                    { label: '润滑油费用', value: 35000, percent: 4.5, color: '#F9C80E' },
                    { label: '维修保养', value: 65000, percent: 8.4, color: '#3E92CC' },
                    { label: '其他费用', value: 42000, percent: 5.5, color: '#44AF69' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#4A4A6A]">{item.label}</span>
                        <span className="font-medium">¥{item.value.toLocaleString()} ({item.percent}%)</span>
                      </div>
                      <div className="h-2 bg-[#E8E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t border-[#E8E8F0]">
                    <div className="flex justify-between">
                      <span className="text-[#4A4A6A]">油料总成本</span>
                      <span className="text-xl font-bold text-[#1A1A2E]">¥770,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
