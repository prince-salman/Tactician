'use client';
import { useGameStore } from '@/lib/store/gameStore';
import { useState, useMemo } from 'react';
import { Landmark, TrendingUp, AlertCircle, Building2, Ticket, Users } from 'lucide-react';

export default function FinancesPage() {
  const database = useGameStore(state => state.database);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const clubBalance = useGameStore(state => state.playerClubBalance);
  const activeSponsor = useGameStore(state => state.activeSponsor);
  const acceptSponsor = useGameStore(state => state.acceptSponsor);
  const upgradeStadium = useGameStore(state => state.upgradeStadium);
  const upgradeFacility = useGameStore(state => state.upgradeFacility);

  const myTeam = database?.teams.find(t => t.id === playerTeamId);
  const mySquad = database?.players.filter(p => p.teamId === playerTeamId) || [];

  const weeklyWageBill = mySquad.reduce((sum, p) => sum + p.wage, 0);
  const matchdayRevenue = (myTeam?.stadiumCapacity || 0) * (myTeam?.ticketPrice || 45) * 0.8; // Estimated 80% attendance

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `€${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`;
    return `€${n}`;
  };

  const handleSponsorSelect = (type: number) => {
    // 1: Safe, 2: Aggressive, 3: Loyalty
    if (type === 1) acceptSponsor('Fly Emirates', 500000, 100000, 52);
    else if (type === 2) acceptSponsor('Bet365', 200000, 1500000, 52);
    else if (type === 3) acceptSponsor('Local Airline', 300000, 500000, 52);
  };

  const handleUpgradeStadium = () => {
    const cost = 25000000; // €25M for +5000 seats
    if (clubBalance >= cost) {
       upgradeStadium(cost, 5000);
    } else {
       alert("Saldo tidak cukup!");
    }
  };

  const handleUpgradeFacility = (facility: 'academyLevel' | 'coachingLevel' | 'medicalLevel', currentLevel: number) => {
     if (currentLevel >= 5) return;
     const cost = currentLevel * 10000000; // 10M, 20M, 30M, 40M
     if (clubBalance >= cost) {
        upgradeFacility(facility, cost);
     } else {
        alert("Saldo tidak cukup untuk upgrade fasilitas ini.");
     }
  };

  if (!myTeam) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
        <Landmark className="text-emerald-400" size={32} />
        <div>
          <h1 className="text-3xl font-black text-white">Club Finances</h1>
          <p className="text-slate-400">Kelola neraca keuangan dan sponsor {myTeam.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-white">Current Balance</h2>
          <div className={`text-6xl font-black ${clubBalance < 0 ? 'text-red-500' : 'text-emerald-400'} mb-6`}>
            {clubBalance < 0 ? '-' : ''}{formatMoney(Math.abs(clubBalance))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-red-900/30">
              <div className="text-sm text-slate-500 flex items-center gap-2"><Users size={16}/> Tagihan Gaji (Mingguan)</div>
              <div className="text-xl font-bold text-red-400 mt-1">-{formatMoney(weeklyWageBill)}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-emerald-900/30">
              <div className="text-sm text-slate-500 flex items-center gap-2"><Ticket size={16}/> Est. Matchday Rev (Home)</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">+{formatMoney(matchdayRevenue)}</div>
            </div>
          </div>
          
          {clubBalance < -10000000 && (
             <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3 text-red-400">
                <AlertCircle className="shrink-0" />
                <p className="text-sm"><strong>Peringatan!</strong> Keuangan klub minus parah. Segera jual pemain atau board akan memecat Anda dalam waktu dekat.</p>
             </div>
          )}
        </div>

        {/* Stadium & Facilities */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-8">
           {/* Stadium */}
           <div>
             <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><Building2 className="text-blue-400"/> Stadium</h2>
             <div className="space-y-3">
               <div>
                 <div className="text-sm text-slate-500">Kapasitas Saat Ini</div>
                 <div className="font-bold text-emerald-400 text-lg">{myTeam.stadiumCapacity.toLocaleString()} Kursi</div>
               </div>
               <button 
                 onClick={handleUpgradeStadium}
                 className={`w-full py-2 rounded-lg font-bold transition-colors ${clubBalance >= 25000000 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                 disabled={clubBalance < 25000000}
               >
                 Upgrade Tribun (€25M)
               </button>
             </div>
           </div>

           {/* Facilities */}
           <div>
             <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2 border-t border-slate-800 pt-6">⚙️ Club Facilities</h2>
             <div className="space-y-4">
               
               {/* Academy */}
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-slate-300 font-bold">Youth Academy</span>
                     <span className="text-emerald-400 font-black">Lv.{myTeam.academyLevel || 1}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">Tingkatkan kualitas pemain muda saat Youth Intake (Maret).</div>
                  <button onClick={() => handleUpgradeFacility('academyLevel', myTeam.academyLevel || 1)} disabled={(myTeam.academyLevel || 1) >= 5} className="w-full text-xs font-bold py-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 rounded disabled:opacity-50">
                     {(myTeam.academyLevel || 1) >= 5 ? 'Max Level' : `Upgrade (Mulai €${(myTeam.academyLevel || 1) * 10}M)`}
                  </button>
               </div>

               {/* Coaching */}
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-slate-300 font-bold">Coaching Staff</span>
                     <span className="text-amber-400 font-black">Lv.{myTeam.coachingLevel || 1}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">Pemain U-23 berkembang lebih cepat tiap akhir musim.</div>
                  <button onClick={() => handleUpgradeFacility('coachingLevel', myTeam.coachingLevel || 1)} disabled={(myTeam.coachingLevel || 1) >= 5} className="w-full text-xs font-bold py-2 bg-amber-900/50 hover:bg-amber-800 text-amber-200 rounded disabled:opacity-50">
                     {(myTeam.coachingLevel || 1) >= 5 ? 'Max Level' : `Upgrade (Mulai €${(myTeam.coachingLevel || 1) * 10}M)`}
                  </button>
               </div>

               {/* Medical */}
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-slate-300 font-bold">Medical Center</span>
                     <span className="text-red-400 font-black">Lv.{myTeam.medicalLevel || 1}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">Memotong durasi cedera parah (ACL) hingga 40%.</div>
                  <button onClick={() => handleUpgradeFacility('medicalLevel', myTeam.medicalLevel || 1)} disabled={(myTeam.medicalLevel || 1) >= 5} className="w-full text-xs font-bold py-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded disabled:opacity-50">
                     {(myTeam.medicalLevel || 1) >= 5 ? 'Max Level' : `Upgrade (Mulai €${(myTeam.medicalLevel || 1) * 10}M)`}
                  </button>
               </div>

             </div>
           </div>
        </div>
      </div>

      {/* Sponsors */}
      <h2 className="text-2xl font-black text-white pt-6 border-t border-slate-800">Commercial Sponsors</h2>
      
      {activeSponsor ? (
        <div className="bg-slate-900 border border-emerald-800 rounded-xl p-8 shadow-xl flex justify-between items-center bg-gradient-to-r from-emerald-900/20 to-slate-900">
           <div>
              <div className="text-sm text-emerald-500 font-bold uppercase tracking-wider mb-1">Active Main Sponsor</div>
              <div className="text-3xl font-black text-white mb-2">{activeSponsor.name}</div>
              <div className="flex gap-6 text-sm">
                 <div><span className="text-slate-400">Base/Week:</span> <span className="font-bold text-emerald-400">{formatMoney(activeSponsor.basePerWeek)}</span></div>
                 <div><span className="text-slate-400">Win Bonus:</span> <span className="font-bold text-emerald-400">{formatMoney(activeSponsor.bonusPerWin)}</span></div>
                 <div><span className="text-slate-400">Sisa Kontrak:</span> <span className="font-bold text-white">{activeSponsor.remainingWeeks} Minggu</span></div>
              </div>
           </div>
           <TrendingUp size={48} className="text-emerald-500/20" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-xl p-6 transition-colors cursor-pointer group" onClick={() => handleSponsorSelect(1)}>
              <div className="text-xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">Safe Sponsor</div>
              <p className="text-sm text-slate-400 mb-6">Cocok untuk tim papan bawah yang butuh kestabilan.</p>
              <div className="space-y-2 mb-6">
                 <div className="flex justify-between text-sm"><span className="text-slate-500">Base</span><span className="font-bold text-emerald-400">{formatMoney(500000)}/week</span></div>
                 <div className="flex justify-between text-sm"><span className="text-slate-500">Win Bonus</span><span className="font-bold text-emerald-400">{formatMoney(100000)}/win</span></div>
              </div>
              <button className="w-full py-2 bg-slate-800 group-hover:bg-emerald-600 rounded text-sm font-bold text-white transition-colors">Pilih Kontrak (1 Thn)</button>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl p-6 transition-colors cursor-pointer group" onClick={() => handleSponsorSelect(2)}>
              <div className="text-xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">Aggressive Sponsor</div>
              <p className="text-sm text-slate-400 mb-6">Hanya akan menguntungkan jika Anda menang terus menerus.</p>
              <div className="space-y-2 mb-6">
                 <div className="flex justify-between text-sm"><span className="text-slate-500">Base</span><span className="font-bold text-amber-400">{formatMoney(200000)}/week</span></div>
                 <div className="flex justify-between text-sm"><span className="text-slate-500">Win Bonus</span><span className="font-bold text-amber-400">{formatMoney(1500000)}/win</span></div>
              </div>
              <button className="w-full py-2 bg-slate-800 group-hover:bg-amber-600 rounded text-sm font-bold text-white transition-colors">Pilih Kontrak (1 Thn)</button>
           </div>

           <div className="bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl p-6 transition-colors cursor-pointer group" onClick={() => handleSponsorSelect(3)}>
              <div className="text-xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">Balanced Sponsor</div>
              <p className="text-sm text-slate-400 mb-6">Tawaran paling seimbang dari maskapai penerbangan lokal.</p>
              <div className="space-y-2 mb-6">
                 <div className="flex justify-between text-sm"><span className="text-slate-500">Base</span><span className="font-bold text-blue-400">{formatMoney(300000)}/week</span></div>
                 <div className="flex justify-between text-sm"><span className="text-slate-500">Win Bonus</span><span className="font-bold text-blue-400">{formatMoney(500000)}/win</span></div>
              </div>
              <button className="w-full py-2 bg-slate-800 group-hover:bg-blue-600 rounded text-sm font-bold text-white transition-colors">Pilih Kontrak (1 Thn)</button>
           </div>
        </div>
      )}

    </div>
  );
}
