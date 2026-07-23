import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileSimulatorProps {
  children: React.ReactNode;
  currentTime: string;
}

export default function MobileSimulator({ children, currentTime }: MobileSimulatorProps) {
  return (
    <div class="relative w-full max-w-[410px] h-[840px] bg-white rounded-[50px] p-3 shadow-[0_0_80px_rgba(0,0,0,0.06)] border-[10px] border-neutral-900 flex flex-col overflow-hidden mx-auto">
      {/* Phone side buttons simulation */}
      <div class="absolute left-[-15px] top-[140px] w-[3px] h-[40px] bg-neutral-900 rounded-r-lg"></div> {/* Action Button */}
      <div class="absolute left-[-15px] top-[195px] w-[3px] h-[60px] bg-neutral-900 rounded-r-lg"></div> {/* Vol Up */}
      <div class="absolute left-[-15px] top-[265px] w-[3px] h-[60px] bg-neutral-900 rounded-r-lg"></div> {/* Vol Down */}
      <div class="absolute right-[-15px] top-[220px] w-[3px] h-[85px] bg-neutral-900 rounded-l-lg"></div> {/* Power Button */}

      {/* Screen container */}
      <div class="relative flex-1 bg-white rounded-[38px] overflow-hidden flex flex-col border border-neutral-100 select-none">
        
        {/* Dynamic Island / Notch */}
        <div class="absolute top-2 left-1/2 -translate-x-1/2 w-[110px] h-[28px] bg-neutral-900 rounded-full z-50 flex items-center justify-between px-3 border border-neutral-800">
          <div class="w-3.5 h-3.5 bg-neutral-850 rounded-full flex items-center justify-center border border-neutral-900">
            <div class="w-1.5 h-1.5 bg-blue-950 rounded-full"></div>
          </div>
          <div class="w-2.5 h-2.5 bg-neutral-950 rounded-full border border-neutral-900"></div>
        </div>

        {/* Status Bar */}
        <div class="h-11 pt-1.5 px-6 flex items-center justify-between text-[11px] font-semibold text-neutral-900 z-40 bg-transparent select-none">
          <span class="font-sans leading-none">{currentTime}</span>
          <div class="flex items-center gap-1.5">
            <Signal class="w-3 h-3 text-neutral-900 fill-neutral-900" />
            <span class="text-[9px] uppercase font-bold text-blue-600">5G</span>
            <Wifi class="w-3 h-3 text-neutral-900" />
            <div class="flex items-center gap-0.5">
              <Battery class="w-4 h-4 text-neutral-900" />
            </div>
          </div>
        </div>

        {/* Dynamic Mobile App viewport */}
        <div class="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {children}
        </div>

        {/* iOS Home Indicator */}
        <div class="h-6 flex items-center justify-center bg-transparent z-40 relative">
          <div class="w-32 h-1 bg-neutral-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
