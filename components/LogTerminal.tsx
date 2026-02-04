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
  // Track if we should stick to the bottom. Default to true so it starts at bottom.
  const isAtBottomRef = useRef(true);

  const typeColor = type === 'flash' ? 'text-[#8AB4F8]' : 'text-[#F2B8B5]';

  // Check scroll position when user scrolls
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // If within 50px of the bottom, consider it "at bottom"
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 50;
    isAtBottomRef.current = isAtBottom;
  };

  useEffect(() => {
    // Only auto-scroll if the user hasn't scrolled up manually
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, streamText]);

  return (
    <div className="flex flex-col h-full bg-[#080808] rounded-xl border border-[#1A1A1A] overflow-hidden font-mono text-[12px] shadow-2xl">

      {/* Console Header */}
      <div className="bg-[#121212] px-4 py-2 flex justify-between items-center border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${type === 'flash' ? 'bg-[#8AB4F8]' : 'bg-[#F2B8B5]'} animate-pulse`}></div>
          <span className={`font-bold ${typeColor} text-[10px] uppercase tracking-[0.2em]`}>
            {type === 'flash' ? 'SYSTEM_TRACE' : 'INTEL_REASONING'}
          </span>
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-8 bg-[#1A1A1A] rounded-full"></div>
        </div>
      </div>

      {/* Console Body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 p-5 overflow-y-auto space-y-1.5 custom-scrollbar"
      >
        {type === 'thinking' && streamText ? (
          <div className="whitespace-pre-wrap text-[#F2B8B5]/80 leading-relaxed font-light">
            {streamText.replace(/<[^>]*>?/gm, '')}
            <span className="inline-block w-1.5 h-3 bg-[#F2B8B5] ml-1 animate-pulse align-middle"></span>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex items-start group">
              <span className="text-[#333] mr-3 select-none shrink-0 font-bold group-hover:text-[#444] transition-colors">
                {new Date().toLocaleTimeString('fr-FR', { hour12: false }).split(':').slice(0, 2).join(':')}
              </span>
              <span className={`${type === 'flash' ? 'text-[#8AB4F8]/80' : 'text-[#EEE]/60'} leading-relaxed font-light group-hover:text-white transition-colors`}>
                <span className="text-[#F2B8B5]/40 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">»</span>
                {log}
              </span>
            </div>
          ))
        )}

        {logs.length === 0 && !streamText && (
          <div className="text-[#222] italic flex items-center gap-2 uppercase font-bold tracking-widest text-[10px]">
            <span className="w-1 h-1 rounded-full bg-[#222]"></span>
            System Ready
          </div>
        )}
      </div>
    </div>
  );
};
