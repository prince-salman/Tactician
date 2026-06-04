'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Briefcase, UserX, CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';
import { TeamLogo } from '@/components/TeamLogo';

const INTERVIEW_QUESTIONS = [
  {
    question: "Apa filosofi taktik utama yang akan Anda terapkan di klub kami?",
    options: [
      { text: "Sepakbola menyerang dan menghibur penonton.", points: 10 },
      { text: "Bertahan total, yang penting menang walau 1-0.", points: 5 },
      { text: "Saya akan menyesuaikan dengan pemain yang ada.", points: 8 }
    ]
  },
  {
    question: "Jika klub mengalami 3 kekalahan beruntun, apa yang Anda lakukan?",
    options: [
      { text: "Menghukum pemain dengan latihan fisik tambahan.", points: -5 },
      { text: "Mengevaluasi taktik dan memotivasi ruang ganti.", points: 12 },
      { text: "Menyalahkan wasit di depan media.", points: -10 }
    ]
  },
  {
    question: "Apa prioritas Anda musim ini?",
    options: [
      { text: "Mengembangkan pemain muda dari akademi.", points: 10 },
      { text: "Membeli pemain bintang agar instan juara.", points: 2 },
      { text: "Menjaga stabilitas finansial klub.", points: 8 }
    ]
  }
];

