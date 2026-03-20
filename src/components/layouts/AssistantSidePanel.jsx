"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Bot, Sparkles, MessageSquare, Trash2, ArrowRight, 
  Compass, Languages, ShieldCheck, Zap, MousePointer2, 
  Copy, RotateCcw, Edit2, Check, CheckCircle2, ChevronRight,
  Package, ShoppingCart, Users, Settings, Mic, MicOff, Image as ImageIcon, 
  Play, Pause, Paperclip, Square, RotateCw
} from "lucide-react";
import { useAssistant } from "@/lib/assistant/useAssistant";
import { transcribeAudio } from "@/lib/assistant/aiClient";
import { useVoiceRecorder } from "@/lib/assistant/useVoiceRecorder";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { startTour, tourMapping } from "@/lib/assistant/tourService";

// Import tour styles
import "@/styles/tour.css";

export default function AssistantSidePanel({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { messages, loading, error, sendUserMessage, clearMessages } = useAssistant();
  const [input, setInput] = useState("");
  const [navPending, setNavPending] = useState(null); 
  const [isNavigating, setIsNavigating] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, opacity: 0 });
  const [copiedId, setCopiedId] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // { base64, type, preview }
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioPlaybackRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    durationFormatted,
    waveformData,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecorder();

  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/";

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar-expanded");
    if (stored !== null) setIsSidebarExpanded(stored === "true");
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, navPending, audioUrl, selectedImage]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({
        base64: reader.result.split(',')[1],
        type: file.type,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    
    const text = textOverride || input;
    
    if (isRecording) return;

    if (!text.trim() && !selectedImage && !audioBlob) return;

    let finalPrompt = text;
    let finalImage = selectedImage;

    if (audioBlob && !text.trim()) {
        setIsTranscribing(true);
        try {
            const transcript = await transcribeAudio(audioBlob);
            if (!transcript || !transcript.trim()) {
                console.error("Transcription returned empty text");
                setIsTranscribing(false);
                return;
            }
            finalPrompt = transcript;
        } catch (err) {
            console.error("Transcription failed", err);
            setIsTranscribing(false);
            return;
        } finally {
            setIsTranscribing(false);
        }
    }

    setInput("");
    setSelectedImage(null);
    clearRecording();
    
    const reply = await sendUserMessage(finalPrompt, { appLocale: locale }, finalImage);

    if (reply) {
      try {
        let navData = null;
        const fencedMatch = reply.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fencedMatch) {
          try {
            const parsed = JSON.parse(fencedMatch[1].trim());
            if (parsed.action === "navigate") navData = parsed;
          } catch (e) {}
        }
        if (!navData) {
          const rawMatch = reply.match(/\{[\s\S]*?"action"\s*:\s*"navigate"[\s\S]*?\}/);
          if (rawMatch) {
            try {
              const parsed = JSON.parse(rawMatch[0]);
              navData = parsed;
            } catch (e) {}
          }
        }
        if (navData && navData.path) {
          setNavPending({ path: navData.path, label: navData.label || "Requested Module" });
        }
      } catch (err) {
        console.error("Failed to parse navigation command:", err);
      }
    }
  };

  const simulateCursorToElement = async (selector) => {
    const element = document.querySelector(selector);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setCursorPos({ x, y, opacity: 1 });
    await new Promise(r => setTimeout(r, 1200));
    const ripple = document.createElement('div');
    ripple.className = 'inara-click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  };

  const confirmNavigation = async () => {
    if (!navPending) return;
    const targetPath = navPending.path;
    const tour = tourMapping[targetPath];
    setIsNavigating(true);
    onClose(); 
    
    // Auto-expand sidebar if it's an inventory page and sidebar is collapsed
    if (!isSidebarExpanded && targetPath.startsWith('/inventory')) {
        const sidebarToggle = document.querySelector('#sidebar-toggle-btn');
        if (sidebarToggle) {
            await simulateCursorToElement('#sidebar-toggle-btn');
            sidebarToggle.click();
            await new Promise(r => setTimeout(r, 500));
        }
    }
    
    if (!tour) {
        router.push(targetPath);
        setIsNavigating(false);
        setNavPending(null);
        return;
    }

    // Start the enhanced tour with navigation support
    startTour(
      targetPath, 
      () => { 
        setIsNavigating(false); 
        setNavPending(null); 
      }, 
      pathname, 
      (p) => router.push(p)
    );
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  };

  const quickQuestions = [
    { label: "Add Product", icon: <Package size={14} />, query: "How do I add a new product?" },
    { label: "Make Sale", icon: <ShoppingCart size={14} />, query: "Show me how to process a sale" },
    { label: "Add Staff", icon: <Users size={14} />, query: "How do I add a staff member?" },
    { label: "Change Language", icon: <Settings size={14} />, query: "How do I change the app language?" },
  ];

  return (
    <>
      <style jsx global>{`
        .inara-click-ripple { position: fixed; width: 40px; height: 40px; background: rgba(255, 120, 45, 0.4); border-radius: 50%; transform: translate(-50%, -50%) scale(0); animation: inara-ripple 0.8s ease-out; pointer-events: none; z-index: 9999; }
        @keyframes inara-ripple { to { transform: translate(-50%, -50%) scale(4); opacity: 0; } }
      `}</style>

      {/* MINI FLOATING ACTION BUTTON */}
      {!isOpen && mounted && (
        <motion.button
          initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} whileHover={{ scale: 1.1 }} whileActive={{ scale: 0.9 }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-inara'))}
          className={`fixed right-6 z-[1110] w-12 h-12 bg-gradient-to-br from-[#ff782d] to-[#ea580c] text-white rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center group border-2 border-white/20 ${isHomePage ? "bottom-[100px]" : "bottom-6"}`}
        >
          <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
        </motion.button>
      )}

      {/* CUSTOM CURSOR */}
      <motion.div animate={{ x: cursorPos.x, y: cursorPos.y, opacity: cursorPos.opacity, scale: cursorPos.opacity ? 1 : 0.5 }} transition={{ type: "spring", damping: 30, stiffness: 200 }} className="fixed top-0 left-0 z-[10000] pointer-events-none text-[#ff782d]">
        <MousePointer2 size={32} fill="currentColor" className="drop-shadow-[0_5px_15px_rgba(255,120,45,0.4)]" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1150]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[1200] flex flex-col border-l border-slate-200" >
              
              {/* Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#081422] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff782d] opacity-10 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-2.5 bg-[#ff782d] rounded-2xl shadow-lg shadow-[#ff782d]/20"><Bot size={26} className="text-white" /></div>
                  <div>
                    <h2 className="font-extrabold text-xl tracking-tight leading-none">Inara</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Advanced Assistant</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative z-10">
                  <button onClick={clearMessages} className="p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90" title="Clear Chat"><Trash2 size={18} className="text-slate-400" /></button>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90"><X size={22} className="text-slate-400" /></button>
                </div>
              </div>

              {/* Chat Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-8 scroll-smooth bg-white">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100"><MessageSquare size={32} className="text-[#081422]" /></div>
                    <h3 className="text-[#081422] font-black text-xl mb-2 tracking-tight">Need a Hand?</h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mb-8">Click a shortcut below to start a practice tour or use voice/images to ask anything.</p>
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                      {quickQuestions.map((q, i) => (
                        <button key={i} onClick={() => handleSend(null, q.query)} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-orange-300 hover:bg-orange-50/50 transition-all group" >
                          <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-orange-500 shadow-sm">{q.icon}</div>
                          <span className="text-[11px] font-bold text-slate-600 group-hover:text-orange-700">{q.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex flex-col group ${msg.role === "user" ? "items-end" : "items-start"}`} >
                    <div className={`max-w-[88%] px-4 py-2 rounded-3xl shadow-sm relative transition-all duration-200 ${msg.role === "user" ? "bg-[#081422] text-white rounded-tr-none hover:shadow-md" : "bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none hover:bg-slate-200/50"}`}>
                      {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                              <Bot size={12} className="text-[#ff782d]" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inara Guide</span>
                          </div>
                      )}
                      <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
                          {msg.content.replace(/```(?:json)?\s*[\s\S]*?```/g, "").replace(/\{[\s\S]*?"action"\s*:\s*"navigate"[\s\S]*?\}/g, "").trim()}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 px-2">{formatTime(msg.timestamp)}</span>
                  </motion.div>
                ))}

                {(loading || isTranscribing) && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 border border-slate-200 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => ( <motion.div key={i} animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} className="w-2 h-2 bg-[#ff782d] rounded-full" /> ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">{isTranscribing ? 'Transcribing Voice...' : 'Thinking...'}</span>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {navPending && !isNavigating && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] shadow-xl space-y-4" >
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#081422] rounded-2xl text-white shadow-lg"><Compass size={24} className="text-[#ff782d]" /></div>
                        <div>
                          <h4 className="font-black text-[#081422] text-sm uppercase tracking-tight">Interactive Tour</h4>
                          <p className="text-xs text-slate-500">I'll take you on a real guided tour of <strong>{navPending.label}</strong>.</p>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center gap-3">
                        <button onClick={() => setNavPending(null)} className="flex-1 py-3.5 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Later</button>
                        <button onClick={confirmNavigation} className="flex-[2] py-3.5 bg-[#ff782d] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#ff782d]/20 hover:bg-[#e66a25] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">Start Tour <ChevronRight size={16} /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Advanced Input Area */}
              <div className="p-5 border-t border-slate-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                
                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600" >
                      <div className="p-1 bg-red-100 rounded-lg"><X size={14} /></div>
                      <p className="text-[11px] font-bold leading-tight">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Futuristic Voice Recording UI */}
                <AnimatePresence>
                    {(isRecording || audioUrl) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-4 p-4 bg-[#081422] rounded-[2rem] border border-orange-500/40 flex flex-col gap-4 shadow-2xl relative overflow-hidden z-[1300]" >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
                            
                            <div className="flex items-center justify-between px-2 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest">{durationFormatted}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={clearRecording} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer" title="Delete"><Trash2 size={16} /></button>
                                    <button type="button" onClick={isPaused ? resumeRecording : pauseRecording} className="p-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl hover:bg-orange-500/20 transition-all cursor-pointer" title={isPaused ? "Resume" : "Pause"}>
                                        {isPaused ? <RotateCw size={16} /> : <Pause size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-end gap-1 px-4 h-12 relative z-10">
                                {waveformData.map((h, i) => (
                                    <motion.div key={i} animate={{ height: isRecording && !isPaused ? h : 4 }} className={`flex-1 rounded-full transition-colors duration-300 ${isRecording && !isPaused ? 'bg-gradient-to-t from-orange-600 to-orange-400' : 'bg-slate-700'}`} />
                                ))}
                            </div>

                            <div className="flex items-center gap-3 mt-2 relative z-10">
                                {isRecording ? (
                                    <button type="button" onClick={stopRecording} className="flex-1 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer" >
                                        <Square size={14} fill="currentColor" /> Stop Recording
                                    </button>
                                ) : audioUrl && (
                                    <>
                                        <button type="button" onClick={() => { if(isAudioPlaying) audioPlaybackRef.current.pause(); else audioPlaybackRef.current.play(); }} className="flex-1 py-3 bg-slate-800 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer" >
                                            {isAudioPlaying ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Preview</>}
                                        </button>
                                        <button type="button" onClick={(e) => handleSend(e)} className="flex-[2] py-3 bg-[#ff782d] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-[#e66a25] transition-all flex items-center justify-center gap-2 cursor-pointer" >
                                            <Send size={14} /> Send Prompt
                                        </button>
                                    </>
                                )}
                            </div>
                            {audioUrl && <audio ref={audioPlaybackRef} src={audioUrl} onPlay={() => setIsAudioPlaying(true)} onPause={() => setIsAudioPlaying(false)} onEnded={() => setIsAudioPlaying(false)} className="hidden" />}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Image Preview */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-xl group" >
                            <img src={selectedImage.preview} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" onClick={() => setSelectedImage(null)} className="bg-red-500 text-white rounded-full p-1.5 shadow-lg"><X size={14} /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSend} className="relative flex items-center gap-3">
                  <div className="relative flex-1">
                      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={isRecording || isTranscribing} placeholder={isTranscribing ? "Inara is listening..." : "Ask Inara..."} className="w-full pl-5 pr-24 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#ff782d]/20 focus:border-[#ff782d] focus:bg-white transition-all shadow-inner" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Paperclip size={18} /></button>
                        <button type="button" onClick={startRecording} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"><Mic size={18} /></button>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                  </div>
                  <button type="submit" disabled={(!input.trim() && !selectedImage && !audioBlob) || loading || isTranscribing} className={`p-4 rounded-[1.2rem] transition-all shadow-lg ${input.trim() || selectedImage || audioBlob ? "bg-[#081422] text-white shadow-slate-200 scale-100 hover:bg-black active:scale-90" : "bg-slate-100 text-slate-300 scale-95 opacity-50 cursor-not-allowed shadow-none"}`}><Send size={20} /></button>
                </form>
                <div className="mt-5 px-1 flex justify-between items-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Inara System <span className="text-[#ff782d] opacity-60 ml-1">v5.1 Stable</span>
                    </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
