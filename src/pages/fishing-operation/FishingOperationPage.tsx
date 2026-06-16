import { useState, useEffect } from 'react';
import { Waves, Plus, Clock, Layers, Gauge, Users, Play, Square, CheckCircle2, Timer, Save, CloudRain, X, Eye, ChevronRight, Anchor } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatusBadge from '@/components/business/StatusBadge';
import Modal from '@/components/business/Modal';
import { useFishingStore } from '@/store/useFishingStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { useCrewStore } from '@/store/useCrewStore';
import { format, differenceInMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { FishingOperation } from '@/types';

const netTypes = ['底拖网', '中层拖网', '表层拖网', '围网', '流刺网'];

export default function FishingOperationPage() {
  const { operations, currentOperation, updateOperation, grounds, addOperation, catchRecords } = useFishingStore();
  const { currentVoyage, voyages } = useVoyageStore();
  const { getCrewById, crewList } = useCrewStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<FishingOperation | null>(null);
  const [filters, setFilters] = useState({
    voyageId: '',
    groundId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [formData, setFormData] = useState({
    netNumber: '',
    operationType: '拖网',
    startTime: '',
    endTime: '',
    duration: 0,
    depth: 0,
    location: '',
    weather: '晴',
    seaState: 0,
    note: '',
  });

  const filteredOperations = operations.filter(op => {
    if (filters.voyageId && op.voyageId !== filters.voyageId) return false;
    if (filters.groundId && op.groundId !== filters.groundId) return false;
    if (filters.dateFrom) {
      const opDate = new Date(op.startTime);
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (opDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const opDate = new Date(op.startTime);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (opDate > toDate) return false;
    }
    return true;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ voyageId: '', groundId: '', dateFrom: '', dateTo: '' });
  };

  useEffect(() => {
    if (currentOperation?.status === 'in_progress') {
      const interval = setInterval(() => {
        const elapsed = differenceInMinutes(new Date(), new Date(currentOperation.startTime));
        setElapsedTime(elapsed);
      }, 60000);
      const initialElapsed = differenceInMinutes(new Date(), new Date(currentOperation.startTime));
      setElapsedTime(initialElapsed);
      return () => clearInterval(interval);
    }
  }, [currentOperation]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['duration', 'depth', 'seaState'].includes(name) 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOperation: FishingOperation = {
      id: `op${Date.now()}`,
      voyageId: currentVoyage?.id || 'v1',
      groundId: grounds[0]?.id || 'fg1',
      netNo: parseInt(formData.netNumber) || operations.length + 1,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      trawlDepth: formData.depth,
      trawlSpeed: 3,
      netType: formData.operationType,
      crewIds: [],
      estimatedCatch: 0,
      actualCatch: 0,
      status: 'planned',
      location: formData.location,
      weather: formData.weather,
      seaState: formData.seaState,
      note: formData.note,
    };

    addOperation(newOperation);
    setIsModalOpen(false);
    setFormData({
      netNumber: '',
      operationType: '拖网',
      startTime: '',
      endTime: '',
      duration: 0,
      depth: 0,
      location: '',
      weather: '晴',
      seaState: 0,
      note: '',
    });
  };

  const columns = [
    {
      key: 'netNo',
      header: '网次',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3E92CC] to-[#0A2463] rounded-xl flex items-center justify-center text-white font-bold">
            {row.netNo}
          </div>
          <span className="font-medium">第{row.netNo}网</span>
        </div>
      ),
    },
    {
      key: 'groundId',
      header: '作业渔场',
      accessor: (row: any) => {
        const ground = grounds.find(g => g.id === row.groundId);
        return ground?.name || '-';
      },
    },
    {
      key: 'location',
      header: '作业位置',
      accessor: (row: any) => (
        <span className="text-[#1A1A2E]">{row.location || '-'}</span>
      ),
    },
    {
      key: 'netType',
      header: '网具类型',
      accessor: (row: any) => (
        <span className="px-3 py-1 bg-[#3E92CC]/10 text-[#0A2463] rounded-full text-sm font-medium">
          {row.netType}
        </span>
      ),
    },
    {
      key: 'trawlDepth',
      header: '拖网深度(m)',
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <Layers className="w-4 h-4 text-[#3E92CC]" />
          <span>{row.trawlDepth}</span>
        </div>
      ),
    },
    {
      key: 'weather',
      header: '天气/海况',
      accessor: (row: any) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-sm">
            <CloudRain className="w-3.5 h-3.5 text-[#3E92CC]" />
            <span>{row.weather || '-'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#4A4A6A]">
            <Waves className="w-3 h-3 text-[#44AF69]" />
            <span>{row.seaState !== undefined ? `${row.seaState}级` : '-'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      header: '作业时长',
      accessor: (row: any) => {
        const start = new Date(row.startTime);
        const end = row.endTime ? new Date(row.endTime) : new Date();
        const mins = differenceInMinutes(end, start);
        return formatDuration(mins);
      },
    },
    {
      key: 'actualCatch',
      header: '实际产量(kg)',
      accessor: (row: any) => (
        <span className={row.status === 'completed' ? 'font-bold text-[#44AF69]' : 'text-[#4A4A6A]'}>
          {row.status === 'completed' ? row.actualCatch.toLocaleString() : '-'}
        </span>
      ),
    },
    {
      key: 'note',
      header: '备注',
      accessor: (row: any) => (
        <span className="max-w-[200px] truncate block text-[#4A4A6A] text-sm">
          {row.note || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      accessor: (row: any) => (
        <StatusBadge
          status={
            row.status === 'completed' ? '已完成' :
            row.status === 'in_progress' ? '进行中' : '计划中'
          }
          variant={
            row.status === 'completed' ? 'success' :
            row.status === 'in_progress' ? 'info' : 'default'
          }
        />
      ),
    },
    {
      key: 'action',
      header: '操作',
      accessor: (row: any) => (
        <button 
          onClick={() => {
            setSelectedOperation(row);
            setIsDetailModalOpen(true);
          }}
          className="text-[#3E92CC] hover:text-[#0A2463] font-medium flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          查看详情
        </button>
      ),
    },
  ];

  const handleStartOperation = () => {
    if (currentOperation && currentOperation.status !== 'in_progress') {
      updateOperation(currentOperation.id, {
        status: 'in_progress',
        startTime: new Date().toISOString(),
      });
    }
  };

  const handleEndOperation = () => {
    if (currentOperation) {
      updateOperation(currentOperation.id, {
        status: 'completed',
        endTime: new Date().toISOString(),
        actualCatch: currentOperation.estimatedCatch,
      });
    }
  };

  const voyageOperations = currentVoyage
    ? operations.filter(o => o.voyageId === currentVoyage.id)
    : operations;

  return (
    <div>
      <PageHeader
        title="捕捞作业"
        subtitle="网次作业登记、拖网时长与捕捞深度管理"
        icon={Waves}
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            新增作业
          </button>
        }
      />

      {currentOperation && (
        <div className="bg-gradient-to-r from-[#0A2463] to-[#1A1A2E] rounded-2xl p-6 mb-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Waves className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold">第{currentOperation.netNo}网作业</h3>
                  <StatusBadge
                    status={currentOperation.status === 'in_progress' ? '进行中' : '待开始'}
                    variant={currentOperation.status === 'in_progress' ? 'info' : 'default'}
                  />
                </div>
                <p className="text-white/70">
                  渔场: {grounds.find(g => g.id === currentOperation.groundId)?.name} · {currentOperation.netType}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="w-5 h-5 text-[#F9C80E]" />
                  <span className="text-white/70 text-sm">作业时长</span>
                </div>
                <p className="text-3xl font-bold font-mono">
                  {currentOperation.status === 'in_progress'
                    ? formatDuration(elapsedTime)
                    : '0小时0分钟'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-5 h-5 text-[#44AF69]" />
                  <span className="text-white/70 text-sm">拖网深度</span>
                </div>
                <p className="text-3xl font-bold">{currentOperation.trawlDepth}<span className="text-lg font-normal">m</span></p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-5 h-5 text-[#FF6B35]" />
                  <span className="text-white/70 text-sm">拖速</span>
                </div>
                <p className="text-3xl font-bold">{currentOperation.trawlSpeed}<span className="text-lg font-normal">节</span></p>
              </div>
            </div>

            <div className="flex gap-3">
              {currentOperation.status !== 'in_progress' ? (
                <button
                  onClick={handleStartOperation}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#44AF69] to-[#2D7A4A] rounded-xl font-bold shadow-lg shadow-[#44AF69]/30 hover:shadow-xl transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  开始作业
                </button>
              ) : (
                <button
                  onClick={handleEndOperation}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#C44D27] rounded-xl font-bold shadow-lg shadow-[#FF6B35]/30 hover:shadow-xl transition-all duration-300"
                >
                  <Square className="w-5 h-5" />
                  结束作业
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-white/70" />
              <span className="text-white/70">作业人员</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {currentOperation.crewIds.map(crewId => {
                const crew = getCrewById(crewId);
                return crew ? (
                  <div key={crewId} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#44AF69] to-[#0A2463] flex items-center justify-center text-sm font-bold">
                      {crew.name.charAt(0)}
                    </div>
                    <span>{crew.name}</span>
                    <span className="text-white/60 text-sm">· {crew.position}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3E92CC] to-[#0A2463] rounded-xl flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#4A4A6A]">总作业网次</p>
              <p className="text-2xl font-bold text-[#1A1A2E]">{voyageOperations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#44AF69] to-[#2D7A4A] rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#4A4A6A]">已完成</p>
              <p className="text-2xl font-bold text-[#1A1A2E]">
                {voyageOperations.filter(o => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#C44D27] rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#4A4A6A]">总作业时长</p>
              <p className="text-2xl font-bold text-[#1A1A2E]">
                {Math.round(voyageOperations
                  .filter(o => o.status === 'completed')
                  .reduce((sum, o) => {
                    const mins = differenceInMinutes(new Date(o.endTime), new Date(o.startTime));
                    return sum + mins;
                  }, 0) / 60)}小时
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F9C80E] to-[#D4A80B] rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#4A4A6A]">总产量</p>
              <p className="text-2xl font-bold text-[#1A1A2E]">
                {voyageOperations
                  .filter(o => o.status === 'completed')
                  .reduce((sum, o) => sum + o.actualCatch, 0)
                  .toLocaleString()}
                <span className="text-sm font-normal text-[#4A4A6A] ml-1">kg</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">作业记录列表</h3>
        <DataTable
          columns={columns}
          data={voyageOperations.slice().reverse()}
          emptyMessage="暂无作业记录"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新增作业登记"
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">网次编号 *</label>
              <input
                type="text"
                name="netNumber"
                value={formData.netNumber}
                onChange={handleInputChange}
                placeholder="例如：1"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">作业类型 *</label>
              <select
                name="operationType"
                value={formData.operationType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              >
                <option value="拖网">拖网</option>
                <option value="围网">围网</option>
                <option value="流刺网">流刺网</option>
                <option value="延绳钓">延绳钓</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">开始时间 *</label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">结束时间 *</label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">拖网时长 (分钟)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="0"
                placeholder="例如：120"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">作业深度 (米)</label>
              <input
                type="number"
                name="depth"
                value={formData.depth}
                onChange={handleInputChange}
                min="0"
                placeholder="例如：60"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">作业位置</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="例如：东海渔区A点"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">天气</label>
              <select
                name="weather"
                value={formData.weather}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
              >
                <option value="晴">晴</option>
                <option value="多云">多云</option>
                <option value="阴">阴</option>
                <option value="小雨">小雨</option>
                <option value="中雨">中雨</option>
                <option value="大雨">大雨</option>
                <option value="雷阵雨">雷阵雨</option>
                <option value="雾">雾</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">海况 (0-9级)</label>
              <select
                name="seaState"
                value={formData.seaState}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <option key={level} value={level}>{level}级</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">备注</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="记录作业特点、渔获情况、注意事项等"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#E8E8F0]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-[#E8E8F0] text-[#4A4A6A] font-medium hover:bg-[#F5F5FA] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              保存作业
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedOperation ? `第${selectedOperation.netNo}网作业详情` : '作业详情'}
        className="max-w-4xl"
      >
        {selectedOperation && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F5F5FA] rounded-xl p-4">
                <div className="text-sm text-[#4A4A6A] mb-1">作业网次</div>
                <div className="text-xl font-bold text-[#1A1A2E]">第{selectedOperation.netNo}网</div>
              </div>
              <div className="bg-[#F5F5FA] rounded-xl p-4">
                <div className="text-sm text-[#4A4A6A] mb-1">作业状态</div>
                <StatusBadge
                  status={
                    selectedOperation.status === 'completed' ? '已完成' :
                    selectedOperation.status === 'in_progress' ? '进行中' : '计划中'
                  }
                  variant={
                    selectedOperation.status === 'completed' ? 'success' :
                    selectedOperation.status === 'in_progress' ? 'info' : 'default'
                  }
                />
              </div>
              <div className="bg-[#F5F5FA] rounded-xl p-4">
                <div className="text-sm text-[#4A4A6A] mb-1">关联网次</div>
                <div className="font-medium text-[#1A1A2E]">{selectedOperation.netType}</div>
              </div>
              <div className="bg-[#F5F5FA] rounded-xl p-4">
                <div className="text-sm text-[#4A4A6A] mb-1">关联渔场</div>
                <div className="font-medium text-[#1A1A2E]">
                  {grounds.find(g => g.id === selectedOperation.groundId)?.name || '-'}
                </div>
              </div>
              <div className="bg-[#F5F5FA] rounded-xl p-4">
                <div className="text-sm text-[#4A4A6A] mb-1">作业位置</div>
                <div className="font-medium text-[#1A1A2E] flex items-center gap-1">
                  <Anchor className="w-4 h-4 text-[#3E92CC]" />
                  {selectedOperation.location || '-'}
                </div>
              </div>
              <div className="bg-[#F5F5FA] rounded-xl p-4">
                <div className="text-sm text-[#4A4A6A] mb-1">拖网深度</div>
                <div className="font-medium text-[#1A1A2E]">{selectedOperation.trawlDepth} 米</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0A2463]/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#3E92CC]" />
                  <span className="text-sm font-medium text-[#4A4A6A]">开始时间</span>
                </div>
                <div className="text-lg font-bold text-[#1A1A2E]">
                  {format(new Date(selectedOperation.startTime), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </div>
              </div>
              <div className="bg-[#0A2463]/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-sm font-medium text-[#4A4A6A]">结束时间</span>
                </div>
                <div className="text-lg font-bold text-[#1A1A2E]">
                  {selectedOperation.endTime
                    ? format(new Date(selectedOperation.endTime), 'yyyy-MM-dd HH:mm', { locale: zhCN })
                    : '-'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F9C80E]/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CloudRain className="w-4 h-4 text-[#F9C80E]" />
                  <span className="text-sm font-medium text-[#4A4A6A]">天气状况</span>
                </div>
                <div className="text-lg font-bold text-[#1A1A2E]">{selectedOperation.weather || '-'}</div>
              </div>
              <div className="bg-[#44AF69]/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Waves className="w-4 h-4 text-[#44AF69]" />
                  <span className="text-sm font-medium text-[#4A4A6A]">海况等级</span>
                </div>
                <div className="text-lg font-bold text-[#1A1A2E]">
                  {selectedOperation.seaState !== undefined ? `${selectedOperation.seaState} 级` : '-'}
                </div>
              </div>
              <div className="bg-[#3E92CC]/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-[#3E92CC]" />
                  <span className="text-sm font-medium text-[#4A4A6A]">作业时长</span>
                </div>
                <div className="text-lg font-bold text-[#1A1A2E]">
                  {selectedOperation.endTime
                    ? formatDuration(differenceInMinutes(new Date(selectedOperation.endTime), new Date(selectedOperation.startTime)))
                    : '-'}
                </div>
              </div>
            </div>

            {selectedOperation.note && (
              <div className="bg-[#F5F5FA] rounded-xl p-4">
                <div className="text-sm font-medium text-[#4A4A6A] mb-2">备注信息</div>
                <div className="text-[#1A1A2E] whitespace-pre-wrap">{selectedOperation.note}</div>
              </div>
            )}

            <div className="border-t border-[#E8E8F0] pt-4">
              <h4 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#3E92CC]" />
                渔获汇总
              </h4>
              {(() => {
                const opCatchRecords = catchRecords.filter(r => r.operationId === selectedOperation.id);
                if (opCatchRecords.length === 0) {
                  return (
                    <div className="bg-[#F5F5FA] rounded-xl p-8 text-center text-[#4A4A6A]">
                      暂无渔获登记记录
                    </div>
                  );
                }
                const totalWeight = opCatchRecords.reduce((sum, r) => sum + r.weight, 0);
                const totalValue = opCatchRecords.reduce((sum, r) => sum + r.weight * r.unitPrice, 0);
                const speciesMap = new Map<string, number>();
                opCatchRecords.forEach(r => {
                  const current = speciesMap.get(r.species) || 0;
                  speciesMap.set(r.species, current + r.weight);
                });
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[#3E92CC]/10 rounded-xl p-4">
                        <div className="text-sm text-[#4A4A6A] mb-1">登记条数</div>
                        <div className="text-xl font-bold text-[#1A1A2E]">{opCatchRecords.length} 条</div>
                      </div>
                      <div className="bg-[#44AF69]/10 rounded-xl p-4">
                        <div className="text-sm text-[#4A4A6A] mb-1">总重量</div>
                        <div className="text-xl font-bold text-[#1A1A2E]">{totalWeight.toLocaleString()} kg</div>
                      </div>
                      <div className="bg-[#F9C80E]/10 rounded-xl p-4">
                        <div className="text-sm text-[#4A4A6A] mb-1">预估产值</div>
                        <div className="text-xl font-bold text-[#1A1A2E]">¥ {totalValue.toLocaleString()}</div>
                      </div>
                      <div className="bg-[#FF6B35]/10 rounded-xl p-4">
                        <div className="text-sm text-[#4A4A6A] mb-1">种类数量</div>
                        <div className="text-xl font-bold text-[#1A1A2E]">{speciesMap.size} 种</div>
                      </div>
                    </div>

                    <div className="bg-[#F5F5FA] rounded-xl overflow-hidden">
                      <div className="grid grid-cols-5 p-3 bg-[#E8E8F0] text-sm font-medium text-[#4A4A6A]">
                        <div>种类</div>
                        <div className="text-right">重量(kg)</div>
                        <div className="text-right">质量等级</div>
                        <div className="text-right">存储位置</div>
                        <div className="text-right">预估金额</div>
                      </div>
                      {opCatchRecords.map((record) => (
                        <div key={record.id} className="grid grid-cols-5 p-3 border-t border-[#E8E8F0] text-sm">
                          <div className="font-medium text-[#1A1A2E]">{record.species}</div>
                          <div className="text-right">{record.weight.toLocaleString()}</div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              record.quality === 'A' ? 'bg-[#44AF69]/20 text-[#2D7A4A]' :
                              record.quality === 'B' ? 'bg-[#F9C80E]/20 text-[#D4A80B]' :
                              'bg-[#FF6B35]/20 text-[#C44D27]'
                            }`}>
                              {record.quality}级
                            </span>
                          </div>
                          <div className="text-right text-[#4A4A6A]">{record.storageLocation}</div>
                          <div className="text-right font-medium">¥ {(record.weight * record.unitPrice).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E8E8F0]">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-3 rounded-xl border border-[#E8E8F0] text-[#4A4A6A] font-medium hover:bg-[#F5F5FA] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
