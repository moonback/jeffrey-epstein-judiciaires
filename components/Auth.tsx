/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Gavel, UserPlus, LogIn } from 'lucide-react';

export const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase!.auth.signUp({ email, password });
                if (error) throw error;
                alert('Vérifiez votre boîte mail pour confirmer votre inscription.');
            } else {
                const { error } = await supabase!.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans p-4">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B91C1C] rounded-full blur-[150px] opacity-[0.03]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0F4C81] rounded-full blur-[150px] opacity-[0.03]"></div>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2] report-paper"></div>

            <div className="w-full max-w-md bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.15)] relative z-10 overflow-hidden animate-pro-reveal translate-y-[-20px]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#B91C1C] via-[#0F4C81] to-[#B91C1C]"></div>

                <div className="p-10 lg:p-12">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center shadow-2xl mb-6 transform hover:rotate-[360deg] transition-transform duration-700 cursor-pointer">
                            <ShieldCheck className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-none mb-3">
                            DOJ <span className="text-[#B91C1C]">Forensic</span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol Authorization v4.2</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identifiant Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agent@doj.gov"
                                    className="w-full bg-[#F8FAFC] border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-[#0F172A] focus:bg-white focus:border-[#B91C1C] outline-none transition-all shadow-inner font-bold placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code d'Accès Crypté</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#F8FAFC] border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-[#0F172A] focus:bg-white focus:border-[#B91C1C] outline-none transition-all shadow-inner font-bold placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <Gavel className="text-[#B91C1C] shrink-0 mt-0.5" size={14} />
                                <p className="text-[11px] font-bold text-[#B91C1C] leading-relaxed uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0F172A] hover:bg-[#B91C1C] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> : <LogIn size={18} className="group-hover:scale-110 transition-transform" />}
                                    <span>{isSignUp ? "Créer l'Accès Agent" : "Initialiser la Session"}</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-[#B91C1C] transition-colors"
                        >
                            {isSignUp ? "Déjà un accès ? Authentification" : "Nouvel agent ? Créer un profil"}
                        </button>
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="bg-[#F8FAFC] p-6 text-center border-t border-slate-50">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[1em] italic">Secure Gateway Protocol // Node_01</span>
                </div>
            </div>
        </div>
    );
};
