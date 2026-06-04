'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { Banknote, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function FinancesPage() {
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const database = useGameStore(state => state.database);
  const playerClubBalance = useGameStore(state => state.playerClubBalance);
  const bankLoan = useGameStore(state => state.bankLoan);
  const takeLoan = useGameStore(state => state.takeLoan);
  const repayLoan = useGameStore(state => state.repayLoan);
  
  const [loanAmount, setLoanAmount] = useState(10000000);

  if (!playerTeamId || playerTeamId === 'UNEMPLOYED' || !database) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Banknote size={64} className="mb-4 opacity-50" />
        <h2 className="text-2xl font-black text-slate-300">Akses Ditolak</h2>
        <p>Anda harus menangani sebuah klub untuk melihat data finansial.</p>
      </div>
    );
  }

  const team = database.teams.find(t => t.id === playerTeamId);
  const formatMoney = (num: number) => '€' + (num / 1000000).toFixed(2) + 'M';

  const handleTakeLoan = () => {
     if (bankLoan > 0) return alert('Lunasi dulu hutang sebelumnya!');
     if (loanAmount > 100000000) return alert('Maksimal pinjaman adalah €100 Juta!');
     if (confirm(`Yakin ingin meminjam ${formatMoney(loanAmount)}? Bunga 0.1% per hari akan memotong kas operasional klub Anda!`)) {
        takeLoan(loanAmount);
     }
  };

  const handleRepayLoan = () => {
     if (playerClubBalance < bankLoan) return alert('Uang kas klub Anda tidak cukup untuk melunasi hutang!');
     if (confirm(`Lunasi hutang sebesar ${formatMoney(bankLoan)} sekarang?`)) {
        repayLoan(bankLoan);
     }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-emerald-400 tracking-tight flex items-center gap-2">
             <Banknote /> Finansial Klub
          </h1>
          <p className="text-slate-400 mt-1">Kelola arus kas, sponsor, dan pinjaman bank</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Saldo Kas */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Kas Operasional & Transfer</h3>
            <div className={`text-5xl font-black ${playerClubBalance < 0 ? 'text-red-500' : 'text-white'}`}>
               {playerClubBalance < 0 ? '-' : ''}{formatMoney(Math.abs(playerClubBalance))}
            </div>
            {playerClubBalance < 0 && (
               <div className="mt-4 p-3 bg-red-950/50 border border-red-900 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-200">Klub mengalami defisit parah. Jika saldo mencapai -€50 Juta, Anda akan dipecat oleh dewan klub karena gagal mengelola finansial!</p>
               </div>
            )}
         </div>

         {/* Hutang Bank */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Hutang Bank Aktif</h3>
            <div className={`text-4xl font-black ${bankLoan > 0 ? 'text-amber-500' : 'text-slate-500'}`}>
               {bankLoan > 0 ? formatMoney(bankLoan) : 'Tidak Ada'}
            </div>
            {bankLoan > 0 && (
               <p className="text-sm text-amber-200/70 mt-2">
                  Bunga harian: <span className="font-bold text-amber-400">-{formatMoney(bankLoan * 0.001)}</span>
               </p>
            )}
         </div>
      </div>

      {/* Aksi Keuangan */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
         <h3 className="text-lg font-black text-white mb-6">Pinjaman Bank Global</h3>
         
         <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
               <p className="text-sm text-slate-400">
                  Ajukan pinjaman bank jika Anda butuh dana instan untuk bursa transfer. Hati-hati, bunga harian sebesar 0.1% akan memakan kas operasional Anda perlahan.
               </p>
               <div className="flex items-end gap-4">
                  <div className="flex-1">
                     <label className="text-xs font-bold text-slate-500 mb-2 block">Jumlah Pinjaman (€)</label>
                     <input 
                        type="number"
                        value={loanAmount}
                        onChange={e => setLoanAmount(Number(e.target.value))}
                        disabled={bankLoan > 0}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                     />
                  </div>
                  <button 
                     onClick={handleTakeLoan}
                     disabled={bankLoan > 0 || loanAmount <= 0}
                     className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                     <ArrowDownCircle size={18} /> Ajukan
                  </button>
               </div>
            </div>

            <div className="w-px bg-slate-800 hidden md:block"></div>

            <div className="flex-1 flex flex-col justify-center items-start">
               <p className="text-sm text-slate-400 mb-4">
                  Jika Anda memiliki kas yang cukup, lunasi hutang Anda sekarang untuk menghentikan potongan bunga harian.
               </p>
               <button 
                  onClick={handleRepayLoan}
                  disabled={bankLoan <= 0}
                  className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
               >
                  <ArrowUpCircle size={18} /> Lunasi Hutang
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
