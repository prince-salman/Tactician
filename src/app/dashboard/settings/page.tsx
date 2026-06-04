'use client';
import { useGameStore } from '@/lib/store/gameStore';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const language = useGameStore(state => state.language);
  const setLanguage = useGameStore(state => state.setLanguage);
  const router = useRouter();

  const handleReset = () => {
    if (confirm('APAKAH ANDA YAKIN? Semua progres karir manajerial Anda akan HANCUR secara permanen!')) {
      localStorage.removeItem('globalfm-save');
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Konfigurasi Game Tactician</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-200 mb-4">Bahasa</h2>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded p-3 focus:outline-none focus:border-emerald-500"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English (Coming Soon)</option>
          </select>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <h2 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h2>
          <p className="text-slate-400 text-sm mb-4">Menghapus save data akan mengembalikan Anda ke halaman utama dan Anda harus membuat karakter manajer dari nol lagi.</p>
          <button 
            onClick={handleReset}
            className="px-6 py-3 bg-red-900/50 hover:bg-red-600 border border-red-800 hover:border-red-500 text-white rounded-lg font-bold transition-colors"
          >
            Hapus Save Data
          </button>
        </div>
      </div>
    </div>
  );
}
