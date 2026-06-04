'use client';
import { useGameStore } from '@/lib/store/gameStore';
import { Mail, MailOpen, AlertCircle, Info, DollarSign, Trophy } from 'lucide-react';

export default function InboxPage() {
  const inboxMessages = useGameStore(state => state.inboxMessages || []);
  const markInboxRead = useGameStore(state => state.markInboxRead);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="text-red-500" />;
      case 'transfer': return <DollarSign className="text-blue-500" />;
      case 'board': return <Trophy className="text-amber-500" />;
      case 'success': return <Trophy className="text-emerald-500" />;
      default: return <Info className="text-blue-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <Mail className="text-emerald-400" size={32} /> Kotak Masuk
          </h1>
          <p className="text-slate-400 mt-1">Pesan dari Asosiasi, Direksi Klub, dan Staff Pelatih Anda.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-bold text-slate-300">
           {inboxMessages.filter(m => !m.read).length} Pesan Belum Dibaca
        </div>
      </div>

      <div className="space-y-4 mt-8">
        {inboxMessages.length === 0 ? (
          <div className="text-center p-12 bg-slate-900/50 border border-slate-800 rounded-xl">
             <MailOpen size={48} className="mx-auto text-slate-600 mb-4" />
             <p className="text-slate-500">Tidak ada pesan masuk.</p>
          </div>
        ) : (
          [...inboxMessages].reverse().map(msg => (
            <div 
              key={msg.id} 
              className={`p-6 rounded-xl border transition-all ${
                msg.read 
                  ? 'bg-slate-900 border-slate-800 opacity-70' 
                  : 'bg-slate-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-[1.01]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                     {getIconForType(msg.type)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${msg.read ? 'text-slate-300' : 'text-white'}`}>{msg.subject}</h3>
                    <div className="text-xs text-slate-500 font-bold tracking-wider uppercase mt-1 mb-3">
                       Dari: {msg.from} &bull; {msg.date}
                    </div>
                    <p className={`text-sm ${msg.read ? 'text-slate-400' : 'text-slate-200'} leading-relaxed`}>{msg.body}</p>
                  </div>
                </div>
                {!msg.read && (
                  <button 
                    onClick={() => markInboxRead(msg.id)}
                    className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow-lg transition-colors"
                  >
                    Tandai Dibaca
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
