import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Anchor,
  MapPin,
  Waves,
  Fish,
  Fuel,
  Users,
  Shield,
  Calculator,
  Settings,
  Ship,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '总览仪表盘', icon: LayoutDashboard },
  { path: '/voyage', label: '出海计划', icon: Anchor },
  { path: '/fishing-ground', label: '渔场记录', icon: MapPin },
  { path: '/fishing-operation', label: '捕捞作业', icon: Waves },
  { path: '/catch', label: '渔获登记', icon: Fish },
  { path: '/fuel', label: '油料补给', icon: Fuel },
  { path: '/crew', label: '船员管理', icon: Users },
  { path: '/safety', label: '安全应急', icon: Shield },
  { path: '/finance', label: '收支结算', icon: Calculator },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-gradient-to-b from-[#0A2463] to-[#1A1A2E] text-white flex flex-col shadow-2xl z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3E92CC] to-[#0A2463] rounded-xl flex items-center justify-center shadow-lg">
            <Ship className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">渔航管理</h1>
            <p className="text-xs text-white/60">深海渔船作业系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-[#3E92CC] text-white shadow-lg shadow-[#3E92CC]/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className={cn(
              'w-5 h-5 transition-transform duration-200',
              'group-hover:scale-110'
            )} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#44AF69] to-[#0A2463] flex items-center justify-center font-bold">
              张
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">张海洋</p>
              <p className="text-xs text-white/60 truncate">船长 · 船长权限</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
