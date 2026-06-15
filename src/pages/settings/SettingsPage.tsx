import { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Palette, Monitor, HelpCircle, Info, ChevronRight, Save, RefreshCw, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/business/PageHeader';
import StatCard from '@/components/business/StatCard';

const THEME_COLORS = [
  { name: '深海蓝', primary: '#0A2463', secondary: '#3E92CC' },
  { name: '海洋绿', primary: '#2D7A4A', secondary: '#44AF69' },
  { name: '日落橙', primary: '#C44D27', secondary: '#FF6B35' },
  { name: '皇家紫', primary: '#5A189A', secondary: '#9D4EDD' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    safetyAlert: true,
    weatherAlert: true,
    catchAlert: true,
  });
  const [language, setLanguage] = useState('zh-CN');
  const [theme, setTheme] = useState(THEME_COLORS[0]);

  const menuItems = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'appearance', label: '外观设置', icon: Palette },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'data', label: '数据管理', icon: Database },
    { id: 'about', label: '关于系统', icon: Info },
    { id: 'help', label: '帮助中心', icon: HelpCircle },
  ];

  return (
    <div>
      <PageHeader
        title="系统设置"
        subtitle="个性化设置、数据管理与系统信息"
        icon={Settings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-4 border border-white/50 sticky top-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white shadow-lg'
                        : 'hover:bg-[#F5F5FA] text-[#1A1A2E]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'profile' && (
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#3E92CC]" />
                个人资料
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A6A] mb-2">姓名</label>
                  <input
                    type="text"
                    defaultValue="张海洋"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A6A] mb-2">职务</label>
                  <input
                    type="text"
                    defaultValue="船长"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A6A] mb-2">联系电话</label>
                  <input
                    type="tel"
                    defaultValue="13800138001"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A6A] mb-2">电子邮箱</label>
                  <input
                    type="email"
                    defaultValue="captain@fishing.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#4A4A6A] mb-2">所属船舶</label>
                  <input
                    type="text"
                    defaultValue="浙渔12345号"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E8F0] focus:border-[#3E92CC] focus:ring-2 focus:ring-[#3E92CC]/20 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button className="px-6 py-3 rounded-xl border border-[#E8E8F0] text-[#4A4A6A] font-medium hover:bg-[#F5F5FA] transition-colors">
                  取消
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3E92CC] to-[#0A2463] text-white rounded-xl font-medium shadow-lg shadow-[#3E92CC]/30 hover:shadow-xl hover:shadow-[#3E92CC]/40 transition-all">
                  <Save className="w-5 h-5" />
                  保存更改
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#3E92CC]" />
                通知设置
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-[#1A1A2E] mb-4">通知方式</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: '邮件通知', desc: '接收重要事项的邮件提醒' },
                      { key: 'push', label: '推送通知', desc: '接收浏览器或APP推送' },
                      { key: 'sms', label: '短信通知', desc: '紧急情况发送短信提醒' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-[#F5F5FA] rounded-xl">
                        <div>
                          <div className="font-medium text-[#1A1A2E]">{item.label}</div>
                          <div className="text-sm text-[#4A4A6A]">{item.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#E8E8F0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3E92CC]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3E92CC]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-[#1A1A2E] mb-4">业务提醒</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'safetyAlert', label: '安全警报', desc: '安全隐患和紧急情况通知' },
                      { key: 'weatherAlert', label: '天气预警', desc: '恶劣天气和海况预警' },
                      { key: 'catchAlert', label: '渔获提醒', desc: '渔获登记和舱位提醒' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-[#F5F5FA] rounded-xl">
                        <div>
                          <div className="font-medium text-[#1A1A2E]">{item.label}</div>
                          <div className="text-sm text-[#4A4A6A]">{item.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#E8E8F0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3E92CC]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3E92CC]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#3E92CC]" />
                外观设置
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-[#1A1A2E] mb-4">主题颜色</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setTheme(color)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme.name === color.name
                            ? 'border-[#3E92CC] shadow-lg'
                            : 'border-transparent hover:border-[#E8E8F0]'
                        }`}
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: color.primary }}></div>
                          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: color.secondary }}></div>
                        </div>
                        <div className="text-sm font-medium text-[#1A1A2E]">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-[#1A1A2E] mb-4">语言设置</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { code: 'zh-CN', name: '简体中文' },
                      { code: 'zh-TW', name: '繁體中文' },
                      { code: 'en-US', name: 'English' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          language === lang.code
                            ? 'border-[#3E92CC] bg-[#3E92CC]/5 shadow-lg'
                            : 'border-transparent bg-[#F5F5FA] hover:border-[#E8E8F0]'
                        }`}
                      >
                        <div className="text-sm font-medium text-[#1A1A2E]">{lang.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#3E92CC]" />
                安全设置
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#F5F5FA] rounded-xl">
                  <div>
                    <div className="font-medium text-[#1A1A2E]">修改密码</div>
                    <div className="text-sm text-[#4A4A6A]">定期更改密码以保护账户安全</div>
                  </div>
                  <button className="text-[#3E92CC] hover:text-[#0A2463] font-medium flex items-center gap-1">
                    修改 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#F5F5FA] rounded-xl">
                  <div>
                    <div className="font-medium text-[#1A1A2E]">两步验证</div>
                    <div className="text-sm text-[#4A4A6A]">启用后登录需要输入验证码</div>
                  </div>
                  <StatusBadge status="orange">未启用</StatusBadge>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#F5F5FA] rounded-xl">
                  <div>
                    <div className="font-medium text-[#1A1A2E]">登录设备管理</div>
                    <div className="text-sm text-[#4A4A6A]">查看和管理已登录的设备</div>
                  </div>
                  <button className="text-[#3E92CC] hover:text-[#0A2463] font-medium flex items-center gap-1">
                    管理 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#3E92CC]" />
                数据管理
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard
                  title="本地数据量"
                  value="128"
                  unit="MB"
                  icon={Database}
                  color="blue"
                />
                <StatCard
                  title="数据备份"
                  value="3"
                  unit="份"
                  icon={RefreshCw}
                  color="green"
                />
                <StatCard
                  title="同步状态"
                  value="已同步"
                  icon={CheckCircle}
                  color="green"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#F5F5FA] rounded-xl">
                  <div>
                    <div className="font-medium text-[#1A1A2E]">导出数据</div>
                    <div className="text-sm text-[#4A4A6A]">将所有数据导出为CSV格式</div>
                  </div>
                  <button className="px-4 py-2 bg-[#3E92CC] text-white rounded-lg font-medium hover:bg-[#0A2463] transition-colors">
                    导出
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#F5F5FA] rounded-xl">
                  <div>
                    <div className="font-medium text-[#1A1A2E]">数据备份</div>
                    <div className="text-sm text-[#4A4A6A]">创建数据备份文件</div>
                  </div>
                  <button className="px-4 py-2 bg-[#44AF69] text-white rounded-lg font-medium hover:bg-[#2D7A4A] transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    备份
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#F5F5FA] rounded-xl">
                  <div>
                    <div className="font-medium text-[#1A1A2E]">清空数据</div>
                    <div className="text-sm text-[#4A4A6A]">清除所有本地数据（不可恢复）</div>
                  </div>
                  <button className="px-4 py-2 bg-[#E63946] text-white rounded-lg font-medium hover:bg-[#C62828] transition-colors">
                    清空
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#3E92CC]" />
                关于系统
              </h3>
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#3E92CC] to-[#0A2463] flex items-center justify-center">
                  <Monitor className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-[#1A1A2E] mb-2">深海渔船捕捞作业系统</h4>
                <p className="text-[#4A4A6A] mb-4">Deep Sea Fishing Operation System</p>
                <div className="inline-block px-4 py-2 bg-[#3E92CC]/10 text-[#3E92CC] rounded-full font-medium">
                  版本 v1.0.0
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between p-3 bg-[#F5F5FA] rounded-lg">
                  <span className="text-[#4A4A6A]">开发团队</span>
                  <span className="font-medium text-[#1A1A2E]">海洋科技开发团队</span>
                </div>
                <div className="flex justify-between p-3 bg-[#F5F5FA] rounded-lg">
                  <span className="text-[#4A4A6A]">发布日期</span>
                  <span className="font-medium text-[#1A1A2E]">2026年6月</span>
                </div>
                <div className="flex justify-between p-3 bg-[#F5F5FA] rounded-lg">
                  <span className="text-[#4A4A6A]">技术支持</span>
                  <span className="font-medium text-[#1A1A2E]">support@fishing.com</span>
                </div>
                <div className="flex justify-between p-3 bg-[#F5F5FA] rounded-lg">
                  <span className="text-[#4A4A6A]">服务热线</span>
                  <span className="font-medium text-[#1A1A2E]">400-123-4567</span>
                </div>
              </div>
              <div className="mt-6 text-center text-sm text-[#4A4A6A]">
                © 2026 海洋科技有限公司 版权所有
              </div>
            </div>
          )}

          {activeSection === 'help' && (
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 p-6 border border-white/50">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#3E92CC]" />
                帮助中心
              </h3>
              <div className="space-y-4">
                {[
                  { title: '如何创建出海航次计划？', desc: '进入出海计划模块，点击"新建航次"按钮，填写航次信息后提交审批。' },
                  { title: '如何登记渔获信息？', desc: '进入渔获登记模块，选择对应的网次作业，填写渔获种类、重量和存储位置。' },
                  { title: '如何查看当前海况天气？', desc: '进入安全应急模块，可以查看实时海况天气数据和历史记录。' },
                  { title: '如何进行油料补给登记？', desc: '进入油料补给模块，点击"新增记录"，选择补给类型并填写相关信息。' },
                  { title: '如何查看航次收支情况？', desc: '进入收支结算模块，可以查看航次的收入、支出和利润分析。' },
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-[#F5F5FA] rounded-xl hover:bg-[#E8E8F0] transition-colors">
                    <div className="font-medium text-[#1A1A2E] mb-2">{item.title}</div>
                    <div className="text-sm text-[#4A4A6A]">{item.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-[#3E92CC]/10 to-[#0A2463]/10 rounded-xl">
                <div className="font-medium text-[#1A1A2E] mb-2">需要更多帮助？</div>
                <div className="text-sm text-[#4A4A6A] mb-4">
                  如果您在使用过程中遇到问题，可以联系我们的技术支持团队。
                </div>
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-[#3E92CC] text-white rounded-lg font-medium hover:bg-[#0A2463] transition-colors">
                    在线客服
                  </button>
                  <button className="px-4 py-2 border border-[#E8E8F0] text-[#1A1A2E] rounded-lg font-medium hover:bg-[#F5F5FA] transition-colors">
                    查看文档
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, children }: { status: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    green: 'bg-[#44AF69]/20 text-[#44AF69]',
    orange: 'bg-[#FF6B35]/20 text-[#FF6B35]',
    red: 'bg-[#E63946]/20 text-[#E63946]',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status] || colors.green}`}>
      {children}
    </span>
  );
}
