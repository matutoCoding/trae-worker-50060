import { useState } from 'react';
import { Anchor, Plus, Calendar, MapPin, User, Clock, CheckCircle2, XCircle, Eye, Save } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatusBadge from '@/components/business/StatusBadge';
import Modal from '@/components/business/Modal';
import { useVoyageStore } from '@/store/useVoyageStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Voyage } from '@/types';

const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  planning: { label: '计划中', variant: 'default' },
  approved: { label: '已审批', variant: 'info' },
  in_progress: { label: '进行中', variant: 'success' },
  completed: { label: '已完成', variant: 'success' },
  cancelled: { label: '已取消', variant: 'danger' },
};

export default function VoyagePage() {
  const { voyageList, currentVoyage, setCurrentVoyage, updateVoyage, addVoyage } = useVoyageStore();
  const [selectedVoyage, setSelectedVoyage] = useState(currentVoyage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    voyageNo: '',
    startDate: '',
    endDate: '',
    targetGround: '',
    captain: '',
    route: '',
    plannedDays: 15,
  });

  const columns = [
    {
      key: 'voyageNo',
      header: '航次编号',
      accessor: (row: any) => (
        <span className="font-bold text-[#0A2463]">{row.voyageNo}</span>
      ),
    },
    {
      key: 'startDate',
      header: '出发日期',
      accessor: (row: any) => format(new Date(row.startDate), 'yyyy-MM-dd', { locale: zhCN }),
    },
    {
      key: 'endDate',
      header: '预计返航',
      accessor: (row: any) => format(new Date(row.endDate), 'yyyy-MM-dd', { locale: zhCN }),
    },
    {
      key: 'targetGround',
      header: '目标渔场',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#3E92CC]" />
          <span>{row.targetGround}</span>
        </div>
      ),
    },
    {
      key: 'captain',
      header: '船长',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#44AF69]" />
          <span>{row.captain}</span>
        </div>
      ),
    },
    {
      key: 'plannedDays',
      header: '计划天数',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#F9C80E]" />
          <span>{row.plannedDays}天</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: '状态',
      accessor: (row: any) => (
        <StatusBadge
          status={statusMap[row.status].label}
          variant={statusMap[row.status].variant}
        />
      ),
    },
    {
      key: 'actions',
      header: '操作',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {row.status === 'planning' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="p-2 text-[#44AF69] hover:bg-green-50 rounded-lg transition-colors"
                title="审批通过"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleCancel(row.id)}
                className="p-2 text-[#E63946] hover:bg-red-50 rounded-lg transition-colors"
                title="取消航次"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => setSelectedVoyage(row)}
            className="p-2 text-[#3E92CC] hover:bg-blue-50 rounded-lg transition-colors"
            title="查看详情"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const handleApprove = (id: string) => {
    updateVoyage(id, { status: 'approved' });
  };

  const handleCancel = (id: string) => {
    updateVoyage(id, { status: 'cancelled' });
  };

  const handleSetCurrent = (voyage: any) => {
    if (voyage.status === 'approved' || voyage.status === 'in_progress') {
      setCurrentVoyage(voyage);
      updateVoyage(voyage.id, { status: 'in_progress' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'plannedDays' ? parseInt(value) || 0 : value,
    }));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    setFormData(prev => {
      const endDate = prev.endDate || startDate;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const plannedDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      return {
        ...prev,
        startDate,
        plannedDays,
      };
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    setFormData(prev => {
      const startDate = prev.startDate || endDate;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const plannedDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      return {
        ...prev,
        endDate,
        plannedDays,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVoyage: Voyage = {
      id: `v${Date.now()}`,
      voyageNo: formData.voyageNo,
      startDate: formData.startDate,
      endDate: formData.endDate,
      targetGround: formData.targetGround,
      captain: formData.captain,
      route: formData.route,
      plannedDays: formData.plannedDays,
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addVoyage(newVoyage);
    setIsModalOpen(false);
    setFormData({
      voyageNo: '',
      startDate: '',
      endDate: '',
      targetGround: '',
      captain: '',
      route: '',
      plannedDays: 15,
    });
  };

  return (
    <div>
      <PageHeader
        title="出海计划"
        subtitle="航次计划管理、审批与状态追踪"
        icon={Anchor}
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            新建航次
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={voyageList}
            emptyMessage="暂无航次计划"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50 h-fit">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3E92CC]" />
            航次详情
          </h3>

          {selectedVoyage ? (
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-[#E8E8F0]">
                <p className="text-sm text-[#4A4A6A] mb-1">航次编号</p>
                <p className="text-2xl font-bold text-[#0A2463]">{selectedVoyage.voyageNo}</p>
                <StatusBadge
                  status={statusMap[selectedVoyage.status].label}
                  variant={statusMap[selectedVoyage.status].variant}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#E8E8F0]/50">
                  <span className="text-[#4A4A6A]">船长</span>
                  <span className="font-medium text-[#1A1A2E]">{selectedVoyage.captain}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#E8E8F0]/50">
                  <span className="text-[#4A4A6A]">目标渔场</span>
                  <span className="font-medium text-[#1A1A2E]">{selectedVoyage.targetGround}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#E8E8F0]/50">
                  <span className="text-[#4A4A6A]">出发日期</span>
                  <span className="font-medium text-[#1A1A2E]">
                    {format(new Date(selectedVoyage.startDate), 'yyyy年MM月dd日', { locale: zhCN })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#E8E8F0]/50">
                  <span className="text-[#4A4A6A]">预计返航</span>
                  <span className="font-medium text-[#1A1A2E]">
                    {format(new Date(selectedVoyage.endDate), 'yyyy年MM月dd日', { locale: zhCN })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#E8E8F0]/50">
                  <span className="text-[#4A4A6A]">计划天数</span>
                  <span className="font-medium text-[#1A1A2E]">{selectedVoyage.plannedDays}天</span>
                </div>
                <div className="py-2">
                  <span className="text-[#4A4A6A] block mb-2">航行路线</span>
                  <div className="bg-[#F5F5FA] rounded-xl p-3 text-sm text-[#1A1A2E]">
                    {selectedVoyage.route}
                  </div>
                </div>
              </div>

              {(selectedVoyage.status === 'approved' || selectedVoyage.status === 'planning') && (
                <button
                  onClick={() => handleSetCurrent(selectedVoyage)}
                  className="w-full py-3 bg-gradient-to-r from-[#44AF69] to-[#2D7A4A] text-white rounded-xl font-medium shadow-lg shadow-[#44AF69]/30 hover:shadow-xl transition-all duration-300"
                >
                  开始执行航次
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-[#4A4A6A]">
              <Anchor className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>请选择一个航次查看详情</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-6">航次时间线</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3E92CC] via-[#44AF69] to-[#E8E8F0]"></div>
          {[
            { title: '航次计划创建', date: '2026-05-28', status: 'completed', desc: '船长张海洋创建航次HY-2026-001' },
            { title: '航次审批通过', date: '2026-05-29', status: 'completed', desc: '渔业公司审批通过' },
            { title: '物资补给完成', date: '2026-05-31', status: 'completed', desc: '完成油料、淡水、伙食补给' },
            { title: '出航', date: '2026-06-01', status: 'completed', desc: '从宁波舟山港出发' },
            { title: '抵达渔场', date: '2026-06-05', status: 'completed', desc: '抵达东海渔区A点' },
            { title: '捕捞作业中', date: '2026-06-10 至今', status: 'in_progress', desc: '完成3网作业，渔获12.9吨' },
            { title: '预计返航', date: '2026-06-18', status: 'pending', desc: '预计从舟山渔场返航' },
            { title: '抵达港口', date: '2026-06-20', status: 'pending', desc: '预计抵达宁波舟山港' },
          ].map((item, index) => (
            <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                item.status === 'completed' ? 'bg-[#44AF69]' :
                item.status === 'in_progress' ? 'bg-[#3E92CC] animate-pulse' : 'bg-[#E8E8F0]'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'completed' || item.status === 'in_progress' ? 'bg-white' : 'bg-[#4A4A6A]'
                }`}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold ${
                    item.status === 'pending' ? 'text-[#4A4A6A]' : 'text-[#1A1A2E]'
                  }`}>{item.title}</h4>
                  {item.status === 'in_progress' && (
                    <StatusBadge status="进行中" variant="info" size="sm" />
                  )}
                </div>
                <p className="text-sm text-[#4A4A6A] mb-1">{item.date}</p>
                <p className={`text-sm ${item.status === 'pending' ? 'text-[#4A4A6A]/60' : 'text-[#4A4A6A]'}`}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新建航次计划"
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">航次编号 *</label>
              <input
                type="text"
                name="voyageNo"
                value={formData.voyageNo}
                onChange={handleInputChange}
                placeholder="例如：HY-2026-004"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">船长 *</label>
              <input
                type="text"
                name="captain"
                value={formData.captain}
                onChange={handleInputChange}
                placeholder="请输入船长姓名"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">出发日期 *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleStartDateChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">预计返航 *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleEndDateChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">目标渔场 *</label>
              <input
                type="text"
                name="targetGround"
                value={formData.targetGround}
                onChange={handleInputChange}
                placeholder="例如：东海渔区123海区"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-2">计划天数</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="plannedDays"
                  value={formData.plannedDays}
                  onChange={handleInputChange}
                  min="1"
                  className="flex-1 px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                />
                <span className="text-[#4A4A6A]">天</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A4A6A] mb-2">航行路线 *</label>
            <textarea
              name="route"
              value={formData.route}
              onChange={handleInputChange}
              placeholder="例如：宁波港 -> 东海渔区 -> 舟山渔场 -> 宁波港"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all resize-none"
              required
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
              保存航次
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
