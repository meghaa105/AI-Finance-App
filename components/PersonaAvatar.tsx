
import React from 'react';
import { PersonaRank } from '../types';
import PixelIcon from './PixelIcon';

interface PersonaAvatarProps {
  score: number;
  level: number;
}

const PersonaAvatar: React.FC<PersonaAvatarProps> = ({ score, level }) => {
  const getPersona = (): { rank: PersonaRank, type: 'ghost' | 'ledger' | 'trophy' | 'sensei', color: string } => {
    // Rank is now strictly tied to Level progression (Decided Strategy)
    // Progression: Level 1-2 (Broke), 3-5 (Scholar), 6-9 (Bag Secured), 10+ (Architect)
    if (level < 3) return { rank: 'Broke Intern', type: 'ghost', color: 'text-rose-500' };
    if (level < 6) return { rank: 'Hustle Scholar', type: 'ledger', color: 'text-amber-500' };
    if (level < 10) return { rank: 'Bag Secured', type: 'trophy', color: 'text-emerald-500' };
    return { rank: 'Wealth Architect', type: 'sensei', color: 'text-blue-500' };
  };

  const { rank, type, color } = getPersona();

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-[2rem] border-2 border-white/5 shadow-2xl group transition-all hover:border-blue-500/20 relative overflow-hidden">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-black flex items-center justify-center pixel-border group-hover:scale-110 transition-transform duration-500">
          <PixelIcon type={type} size={40} className={color} />
        </div>
        <div className="absolute -top-3 -right-3 bg-blue-600 text-[8px] font-pixel text-white px-2 py-1.5 pixel-border animate-bounce z-10 shadow-lg">
          LVL {level}
        </div>
      </div>
      
      <h3 className={`font-pixel text-[10px] ${color} uppercase tracking-tighter mb-4 text-center h-4 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]`}>
        {rank}
      </h3>
      
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-[1px] border border-white/10 mt-auto">
        <div 
          className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default PersonaAvatar;
