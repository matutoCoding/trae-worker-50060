import { useState } from 'react';
import { Shield, Plus, AlertTriangle, CheckCircle, Phone, Radio, Wind, Waves, CloudRain, Thermometer, Eye, ChevronRight, LifeBuoy, Flame, Ship, Save, Trash2, Edit } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatCard from '@/components/business/StatCard';
import StatusBadge from '@/components/business/StatusBadge';
import Modal from '@/components/business/Modal';
import { useSafetyStore } from '@/store/useSafetyStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { useFishingStore } from '@/store/useFishingStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { SafetyCheck, EmergencyPlan, EmergencyContact } from '@/types';

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

const CHECK_TYPE_OPTIONS = ['船舶设备检查', '消防设备检查', '救生设备检查', '航行安全检查', '船员资质检查', '其他'];
const PLAN_TYPE_OPTIONS = [
  { value: 'man_overboard', label: '人员落水' },
  { value: 'fire', label: '火灾' },
  { value: 'ship_damage', label: '船舶破损' },
  { value: 'other', label: '其他' },
];

export default function SafetyPage() {
  const { checks, emergencyPlans, getWarningCount, addCheck, addEmergencyPlan, updateEmergencyPlan } = useSafetyStore();
  const { currentVoyage } = useVoyageStore();
  const { weatherData } = useFishingStore();
  const [activeTab, setActiveTab] = useState<'checks' | 'emergency' | 'weather'>('checks');
  const [selectedPlan, setSelectedPlan] = useState<string | null>('man_overboard');
  
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [checkFormData, setCheckFormData] = useState({
    checkType: '',
    checkDate: format(new Date(), 'yyyy-MM-dd'),
    result: 'pass' as 'pass' | 'warning' | 'fail',
    issues: '',
    inspector: '',
    remark: '',
  });

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    type: 'man_overboard' as string,
    steps: [''] as string[],
    contacts: [{ name: '', position: '', phone: '', radio: '' }] as EmergencyContact[],
  });

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

  const handleCheckInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCheckFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCheck: SafetyCheck = {
      id: `sc${Date.now()}`,
      voyageId: currentVoyage?.id || '',
      checkType: checkFormData.checkType,
      checkDate: checkFormData.checkDate,
      result: checkFormData.result,
      issues: checkFormData.issues,
      inspector: checkFormData.inspector,
      remark: checkFormData.remark,
    };

    addCheck(newCheck);
    setIsCheckModalOpen(false);
    setCheckFormData({
      checkType: '',
      checkDate: format(new Date(), 'yyyy-MM-dd'),
      result: 'pass',
      issues: '',
      inspector: '',
      remark: '',
    });
  };

  const handleEditPlan = (plan?: EmergencyPlan) => {
    if (plan) {
      setEditingPlanId(plan.id);
      setPlanFormData({
        name: plan.name,
        type: plan.type,
        steps: [...plan.steps],
        contacts: plan.contacts.map(c => ({ ...c })),
      });
    } else {
      setEditingPlanId(null);
      setPlanFormData({
        name: '',
        type: 'man_overboard',
        steps: [''],
        contacts: [{ name: '', position: '', phone: '', radio: '' }],
      });
    }
    setIsPlanModalOpen(true);
  };

  const handlePlanInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlanFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStepChange = (index: number, value: string) => {
    setPlanFormData(prev => {
      const newSteps = [...prev.steps];
      newSteps[index] = value;
      return { ...prev, steps: newSteps };
    });
  };

  const handleAddStep = () => {
    setPlanFormData(prev => ({
      ...prev,
      steps: [...prev.steps, ''],
    }));
  };

  const handleRemoveStep = (index: number) => {
    if (planFormData.steps.length > 1) {
      setPlanFormData(prev => {
        const newSteps = prev.steps.filter((_, i) => i !== index);
        return { ...prev, steps: newSteps };
      });
    }
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    setPlanFormData(prev => {
      const newContacts = [...prev.contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      return { ...prev, contacts: newContacts };
    });
  };

  const handleAddContact = () => {
    setPlanFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', position: '', phone: '', radio: '' }],
    }));
  };

  const handleRemoveContact = (index: number) => {
    if (planFormData.contacts.length > 1) {
      setPlanFormData(prev => {
        const newContacts = prev.contacts.filter((_, i) => i !== index);
        return { ...prev, contacts: newContacts };
      });
    }
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredSteps = planFormData.steps.filter(s => s.trim() !== '');
    const filteredContacts = planFormData.contacts.filter(c => c.name.trim() !== '');
    
    if (editingPlanId) {
      updateEmergencyPlan(editingPlanId, {
        name: planFormData.name,
        type: planFormData.type,
        steps: filteredSteps,
        contacts: filteredContacts,
      });
    } else {
      const newPlan: EmergencyPlan = {
        id: `ep${Date.now()}`,
        voyageId: currentVoyage?.id || '',
        name: planFormData.name,
        type: planFormData.type,
        steps: filteredSteps,
        contacts: filteredContacts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addEmergencyPlan(newPlan);
    }

    setIsPlanModalOpen(false);
    setEditingPlanId(null);
    setPlanFormData({
      name: '',
      type: 'man_overboard',
      steps: [''],
      contacts: [{ name: '', position: '', phone: '', radio: '' }],
    });
  };

  return (
    <div>
      <PageHeader
        title="安全应急"
        subtitle="海况天气监测、安全检查与应急处置预案"
        icon={Shield}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleEditPlan()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#44AF69] to-[#2D7A4A] text-white rounded-xl font-medium shadow-lg shadow-[#44AF69]/30 hover:shadow-xl hover:shadow-[#44AF69]/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              新增预案
            </button>
            <button
              onClick={() => setIsCheckModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              安全检查
            </button>
          </div>
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
                    <div
                      key={plan.id}
                      className={`w-full p-4 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white shadow-lg'
                          : 'bg-[#F5F5FA] hover:bg-[#E8E8F0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedPlan(plan.type)}
                          className="flex-1 flex items-center gap-3 text-left"
                        >
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
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPlan(plan);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isSelected
                              ? 'hover:bg-white/20 text-white'
                              : 'hover:bg-[#E8E8F0] text-[#4A4A6A]'
                          }`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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

      <Modal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        title="新增安全检查"
        className="max-w-2xl"
      >
        <form onSubmit={handleCheckSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">检查类型 *</label>
              <select
                name="checkType"
                value={checkFormData.checkType}
                onChange={handleCheckInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              >
                <option value="">请选择检查类型</option>
                {CHECK_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">检查日期 *</label>
              <input
                type="date"
                name="checkDate"
                value={checkFormData.checkDate}
                onChange={handleCheckInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">检查结果 *</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="result"
                  value="pass"
                  checked={checkFormData.result === 'pass'}
                  onChange={handleCheckInputChange}
                  className="w-4 h-4 text-[#44AF69] focus:ring-[#44AF69]"
                  required
                />
                <span className="text-[#1A1A2E]">通过</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="result"
                  value="warning"
                  checked={checkFormData.result === 'warning'}
                  onChange={handleCheckInputChange}
                  className="w-4 h-4 text-[#F9C80E] focus:ring-[#F9C80E]"
                />
                <span className="text-[#1A1A2E]">警告</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="result"
                  value="fail"
                  checked={checkFormData.result === 'fail'}
                  onChange={handleCheckInputChange}
                  className="w-4 h-4 text-[#E63946] focus:ring-[#E63946]"
                />
                <span className="text-[#1A1A2E]">未通过</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">发现问题</label>
            <textarea
              name="issues"
              value={checkFormData.issues}
              onChange={handleCheckInputChange}
              placeholder="请描述发现的问题"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">检查人 *</label>
            <input
              type="text"
              name="inspector"
              value={checkFormData.inspector}
              onChange={handleCheckInputChange}
              placeholder="请输入检查人姓名"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">备注</label>
            <textarea
              name="remark"
              value={checkFormData.remark}
              onChange={handleCheckInputChange}
              placeholder="请输入备注信息"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#E8E8F0]">
            <button
              type="button"
              onClick={() => setIsCheckModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-[#E8E8F0] text-[#4A4A6A] font-medium hover:bg-[#F5F5FA] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              保存检查
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlanId ? "编辑应急预案" : "新增应急预案"}
        className="max-w-3xl"
      >
        <form onSubmit={handlePlanSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">预案名称 *</label>
              <input
                type="text"
                name="name"
                value={planFormData.name}
                onChange={handlePlanInputChange}
                placeholder="请输入预案名称"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">预案类型 *</label>
              <select
                name="type"
                value={planFormData.type}
                onChange={handlePlanInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              >
                {PLAN_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-[#4A4A6A]">处置步骤 *</label>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-sm text-[#3E92CC] hover:text-[#0A2463] font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加步骤
              </button>
            </div>
            <div className="space-y-3">
              {planFormData.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#3E92CC] to-[#0A2463] flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder="请输入处置步骤"
                      className="flex-1 px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-3 rounded-xl border border-[#E8E8F0] text-[#E63946] hover:bg-[#E63946]/10 transition-colors"
                      disabled={planFormData.steps.length <= 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-[#4A4A6A]">紧急联系人 *</label>
              <button
                type="button"
                onClick={handleAddContact}
                className="text-sm text-[#3E92CC] hover:text-[#0A2463] font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加联系人
              </button>
            </div>
            <div className="space-y-4">
              {planFormData.contacts.map((contact, index) => (
                <div key={index} className="p-4 bg-[#F5F5FA] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#4A4A6A]">联系人 {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(index)}
                      className="p-2 rounded-lg text-[#E63946] hover:bg-[#E63946]/10 transition-colors"
                      disabled={planFormData.contacts.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#4A4A6A] mb-1">姓名</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        placeholder="姓名"
                        className="w-full px-3 py-2 rounded-lg border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4A4A6A] mb-1">职务</label>
                      <input
                        type="text"
                        value={contact.position}
                        onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                        placeholder="职务"
                        className="w-full px-3 py-2 rounded-lg border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4A4A6A] mb-1">电话</label>
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        placeholder="联系电话"
                        className="w-full px-3 py-2 rounded-lg border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4A4A6A] mb-1">电台频道</label>
                      <input
                        type="text"
                        value={contact.radio || ''}
                        onChange={(e) => handleContactChange(index, 'radio', e.target.value)}
                        placeholder="电台频道"
                        className="w-full px-3 py-2 rounded-lg border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#E8E8F0]">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-[#E8E8F0] text-[#4A4A6A] font-medium hover:bg-[#F5F5FA] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              保存预案
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
