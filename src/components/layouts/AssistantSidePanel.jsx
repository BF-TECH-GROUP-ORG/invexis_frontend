"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Bot, Sparkles, MessageSquare, Trash2, ArrowRight, 
  Compass, Languages, ShieldCheck, Zap, MousePointer2, 
  Copy, RotateCcw, Edit2, Check, CheckCircle2, ChevronRight,
  Package, ShoppingCart, Users, Settings, Mic, MicOff, Image as ImageIcon, 
  Play, Pause, Paperclip, Square, RotateCw, RefreshCcw,
  ThumbsUp, ThumbsDown, MoreHorizontal, Clock, ArrowLeft, History, User, Plus,
  Volume2, VolumeX, ExternalLink, Shield, Brain
} from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useAssistant } from "@/lib/assistant/useAssistant";
import { transcribeAudio, sendMessage } from "@/lib/assistant/aiClient";
import { useVoiceRecorder } from "@/lib/assistant/useVoiceRecorder";
import { useTextToSpeech } from "@/lib/assistant/useTextToSpeech";
import { toast } from "react-hot-toast";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { startTour, TOUR_MAP, resolveTourKey } from "@/lib/assistant/tourService";
import InaraResponse from "../Assistant/InaraResponse";
import AssistantNetworkError from "../Assistant/AssistantNetworkError";
import ReadAloudButton from "../Assistant/ReadAloudButton";
import SuggestionChips from "../Assistant/SuggestionChips";
import RegistrationForm from "../Assistant/RegistrationForm";
import MemoryManager from "../Assistant/MemoryManager";
import useAuth from "@/hooks/useAuth";

dayjs.extend(relativeTime);

// Import tour styles
import "@/styles/tour.css";

