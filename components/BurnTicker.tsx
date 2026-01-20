
import React, { useMemo } from 'react';

interface BurnTickerProps {
  velocity: number;
  topMerchant: string;
  efficiency: number;
}

const BurnTicker: React.FC<BurnTickerProps> = ({ velocity, topMerchant, efficiency }) => {
  const marketVibe = useMemo(() => {
    const merchant = topMerchant.toUpperCase();
    
    // Efficiency based vibes
    if (efficiency > 85) {
      return `ALPHA STRATEGY DETECTED. WEALTH ARCHITECT VIBES. ${merchant} IS UNDER CONTROL.`;
    }
    if (efficiency < 40) {
      return `CRITICAL LEAKAGE IN ${merchant} SECTOR. SYSTEM OVERHEAT.`;
    }

    // Velocity based vibes
    if (velocity > 5000) {
      return `HYPER-BURN ACTIVE. VELOCITY AT MAX. ${merchant} DRAINING CORE RESERVES.`;
    }
    if (velocity < 1000) {
      return `COLD-STORAGE MODE. BURN MINIMAL. STACKING WINS.`;
    }

    // Default witty vibes
    const defaults = [
      `DOMINANCE AT ${merchant}. SECURING THE BAG.`,
      `MARKET PULSE: STEADY. ${merchant} STOCKS FLUCTUATING.`,
      `INTERNAL ECONOMY: STABLE. ${merchant} IS THE MAIN CHARACTER.`,
      `HUSTLE FREQUENCY: OPTIMAL. ${merchant} TRANSACTIONS VERIFIED.`
    ];
    
    return defaults[Math.floor((velocity + efficiency) % defaults.length)];
  }, [velocity, topMerchant, efficiency]);

  return (
    <div className="w-full bg-blue-600 h-10 flex items-center overflow-hidden border-b-2 border-black z-[100] relative">
      <div className="absolute left-0 h-full bg-black text-white px-4 flex items-center z-10 font-pixel text-[8px] border-r-2 border-white">
        LOCAL_CORE
      </div>
      <div className="flex whitespace-nowrap animate-marquee items-center gap-12 font-pixel text-[8px] text-white">
        <span>BURN_VELOCITY: ₹{Math.round(velocity)}/DAY</span>
        <span className="text-blue-300">///</span>
        <span>TOP_DRAIN: {topMerchant.toUpperCase()}</span>
        <span className="text-blue-300">///</span>
        <span>MARKET_SENSE: {marketVibe}</span>
        <span className="text-blue-300">///</span>
        <span>BAG_SECURITY: {efficiency > 70 ? 'HIGH' : efficiency > 40 ? 'MEDIUM' : 'LOW'}</span>
        <span className="text-blue-300">///</span>
        <span>HUSTLE_STATUS: MAINTAINED</span>
      </div>
    </div>
  );
};

export default BurnTicker;
