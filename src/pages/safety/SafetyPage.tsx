import { useState } from 'react';
import { Shield, Plus, AlertTriangle, CheckCircle, Phone, Radio, Wind, Waves, CloudRain, Thermometer, Eye, ChevronRight, LifeBuoy, Flame, Ship } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatCard from '@/components/business/StatCard';
import StatusBadge from '@/components/business/StatusBadge';
import { useSafetyStore } from '@/store/useSafetyStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { useFishingStore } from '@/store/useFishingStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const CHECK_RESULT_VARIANTS = {
  pass: { variant: 'success' as const, label: '通过', icon: CheckCircle },
  warning: { variant: 'warning' as const, label: '警告', icon: AlertTriangle },
  fail: { variant: 'danger' as const, label: '未通过', icon: AlertTriangle },
};

const PLAN_ICONS = {
  man_overboard: LifeBuoy,
  fire: Flame,
  ship_damage: Ship,
};

export default function SafetyPage() {
  const { checks, emergencyPlans, getWarningCount } = useSafetyStore();
  const { currentVoyage } = useVoyageStore();
  const { weatherData } = useFishingStore();
  const [activeTab, setActiveTab] = useState<'checks' | 'emergency' | 'weather'>('checks');
  const [selectedPlan, setSelectedPlan] = useState<string | null>('man_overboard');

  const warningCount = currentVoyage ? getWarningCount(currentVoyage.id) : 0;
  const voyageChecks = currentVoyage ? checks.filter(c => c.voyageId === currentVoyage.id) : checks;
  const currentWeather = weatherData[weatherData.length - 1];
  const selectedPlanData = emergencyPlans.find(p => p.type === selectedPlan);

  const checkColumns = [
    {
      key: 'checkType',
      header: '检查类型',
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            row.result === 'pass' ? 'bg-[#44AF69]/20' : row.result === 'warning' ? 'bg-[#F9C80E]/20' : 'bg-[#E63946]/20'
          }`}>
            {(() => {
              const Icon = CHECK_RESULT_VARIANTS[row.result].icon;
              return <Icon className={`w-5 h-5 ${
                row.result === 'pass' ? 'text-[#44AF69]' : row.result === 'warning' ? 'text-[#F9C80E]' : 'text-[#E63946]'
              }`} />;
            })()}
          </div>
          <span className="font-medium text-[#1A1A2E]">{row.checkType}</span>
        </div>
      ),
    },
    {
      key: 'checkDate',
      header: '检查日期',
      accessor: (row: any) => format(new Date(row.checkDate), 'yyyy-MM-dd', { locale: zhCN }),
    },
    {
      key: 'result',
      header: '检查结果',
      accessor: (row: any) => (
        <StatusBadge 
          status={CHECK_RESULT_VARIANTS[row.result].label} 
          variant={CHECK_RESULT_VARIANTS[row.result].variant}
        />
      ),
    },
    {
      key: 'issues',
      header: '发现问题',
      accessor: (row: any) => (
        <span className={`max-w-[300px] truncate block ${row.result !== 'pass' ? 'text-[#E63946]' : 'text-[#4A4A6A]'}`}>
          {row.issues}
        </span>
      ),
    },
    {
      key: 'inspector',
      header: '检查人',
      accessor: (row: any) => <span className="font-medium">{row.inspector}</span>,
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

  return (
    <div>
      <PageHeader
        title="安全应急"
        subtitle="海况天气监测、安全检查与应急处置预案"
        icon={Shield}
        actions={
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            安全检查
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="安全检查"
          value={voyageChecks.length.toString()}
          unit="次"
          icon={Shield}
          color="blue"
        />
        <StatCard
          title="通过检查"
          value={voyageChecks.filter(c => c.result === 'pass').length.toString()}
          unit="次"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="安全警告"
          value={warningCount.toString()}
          unit="个"
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="应急预案"
          value={emergencyPlans.length.toString()}
          unit="套"
          icon={LifeBuoy}
          color="orange"
        />
      </div>

      {currentWeather && (
        <div className="bg-gradient-to-r from-[#0A2463] to-[#3E92CC] rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CloudRain className="w-5 h-5" />
              当前海况天气
            </h3>
            <span className="text-sm opacity-80">
              更新时间：{format(new Date(currentWeather.timestamp), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Thermometer className="w-4 h-4" />
                <span className="text-sm">气温</span>
              </div>
              <div className="text-2xl font-bold">{currentWeather.temperature}°C</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Wind className="w-4 h-4" />
                <span className="text-sm">风速</span>
              </div>
              <div className="text-2xl font-bold">{currentWeather.windSpeed} m/s</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Eye className="w-4 h-4" />
                <span className="text-sm">风向</span>
              </div>
              <div className="text-2xl font-bold">{currentWeather.windDirection}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Waves className="w-4 h-4" />
                <span className="text-sm">浪高</span>
              </div>
              <div className="text-2xl font-bold">{currentWeather.waveHeight} m</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Shield className="w-4 h-4" />
                <span className="text-sm">海况等级</span>
              </div>
              <div className="text-2xl font-bold">{currentWeather.seaState} 级</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Eye className="w-4 h-4" />
                <span className="text-sm">能见度</span>
              </div>
              <div className="text-2xl font-bold">{currentWeather.visibility} km</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <CloudRain className="w-4 h-4" />
                <span className="text-sm">天气</span>
              </div>
              <div className="text-2xl font-bold">{currentWeather.weatherCondition}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F9C80E]" />
              <span>海况良好，适合作业</span>
            </div>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium">
              查看历史数据
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-white/50 overflow-hidden">
        <div className="flex border-b border-[#E8E8F0]">
          <button
            onClick={() => setActiveTab('checks')}
            className={`px-6 py-4 font-medium transition-all ${
              activeTab === 'checks'
                ? 'text-[#0A2463] border-b-2 border-[#0A2463] bg-[#0A2463]/5'
                : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
            }`}
          >
            安全检查
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-6 py-4 font-medium transition-all ${
              activeTab === 'emergency'
                ? 'text-[#0A2463] border-b-2 border-[#0A2463] bg-[#0A2463]/5'
                : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
            }`}
          >
            应急预案
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-6 py-4 font-medium transition-all ${
              activeTab === 'weather'
                ? 'text-[#0A2463] border-b-2 border-[#0A2463] bg-[#0A2463]/5'
                : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
            }`}
          >
            海况历史
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'checks' && (
            <DataTable
              columns={checkColumns}
              data={voyageChecks.slice().reverse()}
              emptyMessage="暂无安全检查记录"
            />
          )}

          {activeTab === 'emergency' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {emergencyPlans.map((plan) => {
                  const Icon = PLAN_ICONS[plan.type as keyof typeof PLAN_ICONS] || Shield;
                  const isSelected = selectedPlan === plan.type;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.type)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white shadow-lg'
                          : 'bg-[#F5F5FA] hover:bg-[#E8E8F0]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-white/20' : 'bg-gradient-to-br from-[#3E92CC] to-[#0A2463]'
                        }`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-white'}`} />
                        </div>
                        <div>
                          <div className={`font-bold ${isSelected ? 'text-white' : 'text-[#1A1A2E]'}`}>
                            {plan.name}
                          </div>
                          <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-[#4A4A6A]'}`}>
                            {plan.steps.length} 个处置步骤
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-2 bg-[#F5F5FA] rounded-xl p-6">
                {selectedPlanData && (
                  <div>
                    <h4 className="text-xl font-bold text-[#1A1A2E] mb-6">{selectedPlanData.name}</h4>
                    
                    <div className="mb-6">
                      <h5 className="font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#E63946] flex items-center justify-center text-white text-xs font-bold">!</div>
                        应急处置步骤
                      </h5>
                      <div className="space-y-3">
                        {selectedPlanData.steps.map((step, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#3E92CC] to-[#0A2463] flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1 p-3 bg-white rounded-lg">
                              <p className="text-[#1A1A2E]">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-[#44AF69]" />
                        紧急联系方式
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedPlanData.contacts.map((contact, index) => (
                          <div key={index} className="p-4 bg-white rounded-xl">
                            <div className="font-bold text-[#1A1A2E] mb-1">{contact.name}</div>
                            <div className="text-sm text-[#4A4A6A] mb-2">{contact.position}</div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4 text-[#44AF69]" />
                                <span>{contact.phone}</span>
                              </div>
                              {contact.radio && (
                                <div className="flex items-center gap-1">
                                  <Radio className="w-4 h-4 text-[#FF6B35]" />
                                  <span>{contact.radio}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="space-y-4">
              {weatherData.slice().reverse().map((weather, index) => (
                <div key={index} className="p-4 bg-[#F5F5FA] rounded-xl hover:bg-[#E8E8F0] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-[#1A1A2E]">
                      {format(new Date(weather.timestamp), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </span>
                    <StatusBadge 
                      status={weather.seaState <= 3 ? '适合作业' : weather.seaState <= 5 ? '谨慎作业' : '停止作业'}
                      variant={weather.seaState <= 3 ? 'success' : weather.seaState <= 5 ? 'warning' : 'danger'}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <span className="text-[#4A4A6A]">气温：</span>
                      <span className="font-medium">{weather.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-[#4A4A6A]">风速：</span>
                      <span className="font-medium">{weather.windSpeed} m/s</span>
                    </div>
                    <div>
                      <span className="text-[#4A4A6A]">风向：</span>
                      <span className="font-medium">{weather.windDirection}</span>
                    </div>
                    <div>
                      <span className="text-[#4A4A6A]">浪高：</span>
                      <span className="font-medium">{weather.waveHeight} m</span>
                    </div>
                    <div>
                      <span className="text-[#4A4A6A]">海况：</span>
                      <span className="font-medium">{weather.seaState} 级</span>
                    </div>
                    <div>
                      <span className="text-[#4A4A6A]">能见度：</span>
                      <span className="font-medium">{weather.visibility} km</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
