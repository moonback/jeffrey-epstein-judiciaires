/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Save, Trash2, Zap, Brain, MessageSquare, Terminal, History, Activity, ShieldCheck, Waves } from 'lucide-react';

interface VoiceNote {
    id: string;
    timestamp: number;
    text: string;
    transcriptionStatus: 'loading' | 'done' | 'error';
}

export const VoiceAssistant: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [notes, setNotes] = useState<VoiceNote[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'fr-FR';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setCurrentTranscript(finalTranscript || interimTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setCurrentTranscript('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const saveNote = () => {
        if (!currentTranscript.trim()) return;
        const newNote: VoiceNote = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            text: currentTranscript,
            transcriptionStatus: 'done'
        };
        setNotes([newNote, ...notes]);
        setCurrentTranscript('');
        if (isListening) recognitionRef.current?.stop();
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-10 py-5 lg:py-6 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-20 shrink-0 shadow-sm relative">
                <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-6">
                            <Brain size={20} className="text-[#B91C1C]" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-tight">Assistant <span className="text-[#B91C1C]">Vocal</span></h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Transcription Forensique Main-Libre</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end mr-4">
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Buffer Status</span>
                            <span className="text-[10px] font-mono-data font-black text-[#B91C1C]">READY_FOR_VOICE_STREAM</span>
                        </div>
                        <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>
                        <button
                            onClick={toggleListening}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isListening
                                    ? 'bg-[#B91C1C] text-white animate-pulse'
                                    : 'bg-[#0F172A] text-white hover:bg-slate-800'
                                }`}
                        >
                            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                            {isListening ? 'Stop Listening' : 'Start Recording'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row z-10">

                {/* Recording Area */}
                <div className="flex-1 p-6 lg:p-10 flex flex-col gap-6 overflow-hidden">
                    <div className={`flex-1 bg-white rounded-[3rem] border-2 border-dashed transition-all duration-700 relative overflow-hidden flex flex-col p-10 lg:p-16 ${isListening ? 'border-[#B91C1C]/30 bg-red-50/5 shadow-2xl shadow-red-900/5' : 'border-slate-100 bg-white shadow-sm'
                        }`}>

                        {isListening && (
                            <div className="absolute top-10 right-10 flex items-center gap-3">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#B91C1C]"></span>
                                </span>
                                <span className="text-[9px] font-black text-[#B91C1C] uppercase tracking-widest">LIVE_TRANSCRIPTION_ENABLED</span>
                            </div>
                        )}

                        <div className="flex-1 min-h-0 flex flex-col">
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                <Terminal size={14} /> Flux Digital Transcrit
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                                {currentTranscript ? (
                                    <div className="text-2xl lg:text-3xl font-black text-[#0F172A] italic font-serif-legal leading-relaxed selection:bg-[#B91C1C]/10 animate-pro-reveal text-center lg:text-left">
                                        "{currentTranscript}"
                                        <span className="inline-block w-4 h-8 bg-[#B91C1C] ml-2 animate-pulse align-middle"></span>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
                                            <Waves size={40} className="text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-[0.5em] italic font-serif-legal">Waiting for Audio</h3>
                                        <p className="mt-6 text-[9px] font-black uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                                            Cliquez sur l'icône micro pour initialiser <br /> la capture de preuves orales.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {currentTranscript && (
                            <div className="mt-10 flex items-center justify-center lg:justify-end gap-4 animate-pro-reveal">
                                <button
                                    onClick={() => setCurrentTranscript('')}
                                    className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#B91C1C] transition-all"
                                >
                                    Effacer
                                </button>
                                <button
                                    onClick={saveNote}
                                    className="flex items-center gap-3 px-8 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
                                >
                                    <Save size={14} /> Archiver Note
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* History Sidebar */}
                <div className="w-full lg:w-[320px] bg-white/60 backdrop-blur-xl border-l border-slate-100 overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2">
                                <History size={14} /> Notes Archivées
                            </h4>
                            <span className="text-[9px] font-mono-data font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{notes.length}</span>
                        </div>

                        {notes.map((note) => (
                            <div key={note.id} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm hover:shadow-xl hover:border-[#B91C1C]/10 transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                            {new Date(note.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-[#B91C1C] transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p className="text-[13px] text-slate-600 leading-relaxed italic font-serif-legal font-medium line-clamp-3">
                                    "{note.text}"
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                        <MessageSquare size={10} /> Forensic Script
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#B91C1C] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[8px] font-black uppercase tracking-widest">Analysis</span>
                                        <Zap size={10} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {notes.length === 0 && (
                            <div className="text-center py-20 opacity-20 italic text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                Archives vocales <br /> indisponibles
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Decoration */}
            <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-left pointer-events-none opacity-[0.02]">
                <span className="text-[8px] font-black text-black uppercase tracking-[1.5em] whitespace-nowrap italic">NEURAL VOICE-TO-EVIDENCE PROCESSING UNIT STATION // 404</span>
            </div>
        </div>
    );
};
