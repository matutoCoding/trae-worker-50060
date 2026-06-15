import { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, PieChart, Receipt, ChevronRight, ArrowUpRight, ArrowDownRight, Save } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatCard from '@/components/business/StatCard';
import StatusBadge from '@/components/business/StatusBadge';
import Modal from '@/components/business/Modal';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { FinanceRecord } from '@/types';

const CHART_COLORS = ['#0A2463', '#3E92CC', '#44AF69', '#F9C80E', '#FF6B35', '#E63946'];

const INCOME_CATEGORIES = ['渔获销售', '补贴收入', '其他收入'];
const EXPENSE_CATEGORIES = ['油料费', '伙食费', '船员工资', '港口费', '维修费', '保险费', '其他支出'];

const safePercent = (numerator: number, denominator: number, decimals: number = 1): string => {
  if (denominator === 0) return '0';
  const result = (numerator / denominator) * 100;
  return Number.isFinite(result) ? result.toFixed(decimals) : '0';
};

const safePercentNumber = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0;
  const result = (numerator / denominator) * 100;
  return Number.isFinite(result) ? result : 0;
};

const safeWidth = (numerator: number, denominator: number, max: number = 100): number => {
  if (denominator === 0) return 0;
  const result = (numerator / denominator) * 100;
  return Number.isFinite(result) ? Math.min(result, max) : 0;
};

