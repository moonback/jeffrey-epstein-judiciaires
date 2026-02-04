/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface LogTerminalProps {
  logs: string[];
  type: 'flash' | 'thinking';
  streamText?: string;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs, type, streamText }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const typeColor = type === 'flash' ? 'text-[#0F4C81]' : 'text-[#B91C1C]';
  const typeBg = type === 'flash' ? 'bg-[#0F4C81]' : 'bg-[#B91C1C]';

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight <= 50;
  };

  useEffect(() => {
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, streamText]);

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 overflow-hidden font-mono-data text-[11px] shadow-sm">

      {/* Console Header */}
      <div className="bg-[#F8FAFC] px-6 py-4 flex justify-between items-center border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${typeBg} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
          <span className={`font-black ${typeColor} text-[9px] uppercase tracking-[0.3em]`}>
            {type === 'flash' ? 'SYSTEM_TRACE_LOG' : 'INTEL_REASONING_CORE'}
          </span>
        </div>
        <div className="flex gap-1.5 opacity-20">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
        </div>
      </div>

      {/* Console Body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 p-6 overflow-y-auto space-y-2 custom-scrollbar bg-white/50 relative"
      >
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2] report-paper"></div>

        {type === 'thinking' && streamText ? (
          <div className="relative z-10 whitespace-pre-wrap text-slate-600 leading-relaxed font-bold italic">
            {streamText.replace(/<[^>]*>?/gm, '')}
            <span className="inline-block w-1.5 h-3 bg-[#B91C1C] ml-1 animate-pulse align-middle"></span>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="relative z-10 flex items-start group hover:bg-[#F8FAFC] p-1.5 rounded-lg transition-all duration-300">
              <span className="text-slate-200 mr-4 select-none shrink-0 font-black text-[9px] mt-0.5 tracking-tighter">
                [{new Date().toLocaleTimeString('fr-FR', { hour12: false }).split(':').slice(0, 2).join(':')}]
              </span>
              <span className={`${type === 'flash' ? 'text-[#0F4C81]' : 'text-slate-700'} leading-relaxed font-bold transition-colors`}>
                <span className="text-[#B91C1C]/20 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">»</span>
                {log}
              </span>
            </div>
          ))
        )}

        {logs.length === 0 && !streamText && (
          <div className="relative z-10 text-slate-200 italic flex items-center gap-4 uppercase font-black tracking-[0.5em] text-[9px] h-full justify-center opacity-30">
            <div className="h-[1px] w-6 bg-slate-100"></div>
            STANDBY_ACTIVE
            <div className="h-[1px] w-6 bg-slate-100"></div>
          </div>
        )}
      </div>

      {/* Footer Decoration */}
      <div className="px-6 py-2 bg-slate-50 border-t border-slate-50 flex justify-end">
        <span className="text-[7px] font-black text-slate-200 uppercase tracking-widest">Neural Encryption: 1024-BIT</span>
      </div>
    </div>
  );
};
