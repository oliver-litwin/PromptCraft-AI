/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  Sparkles, 
  Code, 
  MessageSquare, 
  Palette, 
  Brain, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowRight,
  Loader2,
  Terminal,
  ChevronRight,
  History,
  Settings2,
  Share2,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  Mail,
  Lock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { optimizePrompt, OptimizationMode } from './services/geminiService';
import { cn } from './utils';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

const MODES: { id: OptimizationMode; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { 
    id: 'general', 
    label: 'General', 
    icon: MessageSquare, 
    description: 'Everyday tasks',
    color: 'bg-blue-500'
  },
  { 
    id: 'coding', 
    label: 'Coding', 
    icon: Code, 
    description: 'Dev context',
    color: 'bg-indigo-600'
  },
  { 
    id: 'creative', 
    label: 'Creative', 
    icon: Palette, 
    description: 'Art & Writing',
    color: 'bg-purple-500'
  },
  { 
    id: 'logical', 
    label: 'Logical', 
    icon: Brain, 
    description: 'Reasoning',
    color: 'bg-emerald-500'
  },
];

function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] p-8 ios-shadow"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5 text-black/40 dark:text-white/40" />
            </button>

            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-sm text-black/40 dark:text-white/40 mt-1">
                {isLogin ? 'Sign in to sync your prompts' : 'Join PromptCraft AI today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 dark:text-white/20" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-black/5 dark:bg-white/5 border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 dark:text-white/20" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-black/5 dark:bg-white/5 border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium px-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#1C1C1E] dark:bg-white dark:text-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-bold text-blue-600"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<OptimizationMode>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'input' | 'output'>('input');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleOptimize = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await optimizePrompt(input, mode);
      setOutput(result);
      setView('output');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleReset = () => {
    setInput('');
    setOutput('');
    setError(null);
    setView('input');
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F2F2F7] dark:bg-black selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
      {/* iOS Status Bar Spacer */}
      <div className="h-12 bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-30" />

      {/* Header */}
      <header className="px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 sticky top-12 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1C1C1E] dark:text-white">PromptCraft</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-black/30 dark:text-white/30">AI Studio Pro</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-black/40" /> : <Sun className="w-5 h-5 text-white/40" />}
          </button>
          {user ? (
            <button 
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-500/60" />
            </button>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <UserIcon className="w-5 h-5 text-black/40 dark:text-white/40" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          {view === 'input' ? (
            <motion.div 
              key="input-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-8"
            >
              {/* Mode Selector - Horizontal Scroll */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Engine Mode</h2>
                  <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">v26.4.0</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "flex-shrink-0 w-32 p-4 rounded-2xl border transition-all text-left ios-shadow",
                        mode === m.id 
                          ? "bg-white dark:bg-[#1C1C1E] border-blue-500 ring-2 ring-blue-500/10" 
                          : "bg-white dark:bg-[#1C1C1E] border-transparent opacity-60 grayscale-[0.5]"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center mb-3 text-white shadow-sm",
                        m.color
                      )}>
                        <m.icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm block dark:text-white">{m.label}</span>
                      <span className="text-[10px] text-black/40 dark:text-white/40 mt-0.5 leading-tight block">
                        {m.description}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Input Area */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Input Prompt</h2>
                  <button 
                    onClick={handleReset}
                    className="text-[10px] font-bold text-black/30 dark:text-white/30 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    CLEAR
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe what you want to achieve..."
                    className="w-full h-72 p-6 bg-white dark:bg-[#1C1C1E] border-transparent rounded-[2rem] ios-shadow focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg leading-relaxed placeholder:text-black/20 dark:placeholder:text-white/10 dark:text-white resize-none"
                  />
                  <div className="absolute bottom-6 right-6 flex items-center gap-2">
                    <div className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] font-mono text-black/30 dark:text-white/30">
                      {input.length} chars
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl ios-shadow text-xs font-bold text-black/60 dark:text-white/60">
                  <History className="w-4 h-4" />
                  History
                </button>
                <button className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl ios-shadow text-xs font-bold text-black/60 dark:text-white/60">
                  <Share2 className="w-4 h-4" />
                  Templates
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="output-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-6"
            >
              <div className="flex items-center justify-between px-1">
                <button 
                  onClick={() => setView('input')}
                  className="text-xs font-bold text-blue-600 flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to Editor
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ios-shadow",
                      copied ? "bg-emerald-500 text-white" : "bg-white dark:bg-[#1C1C1E] text-black/60 dark:text-white/60"
                    )}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-[#1C1C1E] dark:bg-[#111111] rounded-[2.5rem] p-8 min-h-[400px] shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                <div className="flex items-center gap-2 mb-6 opacity-30">
                  <Terminal className="w-4 h-4 text-white" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white">Optimized Output</span>
                </div>
                <div className="markdown-body text-white/90 text-sm leading-relaxed font-mono">
                  <Markdown>{output}</Markdown>
                </div>
              </div>

              <div className="p-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-[2rem] border border-blue-500/10">
                <h4 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Insights
                </h4>
                <p className="text-xs text-blue-900/60 dark:text-blue-100/60 leading-relaxed">
                  This prompt was optimized using the <span className="font-bold">{mode}</span> engine. It focuses on reducing hallucination risks and improving instruction following.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button / Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F2F2F7] dark:from-black via-[#F2F2F7]/90 dark:via-black/90 to-transparent z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleOptimize}
            disabled={isLoading || !input.trim()}
            className={cn(
              "w-full h-16 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-[0.96]",
              isLoading || !input.trim()
                ? "bg-black/10 dark:bg-white/10 text-black/20 dark:text-white/20 cursor-not-allowed shadow-none"
                : "bg-[#1C1C1E] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-white/90"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                {view === 'output' ? 'Re-Optimize' : 'Craft Prompt'}
                <ArrowRight className="w-5 h-5 opacity-30" />
              </>
            )}
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <style>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          color: #fff;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 700;
          font-family: var(--font-sans);
        }
        .markdown-body p {
          margin-bottom: 1em;
        }
        .markdown-body ul, .markdown-body ol {
          margin-bottom: 1em;
          padding-left: 1.25em;
        }
        .markdown-body li {
          margin-bottom: 0.5em;
        }
        .markdown-body code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-size: 90%;
          color: #60A5FA;
        }
        .markdown-body strong {
          color: #fff;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
