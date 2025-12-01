import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, GraduationCap, Users, Plus, CheckCircle, Clock, FileText, LogOut, 
  Sparkles, Upload, ChevronRight, ChevronLeft, MessageSquare, Award, Bell, 
  Megaphone, ClipboardList, X, PlayCircle, School, Layout, Layers, Send, Bot, 
  Calendar, PieChart, Briefcase, DoorOpen, ArrowLeft, ArrowRight, Menu, 
  MoreVertical, RefreshCw, Search, Filter, Moon, Sun, Camera, Mail, Phone, 
  MapPin, User as UserIcon, Trash2, Edit2, TrendingUp, AlertCircle, Activity, 
  CalendarCheck, Zap, Wand2, Calculator, Globe, Palette, Scale, Lock, Eye, 
  EyeOff, Fingerprint, MessageCircle, Check, XCircle, Info, CheckCheck, Scan, 
  MoreHorizontal, Bookmark, Timer, UserCheck, Building2, ArrowUpRight, ArrowDownLeft,
  Star, Trophy, Target, Rocket, Instagram, Twitter, Facebook, Linkedin, Map,
  CheckSquare, ArrowDown, BrainCircuit, BarChart3, Settings, UserPlus, FileCheck,
  Laptop, Paperclip, Mic, Video, VideoOff, MicOff, PhoneOff, Headphones, ShieldCheck,
  Smartphone, Monitor, Lightbulb
} from 'lucide-react';
import { 
  User, UserRole, Assignment, Submission, SubmissionStatus, 
  Announcement, Notification, Exam, Question, ExamResult, ChatMessage,
  StudySession, Project, AttendanceRecord, Conversation, Message, MessageType, CallSession
} from './types';
import { generateAssignmentIdea, generateFeedbackSuggestion, generateQuizQuestions, chatWithStudentAssistant } from './services/geminiService';

// Firebase Imports
import { db, auth } from './services/firebase';

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'luxury' | 'gold', isLoading?: boolean }> = ({ 
  children, variant = 'primary', className = '', isLoading, ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-5 py-3 rounded-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] text-sm tracking-wide cursor-pointer select-none";
  
  const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:bg-brand-700 border border-transparent hover:-translate-y-0.5",
    secondary: "bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 backdrop-blur-md",
    outline: "bg-transparent border-2 border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 hover:shadow-glow",
    ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:shadow-red-500/30",
    luxury: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-1 border-0 ring-offset-black",
    gold: "bg-gradient-to-b from-[#FCD34D] to-[#F59E0B] text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] border border-yellow-300 hover:-translate-y-1"
  };

  return (
    <button type="button" className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

const SidebarItem: React.FC<{
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
  badge?: number;
  role?: UserRole;
}> = ({ icon: Icon, label, active, onClick, collapsed, badge, role }) => {
  const activeGradient = role === UserRole.INSTRUCTOR 
    ? 'from-amber-500 to-orange-600 shadow-orange-500/30' 
    : 'from-brand-600 to-indigo-600 shadow-brand-500/30';
  
  const activeRing = role === UserRole.INSTRUCTOR
    ? 'ring-orange-400/50'
    : 'ring-brand-400/50';

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center py-3.5 rounded-2xl transition-all duration-300 mb-2 overflow-hidden cursor-pointer select-none
      ${collapsed ? 'w-14 mx-auto justify-center px-0' : 'mx-3 px-4 w-auto'}
      ${active 
          ? `bg-gradient-to-r ${activeGradient} text-white shadow-lg ring-1 ${activeRing}` 
          : 'text-gray-500 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {active && (
         <>
           <div className="absolute inset-0 bg-white/20 blur-xl opacity-30 mix-blend-overlay"></div>
           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white/10 to-transparent"></div>
         </>
      )}

      <div className="relative flex items-center justify-center z-10 shrink-0">
        <Icon size={20} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-300 ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`} />
        
        {badge !== undefined && badge > 0 && (
          <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse`}>
            {badge}
          </span>
        )}
      </div>
      
      {!collapsed && (
        <span className={`ml-3 font-medium text-sm tracking-wide z-10 whitespace-nowrap overflow-hidden transition-all opacity-100 ${active ? 'font-bold text-white drop-shadow-sm' : ''}`}>
            {label}
        </span>
      )}
    </button>
  );
};

const DashboardCard: React.FC<{
  title: string; value: string; subtitle: string; icon: React.ElementType; trend?: string; colorClass: string; className?: string;
}> = ({ title, value, subtitle, icon: Icon, trend, colorClass, className = '' }) => (
  <div className={`glass-panel p-6 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 ${className} border-t border-white/20`}>
        <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-all duration-500 ${colorClass.replace('text-', 'bg-')}`}></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 text-current shadow-sm group-hover:shadow-md transition-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10`}><Icon size={24} /></div>
                {trend && <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${trend.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'} border border-transparent`}>{trend}</span>}
            </div>
            <div>
                <h3 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-1 tracking-tighter">{value}</h3>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</p>
                <div className="h-1 w-full bg-gray-200 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
                   <div className={`h-full ${colorClass.replace('text-', 'bg-')} w-2/3 rounded-full opacity-80`}></div>
                </div>
            </div>
        </div>
    </div>
);

const EmptyState: React.FC<{ icon: React.ElementType, title: string, description: string, action?: React.ReactNode }> = ({ icon: Icon, title, description, action }) => (
    <div className="glass-panel p-16 rounded-[3rem] flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-200 dark:border-white/10 group hover:border-brand-500/30 transition-colors duration-500 bg-gray-50/30 dark:bg-white/5">
        <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner ring-1 ring-black/5 dark:ring-white/10">
            <Icon size={48} className="group-hover:text-brand-500 transition-colors" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-500 max-w-sm mb-10 leading-relaxed text-lg">{description}</p>
        {action}
    </div>
);

const Marquee: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="w-full overflow-hidden bg-white/5 border-y border-white/10 py-4 mb-20 backdrop-blur-sm">
    <div className="animate-scroll whitespace-nowrap flex gap-12 text-gray-400 font-bold uppercase tracking-widest text-sm items-center">
      {items.map((item, i) => <span key={i} className="flex items-center gap-2"><Star size={12} className="text-amber-500"/> {item}</span>)}
      {items.map((item, i) => <span key={`dup-${i}`} className="flex items-center gap-2"><Star size={12} className="text-amber-500"/> {item}</span>)}
      {items.map((item, i) => <span key={`dup2-${i}`} className="flex items-center gap-2"><Star size={12} className="text-amber-500"/> {item}</span>)}
    </div>
  </div>
);