export default function FinancePage() {
  const { records, getRecordsByType, getRecordsByCategory, getSummaryByVoyage, addRecord } = useFinanceStore();
  const { currentVoyage, voyageList } = useVoyageStore();
  const [activeTab, setActiveTab] = useState<'records' | 'analysis'>('records');
  const [selectedVoyageId, setSelectedVoyageId] = useState(currentVoyage?.id || 'v1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    payer: '',
    receiver: '',
    remark: '',
  });

  const summary = getSummaryByVoyage(selectedVoyageId);
  const incomeRecords = getRecordsByType(selectedVoyageId, 'income');
  const expenseRecords = getRecordsByType(selectedVoyageId, 'expense');
  const categoryData = getRecordsByCategory(selectedVoyageId);
  const voyageRecords = records.filter(r => r.voyageId === selectedVoyageId);
  const hasRecords = voyageRecords.length > 0;

  const pieData = summary.costBreakdown.map((item, index) => ({
    name: item.category,
    value: item.amount,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const barData = categoryData.map(item => ({
    category: item.category,
    income: item.income,
    expense: item.expense,
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({ ...prev, type, category: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      return;
    }

    const newRecord: FinanceRecord = {
      id: `fr-${Date.now()}`,
      voyageId: selectedVoyageId,
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      payer: formData.payer,
      receiver: formData.receiver,
      recordDate: new Date().toISOString(),
      remark: formData.remark,
    };

    addRecord(newRecord);
    
    setFormData({
      type: 'income',
      category: '',
      amount: '',
      payer: '',
      receiver: '',
      remark: '',
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'type',
      header: '类型',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            row.type === 'income'
              ? 'bg-gradient-to-br from-[#44AF69] to-[#2D7A4A]'
              : 'bg-gradient-to-br from-[#FF6B35] to-[#C44D27]'
          }`}>
            {row.type === 'income' ? (
              <ArrowUpRight className="w-5 h-5 text-white" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="font-medium">
            {row.type === 'income' ? '收入' : '支出'}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: '类别',
      accessor: (row: any) => <span className="font-medium text-[#1A1A2E]">{row.category}</span>,
    },
    {
      key: 'amount',
      header: '金额(元)',
      accessor: (row: any) => (
        <span className={`font-bold text-lg ${
          row.type === 'income' ? 'text-[#44AF69]' : 'text-[#FF6B35]'
        }`}>
          {row.type === 'income' ? '+' : '-'}¥{row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'payer',
      header: '付款方',
      accessor: (row: any) => <span className="text-[#4A4A6A]">{row.payer}</span>,
    },
    {
      key: 'receiver',
      header: '收款方',
      accessor: (row: any) => <span className="text-[#4A4A6A]">{row.receiver}</span>,
    },
    {
      key: 'recordDate',
      header: '日期',
      accessor: (row: any) => format(new Date(row.recordDate), 'yyyy-MM-dd', { locale: zhCN }),
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

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-[#8A8AAA]">
      <Receipt className="w-12 h-12 mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );

  const EmptyChartState = ({ message }: { message: string }) => (
    <div className="h-[300px] flex flex-col items-center justify-center text-[#8A8AAA]">
      <PieChart className="w-12 h-12 mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="收支结算"
        subtitle="航次收支管理、成本核算与利润分析"
        icon={DollarSign}
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            新增记录
          </button>
        }
      />

      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        <span className="text-[#4A4A6A] font-medium flex-shrink-0">选择航次：</span>
        {voyageList.map((voyage) => (
          <button
            key={voyage.id}
            onClick={() => setSelectedVoyageId(voyage.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl transition-all ${
              selectedVoyageId === voyage.id
                ? 'bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white shadow-lg'
                : 'bg-[#F5F5FA] hover:bg-[#E8E8F0] text-[#1A1A2E]'
            }`}
          >
            <span className="font-medium">{voyage.voyageNo}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="总收入"
          value={`¥${hasRecords ? (summary.totalIncome / 10000).toFixed(1) : '0.0'}`}
          unit="万"
          icon={TrendingUp}
          color="green"
          trend={12.5}
        />
        <StatCard
          title="总支出"
          value={`¥${hasRecords ? (summary.totalExpense / 10000).toFixed(1) : '0.0'}`}
          unit="万"
          icon={TrendingDown}
          color="orange"
          trend={-3.2}
        />
        <StatCard
          title="净利润"
          value={`¥${hasRecords ? (summary.netProfit / 10000).toFixed(1) : '0.0'}`}
          unit="万"
          icon={DollarSign}
          color="blue"
          trend={8.7}
        />
        <StatCard
          title="利润率"
          value={safePercent(summary.netProfit, summary.totalIncome)}
          unit="%"
          icon={PieChart}
          color="green"
          progress={Math.round(safePercentNumber(summary.netProfit, summary.totalIncome))}
        />
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
            收支记录
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-4 font-medium transition-all ${
              activeTab === 'analysis'
                ? 'text-[#0A2463] border-b-2 border-[#0A2463] bg-[#0A2463]/5'
                : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
            }`}
          >
            统计分析
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'records' && (
            <div>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-[#44AF69]"></div>
                    <span className="font-medium text-[#1A1A2E]">收入记录</span>
                    <span className="text-[#44AF69] font-bold ml-auto">¥{summary.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {incomeRecords.length > 0 ? (
                      incomeRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-[#44AF69]/5 rounded-xl hover:bg-[#44AF69]/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#44AF69] to-[#2D7A4A] flex items-center justify-center">
                              <ArrowUpRight className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-[#1A1A2E]">{record.category}</div>
                              <div className="text-sm text-[#4A4A6A]">{record.remark}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#44AF69]">+¥{record.amount.toLocaleString()}</div>
                            <div className="text-xs text-[#4A4A6A]">
                              {format(new Date(record.recordDate), 'yyyy-MM-dd', { locale: zhCN })}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState message="暂无收入记录" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>
                    <span className="font-medium text-[#1A1A2E]">支出记录</span>
                    <span className="text-[#FF6B35] font-bold ml-auto">¥{summary.totalExpense.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {expenseRecords.length > 0 ? (
                      expenseRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-[#FF6B35]/5 rounded-xl hover:bg-[#FF6B35]/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#C44D27] flex items-center justify-center">
                              <ArrowDownRight className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-[#1A1A2E]">{record.category}</div>
                              <div className="text-sm text-[#4A4A6A]">{record.remark}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#FF6B35]">-¥{record.amount.toLocaleString()}</div>
                            <div className="text-xs text-[#4A4A6A]">
                              {format(new Date(record.recordDate), 'yyyy-MM-dd', { locale: zhCN })}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState message="暂无支出记录" />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E8E8F0] pt-6">
                <h4 className="font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#3E92CC]" />
                  全部记录
                </h4>
                <DataTable
                  columns={columns}
                  data={voyageRecords.slice().reverse()}
                  emptyMessage="暂无收支记录"
                />
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#F5F5FA] rounded-xl p-6">
                <h4 className="font-bold text-[#1A1A2E] mb-4">成本构成分析</h4>
                {pieData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `¥${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: '#1A1A2E',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChartState message="暂无成本数据" />
                )}
              </div>

              <div className="bg-[#F5F5FA] rounded-xl p-6">
                <h4 className="font-bold text-[#1A1A2E] mb-4">收支分类对比</h4>
                {barData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8F0" />
                        <XAxis dataKey="category" stroke="#4A4A6A" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#4A4A6A" tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => `¥${value.toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: '#1A1A2E',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="income" name="收入(元)" fill="#44AF69" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="支出(元)" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChartState message="暂无收支数据" />
                )}
              </div>

              <div className="lg:col-span-2 bg-[#F5F5FA] rounded-xl p-6">
                <h4 className="font-bold text-[#1A1A2E] mb-4">航次收益分析</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6">
                    <div className="text-sm text-[#4A4A6A] mb-2">投资回报率</div>
                    <div className="text-3xl font-bold text-[#44AF69]">
                      {safePercent(summary.netProfit, summary.totalExpense)}%
                    </div>
                    <div className="mt-4 h-2 bg-[#E8E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#44AF69] to-[#2D7A4A] rounded-full"
                        style={{ width: `${safeWidth(summary.netProfit, summary.totalExpense)}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <div className="text-sm text-[#4A4A6A] mb-2">成本收入比</div>
                    <div className="text-3xl font-bold text-[#FF6B35]">
                      {safePercent(summary.totalExpense, summary.totalIncome)}%
                    </div>
                    <div className="mt-4 h-2 bg-[#E8E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B35] to-[#C44D27] rounded-full"
                        style={{ width: `${safeWidth(summary.totalExpense, summary.totalIncome)}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <div className="text-sm text-[#4A4A6A] mb-2">日均收益</div>
                    <div className="text-3xl font-bold text-[#3E92CC]">
                      ¥{hasRecords ? Math.round(summary.netProfit / 20).toLocaleString() : '0'}
                    </div>
                    <div className="text-xs text-[#4A4A6A] mt-4">
                      按20天航次计算
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-xl">
                  <h5 className="font-bold text-[#1A1A2E] mb-3">成本明细</h5>
                  {summary.costBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {summary.costBreakdown.map((item, index) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-[#1A1A2E]">{item.category}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">¥{item.amount.toLocaleString()}</span>
                            <span className="text-[#4A4A6A] text-sm">
                              {safePercent(item.amount, summary.totalExpense)}%
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 mt-3 border-t border-[#E8E8F0] flex items-center justify-between">
                        <span className="font-bold text-[#1A1A2E]">总计</span>
                        <span className="font-bold text-lg text-[#FF6B35]">¥{summary.totalExpense.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="暂无成本明细" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增收支记录">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">记录类型 <span className="text-[#E63946]">*</span></label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-gradient-to-r from-[#44AF69] to-[#2D7A4A] text-white shadow-lg shadow-[#44AF69]/30'
                    : 'bg-[#F5F5FA] text-[#4A4A6A] hover:bg-[#E8E8F0]'
                }`}
              >
                收入
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#C44D27] text-white shadow-lg shadow-[#FF6B35]/30'
                    : 'bg-[#F5F5FA] text-[#4A4A6A] hover:bg-[#E8E8F0]'
                }`}
              >
                支出
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">类别 <span className="text-[#E63946]">*</span></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] bg-white text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 focus:border-[#3E92CC] transition-all"
            >
              <option value="">请选择类别</option>
              {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">金额 (元) <span className="text-[#E63946]">*</span></label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="请输入金额"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] bg-white text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 focus:border-[#3E92CC] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">付款方</label>
            <input
              type="text"
              name="payer"
              value={formData.payer}
              onChange={handleInputChange}
              placeholder="请输入付款方"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] bg-white text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 focus:border-[#3E92CC] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">收款方</label>
            <input
              type="text"
              name="receiver"
              value={formData.receiver}
              onChange={handleInputChange}
              placeholder="请输入收款方"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] bg-white text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 focus:border-[#3E92CC] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">备注</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              rows={3}
              placeholder="请输入备注信息"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] bg-white text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 focus:border-[#3E92CC] transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 px-4 rounded-xl font-medium bg-[#F5F5FA] text-[#4A4A6A] hover:bg-[#E8E8F0] transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              保存记录
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
