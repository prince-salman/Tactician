'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Users, Home, LayoutDashboard, ArrowRightLeft, Settings } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentDate = useGameStore(state => state.currentDate);
  const advanceDay = useGameStore(state => state.advanceDay);
  const database = useGameStore(state => state.database);
  const setDatabase = useGameStore(state => state.setDatabase);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const managerName = useGameStore(state => state.managerName);
  const managerLicense = useGameStore(state => state.managerLicense);
  const managerConfederation = useGameStore(state => state.managerConfederation);
  const [loading, setLoading] = useState(!database);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Jika belum buat profil, tendang ke new game
    if (!managerName) {
      router.push('/new-game');
      return;
    }
    
    // Jika nganggur dan mencoba akses halaman selain job-center atau profile, arahkan ke job center
    if ((!playerTeamId || playerTeamId === 'UNEMPLOYED') && !pathname.includes('/job-center') && pathname !== '/dashboard') {
      router.push('/dashboard/job-center');
      return;
    }

    if (!database) {
      fetch('/database.json')
        .then(res => res.json())
        .then(db => {
          setDatabase(db);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [database, setDatabase, playerTeamId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold animate-pulse">Loading Manager Dashboard...</h2>
      </div>
    );
  }

  const isUnemployed = !playerTeamId || playerTeamId === 'UNEMPLOYED';

  const menu = [
    { name: 'Home', icon: Home, path: '/dashboard', show: true },
    { name: 'Job Center', icon: Users, path: '/dashboard/job-center', show: isUnemployed },
    { name: 'Squad', icon: Users, path: '/dashboard/squad', show: !isUnemployed },
    { name: 'Tactics', icon: LayoutDashboard, path: '/dashboard/tactics', show: !isUnemployed },
    { name: 'Transfers', icon: ArrowRightLeft, path: '/dashboard/transfers', show: !isUnemployed },
    { name: 'Finances', icon: Settings, path: '/dashboard/finances', show: !isUnemployed },
    { name: 'Schedule', icon: Calendar, path: '/dashboard/schedule', show: !isUnemployed },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings', show: true },
  ];

  const myTeam = database?.teams.find(t => t.id === playerTeamId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <h2 className="text-xl font-black text-emerald-400">Tactician</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 rounded">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex-col flex-none`}>
        <div className="p-6 hidden md:block">
          <h2 className="text-2xl font-black text-emerald-400">Tactician</h2>
          <p className="text-slate-500 text-sm">2026 Season</p>
        </div>
        
        <div className="px-6 pb-4 mb-4 border-b border-slate-800">
          <div className="text-white font-bold">{managerName}</div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-400">{myTeam ? myTeam.name : 'Unemployed'}</span>
            <span className="text-[10px] font-black bg-emerald-900 text-emerald-400 px-2 py-0.5 rounded">{managerConfederation} Lic {managerLicense}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menu.filter(item => item.show).map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="text-sm font-medium text-slate-400 text-center">
            {new Date(currentDate).toLocaleDateString('en-GB', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </div>
          <button 
            onClick={advanceDay}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-colors"
          >
            Continue
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-73px)] md:h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