export default function JobCenterPage() {
  const router = useRouter();
  const database = useGameStore(state => state.database);
  const managerLicense = useGameStore(state => state.managerLicense);
  const managerConfederation = useGameStore(state => state.managerConfederation);
  const blacklistedClubs = useGameStore(state => state.blacklistedClubs || []);
  const acceptJobOffer = useGameStore(state => state.acceptJobOffer);
  const rejectJobOffer = useGameStore(state => state.rejectJobOffer);
  const availableJobs = useGameStore(state => state.availableJobs || []);

  // Interview State
  const [interviewJob, setInterviewJob] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewScore, setInterviewScore] = useState(0);
  const [interviewStage, setInterviewStage] = useState<'QUESTIONS' | 'SALARY' | 'RESULT'>('QUESTIONS');
  const [isAccepted, setIsAccepted] = useState(false);
  const [negotiatedWage, setNegotiatedWage] = useState(0);

  const jobs = availableJobs;
  const loading = !database;

  if (!database || loading) return <div className="p-12 text-center text-slate-500">Loading Job Center...</div>;

  const licenseRank = { 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'Pro': 5 };
  const currentRank = licenseRank[managerLicense || 'D'];

  const handleApply = (job: any) => {
    const requiredRank = licenseRank[job.requiredLicense as keyof typeof licenseRank];
    
    if (currentRank < requiredRank) {
      alert(`CV Ditolak! Klub mensyaratkan Lisensi ${job.requiredLicense}. Anda hanya memiliki Lisensi ${managerLicense}.`);
      return;
    }

    if (blacklistedClubs.includes(job.team.id)) {
      alert(`Anda telah di-blacklist oleh klub ini karena gagal wawancara sebelumnya.`);
      return;
    }

    // Start Interview
    setInterviewJob(job);
    setQuestionIndex(0);
    setInterviewScore(50); // Base score
    setInterviewStage('QUESTIONS');
    setNegotiatedWage(job.baseWage);
  };

  const handleAnswer = (points: number) => {
    setInterviewScore(prev => prev + points);
    if (questionIndex < INTERVIEW_QUESTIONS.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      setInterviewStage('SALARY');
    }
  };

  const handleSalaryNegotiation = (multiplier: number) => {
    const finalWage = Math.floor(interviewJob.baseWage * multiplier);
    
    // Calculate acceptance probability
    // The higher the requested wage, the more interview score is deducted
    const penalty = (multiplier - 1) * 100; // e.g. 1.2x wage = 20 points penalty
    const finalScore = interviewScore - penalty;
    
    // Required score scales with team reputation (Harder for big clubs)
    const requiredScore = interviewJob.reputation > 80 ? 70 : (interviewJob.reputation > 60 ? 60 : 50);
    
    setNegotiatedWage(finalWage);
    setInterviewStage('RESULT');
    
    if (finalScore >= requiredScore) {
      setIsAccepted(true);
    } else {
      setIsAccepted(false);
      rejectJobOffer(interviewJob.team.id); // Add to blacklist
    }
  };

  const handleFinalize = () => {
    if (isAccepted && interviewJob) {
      acceptJobOffer(interviewJob.team.id, "Manager", negotiatedWage);
      router.push('/dashboard');
    } else {
      setInterviewJob(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 relative">
      <header className="flex justify-between items-end pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3"><Briefcase className="text-emerald-400"/> Job Center</h1>
          <p className="text-slate-400 mt-1">Lamar pekerjaan dan jalani wawancara dengan direksi klub.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Lisensi Anda</div>
          <div className="text-3xl font-black text-emerald-400 text-center">{managerConfederation} Level {managerLicense}</div>
        </div>
      </header>

      {/* Interview Modal Overlay */}
      {interviewJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center gap-4">
               <TeamLogo teamId={interviewJob.team.id} teamName={interviewJob.team.name} shortName={interviewJob.team.shortName} size={48} />
               <div>
                  <h2 className="text-2xl font-black text-white">Wawancara Direksi: {interviewJob.team.name}</h2>
                  <p className="text-slate-400 text-sm">Posisi: {interviewJob.role}</p>
               </div>
            </div>

            <div className="p-8">
              {interviewStage === 'QUESTIONS' && (
                <div className="space-y-6">
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Pertanyaan {questionIndex + 1} dari {INTERVIEW_QUESTIONS.length}</div>
                  <p className="text-xl text-white font-medium">"{INTERVIEW_QUESTIONS[questionIndex].question}"</p>
                  <div className="space-y-3 mt-8">
                    {INTERVIEW_QUESTIONS[questionIndex].options.map((opt, i) => (
                      <button key={i} onClick={() => handleAnswer(opt.points)}
                        className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 rounded-lg text-slate-200 transition-all font-medium">
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {interviewStage === 'SALARY' && (
                <div className="space-y-6 text-center">
                  <Wallet size={48} className="mx-auto text-amber-400 mb-4" />
                  <h3 className="text-2xl font-black text-white">Negosiasi Gaji</h3>
                  <p className="text-slate-400">Gaji standar yang kami tawarkan adalah <strong className="text-emerald-400">€{interviewJob.baseWage} /minggu</strong>. Apakah Anda menerima ini atau ingin menuntut lebih?</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <button onClick={() => handleSalaryNegotiation(1.0)} className="p-4 bg-emerald-900/30 border border-emerald-500 rounded-lg hover:bg-emerald-800/50 transition-colors">
                       <div className="font-bold text-white mb-1">Setuju Normal</div>
                       <div className="text-emerald-400 text-sm">€{interviewJob.baseWage}</div>
                    </button>
                    <button onClick={() => handleSalaryNegotiation(1.2)} className="p-4 bg-amber-900/30 border border-amber-500 rounded-lg hover:bg-amber-800/50 transition-colors">
                       <div className="font-bold text-white mb-1">Minta Naik 20%</div>
                       <div className="text-amber-400 text-sm">€{Math.floor(interviewJob.baseWage * 1.2)}</div>
                    </button>
                    <button onClick={() => handleSalaryNegotiation(1.5)} className="p-4 bg-red-900/30 border border-red-500 rounded-lg hover:bg-red-800/50 transition-colors">
                       <div className="font-bold text-white mb-1">Minta Naik 50%</div>
                       <div className="text-red-400 text-sm">€{Math.floor(interviewJob.baseWage * 1.5)}</div>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">*Meminta gaji tinggi meningkatkan risiko direksi membatalkan tawaran jika jawaban wawancara Anda sebelumnya kurang memuaskan.</p>
                </div>
              )}

              {interviewStage === 'RESULT' && (
                <div className="space-y-6 text-center animate-fade-in">
                  {isAccepted ? (
                    <>
                      <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
                      <h3 className="text-3xl font-black text-white">Anda Diterima!</h3>
                      <p className="text-slate-300">Direksi sangat terkesan dengan visi Anda. Selamat bergabung dengan {interviewJob.team.name} sebagai {interviewJob.role} dengan gaji <strong className="text-emerald-400">€{negotiatedWage}/minggu</strong>.</p>
                      <button onClick={handleFinalize} className="mt-8 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        Mulai Bekerja
                      </button>
                    </>
                  ) : (
                    <>
                      <UserX size={64} className="mx-auto text-red-500 mb-4" />
                      <h3 className="text-3xl font-black text-white">Anda Ditolak.</h3>
                      <p className="text-slate-300">Mohon maaf, direksi merasa visi Anda atau tuntutan gaji Anda tidak sesuai dengan kemampuan klub saat ini. Anda telah di-<strong className="text-red-400">blacklist</strong> oleh klub ini untuk sisa musim.</p>
                      <button onClick={handleFinalize} className="mt-8 px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg uppercase tracking-widest">
                        Cari Klub Lain
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => {
          const requiredRank = licenseRank[job.requiredLicense as keyof typeof licenseRank];
          const isQualified = currentRank >= requiredRank;
          const isBlacklisted = blacklistedClubs.includes(job.team.id);

          return (
            <div key={job.id} className={`bg-slate-900 border ${isBlacklisted ? 'border-red-900/50 opacity-60' : 'border-slate-800'} rounded-xl p-6 flex flex-col justify-between hover:border-slate-600 transition-colors shadow-lg`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <TeamLogo teamId={job.team.id} teamName={job.team.name} shortName={job.team.shortName} size={48} />
                    <div>
                      <h3 className="font-bold text-lg text-white">{job.team.name}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-1"><Building size={14} /> {job.league?.name}</p>
                    </div>
                  </div>
                  <div className="bg-slate-950 px-3 py-1 rounded text-xs font-bold text-emerald-400 border border-emerald-900/50">
                    {job.requiredLicense}
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Gaji Penawaran:</span>
                    <span className="font-bold text-emerald-400">€{job.baseWage}/mgg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Reputasi Klub:</span>
                    <span className="font-bold text-slate-200">{job.reputation} OVR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status Anda:</span>
                    {isBlacklisted ? (
                       <span className="font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14}/> Ditolak (Blacklist)</span>
                    ) : isQualified ? (
                       <span className="font-bold text-emerald-500">Memenuhi Syarat</span>
                    ) : (
                       <span className="font-bold text-slate-500">Lisensi Kurang</span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleApply(job)}
                disabled={!isQualified || isBlacklisted}
                className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${
                  isBlacklisted
                    ? 'bg-red-900/20 text-red-500 cursor-not-allowed border border-red-900/50'
                    : isQualified 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isBlacklisted ? 'Blacklisted' : isQualified ? 'Lamar & Wawancara' : 'Lisensi Tidak Cukup'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
