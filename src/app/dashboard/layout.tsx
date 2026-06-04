'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Users, Home, LayoutDashboard, ArrowRightLeft, Settings, Trophy, UserCircle, Briefcase, Mail, CalendarDays, Search, Newspaper, Banknote } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentDate = useGameStore(state => state.currentDate);
  const advanceDay = useGameStore(state => state.advanceDay);
  const inboxMessages = useGameStore(state => state.inboxMessages);
  const database = useGameStore(state => state.database);
  const setDatabase = useGameStore(state => state.setDatabase);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const managerName = useGameStore(state => state.managerName);
  const managerLicense = useGameStore(state => state.managerLicense);
  const managerConfederation = useGameStore(state => state.managerConfederation);
  const [loading, setLoading] = useState(!database);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    if (!managerName) {
      router.push('/new-game');
      return;
    }
    
    // Jika nganggur dan mencoba akses halaman selain job-center, profile, media, inbox, atau scouting, tendang ke job-center
    const allowedForUnemployed = ['/dashboard', '/dashboard/job-center', '/dashboard/media', '/dashboard/inbox', '/dashboard/scouting', '/dashboard/settings'];
    if ((!playerTeamId || playerTeamId === 'UNEMPLOYED') && !allowedForUnemployed.some(path => pathname === path || pathname.startsWith(path + '/'))) {
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
  }, [database, setDatabase, playerTeamId, router, managerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold animate-pulse">Loading Manager Dashboard...</h2>
      </div>
    );
  }

  const isUnemployed = !playerTeamId || playerTeamId === 'UNEMPLOYED';
  const unreadMessages = inboxMessages ? inboxMessages.filter(m => !m.read).length : 0;

  const menu = [
    { name: 'Home', icon: Home, path: '/dashboard', show: true },
    { name: 'Inbox', icon: Mail, path: '/dashboard/inbox', show: true },
    { name: 'Scouting', icon: Search, path: '/dashboard/scouting', show: true },
    { name: 'Job Center', icon: Briefcase, path: '/dashboard/job-center', show: isUnemployed },
    { name: 'Squad', icon: Users, path: '/dashboard/squad', show: !isUnemployed },
    { name: 'Tactics', icon: LayoutDashboard, path: '/dashboard/tactics', show: !isUnemployed },
    { name: 'Transfers', icon: ArrowRightLeft, path: '/dashboard/transfers', show: !isUnemployed },
    { name: 'Finances', icon: Banknote, path: '/dashboard/finances', show: !isUnemployed },
    { name: 'Competitions', icon: Trophy, path: '/dashboard/competitions', show: true },
    { name: 'Schedule', icon: Calendar, path: '/dashboard/schedule', show: !isUnemployed },
    { name: 'Media', icon: Newspaper, path: '/dashboard/media', show: true },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings', show: true },
  ];

  const myTeam = database?.teams.find(t => t.id === playerTeamId);

  const handleAdvanceDay = () => {
    if (unreadMessages > 0) {
      alert('Bos, ada pesan yang wajib dibaca di Inbox sebelum melanjutkan hari! Silakan cek kotak masuk Anda.');
      router.push('/dashboard/inbox');
      return;
    }
    setIsAdvancing(true);
    setTimeout(() => {
      advanceDay();
      setIsAdvancing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      {isAdvancing && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm">
           <CalendarDays size={80} className="text-blue-500 animate-bounce mb-6" />
           <h2 className="text-3xl font-black text-white tracking-widest animate-pulse">MEMPROSES HARI...</h2>
           <p className="text-blue-400 mt-2 font-mono">Simulasi dunia sedang berjalan</p>
        </div>
      )}

      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <h2 className="text-xl font-black text-emerald-400">Tactician</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 rounded">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex-col flex-none`}>
        <div className="p-6 hidden md:block">
          <h2 className="text-2xl font-black text-emerald-400">Tactician</h2>
        </div>
        
        <div className="px-6 pb-4 mb-4 border-b border-slate-800">
          <div className="text-white font-bold flex items-center gap-2">
            <UserCircle size={20} /> {managerName}
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-400">{myTeam ? myTeam.name : 'Unemployed'}</span>
            <span className="text-[10px] font-black bg-emerald-900 text-emerald-400 px-2 py-0.5 rounded">{managerConfederation} Lic {managerLicense}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menu.filter(item => item.show).map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {item.name}
                {item.name === 'Inbox' && unreadMessages > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadMessages}</span>
                )}
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
            onClick={handleAdvanceDay}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors active:scale-95"
          >
            <CalendarDays size={18} />
            <span>Next Day</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 h-[calc(100vh-73px)] md:h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
