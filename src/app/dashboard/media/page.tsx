'use client';
import { useGameStore } from '@/lib/store/gameStore';
import { Newspaper } from 'lucide-react';

export default function MediaPage() {
  const news = useGameStore(state => state.news || []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <Newspaper size={32} className="text-blue-500" />
        <h1 className="text-3xl font-black text-white">Media & Berita</h1>
      </header>
      
      {news.length === 0 ? (
         <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
            Belum ada berita hari ini. Silakan jalankan simulasi hari.
         </div>
      ) : (
         <div className="space-y-4">
            {news.slice().reverse().map((item: any) => (
               <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-900/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                        item.type === 'TRANSFER' ? 'bg-emerald-900/40 text-emerald-400' :
                        item.type === 'MANAGER' ? 'bg-orange-900/40 text-orange-400' :
                        item.type === 'NATURALISASI' ? 'bg-blue-900/40 text-blue-400' :
                        'bg-purple-900/40 text-purple-400'
                     }`}>
                        {item.type}
                     </span>
                     <span className="text-xs text-slate-500 font-mono">{item.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.content}</p>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