// --- Landing Page with Integrated Auth Modal ---
const LandingPage: React.FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [loginRole, setLoginRole] = useState<UserRole>(UserRole.STUDENT);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', tcNo: '', className: '', field: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openAuth = (mode: 'LOGIN' | 'REGISTER') => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
        setError(null);
    };

    const handleAuthSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            if (authMode === 'LOGIN') {
                const userCredential = await auth.signInWithEmailAndPassword(loginForm.email, loginForm.password);
                const userDoc = await db.collection("users").doc(userCredential.user!.uid).get();
                if (userDoc.exists) {
                    onLoginSuccess({ id: userDoc.id, ...userDoc.data() } as User);
                } else {
                    setError("Kullanıcı verisi bulunamadı.");
                }
            } else {
                const userCredential = await auth.createUserWithEmailAndPassword(registerForm.email, registerForm.password);
                const userData: User = {
                    id: userCredential.user!.uid,
                    name: registerForm.name,
                    role: loginRole,
                    email: registerForm.email,
                    pin: '', // Not used with Firebase Auth but kept for interface type
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.name}`,
                    tcNo: registerForm.tcNo,
                    className: loginRole === UserRole.STUDENT ? registerForm.className : undefined,
                    field: loginRole === UserRole.STUDENT ? registerForm.field : undefined
                };
                await db.collection("users").doc(userCredential.user!.uid).set(userData);
                onLoginSuccess(userData);
            }
        } catch (err: any) {
            console.error(err);
            setError("Giriş/Kayıt başarısız: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden selection:bg-amber-500 selection:text-white scroll-smooth font-sans">
             {/* DARK BACKGROUND */}
             <div className="fixed inset-0 pointer-events-none z-0">
                 {/* Dark Grid Pattern */}
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                 
                 {/* Subtle Blobs */}
                 <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] animate-blob"></div>
                 <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
            </div>

             <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
                 <div className="container mx-auto px-6 py-5 flex justify-between items-center">
                     <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                         <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20 shadow-sm shadow-brand-500/10">
                             <GraduationCap size={20} className="text-brand-500" />
                         </div>
                         <span className="text-xl font-black tracking-tight flex items-center gap-1 text-white">Enid<span className="text-brand-500">AI</span></span>
                     </div>
                     <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-widest text-gray-400">
                         <button onClick={() => scrollToSection('features')} className="hover:text-brand-500 hover:scale-105 transition-all">Teknoloji</button>
                         <button onClick={() => scrollToSection('stats')} className="hover:text-brand-500 hover:scale-105 transition-all">Başarılar</button>
                         <button onClick={() => scrollToSection('about')} className="hover:text-brand-500 hover:scale-105 transition-all">Kurumsal</button>
                     </div>
                     <div className="flex gap-4">
                         <Button onClick={() => openAuth('LOGIN')} variant="ghost" className="text-gray-400 hover:bg-white/10 hover:text-white h-10 px-6 hidden sm:flex text-xs font-bold uppercase tracking-widest">Giriş</Button>
                         <Button onClick={() => openAuth('REGISTER')} variant="luxury" className="h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-500/20">Başvur</Button>
                     </div>
                 </div>
             </nav>

             {/* HERO SECTION */}
             <div className="relative z-10 container mx-auto px-6 pt-40 md:pt-48 pb-20">
                 <div className="flex flex-col lg:flex-row items-center gap-20">
                     <div className="flex-1 space-y-10 animate-in slide-in-from-left-8 fade-in duration-1000 text-center lg:text-left">
                         <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow">
                             <Sparkles size={12} /> Geleceğin Eğitim Standartı
                         </div>
                         <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-white">
                             Eğitimin <br/>
                             <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">Dijital Zirvesi.</span>
                         </h1>
                         <p className="text-xl text-gray-400 max-w-2xl leading-relaxed font-light mx-auto lg:mx-0">
                             Yapay zeka, kurumunuzun DNA'sına işleniyor. Veri odaklı analiz, kişiselleştirilmiş koçluk ve kusursuz yönetim tek bir lüks panelde.
                         </p>
                         <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
                             <Button onClick={() => openAuth('REGISTER')} variant="luxury" className="h-16 px-12 text-lg rounded-full">Hemen Başla</Button>
                             <Button onClick={() => scrollToSection('features')} variant="outline" className="h-16 px-12 text-lg rounded-full hover:bg-white/5 text-white border-white/20">
                                <PlayCircle className="mr-3" size={20} /> Özellikleri Keşfet
                             </Button>
                         </div>
                     </div>
                     
                     <div className="flex-1 w-full perspective-1000 hidden lg:block">
                         {/* 3D FLOATING CARD COMPOSITION */}
                         <div className="relative w-full aspect-[4/5] rotate-y-12 transition-transform duration-700 hover:rotate-y-0 transform-style-3d group">
                              {/* Back Glow */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-indigo-500 blur-[80px] opacity-20"></div>
                              
                              {/* Main Card */}
                              <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-[#0f172a]/60 backdrop-blur-xl shadow-2xl overflow-hidden z-10 ring-1 ring-white/5">
                                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-50"></div>
                                   <div className="p-8 h-full flex flex-col relative z-20">
                                       <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                           <div className="flex gap-2">
                                               <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                               <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                           </div>
                                           <div className="text-xs font-mono text-gray-500">SYSTEM: ONLINE</div>
                                       </div>
                                       <div className="flex-1 relative">
                                            {/* Floating Elements inside card */}
                                            <div className="absolute top-0 right-0 p-4 bg-[#020617] rounded-2xl border border-white/10 text-green-400 text-xs font-bold animate-float shadow-lg">
                                                <TrendingUp size={16} className="mb-1"/> +%35 Başarı Artışı
                                            </div>
                                            <div className="absolute bottom-10 left-0 right-0 p-6 bg-white/5 rounded-3xl border border-white/10 shadow-xl backdrop-blur-md">
                                                <div className="flex gap-4 items-center mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 p-[2px]"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="rounded-full bg-black"/></div>
                                                    <div>
                                                        <div className="h-2 w-24 bg-white/20 rounded-full mb-2"></div>
                                                        <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full w-[80%] bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                                                </div>
                                            </div>
                                            <img src="https://cdni.iconscout.com/illustration/premium/thumb/artificial-intelligence-robotic-hand-touching-digital-brain-concept-illustration-download-in-svg-png-gif-file-formats--technology-ai-pack-science-illustrations-4384666.png" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 opacity-90 mix-blend-color-dodge" alt="AI Brain"/>
                                       </div>
                                   </div>
                              </div>
                         </div>
                     </div>
                 </div>
             </div>

             {/* MARQUEE */}
             <div className="border-y border-white/10 bg-[#020617]/50 backdrop-blur-sm relative z-20">
                 <div className="container mx-auto py-4">
                     <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Kazandıran Başarılar</p>
                 </div>
                 <Marquee items={["ODTÜ Bilgisayar", "İTÜ Mimarlık", "Boğaziçi İşletme", "Koç Tıp", "Bilkent Hukuk", "Galatasaray Üniversitesi", "Stanford Kabul", "MIT Kabul"]} />
             </div>

             {/* FEATURES SECTION (Bento Grid) */}
             <div id="features" className="container mx-auto px-6 py-32 relative z-10">
                 <div className="text-center max-w-3xl mx-auto mb-20">
                     <h2 className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">Teknoloji</h2>
                     <h3 className="text-5xl font-black mb-6 tracking-tighter text-white">Eğitimin İşletim Sistemi</h3>
                     <p className="text-gray-400 text-lg">Enid AI, her öğrenciyi benzersiz bir veri noktası olarak ele alır ve potansiyellerini maksimize eder.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                      {/* Large Card */}
                      <div className="md:col-span-2 row-span-2 bg-white/5 rounded-[2.5rem] relative overflow-hidden group shadow-xl border border-white/10 cursor-pointer hover:border-brand-500/30 transition-colors" onClick={() => openAuth('REGISTER')}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                          <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" alt="Data"/>
                          <div className="relative z-10 p-10 h-full flex flex-col justify-end">
                              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-500/30"><BrainCircuit size={32}/></div>
                              <h4 className="text-4xl font-black text-white mb-2">Neural Learning Engine™</h4>
                              <p className="text-gray-400 text-lg max-w-md">Her öğrencinin öğrenme hızını ve stilini analiz eden, sürekli öğrenen yapay zeka motoru.</p>
                          </div>
                      </div>

                      {/* Small Cards */}
                      <div className="bg-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:bg-white/10 transition-all border border-white/10 cursor-pointer" onClick={() => openAuth('REGISTER')}>
                           <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-brand-500 border border-blue-500/20"><Smartphone size={24}/></div>
                           <div>
                               <h4 className="text-xl font-bold text-white mb-2">Mobil Veli Ağı</h4>
                               <p className="text-gray-500 text-sm">Veliler için şeffaf, anlık ve detaylı raporlama.</p>
                           </div>
                      </div>
                      
                      <div className="bg-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:bg-white/10 transition-all border border-white/10 cursor-pointer" onClick={() => openAuth('REGISTER')}>
                           <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 border border-green-500/20"><ShieldCheck size={24}/></div>
                           <div>
                               <h4 className="text-xl font-bold text-white mb-2">Kurumsal Güvenlik</h4>
                               <p className="text-gray-500 text-sm">Biyometrik yoklama ve uçtan uca şifreli veri koruması.</p>
                           </div>
                      </div>
                      
                      {/* Wide Low Card */}
                      <div className="md:col-span-2 bg-white/5 p-8 rounded-[2.5rem] flex items-center gap-8 relative overflow-hidden border border-white/10 shadow-lg cursor-pointer hover:border-brand-500/30 transition-all" onClick={() => openAuth('REGISTER')}>
                           <div className="absolute top-0 right-0 p-8 opacity-5 text-white"><Monitor size={200}/></div>
                           <div className="flex-1 relative z-10">
                               <h4 className="text-2xl font-bold text-white mb-2">Hibrit Sınav Merkezi</h4>
                               <p className="text-gray-400">Türkiye geneli deneme sınavları ve online testlerin tek merkezden yönetimi.</p>
                           </div>
                           <div className="hidden md:block w-32 h-32 bg-gradient-to-tr from-brand-500 to-indigo-500 rounded-full blur-[50px] opacity-30"></div>
                      </div>
                 </div>
             </div>

             {/* STATS STRIP */}
             <div id="stats" className="container mx-auto px-6 py-20 relative z-10">
                 <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-md">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
                          {[
                            { num: "12K+", label: "Analiz Edilen Soru", icon: FileCheck },
                            { num: "%98", label: "Yerleştirme Oranı", icon: Trophy },
                            { num: "45", label: "Partner Kurum", icon: Building2 },
                            { num: "24/7", label: "Aktif Sistem", icon: Activity }
                          ].map((stat, i) => (
                            <div key={i} className="text-center px-4 group">
                               <h3 className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">{stat.num}</h3>
                               <p className="text-xs font-bold uppercase tracking-widest text-amber-500">{stat.label}</p>
                            </div>
                          ))}
                     </div>
                 </div>
             </div>

             {/* ABOUT SECTION */}
             <div id="about" className="container mx-auto px-6 py-32 relative z-10">
                 <div className="flex flex-col lg:flex-row items-center gap-20">
                     <div className="flex-1">
                         <h2 className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">Hakkımızda</h2>
                         <h3 className="text-5xl font-black mb-8 tracking-tighter text-white">Biz Sadece Yazılım Üretmiyoruz,<br/>Geleceği Kodluyoruz.</h3>
                         <p className="text-gray-400 text-lg leading-relaxed mb-6">Enid AI, eğitim kurumlarının yönetimsel yükünü yapay zeka ile %90 azaltarak, asıl odak noktası olan "öğretmeye" zaman kazandırır.</p>
                         <p className="text-gray-400 text-lg leading-relaxed mb-10">Veri analitiği, öngörüsel modelleme ve kişiselleştirilmiş öğrenme rotaları ile her öğrencinin potansiyelini zirveye taşıyoruz.</p>
                         <Button onClick={() => openAuth('REGISTER')} variant="gold" className="px-10 h-14 text-lg">Bize Katılın</Button>
                     </div>
                     <div className="flex-1 grid grid-cols-2 gap-6">
                         <div className="space-y-6 mt-12">
                             <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" className="rounded-[2rem] w-full h-64 object-cover opacity-80 hover:opacity-100 transition-opacity border border-white/10" alt="Team"/>
                             <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2670&auto=format&fit=crop" className="rounded-[2rem] w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity border border-white/10" alt="Campus"/>
                         </div>
                         <div className="space-y-6">
                             <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop" className="rounded-[2rem] w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity border border-white/10" alt="Meeting"/>
                             <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop" className="rounded-[2rem] w-full h-64 object-cover opacity-80 hover:opacity-100 transition-opacity border border-white/10" alt="Tech"/>
                         </div>
                     </div>
                 </div>
             </div>

             {/* FOOTER */}
             <footer className="border-t border-white/10 bg-[#020617] pt-24 pb-12 relative z-10">
                 <div className="container mx-auto px-6">
                     <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                         <div className="max-w-md">
                             <div className="flex items-center gap-3 mb-8">
                                 <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20">
                                     <GraduationCap size={20} className="text-brand-500" />
                                 </div>
                                 <span className="text-2xl font-black text-white">Enid<span className="text-brand-500">AI</span></span>
                             </div>
                             <p className="text-gray-400 leading-relaxed mb-8 text-lg font-light">
                                 Eğitim kurumlarının dijital dönüşümündeki stratejik ortağınız. Geleceği inşa edenler için tasarlandı.
                             </p>
                             <div className="flex gap-4">
                                 {[Twitter, Instagram, Linkedin, Facebook].map((Icon, i) => (
                                     <a key={i} href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-300 hover:-translate-y-1"><Icon size={20}/></a>
                                 ))}
                             </div>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                             <div>
                                 <h4 className="text-white font-bold mb-6">Platform</h4>
                                 <ul className="space-y-4 text-gray-500 text-sm font-medium">
                                     <li><button onClick={() => scrollToSection('features')} className="hover:text-brand-500 transition-colors">Özellikler</button></li>
                                     <li><button onClick={() => scrollToSection('features')} className="hover:text-brand-500 transition-colors">Entegrasyonlar</button></li>
                                     <li><button onClick={() => scrollToSection('about')} className="hover:text-brand-500 transition-colors">Fiyatlandırma</button></li>
                                     <li><button onClick={() => scrollToSection('features')} className="hover:text-brand-500 transition-colors">Güvenlik</button></li>
                                 </ul>
                             </div>
                             <div>
                                 <h4 className="text-white font-bold mb-6">Şirket</h4>
                                 <ul className="space-y-4 text-gray-500 text-sm font-medium">
                                     <li><button onClick={() => scrollToSection('about')} className="hover:text-brand-500 transition-colors">Hakkımızda</button></li>
                                     <li><button onClick={() => scrollToSection('about')} className="hover:text-brand-500 transition-colors">Kariyer</button></li>
                                     <li><button onClick={() => scrollToSection('about')} className="hover:text-brand-500 transition-colors">Blog</button></li>
                                     <li><button onClick={() => scrollToSection('about')} className="hover:text-brand-500 transition-colors">İletişim</button></li>
                                 </ul>
                             </div>
                         </div>
                     </div>
                     <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wider">
                         <p>© 2024 Enid AI Inc. All rights reserved.</p>
                         <div className="flex gap-8">
                             <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
                             <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
                         </div>
                     </div>
                 </div>
             </footer>

             {/* AUTH MODAL - Dark/Premium Overlay to keep focus */}
             {isAuthModalOpen && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
                     <div className="relative w-full max-w-5xl h-[700px] bg-[#020617] rounded-[3rem] shadow-2xl flex overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500 ring-1 ring-white/5 relative">
                          {/* Animated Background inside Modal */}
                         <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px] animate-blob"></div>
                            <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
                         </div>

                         {/* Close Button */}
                         <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5 cursor-pointer">
                             <X size={20} />
                         </button>
                         
                         {/* Left Side (Visual) */}
                         <div className="hidden lg:flex w-5/12 bg-black relative flex-col justify-between p-12 text-white overflow-hidden border-r border-white/5 z-10">
                             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                             <div className="relative z-10 mt-auto">
                                 <h2 className="text-4xl font-black tracking-tighter mb-4 text-white">Geleceğe <br/>Hoş Geldin.</h2>
                                 <p className="text-gray-400 text-sm font-light leading-relaxed">Enid AI ile potansiyelini keşfet. Giriş yaparak eğitim yolculuğuna başla.</p>
                             </div>
                         </div>

                         {/* Right Side (Form) */}
                         <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center relative z-10">
                             <div className="max-w-md mx-auto w-full">
                                 <div className="mb-10 text-center">
                                     <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-glow"><UserIcon size={24} className="text-amber-500"/></div>
                                     <h2 className="text-3xl font-black text-white tracking-tight">{authMode === 'LOGIN' ? 'Hesabına Giriş Yap' : 'Yeni Hesap Oluştur'}</h2>
                                 </div>
                                 
                                 {error && <div className="mb-4 p-3 bg-red-500/20 text-red-500 rounded-xl text-sm font-bold text-center">{error}</div>}

                                 <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/10">
                                      <button onClick={() => setLoginRole(UserRole.STUDENT)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${loginRole === UserRole.STUDENT ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Öğrenci</button>
                                      <button onClick={() => setLoginRole(UserRole.INSTRUCTOR)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${loginRole === UserRole.INSTRUCTOR ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Eğitmen</button>
                                  </div>

                                  {authMode === 'LOGIN' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-2">E-posta</label>
                                            <input type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]" placeholder="ornek@enid.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-2">Şifre</label>
                                            <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]" placeholder="••••••" />
                                        </div>
                                        <Button onClick={handleAuthSubmit} variant="gold" className="w-full py-5 text-lg font-bold mt-4 rounded-2xl" disabled={loading || !loginForm.email || !loginForm.password} isLoading={loading}>Giriş Yap</Button>
                                    </div>
                                  ) : (
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        <input placeholder="Ad Soyad" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all" />
                                        <input type="email" placeholder="E-posta" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all" />
                                        {loginRole === UserRole.STUDENT && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <select value={registerForm.className} onChange={e => setRegisterForm({...registerForm, className: e.target.value})} className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 bg-black focus:border-amber-500/50 outline-none"><option value="">Sınıf</option><option value="12-A">12-A</option><option value="11-B">11-B</option></select>
                                                <select value={registerForm.field} onChange={e => setRegisterForm({...registerForm, field: e.target.value})} className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 bg-black focus:border-amber-500/50 outline-none"><option value="">Alan</option><option value="Sayısal">Sayısal</option><option value="EA">EA</option></select>
                                            </div>
                                        )}
                                        <input type="password" placeholder="Şifre Belirle" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all" />
                                        <Button onClick={handleAuthSubmit} variant="gold" className="w-full py-5 text-lg font-bold rounded-2xl" disabled={loading || !registerForm.name || !registerForm.email || !registerForm.password} isLoading={loading}>Kayıt Ol</Button>
                                    </div>
                                  )}
                                  <div className="mt-8 text-center">
                                      <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="text-sm font-bold text-gray-500 hover:text-amber-400 uppercase tracking-widest transition-colors">{authMode === 'LOGIN' ? 'Hesap Oluştur' : 'Giriş Yap'}</button>
                                  </div>
                             </div>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
}

const CallOverlay: React.FC<{ session: CallSession, onEnd: () => void }> = ({ session, onEnd }) => {
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0f172a]/95 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                 <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-brand-600 rounded-full blur-[120px] animate-pulse"></div>
                 <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>
             </div>

             <div className="relative z-10 flex flex-col items-center">
                 <div className="relative mb-12">
                     <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-brand-500 to-indigo-500 shadow-glow-lg animate-pulse-slow">
                        <img src={session.participantAvatar} className="w-full h-full rounded-full object-cover border-4 border-[#0f172a]" alt=""/>
                     </div>
                     <div className="absolute -bottom-2 -right-2 p-3 bg-green-500 rounded-full border-4 border-[#0f172a] shadow-lg animate-bounce">
                        {session.type === 'video' ? <Video size={20} className="text-white"/> : <Phone size={20} className="text-white"/>}
                     </div>
                 </div>
                 
                 <h2 className="text-4xl font-black text-white mb-2">{session.participantName}</h2>
                 <p className="text-brand-400 font-bold uppercase tracking-widest text-sm mb-12">{formatTime(timer)} • {session.type === 'video' ? 'Görüntülü Arıyor' : 'Sesli Arıyor'}</p>
                 
                 <div className="flex items-center gap-6">
                     <button onClick={() => setMuted(!muted)} className={`p-6 rounded-full transition-all duration-300 ${muted ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                         {muted ? <MicOff size={32}/> : <Mic size={32}/>}
                     </button>
                     <button onClick={onEnd} className="p-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/40 transform hover:scale-105 transition-all">
                         <PhoneOff size={40} fill="currentColor"/>
                     </button>
                     {session.type === 'video' && (
                        <button onClick={() => setCameraOff(!cameraOff)} className={`p-6 rounded-full transition-all duration-300 ${cameraOff ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                            {cameraOff ? <VideoOff size={32}/> : <Video size={32}/>}
                        </button>
                     )}
                 </div>
             </div>
        </div>
    );
};


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Added loading state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // --- DATA STATES (Connected to Firebase) ---
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  
  // These are still mock/local for simplicity in this demo but could be easily connected
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // --- UI STATES ---
  const [isModalOpen, setIsModalOpen] = useState<{type: string, isOpen: boolean}>({type: '', isOpen: false});
  const [formData, setFormData] = useState<any>({});
  
  // Filtering
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(null);
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string | null>(null);

  // Chat State (AI)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'model', text: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Messaging State (Human)
  const [conversations, setConversations] = useState<Conversation[]>([
      {
          id: '1', participantId: '2', participantName: 'Ahmet Yılmaz', participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet', participantRole: UserRole.INSTRUCTOR,
          lastMessage: 'Ödevi kontrol ettim.', unreadCount: 1, status: 'active',
          messages: [
              { id: 'm1', senderId: '2', text: 'Merhaba, nasılsın?', messageType: 'text', timestamp: new Date().toISOString() },
              { id: 'm2', senderId: '1', text: 'İyiyim hocam, siz?', messageType: 'text', timestamp: new Date().toISOString() }
          ]
      }
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Calling State
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);

  // Exam Taking State
  const [activeExamSession, setActiveExamSession] = useState<{exam: Exam, currentQuestion: number, answers: Record<string, string>, timeLeft: number} | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // AI Assignment State
  const [assignmentTopic, setAssignmentTopic] = useState('');
  const [generatedAssignment, setGeneratedAssignment] = useState<{title: string, description: string} | null>(null);
  const [isGeneratingAssignment, setIsGeneratingAssignment] = useState(false);

  // --- FIREBASE SUBSCRIPTIONS ---
  useEffect(() => {
    // Auth Listener
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
            const userDoc = await db.collection("users").doc(currentUser.uid).get();
            if (userDoc.exists) {
                setUser({ id: userDoc.id, ...userDoc.data() } as User);
            }
        } else {
            setUser(null);
        }
        setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!user) return;

      // Subscribe to Students
      const unsubStudents = db.collection("users").where("role", "==", UserRole.STUDENT)
        .onSnapshot((snapshot) => {
          setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User)));
        });

      // Subscribe to Assignments
      const unsubAssignments = db.collection("assignments").orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
          setAssignments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)));
        });

      // Subscribe to Exams
      const unsubExams = db.collection("exams").orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
          setExams(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam)));
        });

      // Subscribe to Announcements
      const unsubAnnouncements = db.collection("announcements").orderBy("date", "desc")
        .onSnapshot((snapshot) => {
          setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        });

      // Subscribe to Classes
      const unsubClasses = db.collection("classes").onSnapshot((snapshot) => {
          setClasses(snapshot.docs.map(d => d.data().name));
      });

       // Subscribe to Fields
       const unsubFields = db.collection("fields").onSnapshot((snapshot) => {
          setFields(snapshot.docs.map(d => d.data().name));
      });

      // Subscribe to Study Sessions
      const unsubStudy = db.collection("studySessions").onSnapshot((snapshot) => {
          setStudySessions(snapshot.docs.map(d => ({id: d.id, ...d.data()} as StudySession)));
      });

      return () => {
          unsubStudents();
          unsubAssignments();
          unsubExams();
          unsubAnnouncements();
          unsubClasses();
          unsubFields();
          unsubStudy();
      };
  }, [user]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Exam Timer
  useEffect(() => {
    if (activeExamSession && activeExamSession.timeLeft > 0) {
      const timer = setInterval(() => {
        setActiveExamSession(prev => prev ? {...prev, timeLeft: prev.timeLeft - 1} : null);
      }, 1000);
      return () => clearInterval(timer);
    } else if (activeExamSession && activeExamSession.timeLeft === 0) {
      submitExam();
    }
  }, [activeExamSession?.timeLeft]);

  const handleLogout = async () => { 
      await auth.signOut();
      setUser(null); 
      setActiveTab('dashboard'); 
      setChatMessages([]); 
  };
  const handleBackToDashboard = () => setActiveTab('dashboard');

  // --- ACTIONS (FIREBASE) ---
  const handleAddStudent = async () => {
      // Note: In a real app, adding a student usually triggers an email invite or cloud function to create Auth user.
      // Here we simulate by just adding to Firestore so they appear in list, but they can't login until they register.
      // Or we can use a secondary admin app to create users.
      // For this demo, we assume Students self-register via the landing page or we just store data here.
      alert("Öğrenci kaydı ana sayfadan yapılmalıdır. Bu panel sadece veri görüntüleme amaçlıdır (Demo).");
      setIsModalOpen({type: '', isOpen: false});
      setFormData({});
  };

  const handleDeleteStudent = async (id: string) => {
      if (confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) {
          await db.collection("users").doc(id).delete();
      }
  };

  const handleFilterByClass = (className: string) => {
      setSelectedClassFilter(className);
      setActiveTab('students');
  };

  const handleFilterByField = (field: string) => {
      setSelectedFieldFilter(field);
      setActiveTab('students');
  };

  const handleAddAssignment = async () => {
      const newAssign: Omit<Assignment, 'id'> = {
          title: generatedAssignment?.title || formData.title,
          description: generatedAssignment?.description || formData.description,
          subject: formData.subject || 'Genel',
          dueDate: formData.dueDate,
          createdBy: user!.id,
          createdAt: new Date().toISOString()
      };
      await db.collection("assignments").add(newAssign);
      setGeneratedAssignment(null);
      setIsModalOpen({type: '', isOpen: false});
      setFormData({});
  };

  const handleAddExam = async () => {
     const mockQuestions: Question[] = Array(5).fill(null).map((_, i) => ({
         id: i.toString(),
         text: `Soru ${i+1}: Bu bir deneme sorusudur. Doğru cevap A şıkkıdır.`,
         type: 'MULTIPLE_CHOICE',
         options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'],
         correctAnswer: 'Cevap A',
         points: 20
     }));
     const newExam: Omit<Exam, 'id'> = {
         title: formData.title,
         description: formData.description,
         subject: formData.subject,
         durationMinutes: parseInt(formData.duration),
         questions: mockQuestions,
         createdBy: user!.id,
         createdAt: new Date().toISOString()
     };
     await db.collection("exams").add(newExam);
     setIsModalOpen({type: '', isOpen: false});
     setFormData({});
  };

  const handleAddStudy = async () => {
      const newStudy: Omit<StudySession, 'id'> = {
          subject: formData.subject,
          teacherName: formData.teacherName,
          date: formData.date,
          time: formData.time,
          location: 'Etüt Odası 3',
          status: 'UPCOMING'
      };
      await db.collection("studySessions").add(newStudy);
      setIsModalOpen({type: '', isOpen: false});
  };

  const handleAddAnnouncement = async () => {
      const newAnnouncement: Omit<Announcement, 'id'> = {
          title: formData.title,
          content: formData.content,
          date: new Date().toISOString(),
          authorName: user!.name,
          priority: 'NORMAL'
      };
      await db.collection("announcements").add(newAnnouncement);
      setIsModalOpen({type:'', isOpen:false});
  };

  const handleAddClass = async () => {
      await db.collection("classes").add({ name: formData.name });
      setIsModalOpen({type:'', isOpen:false});
  };

  const handleAddField = async () => {
      await db.collection("fields").add({ name: formData.name });
      setIsModalOpen({type:'', isOpen:false});
  };

  const handleStartExam = (exam: Exam) => {
      setActiveExamSession({
          exam,
          currentQuestion: 0,
          answers: {},
          timeLeft: exam.durationMinutes * 60
      });
  };

  const handleAnswerExam = (option: string) => {
      if (!activeExamSession) return;
      setActiveExamSession({
          ...activeExamSession,
          answers: { ...activeExamSession.answers, [activeExamSession.exam.questions[activeExamSession.currentQuestion].id]: option }
      });
  };

  const submitExam = () => {
      if (!activeExamSession) return;
      let score = 0;
      let correct = 0;
      let wrong = 0;
      activeExamSession.exam.questions.forEach(q => {
          if (activeExamSession.answers[q.id] === q.correctAnswer) {
              score += q.points;
              correct++;
          } else {
              wrong++;
          }
      });
      setExamResult({
          id: Date.now().toString(),
          examId: activeExamSession.exam.id,
          studentId: user!.id,
          score, correctCount: correct, wrongCount: wrong,
          submittedAt: new Date().toISOString()
      });
      setActiveExamSession(null);
  };

  const handleGenerateAssignment = async () => {
    if (!assignmentTopic) return;
    setIsGeneratingAssignment(true);
    try {
      const result = await generateAssignmentIdea(assignmentTopic);
      setGeneratedAssignment(result);
    } catch (error) { console.error(error); } 
    finally { setIsGeneratingAssignment(false); }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const history = newMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await chatWithStudentAssistant(chatInput, history);
      setChatMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) { console.error(error); } 
    finally { setIsChatLoading(false); }
  };

  // Human Messaging Logic (Still mostly local for this demo, would need sub-collection in Firebase)
  const handleSendMessage = (type: MessageType = 'text', content?: string) => {
      if (!activeConversationId) return;
      const newMsg: Message = {
          id: Date.now().toString(),
          senderId: user!.id,
          messageType: type,
          text: type === 'text' ? messageInput : undefined,
          fileUrl: type !== 'text' ? content : undefined,
          fileName: type === 'file' ? 'odev_taslagi.pdf' : undefined,
          duration: type === 'audio' ? '0:12' : undefined,
          timestamp: new Date().toISOString()
      };
      
      setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
              return { ...c, messages: [...c.messages, newMsg], lastMessage: type === 'text' ? messageInput : (type === 'audio' ? 'Sesli mesaj' : 'Dosya gönderildi') };
          }
          return c;
      }));
      setMessageInput('');
  };

  const handleFileUpload = () => {
      // Simulation
      setTimeout(() => handleSendMessage('file', '#'), 500);
  };

  const handleVoiceRecord = () => {
      setIsRecording(!isRecording);
      if (isRecording) {
          // Finish recording
          handleSendMessage('audio', '#');
      }
  };

  const handleStartCall = (type: 'voice' | 'video', participantName: string, participantAvatar: string) => {
      setActiveCall({
          isActive: true,
          participantName,
          participantAvatar,
          type,
          status: 'calling',
          duration: 0
      });
  };

  const filteredStudents = students.filter(std => {
      if (selectedClassFilter && std.className !== selectedClassFilter) return false;
      if (selectedFieldFilter && std.field !== selectedFieldFilter) return false;
      return true;
  });

  if (isAuthLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
              <div className="flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-4"></div>
                   <div className="text-xl font-bold animate-pulse">Enid AI Yükleniyor...</div>
              </div>
          </div>
      );
  }

  if (!user) return <LandingPage onLoginSuccess={setUser} />;

  // --- RENDER CONTENT ---
  const renderContent = () => {
      if (activeExamSession) {
          const q = activeExamSession.exam.questions[activeExamSession.currentQuestion];
          return (
              <div className="flex flex-col h-full animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">{activeExamSession.exam.title}</h2>
                      <div className="px-6 py-3 bg-brand-600/10 border border-brand-600/20 text-brand-500 rounded-2xl font-mono text-xl shadow-glow">
                          {Math.floor(activeExamSession.timeLeft / 60)}:{(activeExamSession.timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                  </div>
                  <div className="flex-1 glass-panel rounded-[2.5rem] p-10 relative overflow-y-auto">
                      <div className="mb-4 text-brand-500 font-bold uppercase tracking-widest text-sm">Soru {activeExamSession.currentQuestion + 1} / {activeExamSession.exam.questions.length}</div>
                      <h3 className="text-2xl font-medium mb-10 leading-snug">{q.text}</h3>
                      <div className="space-y-4 max-w-3xl">
                          {q.options?.map((opt, i) => (
                              <button key={i} onClick={() => handleAnswerExam(opt)} 
                                className={`w-full p-5 text-left rounded-2xl border transition-all duration-300 group ${activeExamSession.answers[q.id] === opt ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10' : 'border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10'}`}>
                                  <div className="flex items-center justify-between">
                                      <span className="font-medium">{opt}</span>
                                      {activeExamSession.answers[q.id] === opt && <CheckCircle size={20} className="text-brand-500"/>}
                                  </div>
                              </button>
                          ))}
                      </div>
                      <div className="mt-10 flex justify-end">
                          {activeExamSession.currentQuestion < activeExamSession.exam.questions.length - 1 ? (
                              <Button onClick={() => setActiveExamSession({...activeExamSession, currentQuestion: activeExamSession.currentQuestion + 1})} variant="primary" className="px-8 py-4 text-lg">
                                  Sonraki Soru <ChevronRight className="ml-2" />
                              </Button>
                          ) : (
                              <Button onClick={submitExam} variant="gold" className="px-8 py-4 text-lg">
                                  Sınavı Bitir <CheckCircle className="ml-2" />
                              </Button>
                          )}
                      </div>
                  </div>
              </div>
          );
      }

      // Default Dashboard View
      return (
          <div className="animate-in fade-in duration-500">
              <header className="mb-10 flex justify-between items-center">
                  <div>
                      <h1 className="text-4xl font-black text-white mb-2">Merhaba, {user?.name.split(' ')[0]} 👋</h1>
                      <p className="text-gray-400">Bugün öğrenmek için harika bir gün.</p>
                  </div>
                  <div className="flex gap-4">
                      <Button variant="secondary" className="h-12 w-12 rounded-full p-0 flex items-center justify-center"><Bell size={20}/></Button>
                      <img src={user?.avatarUrl} className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30" alt="Profile"/>
                  </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <DashboardCard title="Genel Ort." value="84.5" subtitle="Başarılı" icon={TrendingUp} trend="+2.4" colorClass="text-brand-500" />
                  <DashboardCard title="Tamamlanan" value="12" subtitle="Ödev" icon={CheckCircle} colorClass="text-green-500" />
                  <DashboardCard title="Bekleyen" value="3" subtitle="Ödev" icon={Clock} colorClass="text-orange-500" />
                  <DashboardCard title="Sıralama" value="#4" subtitle="Sınıf" icon={Award} trend="+1" colorClass="text-purple-500" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem]">
                       <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen size={20} className="text-brand-500"/> Son Ödevler</h3>
                       <div className="space-y-4">
                           {assignments.slice(0, 3).map(a => (
                               <div key={a.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
                                   <div>
                                       <h4 className="font-bold text-white">{a.title}</h4>
                                       <p className="text-sm text-gray-500">{a.subject} • {new Date(a.dueDate).toLocaleDateString()}</p>
                                   </div>
                                   <ChevronRight className="text-gray-600"/>
                               </div>
                           ))}
                           {assignments.length === 0 && <p className="text-gray-500 text-center py-4">Henüz ödev yok.</p>}
                       </div>
                   </div>
                   <div className="glass-panel p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Megaphone size={20} className="text-amber-500"/> Duyurular</h3>
                        <div className="space-y-6">
                            {announcements.slice(0, 3).map(a => (
                                <div key={a.id} className="relative pl-6 border-l-2 border-white/10">
                                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                                    <p className="text-sm text-gray-300 mb-1">{a.content}</p>
                                    <span className="text-xs text-gray-600 font-bold uppercase">{new Date(a.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                   </div>
              </div>
          </div>
      );
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#020617] text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Sidebar */}
        <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-[#0f172a]/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 fixed h-full z-40`}>
            <div className="p-6 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                        <span className="text-lg font-black tracking-tight">Enid<span className="text-brand-500">AI</span></span>
                    </div>
                )}
                <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Menu size={20} className="text-gray-400"/>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                <div className="px-6 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest hidden md:block">{!collapsed && 'Menü'}</div>
                <SidebarItem icon={Layout} label="Panel" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={collapsed} />
                <SidebarItem icon={BookOpen} label="Ödevler" active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} collapsed={collapsed} />
                <SidebarItem icon={FileText} label="Sınavlar" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} collapsed={collapsed} />
                <SidebarItem icon={Users} label="Öğrenciler" active={activeTab === 'students'} onClick={() => setActiveTab('students')} collapsed={collapsed} role={user?.role} />
                <SidebarItem icon={Bot} label="AI Asistan" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} collapsed={collapsed} />
            </div>

            <div className="p-4 border-t border-white/10">
                <button onClick={handleLogout} className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 w-full rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors`}>
                    <LogOut size={20} />
                    {!collapsed && <span className="ml-3 font-medium">Çıkış Yap</span>}
                </button>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-72'} p-8 md:p-12`}>
            {renderContent()}
        </main>

        {/* Floating Call Overlay */}
        {activeCall && <CallOverlay session={activeCall} onEnd={() => setActiveCall(null)} />}
        
        {/* Modals would go here (simplified) */}
        {isModalOpen.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/10 w-full max-w-md">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-xl font-bold text-white">Yeni Ekle</h3>
                         <button onClick={() => setIsModalOpen({type:'', isOpen: false})}><X size={24} className="text-gray-500"/></button>
                     </div>
                     <div className="space-y-4">
                         {isModalOpen.type === 'ASSIGNMENT' && (
                             <>
                                <input placeholder="Başlık" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white" onChange={e => setFormData({...formData, title: e.target.value})} />
                                <textarea placeholder="Açıklama" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white" onChange={e => setFormData({...formData, description: e.target.value})} />
                                <input type="date" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white" onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                                <Button onClick={handleAddAssignment} className="w-full py-4">Oluştur</Button>
                                <div className="relative my-4 text-center border-t border-white/10">
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] px-2 text-xs text-gray-500">YA DA</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Yapay Zeka ile Oluştur</p>
                                    <div className="flex gap-2">
                                        <input placeholder="Konu (örn: Türev)" className="flex-1 p-3 bg-white/5 rounded-xl border border-white/10 text-white text-sm" value={assignmentTopic} onChange={e => setAssignmentTopic(e.target.value)} />
                                        <Button onClick={handleGenerateAssignment} variant="luxury" className="px-4" isLoading={isGeneratingAssignment}><Sparkles size={16}/></Button>
                                    </div>
                                    {generatedAssignment && (
                                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                            <p className="font-bold text-green-400 mb-1">{generatedAssignment.title}</p>
                                            <p className="text-xs text-green-300 line-clamp-2">{generatedAssignment.description}</p>
                                            <button onClick={() => setFormData({...formData, title: generatedAssignment.title, description: generatedAssignment.description})} className="text-xs font-bold text-green-400 mt-2 underline">Bunu Kullan</button>
                                        </div>
                                    )}
                                </div>
                             </>
                         )}
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;