import { useState } from 'react';
import { Waves, Plus, Clock, Layers, Gauge, Users, Play, Square, CheckCircle2, Timer } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatusBadge from '@/components/business/StatusBadge';
import { useFishingStore } from '@/store/useFishingStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { useCrewStore } from '@/store/useCrewStore';
import { format, differenceInMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useEffect } from 'react';

const netTypes = ['底拖网', '中层拖网', '表层拖网', '围网', '流刺网'];

export default function FishingOperationPage() {
  const { operations, currentOperation, updateOperation, grounds } = useFishingStore();
  const { currentVoyage } = useVoyageStore();
  const { getCrewById } = useCrewStore();
  const [elapsedTime, setElapsedTime] = useState(0);

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
      key: 'trawlSpeed',
      header: '拖速(节)',
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <Gauge className="w-4 h-4 text-[#FF6B35]" />
          <span>{row.trawlSpeed}</span>
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
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5">
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
    </div>
  );
}
