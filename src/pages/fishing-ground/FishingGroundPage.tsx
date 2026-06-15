import { MapPin, Plus, Thermometer, Waves, Cloud, Navigation, Layers } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import DataTable from '@/components/business/DataTable';
import StatCard from '@/components/business/StatCard';
import { useFishingStore } from '@/store/useFishingStore';
import { useVoyageStore } from '@/store/useVoyageStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function FishingGroundPage() {
  const { grounds, currentWeather } = useFishingStore();
  const { currentVoyage } = useVoyageStore();

  const columns = [
    {
      key: 'name',
      header: '渔场名称',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#3E92CC] to-[#0A2463] rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-[#1A1A2E]">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'coordinates',
      header: '坐标',
      accessor: (row: any) => (
        <span className="font-mono text-sm">
          {row.longitude.toFixed(4)}°E, {row.latitude.toFixed(4)}°N
        </span>
      ),
    },
    {
      key: 'depth',
      header: '水深(m)',
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <Layers className="w-4 h-4 text-[#3E92CC]" />
          <span>{row.depth}</span>
        </div>
      ),
    },
    {
      key: 'waterTemp',
      header: '水温(°C)',
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <Thermometer className="w-4 h-4 text-[#FF6B35]" />
          <span>{row.waterTemp}</span>
        </div>
      ),
    },
    {
      key: 'weather',
      header: '天气',
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <Cloud className="w-4 h-4 text-[#F9C80E]" />
          <span>{row.weather}</span>
        </div>
      ),
    },
    {
      key: 'seaState',
      header: '海况',
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <Waves className="w-4 h-4 text-[#0A2463]" />
          <span>{row.seaState}级</span>
        </div>
      ),
    },
    {
      key: 'recordTime',
      header: '记录时间',
      accessor: (row: any) =>
        format(new Date(row.recordTime), 'MM-dd HH:mm', { locale: zhCN }),
    },
  ];

  return (
    <div>
      <PageHeader
        title="渔场记录"
        subtitle="渔场坐标管理、渔区信息与海况天气记录"
        icon={MapPin}
        actions={
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all duration-300 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            新增渔场
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="当前气温"
          value={currentWeather.temperature}
          unit="°C"
          icon={Thermometer}
          color="orange"
        />
        <StatCard
          title="风速"
          value={currentWeather.windSpeed}
          unit="m/s"
          icon={Navigation}
          color="blue"
        />
        <StatCard
          title="浪高"
          value={currentWeather.waveHeight}
          unit="m"
          icon={Waves}
          color="blue"
        />
        <StatCard
          title="能见度"
          value={currentWeather.visibility}
          unit="km"
          icon={Cloud}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3E92CC] to-[#0A2463] rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            实时海况监测
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#0A2463]/5 to-[#3E92CC]/5 rounded-xl p-4 text-center">
              <p className="text-sm text-[#4A4A6A] mb-1">风向</p>
              <p className="text-2xl font-bold text-[#0A2463]">{currentWeather.windDirection}</p>
            </div>
            <div className="bg-gradient-to-br from-[#44AF69]/5 to-[#2D7A4A]/5 rounded-xl p-4 text-center">
              <p className="text-sm text-[#4A4A6A] mb-1">湿度</p>
              <p className="text-2xl font-bold text-[#44AF69]">{currentWeather.humidity}%</p>
            </div>
            <div className="bg-gradient-to-br from-[#FF6B35]/5 to-[#C44D27]/5 rounded-xl p-4 text-center">
              <p className="text-sm text-[#4A4A6A] mb-1">海况等级</p>
              <p className="text-2xl font-bold text-[#FF6B35]">{currentWeather.seaState}级</p>
            </div>
            <div className="bg-gradient-to-br from-[#F9C80E]/5 to-[#D4A80B]/5 rounded-xl p-4 text-center">
              <p className="text-sm text-[#4A4A6A] mb-1">天气状况</p>
              <p className="text-2xl font-bold text-[#F9C80E]">{currentWeather.weatherCondition}</p>
            </div>
          </div>
          <div className="bg-[#F5F5FA] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-[#1A1A2E]">当前位置</span>
              <span className="text-sm text-[#4A4A6A]">
                {format(new Date(currentWeather.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#4A4A6A] mb-1">经度</p>
                <p className="font-mono font-bold text-[#0A2463]">123.5000°E</p>
              </div>
              <div>
                <p className="text-xs text-[#4A4A6A] mb-1">纬度</p>
                <p className="font-mono font-bold text-[#0A2463]">29.8000°N</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#3E92CC]" />
            渔区地图预览
          </h3>
          <div className="relative h-[300px] bg-gradient-to-br from-[#E8E8F0] to-[#F5F5FA] rounded-xl overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0A2463" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            {grounds.map((ground, index) => (
              <div
                key={ground.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{
                  left: `${30 + index * 25}%`,
                  top: `${40 + (index % 2) * 30}%`,
                }}
              >
                <div className={`w-4 h-4 rounded-full ${
                  index === 2 ? 'bg-[#44AF69] ring-4 ring-[#44AF69]/30 animate-pulse' : 'bg-[#FF6B35]'
                }`} />
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A2E] text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {ground.name}
                </div>
              </div>
            ))}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#44AF69]"></div>
                <span>当前作业区</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>
                <span>历史作业区</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">渔场记录列表</h3>
        <DataTable
          columns={columns}
          data={currentVoyage ? grounds.filter(g => g.voyageId === currentVoyage.id) : grounds}
          emptyMessage="暂无渔场记录"
        />
      </div>
    </div>
  );
}
