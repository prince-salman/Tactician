import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-br from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Tactician 2026
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
            The Ultimate Browser-Based Football Management Experience.
            Build your legacy across the globe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/new-game" 
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
          >
            NEW CAREER
          </Link>
          <Link 
            href="/load-game" 
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 border border-slate-700"
          >
            LOAD GAME
          </Link>
          <label className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all hover:scale-105 active:scale-95 border border-slate-700 cursor-pointer">
            IMPORT SAVE
            <input type="file" accept=".json" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const result = event.target?.result as string;
                  JSON.parse(result);
                  localStorage.setItem('globalfm-save', result);
                  alert('Save data berhasil diimpor!');
                  window.location.reload();
                } catch (err) {
                  alert('File save data rusak atau tidak valid!');
                }
              };
              reader.readAsText(file);
            }} />
          </label>
        </div>
        
        <div className="pt-12 text-slate-500 text-sm">
          Database: 2026/2027 Season • Over 50,000 Players • 200+ Nations
        </div>
      </div>
    </main>
  );
}