export default function AssistantSidePanel({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useAuth();
  const { messages, setMessages, loading, error, quality, online, sendUserMessage, clearMessages, dismissError, isAuthenticated, loadSession, sessionId } = useAssistant();
  const tts = useTextToSpeech();

  const [ttsLang, setTtsLang] = useState(locale); 
  const [input, setInput] = useState("");
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState('chat'); // 'chat' | 'history' | 'memory'
  const [chatHistory, setChatHistory] = useState([]);
  const [feedbackState, setFeedbackState] = useState({}); 
  const [negativeFeedbackIdx, setNegativeFeedbackIdx] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [navPending, setNavPending] = useState(null); 
  const [isNavigating, setIsNavigating] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, opacity: 0 });
  const [copiedId, setCopiedId] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 
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
    setShowSuggestions(false);
    setCurrentSuggestions([]);
    
    const reply = await sendUserMessage(finalPrompt, { appLocale: locale }, finalImage);

    if (reply) {
      if (reply.toLowerCase().includes("collect your details") || reply.toLowerCase().includes("registration request")) {
        setShowRegistration(true);
      }
      
      // 1. Check for manual navigation command in JSON
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

      // 2. Intent-based tour detection (from documentation)
      const tourKey = resolveTourKey(finalPrompt);
      if (tourKey && TOUR_MAP[tourKey]) {
        // Auto-show tour prompt after 600ms as per documentation
        setTimeout(() => {
          setNavPending({ path: tourKey, label: TOUR_MAP[tourKey].title });
        }, 600);
      }
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (text, index) => {
    setInput(text);
    setMessages(prev => prev.slice(0, index));
  };

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/assistant/history?userId=${user.id}`);
      const data = await res.json();
      setChatHistory(Array.isArray(data) ? data.sort((a, b) => new Date(b.updatedAt) - new Date(b.createdAt)) : []);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (view === 'history') {
      fetchHistory();
    }
  }, [view, fetchHistory]);

  const handleStartNewChat = () => {
    clearMessages();
    setView('chat');
    setIsMenuOpen(false);
  };

  const handleSelectHistory = (session) => {
    loadSession(session);
    setView('chat');
  };

  const handleFeedback = async (idx, type, reason = null) => {
    const msg = messages[idx];
    const userMsg = messages[idx - 1];
    setFeedbackState(prev => ({ ...prev, [idx]: type }));
    
    if (type === 'negative' && !reason) {
      setNegativeFeedbackIdx(idx);
      return;
    }

    try {
      await fetch('/api/assistant/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messageIndex: idx,
          feedback: type,
          reason,
          userMessage: userMsg?.content,
          inaraReply: msg.content
        }),
      });
      setNegativeFeedbackIdx(null);
    } catch (e) {
      console.error("Feedback failed:", e);
    }
  };

  const handleRefresh = async (index) => {
    const userMsg = messages[index - 1];
    if (userMsg && userMsg.role === 'user') {
      setMessages(prev => prev.slice(0, index));
      handleSend(null, userMsg.content);
    }
  };

  const confirmNavigation = async () => {
    if (!navPending) return;
    const targetPath = navPending.path;
    if (!isAuthenticated && targetPath.startsWith('/inventory')) {
      router.push(`/auth/login`);
      setNavPending(null);
      onClose();
      return;
    }
    const tour = tourMapping[targetPath];
    setIsNavigating(true);
    onClose(); 
    if (tour) {
      startTour(targetPath, () => { setIsNavigating(false); setNavPending(null); }, pathname, (p) => router.push(p));
    } else {
      router.push(targetPath);
      setIsNavigating(false);
      setNavPending(null);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "Just now";
    return dayjs(date).fromNow();
  };

  return (
    <>
      <style jsx global>{`
        .inara-click-ripple { position: fixed; width: 40px; height: 40px; background: rgba(255, 120, 45, 0.4); border-radius: 50%; transform: translate(-50%, -50%) scale(0); animation: inara-ripple 0.8s ease-out; pointer-events: none; z-index: 9999; }
        @keyframes inara-ripple { to { transform: translate(-50%, -50%) scale(4); opacity: 0; } }
      `}</style>

      {!isOpen && mounted && (
        <motion.button
          initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} whileHover={{ scale: 1.1 }} whileActive={{ scale: 0.9 }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-inara'))}
          className={`fixed right-6 z-[1110] w-12 h-12 bg-[#081422] text-white rounded-2xl shadow-xl shadow-slate-900/20 flex items-center justify-center group border border-white/10 bottom-24 ${isHomePage ? "md:bottom-28" : "md:bottom-6"}`}
        >
          <Bot size={22} className="group-hover:scale-110 transition-transform text-[#ff782d]" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff782d] rounded-full border-2 border-white animate-pulse"></span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[1200]" />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 30, stiffness: 250 }} 
              className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-white shadow-2xl z-[1300] flex flex-col border-l border-slate-100 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-[2rem] overflow-hidden" 
            >
              
              {/* Header - Chatbase Style */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-black text-white z-[1310]">
                <div className="flex items-center gap-3">
                  {view === 'history' ? (
                    <button onClick={() => setView('chat')} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={18} /></button>
                  ) : (
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10"><Bot size={18} className="text-[#ff782d]" /></div>
                  )}
                  <div>
                    <h2 className="font-bold text-[15px] tracking-tight">{view === 'history' ? 'Recent chats' : 'Inara AI Assistant'}</h2>
                    {view !== 'history' && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Always online</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                          animate={{ opacity: 1, scale: 1, y: 0 }} 
                          exit={{ opacity: 0, scale: 0.95, y: 10 }} 
                          className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-[1500]" 
                        >
                          <button onClick={handleStartNewChat} className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors">
                            <Plus size={14} className="text-[#ff782d]" />
                            <span className="text-[13px] font-bold">New Chat</span>
                          </button>
                          <button onClick={() => { setView('history'); setIsMenuOpen(false); }} className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors">
                            <History size={14} className="text-[#ff782d]" />
                            <span className="text-[13px] font-bold">History</span>
                          </button>
                          <button onClick={() => { setView('memory'); setIsMenuOpen(false); }} className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors">
                            <Brain size={14} className="text-[#ff782d]" />
                            <span className="text-[13px] font-bold">Memories</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={18} /></button>
                </div>
              </div>

              {/* Chat Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-8 bg-white relative">
                
                {view === 'memory' ? (
                  <MemoryManager userId={user?.id} onClose={() => setView('chat')} />
                ) : view === 'history' ? (
                  <div className="space-y-3">
                    {loadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <RefreshCcw className="animate-spin text-[#ff782d]" size={24} />
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading chats...</p>
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4"><Clock size={24} className="text-slate-300" /></div>
                        <h3 className="text-slate-900 font-bold text-sm mb-1">No chats yet</h3>
                        <p className="text-slate-500 text-[12px]">Your recent conversations will appear here.</p>
                      </div>
                    ) : (
                      chatHistory.map((session, idx) => (
                        <motion.button 
                          key={session.sessionId}
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                          onClick={() => handleSelectHistory(session)}
                          className="w-full text-left p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-slate-900 text-[13px] line-clamp-1 flex-1 pr-4">{session.summary || "Untitled Chat"}</h4>
                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{getTimeAgo(session.updatedAt)}</span>
                          </div>
                          <p className="text-[12px] text-slate-500 line-clamp-1 opacity-70">
                            Inara: {session.messages[session.messages.length - 1]?.content || "..."}
                          </p>
                        </motion.button>
                      ))
                    )}
                    <div className="pt-6 flex justify-center">
                       <button onClick={handleStartNewChat} className="px-6 py-2.5 bg-black text-white rounded-lg text-[12px] font-bold shadow-lg hover:bg-slate-900 active:scale-95 flex items-center gap-2">
                         <Plus size={14} /> Start a new chat
                       </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col justify-between py-10">
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-[2rem] max-w-[85%]">
                            <p className="text-[14px] text-slate-700 leading-relaxed">Hi 👋 looking to get the most out of Invexix?</p>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-[2rem] max-w-[85%]">
                            <p className="text-[14px] text-slate-700 leading-relaxed">Tell me what you're trying to do and I'll guide you through it in real-time.</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <button onClick={() => handleSend(null, "How can Inara help me?")} className="px-4 py-2 border border-slate-200 rounded-full text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">How can Inara help me?</button>
                            <button onClick={() => handleSend(null, "How do I add a product?")} className="px-4 py-2 border border-slate-200 rounded-full text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">How do I add a product?</button>
                            <button onClick={() => handleSend(null, "Can I see a demo?")} className="px-4 py-2 border border-slate-200 rounded-full text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">Can I see a demo?</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col group ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] px-4 py-2 rounded-[2rem] relative transition-all ${msg.role === "user" ? "bg-black text-white rounded-tr-none" : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none"}`}>
                          <div className="text-[14px] leading-relaxed">
                              {msg.role === "assistant" 
                                ? <InaraResponse 
                                    content={msg.content} 
                                    onSuggestionsFound={(s) => {
                                      if (idx === messages.length - 1) {
                                        setCurrentSuggestions(s);
                                        setShowSuggestions(true);
                                      }
                                    }} 
                                  /> 
                                : <div className="whitespace-pre-wrap">{msg.content}</div>
                              }
                          </div>
                        </div>
                        
                        {/* Message Actions & Time */}
                        <div className={`flex items-center gap-3 mt-2 px-1 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-400 font-medium">{getTimeAgo(msg.timestamp)}</span>
                              {msg.usage && (
                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">
                                  {msg.usage.total_tokens || (msg.usage.input_tokens + msg.usage.output_tokens)} tokens
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleCopy(msg.content, idx)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-black transition-all">
                                    {copiedId === idx ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                                </button>
                                
                                {msg.role === 'user' && (
                                    <button onClick={() => handleEdit(msg.content, idx)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-black transition-all">
                                        <Edit2 size={13} />
                                    </button>
                                )}
                                
                                {msg.role === 'assistant' && (
                                    <>
                                        <button onClick={() => handleRefresh(idx)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-black transition-all">
                                            <RefreshCcw size={13} />
                                        </button>
                                        <button onClick={() => handleFeedback(idx, 'positive')} className={`p-1.5 hover:bg-slate-100 rounded-lg transition-all ${feedbackState[idx] === 'positive' ? 'text-emerald-500' : 'text-slate-400 hover:text-black'}`}>
                                            <ThumbsUp size={13} fill={feedbackState[idx] === 'positive' ? 'currentColor' : 'none'} />
                                        </button>
                                        <button onClick={() => handleFeedback(idx, 'negative')} className={`p-1.5 hover:bg-slate-100 rounded-lg transition-all ${feedbackState[idx] === 'negative' ? 'text-red-500' : 'text-slate-400 hover:text-black'}`}>
                                            <ThumbsDown size={13} fill={feedbackState[idx] === 'negative' ? 'currentColor' : 'none'} />
                                        </button>
                                        <ReadAloudButton text={msg.content} id={idx} tts={tts} lang={ttsLang} iconSize={13} />
                                    </>
                                )}
                                <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-black transition-all" onClick={() => tts.speak(msg.content, ttsLang)}><Volume2 size={13} /></button>
                            </div>
                        </div>

                        {msg.role === "assistant" && idx === messages.length - 1 && (
                          <div className="mt-4 flex flex-wrap gap-2 justify-start w-full">
                            <SuggestionChips 
                              suggestions={currentSuggestions} 
                              visible={showSuggestions && !loading} 
                              onSelect={(text) => handleSend(null, text)}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-[2rem] rounded-tl-none flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => ( <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> ))}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Inara is thinking...</span>
                        </div>
                      </div>
                    )}

                    {error && (
                      <AssistantNetworkError 
                        quality={error.type === 'offline' ? 'offline' : 'slow'} 
                        onRetry={error.retryFn} 
                      />
                    )}
                  </>
                )}
              </div>

              {/* Input Area */}
              {view === 'chat' && (
                <div className="px-5 pb-5 pt-2 bg-white">
                  
                  {/* Voice Recorder Card */}
                  <AnimatePresence>
                    {(isRecording || audioUrl) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="mb-4 p-4 bg-slate-900 rounded-2xl shadow-2xl border border-white/5 relative overflow-hidden"
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-[#ff782d] flex items-center justify-center text-white shadow-lg shadow-[#ff782d]/20">
                            {isRecording ? (
                              <div className="w-3 h-3 bg-white rounded-sm animate-pulse" />
                            ) : (
                              <button onClick={() => isAudioPlaying ? audioPlaybackRef.current.pause() : audioPlaybackRef.current.play()} className="hover:scale-110 transition-transform">
                                {isAudioPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                              </button>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                                {isRecording ? "Recording..." : "Voice Message"}
                              </span>
                              <span className="text-[11px] font-bold text-[#ff782d] tabular-nums">
                                {durationFormatted}
                              </span>
                            </div>
                            
                            {/* Waveform Visualization */}
                            <div className="h-8 flex items-end gap-[2px]">
                              {waveformData.map((h, i) => (
                                <motion.div 
                                  key={i} 
                                  initial={{ height: 4 }}
                                  animate={{ height: isRecording ? h : (audioUrl ? 4 : 4) }}
                                  className="flex-1 bg-white/20 rounded-full min-h-[4px]"
                                  style={{ background: i < (waveformData.length * 0.4) ? '#ff782d' : 'rgba(255,255,255,0.2)' }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={clearRecording} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                              <Trash2 size={18} />
                            </button>
                            {isRecording ? (
                              <button onClick={stopRecording} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                                <Square size={18} fill="currentColor" />
                              </button>
                            ) : (
                              <button onClick={() => handleSend(null)} className="w-10 h-10 rounded-full bg-[#ff782d] flex items-center justify-center text-white hover:bg-[#e66a25] shadow-lg shadow-[#ff782d]/20 transition-all active:scale-95">
                                <Send size={18} />
                              </button>
                            )}
                          </div>
                        </div>

                        {audioUrl && (
                          <audio 
                            ref={audioPlaybackRef} 
                            src={audioUrl} 
                            onPlay={() => setIsAudioPlaying(true)} 
                            onPause={() => setIsAudioPlaying(false)} 
                            onEnded={() => setIsAudioPlaying(false)}
                            className="hidden" 
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tour Prompt */}
                  <AnimatePresence>
                    {navPending && !isNavigating && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-slate-900 text-white rounded-xl shadow-xl flex items-center justify-between gap-4" >
                        <div className="flex items-center gap-3">
                          <Compass size={20} className="text-[#ff782d]" />
                          <p className="text-[12px] font-medium leading-tight">Start guided tour of <strong>{navPending.label}</strong>?</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setNavPending(null)} className="text-[11px] font-bold text-white/50 hover:text-white px-2 py-1 transition-colors uppercase">Skip</button>
                          <button onClick={confirmNavigation} className="bg-[#ff782d] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[#e66a25] transition-colors uppercase">Start</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 group transition-all outline-none ring-0">
                       <Paperclip size={18} className="text-slate-400 cursor-pointer hover:text-black ml-1" onClick={() => fileInputRef.current.click()} />
                       <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(e)} 
                        placeholder="Ask me anything..." 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] font-medium text-slate-800 placeholder:text-slate-400 py-1" 
                       />
                       <Mic size={18} className={`cursor-pointer transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-black'}`} onClick={isRecording ? stopRecording : startRecording} />
                    </div>
                    <button 
                      onClick={handleSend} 
                      disabled={!input.trim() || loading} 
                      className={`p-3 rounded-xl transition-all shadow-sm ${input.trim() ? "bg-black text-white hover:bg-slate-900 scale-100" : "bg-slate-100 text-slate-300 scale-95"}`}
                    >
                      <Send size={18} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
                    <Shield size={10} />
                    <span>By chatting, you agree to our <span className="underline cursor-pointer hover:text-slate-600">privacy policy</span></span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
