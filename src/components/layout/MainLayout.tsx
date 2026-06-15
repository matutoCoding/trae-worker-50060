import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E8F0] to-[#F5F5FA]">
      <Sidebar />
      <main className="ml-[280px] min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
