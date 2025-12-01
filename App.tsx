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
import { 
  collection, addDoc, onSnapshot, query, where, deleteDoc, doc, setDoc, orderBy, getDoc 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from 'firebase/auth';

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
                const userCredential = await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
                const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
                if (userDoc.exists()) {
                    onLoginSuccess({ id: userDoc.id, ...userDoc.data() } as User);
                } else {
                    setError("Kullanıcı verisi bulunamadı.");
                }
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, registerForm.email, registerForm.password);
                const userData: User = {
                    id: userCredential.user.uid,
                    name: registerForm.name,
                    role: loginRole,
                    email: registerForm.email,
                    pin: '', // Not used with Firebase Auth but kept for interface type
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.name}`,
                    tcNo: registerForm.tcNo,
                    className: loginRole === UserRole.STUDENT ? registerForm.className : undefined,
                    field: loginRole === UserRole.STUDENT ? registerForm.field : undefined
                };
                await setDoc(doc(db, "users", userCredential.user.uid), userData);
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                setUser({ id: userDoc.id, ...userDoc.data() } as User);
            }
        } else {
            setUser(null);
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!user) return;

      // Subscribe to Students
      const qStudents = query(collection(db, "users"), where("role", "==", UserRole.STUDENT));
      const unsubStudents = onSnapshot(qStudents, (snapshot) => {
          setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      });

      // Subscribe to Assignments
      const qAssignments = query(collection(db, "assignments"), orderBy("createdAt", "desc"));
      const unsubAssignments = onSnapshot(qAssignments, (snapshot) => {
          setAssignments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)));
      });

      // Subscribe to Exams
      const qExams = query(collection(db, "exams"), orderBy("createdAt", "desc"));
      const unsubExams = onSnapshot(qExams, (snapshot) => {
          setExams(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam)));
      });

      // Subscribe to Announcements
      const qAnnouncements = query(collection(db, "announcements"), orderBy("date", "desc"));
      const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
          setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
      });

      // Subscribe to Classes
      const unsubClasses = onSnapshot(collection(db, "classes"), (snapshot) => {
          setClasses(snapshot.docs.map(d => d.data().name));
      });

       // Subscribe to Fields
       const unsubFields = onSnapshot(collection(db, "fields"), (snapshot) => {
          setFields(snapshot.docs.map(d => d.data().name));
      });

      // Subscribe to Study Sessions
      const unsubStudy = onSnapshot(collection(db, "studySessions"), (snapshot) => {
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
      await signOut(auth);
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
          await deleteDoc(doc(db, "users", id));
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
      await addDoc(collection(db, "assignments"), newAssign);
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
     await addDoc(collection(db, "exams"), newExam);
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
      await addDoc(collection(db, "studySessions"), newStudy);
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
      await addDoc(collection(db, "announcements"), newAnnouncement);
      setIsModalOpen({type:'', isOpen:false});
  };

  const handleAddClass = async () => {
      await addDoc(collection(db, "classes"), { name: formData.name });
      setIsModalOpen({type:'', isOpen:false});
  };

  const handleAddField = async () => {
      await addDoc(collection(db, "fields"), { name: formData.name });
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
                                className={`w-full p-5 text-left rounded-2xl border transition-all duration-300 group ${activeExamSession.answers[q.id] === opt ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10' : 'border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                  <div className="flex items-center gap-4">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${activeExamSession.answers[q.id] === opt ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-400 text-gray-400 group-hover:border-brand-500 group-hover:text-brand-500'}`}>
                                          {String.fromCharCode(65 + i)}
                                      </div>
                                      <span className="font-medium">{opt}</span>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="flex justify-between mt-8 px-2">
                      <Button disabled={activeExamSession.currentQuestion === 0} onClick={() => setActiveExamSession({...activeExamSession, currentQuestion: activeExamSession.currentQuestion - 1})} variant="secondary" className="px-8"><ChevronLeft className="mr-2"/> Önceki</Button>
                      {activeExamSession.currentQuestion < activeExamSession.exam.questions.length - 1 ? (
                          <Button onClick={() => setActiveExamSession({...activeExamSession, currentQuestion: activeExamSession.currentQuestion + 1})} variant="primary" className="px-8">Sonraki <ChevronRight className="ml-2"/></Button>
                      ) : (
                          <Button onClick={submitExam} variant="luxury" className="px-10">Sınavı Bitir</Button>
                      )}
                  </div>
              </div>
          );
      }
      if (examResult) {
          return (
              <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95">
                  <div className="glass-panel p-16 rounded-[3.5rem] border-brand-500/30 shadow-glow-lg max-w-2xl w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent"></div>
                      <div className="relative z-10">
                          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                             <Trophy size={48} className="text-amber-500" />
                          </div>
                          <h2 className="text-5xl font-black mb-2 tracking-tighter">Tebrikler!</h2>
                          <p className="text-gray-500 mb-10 text-lg">Sınav başarıyla tamamlandı.</p>
                          <div className="grid grid-cols-3 gap-6 mb-12">
                              <div className="p-6 rounded-3xl bg-green-500/10 border border-green-500/20">
                                  <div className="text-3xl font-black text-green-500 mb-1">{examResult.correctCount}</div>
                                  <div className="text-xs font-bold uppercase text-green-700 dark:text-green-400 tracking-widest">Doğru</div>
                              </div>
                              <div className="p-6 rounded-3xl bg-brand-500/10 border border-brand-500/20 shadow-glow">
                                  <div className="text-4xl font-black text-brand-500 mb-1">{examResult.score}</div>
                                  <div className="text-xs font-bold uppercase text-brand-700 dark:text-brand-400 tracking-widest">Puan</div>
                              </div>
                              <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20">
                                  <div className="text-3xl font-black text-red-500 mb-1">{examResult.wrongCount}</div>
                                  <div className="text-xs font-bold uppercase text-red-700 dark:text-red-400 tracking-widest">Yanlış</div>
                              </div>
                          </div>
                          <Button onClick={() => setExamResult(null)} variant="secondary" className="w-full h-14 text-lg">Panele Dön</Button>
                      </div>
                  </div>
              </div>
          );
      }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
             <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 relative glass-panel p-8 md:p-12 rounded-[2.5rem] overflow-hidden group min-h-[300px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-brand-600/20 to-transparent rounded-full blur-[100px] animate-blob"></div>
                    <div className="relative z-10">
                         <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold uppercase tracking-wider border border-brand-500/10 shadow-sm">
                                {user.role === UserRole.INSTRUCTOR ? 'Komuta Merkezi' : 'Öğrenci Portalı'}
                            </span>
                         </div>
                         <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 leading-none">
                             Merhaba, <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-500">{user.name.split(' ')[0]}</span>
                         </h2>
                         <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
                             {user.role === UserRole.INSTRUCTOR 
                                ? "Okulun tüm verileri parmaklarının ucunda. Bugün neler yapmak istersin?" 
                                : "Hedeflerine bir adım daha yaklaşmaya hazır mısın? Hadi başlayalım."}
                         </p>
                    </div>
                    <div className="relative z-10 flex gap-4 mt-8">
                        {user.role === UserRole.INSTRUCTOR ? (
                            <>
                                <Button onClick={() => { setIsModalOpen({type: 'ADD_ANNOUNCEMENT', isOpen: true}); setFormData({}); }} variant="luxury" className="px-8 shadow-glow"><Megaphone size={18} className="mr-2"/> Duyuru Yap</Button>
                                <Button onClick={() => setActiveTab('students')} variant="secondary" className="px-8">Öğrenci Ara</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => setActiveTab('exams')} variant="luxury" className="px-8 shadow-glow"><PlayCircle size={18} className="mr-2"/> Çalışmaya Başla</Button>
                                <Button onClick={() => setActiveTab('assignments')} variant="secondary" className="px-8">Ödevlerimi Gör</Button>
                            </>
                        )}
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    {user.role === UserRole.INSTRUCTOR ? (
                        <>
                           <div className="flex-1 glass-panel p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center">
                               <div className="absolute right-0 top-0 p-8 opacity-5 text-brand-500"><Users size={120}/></div>
                               <div className="text-5xl font-black mb-1">{students.length}</div>
                               <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Kayıtlı Öğrenci</div>
                           </div>
                           <div className="flex-1 glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
                               <div>
                                   <div className="text-3xl font-black mb-1 text-amber-500">%92</div>
                                   <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Günlük Katılım</div>
                               </div>
                               <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors"><Activity/></div>
                           </div>
                        </>
                    ) : (
                        <div className="h-full glass-panel p-8 rounded-[2.5rem] relative overflow-hidden bg-gradient-to-b from-brand-600 to-indigo-700 text-white flex flex-col justify-between shadow-glow">
                             <div>
                                 <div className="flex justify-between items-start mb-6">
                                     <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Target/></div>
                                     <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">Odak Modu</span>
                                 </div>
                                 <h3 className="text-2xl font-bold mb-2">Sıradaki Hedef</h3>
                                 <p className="text-brand-100 text-sm mb-6">Matematik Sınavı • Yarın 10:00</p>
                             </div>
                             <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                                 <div className="flex justify-between text-xs font-bold mb-2 opacity-80"><span>Kalan Süre</span><span>14 Saat</span></div>
                                 <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-white w-[60%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div></div>
                             </div>
                        </div>
                    )}
                </div>
                <div className="col-span-12 md:col-span-4">
                    <DashboardCard title="Sınavlar" value={exams.length.toString()} subtitle="Aktif Sınav" icon={FileText} colorClass="text-purple-500" trend="+2 Yeni" />
                </div>
                <div className="col-span-12 md:col-span-4">
                    <DashboardCard title="Ödevler" value={assignments.length.toString()} subtitle="Bekleyen" icon={BookOpen} colorClass="text-amber-500" trend="Yüksek Öncelik" />
                </div>
                <div className="col-span-12 md:col-span-4">
                    <DashboardCard title="Sınıflar" value={classes.length.toString()} subtitle="Aktif Şube" icon={School} colorClass="text-emerald-500" />
                </div>
             </div>
          </div>
        );
      
      case 'students':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-end">
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" className="h-14 w-14 rounded-full !p-0" onClick={handleBackToDashboard}><ArrowLeft/></Button>
                    <div>
                        <h2 className="text-5xl font-black tracking-tight">Öğrenciler</h2>
                        <div className="flex gap-2 mt-2">
                             {(selectedClassFilter || selectedFieldFilter) ? (
                                <div className="flex gap-2">
                                   {selectedClassFilter && <span className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-lg text-xs font-bold">{selectedClassFilter}</span>}
                                   {selectedFieldFilter && <span className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-lg text-xs font-bold">{selectedFieldFilter}</span>}
                                   <button onClick={() => { setSelectedClassFilter(null); setSelectedFieldFilter(null); }} className="text-xs text-red-400 hover:text-red-500 font-bold underline">Filtreyi Temizle</button>
                                </div>
                             ) : <p className="text-gray-500 font-medium">Toplam {students.length} öğrenci listeleniyor.</p>}
                        </div>
                    </div>
                 </div>
                 {user.role === UserRole.INSTRUCTOR && <Button onClick={() => { setIsModalOpen({type: 'ADD_STUDENT', isOpen: true}); setFormData({}); }} variant="luxury" className="h-14 px-8 shadow-glow"><UserPlus size={20} className="mr-2"/> Öğrenci Ekle</Button>}
             </div>
             
             {filteredStudents.length === 0 ? <EmptyState icon={Users} title="Liste Boş" description={students.length > 0 ? "Filtreye uygun öğrenci bulunamadı." : "Henüz sisteme kayıtlı öğrenci bulunmuyor."} /> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredStudents.map(std => (
                         <div key={std.id} className="glass-panel p-6 rounded-[2rem] flex items-center gap-5 hover:border-brand-500/30 hover:shadow-glow transition-all duration-300 group cursor-pointer relative overflow-hidden">
                             <div className="relative z-10 flex gap-4 w-full items-center">
                                 <div className="relative">
                                     <img src={std.avatarUrl} className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-black/50 object-cover group-hover:scale-105 transition-transform" alt=""/>
                                     <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-4 border-white dark:border-[#0f172a]"><Check size={12} strokeWidth={4}/></div>
                                 </div>
                                 <div className="flex-1">
                                     <h4 className="font-bold text-xl mb-1 group-hover:text-brand-500 transition-colors">{std.name}</h4>
                                     <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                         <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">{std.className}</span>
                                         <span className="bg-brand-500/10 text-brand-600 px-2 py-1 rounded-lg">{std.field}</span>
                                     </div>
                                 </div>
                                 {user.role === UserRole.INSTRUCTOR && (
                                     <div className="flex flex-col gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteStudent(std.id); }} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={16}/></button>
                                     </div>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        );

      case 'assignments':
         return (
             <div className="space-y-8 animate-in fade-in duration-500">
                 <div className="flex justify-between items-end">
                     <div className="flex items-center gap-4"><Button variant="ghost" className="h-14 w-14 rounded-full !p-0" onClick={handleBackToDashboard}><ArrowLeft/></Button><div><h2 className="text-5xl font-black tracking-tight">Ödevler</h2><p className="text-gray-500 mt-2 font-medium">Tamamlanması gereken görevler.</p></div></div>
                     {user.role === UserRole.INSTRUCTOR && <Button onClick={() => { setIsModalOpen({type: 'ADD_ASSIGNMENT', isOpen: true}); setFormData({}); setGeneratedAssignment(null); }} variant="luxury" className="h-14 px-8 shadow-glow"><Plus size={20} className="mr-2"/> Yeni Ödev</Button>}
                 </div>
                 {assignments.length === 0 ? <EmptyState icon={BookOpen} title="Ödev Yok" description="Harika! Tüm görevlerini tamamladın." /> : (
                     <div className="grid grid-cols-1 gap-4">
                         {assignments.map(ass => (
                             <div key={ass.id} className="glass-panel p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-brand-500/30 transition-all duration-500">
                                 <div className="flex gap-6 items-center">
                                     <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0 border border-brand-500/20 group-hover:scale-110 transition-transform"><BookOpen size={28}/></div>
                                     <div>
                                         <h4 className="font-bold text-2xl mb-2 group-hover:text-brand-500 transition-colors">{ass.title}</h4>
                                         <p className="text-gray-500 text-sm line-clamp-1 max-w-xl mb-3">{ass.description}</p>
                                         <div className="flex gap-3">
                                             <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl uppercase tracking-wider">{ass.subject}</span>
                                             <span className="text-xs font-bold px-3 py-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> {new Date(ass.dueDate).toLocaleDateString()}</span>
                                         </div>
                                     </div>
                                 </div>
                                 {user.role === UserRole.STUDENT ? (
                                     <Button variant="secondary" className="px-8 h-12 rounded-xl">Detay</Button>
                                 ) : (
                                     <div className="flex items-center gap-2">
                                         <div className="text-right mr-4">
                                             <div className="text-2xl font-black">0/24</div>
                                             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teslim</div>
                                         </div>
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         );

      case 'exams':
          return (
              <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex justify-between items-end">
                      <div className="flex items-center gap-4"><Button variant="ghost" className="h-14 w-14 rounded-full !p-0" onClick={handleBackToDashboard}><ArrowLeft/></Button><div><h2 className="text-5xl font-black tracking-tight">Sınavlar</h2><p className="text-gray-500 mt-2 font-medium">Bilgini test etme zamanı.</p></div></div>
                      {user.role === UserRole.INSTRUCTOR && <Button onClick={() => { setIsModalOpen({type: 'ADD_EXAM', isOpen: true}); setFormData({}); }} variant="secondary" className="h-14 px-8"><Plus size={20} className="mr-2"/> Sınav Oluştur</Button>}
                  </div>
                  {exams.length === 0 ? <EmptyState icon={FileText} title="Sınav Yok" description="Şu an aktif bir sınav bulunmuyor." /> : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {exams.map(exam => (
                              <div key={exam.id} className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 border-l-8 border-l-transparent hover:border-l-purple-500">
                                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 scale-150"><FileText size={120}/></div>
                                  <div className="relative z-10">
                                      <div className="flex justify-between items-start mb-6">
                                          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl"><FileText/></div>
                                          <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold uppercase tracking-wider">{exam.durationMinutes} Dakika</div>
                                      </div>
                                      <h3 className="text-3xl font-black mb-2">{exam.title}</h3>
                                      <p className="text-gray-500 mb-8 font-medium">{exam.subject}</p>
                                      
                                      {user.role === UserRole.STUDENT ? (
                                          <Button onClick={() => handleStartExam(exam)} variant="luxury" className="w-full h-14 shadow-lg shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/40 border-0">Sınava Başla</Button>
                                      ) : (
                                          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                                              <Info size={16}/> 5 Soru • {new Date(exam.createdAt).toLocaleDateString()}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          );
      
      case 'classes': return (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center gap-4"><Button variant="ghost" onClick={handleBackToDashboard} className="rounded-full !p-0 w-14 h-14"><ArrowLeft/></Button><div><h2 className="text-5xl font-black tracking-tight">Sınıflar</h2><p className="text-gray-500 mt-2 font-medium">Şube yönetimi ve detaylar.</p></div></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {classes.map(c => (
                      <div key={c} onClick={() => handleFilterByClass(c)} className="glass-panel p-10 rounded-[2.5rem] text-center font-black text-3xl hover:scale-105 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-glow-sm hover:shadow-glow group relative overflow-hidden">
                          <span className="bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 group-hover:from-brand-500 group-hover:to-indigo-500 relative z-10">{c}</span>
                          <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors"></div>
                      </div>
                  ))}
                  <button onClick={() => { setIsModalOpen({type: 'ADD_CLASS', isOpen: true}); setFormData({}); }} className="glass-panel p-10 rounded-[2.5rem] flex items-center justify-center hover:bg-white/10 transition-colors group border-dashed border-2 border-gray-300 dark:border-white/10">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all"><Plus size={32}/></div>
                  </button>
              </div>
          </div>
      );
      
      case 'fields': return (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center gap-4"><Button variant="ghost" onClick={handleBackToDashboard} className="rounded-full !p-0 w-14 h-14"><ArrowLeft/></Button><div><h2 className="text-5xl font-black tracking-tight">Alanlar</h2><p className="text-gray-500 mt-2 font-medium">Bölüm bazlı öğrenci dağılımı.</p></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {fields.map(f => (
                      <div key={f} onClick={() => handleFilterByField(f)} className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-2 transition-transform cursor-pointer">
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Layers size={80}/></div>
                          <h3 className="text-2xl font-bold mb-2">{f}</h3>
                          <div className="h-1 w-full bg-gray-200 dark:bg-white/5 rounded-full mt-4 mb-2"><div className="h-full bg-brand-500 w-3/4 rounded-full"></div></div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{students.filter(s => s.field === f).length} Öğrenci</p>
                      </div>
                  ))}
                  <button onClick={() => { setIsModalOpen({type: 'ADD_FIELD', isOpen: true}); setFormData({}); }} className="glass-panel p-8 rounded-[2.5rem] flex items-center justify-center border-dashed border-2 border-gray-300 dark:border-white/10 hover:border-brand-500/50 group">
                       <div className="text-gray-400 group-hover:text-brand-500 flex flex-col items-center gap-2 font-bold"><Plus size={32}/> Yeni Alan Ekle</div>
                  </button>
              </div>
          </div>
      );

      case 'study': return (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4"><Button variant="ghost" onClick={handleBackToDashboard} className="rounded-full !p-0 w-14 h-14"><ArrowLeft/></Button><div><h2 className="text-5xl font-black tracking-tight">Etütler</h2><p className="text-gray-500 mt-2 font-medium">Birebir ders ve çalışma saatleri.</p></div></div>
                  {user.role === UserRole.INSTRUCTOR && <Button onClick={() => { setIsModalOpen({type: 'ADD_STUDY', isOpen: true}); setFormData({}); }} variant="luxury" className="h-14 px-8 shadow-glow"><Plus size={20} className="mr-2"/> Etüt Planla</Button>}
              </div>
              {studySessions.length === 0 ? <EmptyState icon={Timer} title="Planlı Etüt Yok" description="Yaklaşan bir etüt programı görünmüyor." /> : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {studySessions.map(study => (
                          <div key={study.id} className="glass-panel p-6 rounded-[2rem] border-l-4 border-l-brand-500 flex flex-col gap-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                  <span>{study.date}</span>
                                  <span>{study.time}</span>
                              </div>
                              <h3 className="text-xl font-bold">{study.subject}</h3>
                              <p className="text-gray-500 text-sm">Eğitmen: {study.teacherName}</p>
                              <div className="mt-2 text-brand-500 text-xs font-bold px-3 py-1 bg-brand-500/10 rounded-lg self-start">{study.location}</div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );

      case 'ai-chat':
        return (
          <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-[3rem] overflow-hidden animate-in fade-in duration-500 border border-white/20 shadow-2xl relative">
             <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                   <Button variant="ghost" className="h-12 w-12 rounded-full !p-0 border border-gray-200 dark:border-white/10" onClick={handleBackToDashboard}><ArrowLeft size={24} /></Button>
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 animate-pulse-slow"><Bot size={24}/></div>
                   <div><h3 className="font-bold text-xl leading-tight">Enid Asistan</h3><p className="text-xs text-green-500 flex items-center gap-1 font-bold uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</p></div>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white/30 dark:bg-[#020617]/30">
                {chatMessages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                      <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-8 animate-float shadow-glow"><Bot size={64} className="text-brand-400" /></div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Merhaba! Ben Enid.</h3>
                      <p className="max-w-xs mx-auto">Sana derslerinde, ödevlerinde veya herhangi bir konuda nasıl yardımcı olabilirim?</p>
                   </div>
                )}
                {chatMessages.map((msg, idx) => (
                   <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-500`}>
                      <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-br from-brand-600 to-indigo-600 text-white rounded-tr-sm shadow-brand-500/20' : 'glass-panel text-gray-800 dark:text-gray-200 rounded-tl-sm border border-white/20'}`}>{msg.text}</div>
                   </div>
                ))}
                {isChatLoading && <div className="flex justify-start"><div className="glass-panel px-6 py-4 rounded-3xl rounded-tl-sm flex gap-2 items-center"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400"></span></div></div>}
             </div>
             <form onSubmit={handleChatSubmit} className="p-6 border-t border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl z-10">
                <div className="flex gap-4 items-end">
                   <div className="flex-1 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/5 rounded-[2rem] px-6 py-4 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all shadow-inner">
                       <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Bir mesaj yaz..." className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 text-lg"/>
                   </div>
                   <Button type="submit" disabled={isChatLoading || !chatInput.trim()} className="h-16 w-16 rounded-[1.5rem] !p-0 shadow-lg shadow-brand-500/30 hover:scale-105"><Send size={28} className="ml-1"/></Button>
                </div>
             </form>
          </div>
        );

      case 'messages':
        return (
            <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in duration-500">
                {/* Users List */}
                <div className="w-full md:w-1/3 glass-panel rounded-[2.5rem] p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <Button variant="ghost" className="h-10 w-10 rounded-full !p-0" onClick={handleBackToDashboard}><ArrowLeft size={20}/></Button>
                        <h2 className="text-2xl font-black">Mesajlar</h2>
                    </div>
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                        <input placeholder="Kişi ara..." className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {conversations.map(conv => (
                            <div key={conv.id} onClick={() => setActiveConversationId(conv.id)} className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${activeConversationId === conv.id ? 'bg-brand-500/10 border border-brand-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                                <img src={conv.participantAvatar} className="w-12 h-12 rounded-xl object-cover" alt=""/>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-bold truncate">{conv.participantName}</h4>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                                {conv.unreadCount > 0 && <span className="w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 glass-panel rounded-[2.5rem] flex flex-col overflow-hidden relative border border-white/20">
                     {activeConversationId ? (
                         <>
                             {/* Chat Header */}
                             <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                                 <div className="flex items-center gap-4">
                                     <img src={conversations.find(c => c.id === activeConversationId)?.participantAvatar} className="w-12 h-12 rounded-xl object-cover" alt=""/>
                                     <div>
                                         <h3 className="font-bold text-lg">{conversations.find(c => c.id === activeConversationId)?.participantName}</h3>
                                         <span className="text-xs text-green-500 font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Müsait</span>
                                     </div>
                                 </div>
                                 <div className="flex gap-2">
                                     <button onClick={() => handleStartCall('voice', conversations.find(c => c.id === activeConversationId)?.participantName!, conversations.find(c => c.id === activeConversationId)?.participantAvatar!)} className="p-3 rounded-xl bg-white/5 hover:bg-brand-500 hover:text-white transition-colors"><Phone size={20}/></button>
                                     <button onClick={() => handleStartCall('video', conversations.find(c => c.id === activeConversationId)?.participantName!, conversations.find(c => c.id === activeConversationId)?.participantAvatar!)} className="p-3 rounded-xl bg-white/5 hover:bg-brand-500 hover:text-white transition-colors"><Video size={20}/></button>
                                 </div>
                             </div>

                             {/* Chat Messages */}
                             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
                                 {conversations.find(c => c.id === activeConversationId)?.messages.map(msg => (
                                     <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                         <div className={`max-w-[70%] p-4 rounded-2xl ${msg.senderId === user.id ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'}`}>
                                             {msg.messageType === 'text' && <p>{msg.text}</p>}
                                             {msg.messageType === 'file' && (
                                                 <div className="flex items-center gap-3 p-2 bg-black/20 rounded-xl">
                                                     <div className="p-2 bg-white/10 rounded-lg"><FileText size={20}/></div>
                                                     <div className="flex-1 overflow-hidden">
                                                         <p className="text-sm font-bold truncate">{msg.fileName}</p>
                                                         <p className="text-[10px] opacity-70">PDF Dosyası</p>
                                                     </div>
                                                 </div>
                                             )}
                                             {msg.messageType === 'audio' && (
                                                 <div className="flex items-center gap-3 min-w-[150px]">
                                                     <button className="p-2 bg-white/20 rounded-full hover:bg-white/30"><PlayCircle size={20}/></button>
                                                     <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-white"></div></div>
                                                     <span className="text-xs font-bold">{msg.duration}</span>
                                                 </div>
                                             )}
                                             <span className="text-[10px] opacity-50 block text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>

                             {/* Chat Input */}
                             <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-md">
                                 <div className="flex items-center gap-2 bg-black/20 p-2 rounded-[2rem] border border-white/5">
                                     <button onClick={handleFileUpload} className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><Paperclip size={20}/></button>
                                     <input 
                                        value={messageInput}
                                        onChange={e => setMessageInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSendMessage('text')}
                                        placeholder="Mesaj yazın..." 
                                        className="flex-1 bg-transparent outline-none px-2 text-white placeholder-gray-500"
                                     />
                                     <button 
                                        onClick={handleVoiceRecord}
                                        className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                     >
                                         <Mic size={20}/>
                                     </button>
                                     <button onClick={() => handleSendMessage('text')} className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/20"><Send size={20}/></button>
                                 </div>
                             </div>
                         </>
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-500">
                             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4"><MessageSquare size={48} className="opacity-50"/></div>
                             <p>Sohbet başlatmak için bir kişi seçin.</p>
                         </div>
                     )}
                </div>
            </div>
        );

      case 'announcements':
          return (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4"><Button variant="ghost" className="h-14 w-14 rounded-full !p-0" onClick={handleBackToDashboard}><ArrowLeft/></Button><div><h2 className="text-5xl font-black tracking-tight">Duyurular</h2><p className="text-gray-500 mt-2 font-medium">Güncel bilgilendirmeler.</p></div></div>
                    {user.role === UserRole.INSTRUCTOR && <Button onClick={() => {setIsModalOpen({type:'ADD_ANNOUNCEMENT', isOpen:true}); setFormData({});}} variant="luxury" className="h-14 px-8 shadow-glow">Yeni Duyuru</Button>}
                </div>
                {announcements.length === 0 ? <EmptyState icon={Megaphone} title="Duyuru Yok" description="Şu an için yeni bir bildirim yok."/> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {announcements.map(a => (
                            <div key={a.id} className="glass-panel p-8 rounded-[2.5rem] hover:border-brand-500/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${a.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{a.priority === 'HIGH' ? 'Önemli' : 'Bilgi'}</span>
                                    <span className="text-xs text-gray-400 font-bold">{new Date(a.date).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{a.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{a.content}</p>
                                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-400">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10"></div>
                                    {a.authorName}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          );

      case 'attendance':
          return (
              <div className="space-y-8 animate-in fade-in">
                  <div className="flex items-center gap-4"><Button variant="ghost" className="h-14 w-14 rounded-full !p-0" onClick={handleBackToDashboard}><ArrowLeft/></Button><div><h2 className="text-5xl font-black tracking-tight">Giriş Çıkış</h2><p className="text-gray-500 mt-2 font-medium">Kampüs erişim kayıtları.</p></div></div>
                  {user.role === UserRole.STUDENT ? (
                      <div className="glass-panel p-16 rounded-[3.5rem] text-center max-w-2xl mx-auto shadow-glow relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent"></div>
                          <div className="relative z-10">
                              <div className="w-40 h-40 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10 relative group cursor-pointer hover:border-brand-500/50 transition-colors">
                                  <div className="absolute inset-0 rounded-full border-t-4 border-brand-500 animate-spin-slow opacity-50"></div>
                                  <Fingerprint size={80} className="text-brand-500 group-hover:scale-110 transition-transform"/>
                              </div>
                              <h3 className="text-3xl font-black mb-4">Yoklama Al</h3>
                              <p className="text-gray-500 mb-10">QR kodunu okutarak veya biyometrik doğrulama ile giriş yap.</p>
                              <div className="flex gap-4 justify-center">
                                  <Button variant="luxury" className="h-16 px-12 text-lg rounded-[2rem]">Giriş Yap</Button>
                                  <Button variant="secondary" className="h-16 px-12 text-lg rounded-[2rem]">Çıkış Yap</Button>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div>
                          {students.length === 0 ? <EmptyState icon={DoorOpen} title="Log Kaydı" description="Öğrenci olmadığı için kayıt yok."/> : (
                             <div className="glass-panel p-8 rounded-[2.5rem] overflow-hidden">
                                 <table className="w-full text-left">
                                     <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                         <tr>
                                             <th className="p-4 rounded-l-xl">Öğrenci</th>
                                             <th className="p-4">Giriş Saati</th>
                                             <th className="p-4">Durum</th>
                                             <th className="p-4 rounded-r-xl">Konum</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-white/5">
                                         {students.map((s, idx) => (
                                             <tr key={s.id} className="group hover:bg-white/5 transition-colors">
                                                 <td className="p-4 font-bold">{s.name}</td>
                                                 <td className="p-4 text-gray-500">08:3{idx}</td>
                                                 <td className="p-4"><span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold uppercase">Okulda</span></td>
                                                 <td className="p-4 text-gray-500">Ana Kapı</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                          )}
                      </div>
                  )}
              </div>
          );

      default: return <div className="p-20 text-center text-gray-500 glass-panel rounded-[3rem]">Bu modül geliştirme aşamasındadır.</div>;
    }
  };

  return (
    <div className={`min-h-screen flex bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 bg-noise overflow-hidden ${darkMode ? 'dark' : ''}`}>
       <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[150px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
       </div>
       
       {activeCall && <CallOverlay session={activeCall} onEnd={() => setActiveCall(null)} />}

       <aside className={`${collapsed ? 'w-28' : 'w-80'} my-6 ml-6 rounded-[3rem] bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 flex flex-col transition-all duration-500 relative z-40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-x-hidden`}>
          <div className={`${collapsed ? 'p-6' : 'p-10'} flex items-center justify-center gap-4 mb-4 relative transition-all duration-300`}>
             <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 shrink-0 border border-white/10 group cursor-pointer hover:scale-105 transition-transform duration-300">
                <GraduationCap size={28} />
             </div>
             {!collapsed && (
               <span className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Enid<span className="text-brand-500">AI</span></span>
             )}
          </div>

          <div className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar space-y-2">
             {user.role === UserRole.INSTRUCTOR ? (
                <>
                  <SidebarItem role={user.role} icon={Layout} label="Komuta Merkezi" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={collapsed} />
                  <div className={`px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-8 ${collapsed ? 'text-center' : ''}`}>{!collapsed ? 'Yönetim' : '•'}</div>
                  <SidebarItem role={user.role} icon={Users} label="Öğrenciler" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setSelectedClassFilter(null); setSelectedFieldFilter(null); }} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={School} label="Sınıflar" active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={Layers} label="Alanlar" active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} collapsed={collapsed} />
                  <div className={`px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-8 ${collapsed ? 'text-center' : ''}`}>{!collapsed ? 'İletişim' : '•'}</div>
                  <SidebarItem role={user.role} icon={Megaphone} label="Duyurular" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={MessageCircle} label="Mesajlar" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} collapsed={collapsed} badge={1} />
                  <div className={`px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-8 ${collapsed ? 'text-center' : ''}`}>{!collapsed ? 'Akademik' : '•'}</div>
                  <SidebarItem role={user.role} icon={BookOpen} label="Ödevler" active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={FileText} label="Sınavlar" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={Timer} label="Etütler" active={activeTab === 'study'} onClick={() => setActiveTab('study')} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={DoorOpen} label="Giriş Çıkış" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} collapsed={collapsed} />
                </>
             ) : (
                <>
                  <SidebarItem role={user.role} icon={Layout} label="Panelim" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={collapsed} />
                  <div className={`px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-8 ${collapsed ? 'text-center' : ''}`}>{!collapsed ? 'Dersler' : '•'}</div>
                  <SidebarItem role={user.role} icon={BookOpen} label="Ödevlerim" active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} collapsed={collapsed} badge={2} />
                  <SidebarItem role={user.role} icon={FileText} label="Sınavlar" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={Bot} label="AI Asistan" active={activeTab === 'ai-chat'} onClick={() => setActiveTab('ai-chat')} collapsed={collapsed} />
                  <div className={`px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-8 ${collapsed ? 'text-center' : ''}`}>{!collapsed ? 'Kampüs' : '•'}</div>
                  <SidebarItem role={user.role} icon={MessageCircle} label="Eğitmenler" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={DoorOpen} label="Giriş Çıkış" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} collapsed={collapsed} />
                  <SidebarItem role={user.role} icon={Timer} label="Etütler" active={activeTab === 'study'} onClick={() => setActiveTab('study')} collapsed={collapsed} />
                </>
             )}
          </div>
          
          <div className="p-4 mx-4 mb-6 bg-white/40 dark:bg-black/20 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-inner backdrop-blur-md relative z-50">
             {!collapsed && (
               <div className="flex items-center gap-4 mb-6 px-2">
                 <img src={user.avatarUrl} className="w-12 h-12 rounded-2xl border-2 border-brand-500/50" alt="User"/>
                 <div className="overflow-hidden"><p className="text-sm font-bold truncate text-gray-900 dark:text-white">{user.name}</p><p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Online</p></div>
               </div>
             )}
             <div className={`flex ${collapsed ? 'flex-col gap-4' : 'justify-between gap-2'}`}>
                 <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-2xl hover:bg-white/10 text-gray-500 hover:text-amber-500 transition-colors bg-white/5 border border-white/5">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
                 <button onClick={() => setCollapsed(!collapsed)} className="p-3 rounded-2xl hover:bg-white/10 text-gray-500 hover:text-brand-500 transition-colors bg-white/5 border border-white/5">{collapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}</button>
                 <button onClick={handleLogout} className="p-3 rounded-2xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors bg-white/5 border border-white/5"><LogOut size={20}/></button>
             </div>
          </div>
       </aside>

       <main className="flex-1 m-6 rounded-[3.5rem] relative z-10 flex flex-col h-[calc(100vh-3rem)] overflow-hidden">
          <header className="px-10 py-6 flex justify-between items-center bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl rounded-[3rem] mb-6 border border-white/20 dark:border-white/5 shadow-sm mx-2 mt-2">
             <div className="flex items-center gap-4 flex-1">
                <div className="hidden md:flex items-center gap-3 bg-white/40 dark:bg-black/20 px-6 py-3.5 rounded-[2rem] border border-transparent focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all w-80 group shadow-inner">
                    <Search size={20} className="text-gray-400 group-focus-within:text-brand-500 transition-colors"/>
                    <input placeholder="Global Arama (Cmd + K)" className="bg-transparent outline-none text-sm w-full font-medium placeholder-gray-500"/>
                </div>
             </div>
             <div className="flex items-center gap-8">
                <button className="relative p-3.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 group"><Bell size={22} className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors"/><span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0f172a] animate-pulse"></span></button>
                <div className="h-10 w-[1px] bg-gray-200 dark:bg-white/10 mx-2"></div>
                <div className="flex items-center gap-4 group cursor-pointer">
                   <div className="text-right hidden sm:block"><p className="font-bold text-sm leading-none text-gray-900 dark:text-white">{user.name}</p><p className="text-[10px] font-bold text-brand-500 mt-1.5 uppercase tracking-widest">{user.role}</p></div>
                   <div className="p-[3px] rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-500 shadow-glow"><img src={user.avatarUrl} className="w-12 h-12 rounded-[0.9rem] bg-black border-2 border-white dark:border-[#0f172a]" alt="Profile" /></div>
                </div>
             </div>
          </header>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6">{renderContent()}</div>
       </main>

       {/* GLOBAL MODALS */}
       {isModalOpen.isOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
               <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[3rem] p-10 relative shadow-2xl animate-in zoom-in-95 ring-1 ring-white/5">
                   <button onClick={() => setIsModalOpen({...isModalOpen, isOpen: false})} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20}/></button>
                   <h2 className="text-3xl font-black mb-8 tracking-tight">
                       {isModalOpen.type === 'ADD_STUDENT' && 'Yeni Öğrenci'}
                       {isModalOpen.type === 'ADD_ASSIGNMENT' && 'Ödev Oluştur'}
                       {isModalOpen.type === 'ADD_EXAM' && 'Sınav Hazırla'}
                       {isModalOpen.type === 'ADD_ANNOUNCEMENT' && 'Duyuru Yayınla'}
                       {isModalOpen.type === 'ADD_CLASS' && 'Sınıf Ekle'}
                       {isModalOpen.type === 'ADD_FIELD' && 'Alan Ekle'}
                       {isModalOpen.type === 'ADD_STUDY' && 'Etüt Planla'}
                   </h2>
                   
                   <div className="space-y-5">
                       {isModalOpen.type === 'ADD_STUDENT' && (
                           <>
                              <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl text-sm mb-4">
                                  Not: Öğrenci ekleme işlemi bu demo panelinde pasiftir. Öğrenciler ana sayfadan "Kayıt Ol" diyerek sisteme dahil olmalıdır.
                              </div>
                              <input placeholder="Ad Soyad" disabled className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none text-gray-500 cursor-not-allowed"/>
                              <Button onClick={handleAddStudent} variant="luxury" className="w-full h-16 text-lg mt-4 opacity-50">Öğrenciyi Kaydet</Button>
                           </>
                       )}
                       {isModalOpen.type === 'ADD_ASSIGNMENT' && (
                           <>
                               <div className="flex gap-3">
                                   <input placeholder="AI ile Konu (Örn: Türev)" value={assignmentTopic} onChange={e => setAssignmentTopic(e.target.value)} className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                                   <Button onClick={handleGenerateAssignment} isLoading={isGeneratingAssignment} variant="secondary" className="px-6 rounded-2xl h-auto">AI Üret</Button>
                               </div>
                               {generatedAssignment && <div className="p-5 bg-brand-500/10 rounded-2xl border border-brand-500/20 text-sm mb-2 animate-in slide-in-from-top-2"><span className="font-bold text-brand-500 block mb-1">AI Önerisi:</span>{generatedAssignment.title}</div>}
                               <input placeholder="Başlık" value={generatedAssignment?.title || formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <textarea placeholder="Açıklama" value={generatedAssignment?.description || formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 h-32 outline-none focus:border-brand-500"/>
                               <input type="date" onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <Button onClick={handleAddAssignment} variant="luxury" className="w-full h-16 text-lg mt-4">Oluştur</Button>
                           </>
                       )}
                       {isModalOpen.type === 'ADD_EXAM' && (
                           <>
                               <input placeholder="Sınav Başlığı" onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <input placeholder="Konu" onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <input placeholder="Süre (Dakika)" type="number" onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <Button onClick={handleAddExam} variant="luxury" className="w-full h-16 text-lg mt-4">Sınavı Başlat</Button>
                           </>
                       )}
                       {isModalOpen.type === 'ADD_ANNOUNCEMENT' && (
                           <>
                               <input placeholder="Duyuru Başlığı" onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <textarea placeholder="İçerik" onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 h-32 outline-none focus:border-brand-500"/>
                               <Button onClick={handleAddAnnouncement} variant="luxury" className="w-full h-16 text-lg mt-4">Yayınla</Button>
                           </>
                       )}
                       {isModalOpen.type === 'ADD_CLASS' && (
                           <>
                               <input placeholder="Sınıf Adı (Örn: 10-C)" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <Button onClick={handleAddClass} variant="luxury" className="w-full h-16 text-lg mt-4">Sınıf Ekle</Button>
                           </>
                       )}
                       {isModalOpen.type === 'ADD_FIELD' && (
                           <>
                               <input placeholder="Alan Adı (Örn: Yabancı Dil)" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <Button onClick={handleAddField} variant="luxury" className="w-full h-16 text-lg mt-4">Alan Ekle</Button>
                           </>
                       )}
                       {isModalOpen.type === 'ADD_STUDY' && (
                           <>
                               <input placeholder="Ders/Konu" onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <input placeholder="Eğitmen Adı" onChange={e => setFormData({...formData, teacherName: e.target.value})} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-brand-500"/>
                               <div className="flex gap-4">
                                   <input type="date" onChange={e => setFormData({...formData, date: e.target.value})} className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10 outline-none"/>
                                   <input type="time" onChange={e => setFormData({...formData, time: e.target.value})} className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10 outline-none"/>
                               </div>
                               <Button onClick={handleAddStudy} variant="luxury" className="w-full h-16 text-lg mt-4">Planla</Button>
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