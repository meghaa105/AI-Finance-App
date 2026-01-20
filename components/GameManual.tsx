
import React from 'react';
import PixelIcon from './PixelIcon';

const GameManual: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <div className="flex justify-center gap-4 mb-2">
          <PixelIcon type="sparkle" size={24} className="text-blue-500 animate-pulse" />
          <PixelIcon type="trophy" size={24} className="text-amber-500 animate-bounce" />
          <PixelIcon type="sparkle" size={24} className="text-blue-500 animate-pulse" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase underline decoration-blue-600 underline-offset-8">Manual of the Wealth Lord</h2>
        <p className="text-slate-500 font-pixel text-[8px] uppercase tracking-widest">Version 2.0 // Decoded Financial Strategy</p>
      </header>

      <section className="bg-slate-900/40 backdrop-blur-3xl border-2 border-white/5 rounded-[3rem] p-8 lg:p-12 space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <PixelIcon type="sensei" size={128} className="text-white" />
        </div>

        <div className="space-y-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center pixel-border">
              <span className="font-pixel text-white text-[10px]">01</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">The Leveling System (XP)</h3>
          </div>
          <div className="pl-14 space-y-4">
            <p className="text-slate-400 text-sm leading-relaxed">
              In <span className="text-blue-400 font-bold">Finvue.Ai</span>, your financial status is a character you must build. Your "XP" is earned by maintaining a clean "Source of Truth."
            </p>
            <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <PixelIcon type="sparkle" size={12} className="text-blue-500 mt-1" />
                  <p className="text-[10px] font-bold text-slate-300">
                    <span className="text-white">XP GAIN:</span> Go to the <span className="text-white">RECEIPTS</span> tab and verify a pending transaction.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <PixelIcon type="sparkle" size={12} className="text-blue-500 mt-1" />
                  <p className="text-[10px] font-bold text-slate-300">
                    <span className="text-white">LVL UP:</span> Every <span className="text-white">3 VERIFIED RECEIPTS</span> increases your level by 1.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center pixel-border">
              <span className="font-pixel text-white text-[10px]">02</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Boss Battles (Quests)</h3>
          </div>
          <div className="pl-14 space-y-6">
            <p className="text-slate-400 text-sm leading-relaxed">
              Gemini AI scans your transaction history to identify your biggest "spending leak." It then manifests a <span className="text-rose-500 font-bold italic">BOSS BATTLE</span> to challenge your discipline.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Delivery Dragon', desc: 'Slayer of savings through 2AM Zomato/Swiggy hits.', color: 'text-orange-500' },
                { name: 'Commute Kraken', desc: 'A beast that feeds on high-frequency Uber/Ola rides.', color: 'text-blue-500' },
                { name: 'Subscription Specter', desc: 'Ghostly recurring charges that drain your core reserves.', color: 'text-purple-500' },
                { name: 'Impulse Imp', desc: 'Frequent small UPI transfers that aggregate into a massive L.', color: 'text-emerald-500' }
              ].map(boss => (
                <div key={boss.name} className="p-4 bg-black/60 border border-white/5 rounded-2xl group hover:border-white/20 transition-all">
                  <h4 className={`text-[10px] font-pixel ${boss.color} mb-2 uppercase tracking-tighter`}>{boss.name}</h4>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">{boss.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center pixel-border">
              <span className="font-pixel text-white text-[10px]">03</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">The Persona Spectrum</h3>
          </div>
          <div className="pl-14 space-y-6">
            <p className="text-slate-400 text-sm leading-relaxed">
              Your "Rank" is displayed via your <span className="text-blue-400 font-bold">Persona Avatar</span>. This is your social standing in the Wealth Kingdom.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { rank: 'Broke Intern', level: '1-2', color: 'text-rose-500', desc: 'Living on vibes and credit. High burn, low efficiency.' },
                { rank: 'Hustle Scholar', level: '3-5', color: 'text-amber-500', desc: 'Learning the game. Balancing the bags.' },
                { rank: 'Bag Secured', level: '6-9', color: 'text-emerald-500', desc: 'Financial dominance achieved. Outliers are rare.' },
                { rank: 'Wealth Architect', level: '10+', color: 'text-blue-500', desc: 'The Final Boss of Personal Finance. Ascended.' }
              ].map(r => (
                <div key={r.rank} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-pixel ${r.color} uppercase tracking-tighter`}>{r.rank}</span>
                    <span className="text-[8px] font-bold text-slate-500 mt-1">{r.desc}</span>
                  </div>
                  <span className="font-pixel text-[8px] text-white bg-white/10 px-2 py-1 rounded">LVL {r.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-600 flex items-center justify-center pixel-border">
              <span className="font-pixel text-white text-[10px]">04</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Vibe-Check Stats</h3>
          </div>
          <div className="pl-14 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Efficiency Score</span>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  A calculation of your discipline. High frequency of "Micro-spends" and high "Burn Velocity" will tank this score.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Guardrails</span>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Your defensive spells. Set budget caps to prevent the "Delivery Dragon" from spawning too often.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center pb-20 opacity-40">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Go forth and secure the bag.</p>
      </footer>
    </div>
  );
};

export default GameManual;
