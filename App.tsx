
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
  Smartphone, Monitor, Lightbulb, Key, Unlock, LogIn
} from 'lucide-react';
import { 
  User, UserRole, Assignment, Submission, SubmissionStatus, 
  Announcement, Notification, Exam, Question, ExamResult, ChatMessage,
  StudySession, Project, AttendanceRecord, Conversation, Message, MessageType, CallSession
} from './types';
import { generateAssignmentIdea, generateFeedbackSuggestion, generateQuizQuestions, chatWithStudentAssistant } from './services/geminiService';

// Firebase Imports
import { db, auth } from './services/firebase';

// --- Constants ---
const INSTRUCTOR_SECRET_CODE = "wasd123wasd";

const CLASS_OPTIONS = [
    "9-A", "9-B", "9-C", "9-D",
    "10-A", "10-B", "10-C", "10-D",
    "11-A", "11-B", "11-C", "11-D",
    "12-A", "12-B", "12-C", "12-D",
    "Mezun", "Hazırlık"
];

const FIELD_OPTIONS = [
    "Sayısal", "Eşit Ağırlık", "Sözel", "Dil"
];

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'luxury' | 'gold' | 'glass', isLoading?: boolean }> = ({ 
  children, variant = 'primary', className = '', isLoading, ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] text-sm tracking-wide cursor-pointer select-none";
  
  const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:bg-brand-700 border border-transparent hover:-translate-y-0.5",
    secondary: "bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10 shadow-sm hover:shadow-glow hover:-translate-y-0.5 backdrop-blur-md",
    outline: "bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-white/40",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:shadow-red-500/30",
    luxury: "bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 text-white shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-1 border-0 ring-offset-black",
    gold: "bg-gradient-to-b from-[#FCD34D] to-[#F59E0B] text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-yellow-300 hover:-translate-y-1",
    glass: "bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:shadow-lg"
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
      ${collapsed ? 'w-12 mx-auto justify-center px-0' : 'mx-3 px-4 w-auto'}
      ${active 
          ? `bg-gradient-to-r ${activeGradient} text-white shadow-lg ring-1 ${activeRing}` 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {active && (
         <>
           <div className="absolute inset-0 bg-white/20 blur-xl opacity-30 mix-blend-overlay"></div>
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
  <div className={`glass-panel p-6 rounded-[2rem] relative overflow-hidden group glass-card-hover ${className}`}>
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.05] group-hover:opacity-[0.15] transition-all duration-500 blur-3xl ${colorClass.replace('text-', 'bg-')}`}></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${colorClass} bg-white/5 text-current shadow-lg ring-1 ring-white/10 group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
                {trend && <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${trend.startsWith('+') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{trend}</span>}
            </div>
            <div>
                <h3 className="text-4xl lg:text-5xl font-black text-white mb-1 tracking-tighter">{value}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</p>
            </div>
        </div>
    </div>
);

const Marquee: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="w-full overflow-hidden bg-white/5 border-y border-white/10 py-5 mb-20 backdrop-blur-md relative z-20">
    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10"></div>
    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10"></div>
    <div className="animate-scroll whitespace-nowrap flex gap-16 text-gray-400 font-black uppercase tracking-widest text-lg items-center opacity-70 hover:opacity-100 transition-opacity">
      {items.map((item, i) => <span key={i} className="flex items-center gap-4"><Star size={16} className="text-amber-500 fill-amber-500"/> {item}</span>)}
      {items.map((item, i) => <span key={`dup-${i}`} className="flex items-center gap-4"><Star size={16} className="text-amber-500 fill-amber-500"/> {item}</span>)}
      {items.map((item, i) => <span key={`dup2-${i}`} className="flex items-center gap-4"><Star size={16} className="text-amber-500 fill-amber-500"/> {item}</span>)}
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] text-center w-full group hover:border-white/20 transition-colors">
    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-500 group-hover:scale-110 transition-transform group-hover:text-amber-500 shadow-glow">
      <Icon size={40} />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 max-w-sm">{description}</p>
  </div>
);

// --- Landing Page with Integrated Auth Modal ---
const LandingPage: React.FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [loginRole, setLoginRole] = useState<UserRole>(UserRole.STUDENT);
    
    // Instructor Verification State
    const [instructorCode, setInstructorCode] = useState('');
    const [isInstructorVerified, setIsInstructorVerified] = useState(false);

    // Auth Forms
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', tcNo: '', className: '', field: '' });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openAuth = (mode: 'LOGIN' | 'REGISTER') => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
        setError(null);
        setLoginForm({ email: '', password: '' });
        setRegisterForm({ name: '', email: '', password: '', tcNo: '', className: '', field: '' });
        setInstructorCode('');
        setIsInstructorVerified(false);
        setLoginRole(UserRole.STUDENT);
    };

    useEffect(() => {
        if (loginRole === UserRole.STUDENT) {
            setIsInstructorVerified(false);
            setInstructorCode('');
        }
        setError(null);
    }, [loginRole]);

    const handleVerifyInstructor = () => {
        if (instructorCode === INSTRUCTOR_SECRET_CODE) {
            setIsInstructorVerified(true);
            setError(null);
        } else {
            setError("Hatalı Eğitmen Kodu! Erişim reddedildi.");
        }
    };

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleAuthSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            if (authMode === 'LOGIN') {
                const email = loginForm.email.trim();
                const password = loginForm.password;

                if (!email || !password) throw new Error("Lütfen e-posta ve şifrenizi giriniz.");
                if (!validateEmail(email)) throw new Error("Geçersiz e-posta formatı.");

                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const userDoc = await db.collection("users").doc(userCredential.user!.uid).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data() as User;
                    if (userData.role !== loginRole) {
                        throw new Error(`Bu hesap bir ${loginRole === UserRole.INSTRUCTOR ? 'Öğrenci' : 'Eğitmen'} hesabıdır.`);
                    }
                    onLoginSuccess({ id: userDoc.id, ...userData });
                } else {
                    throw new Error("Kullanıcı verisi bulunamadı.");
                }
            } else {
                // REGISTER
                const email = registerForm.email.trim();
                const password = registerForm.password;
                
                if (!email || !password || !registerForm.name) throw new Error("Lütfen zorunlu alanları doldurunuz.");
                if (!validateEmail(email)) throw new Error("Geçersiz e-posta formatı.");

                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                const userData: User = {
                    id: userCredential.user!.uid,
                    name: registerForm.name,
                    role: loginRole,
                    email: email,
                    pin: '', 
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.name}`,
                    tcNo: registerForm.tcNo || '',
                    className: loginRole === UserRole.STUDENT && registerForm.className ? registerForm.className : undefined,
                    field: loginRole === UserRole.STUDENT && registerForm.field ? registerForm.field : undefined
                };

                const safeUserData = JSON.parse(JSON.stringify(userData));
                
                await db.collection("users").doc(userCredential.user!.uid).set(safeUserData);
                onLoginSuccess(userData);
            }
        } catch (err: any) {
            console.error(err);
            let errorMessage = "İşlem başarısız.";
            if (err.code === 'auth/invalid-email') errorMessage = "Geçersiz e-posta formatı.";
            else if (err.code === 'auth/user-not-found') errorMessage = "Kullanıcı bulunamadı. Lütfen kayıt olun.";
            else if (err.code === 'auth/wrong-password') errorMessage = "Hatalı şifre.";
            else if (err.code === 'auth/email-already-in-use') errorMessage = "Bu e-posta adresi zaten kullanımda.";
            else if (err.code === 'auth/invalid-credential') errorMessage = "Hatalı giriş bilgileri veya hesap bulunamadı.";
            else if (err.message) errorMessage = err.message;

            setError(errorMessage);
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
             {/* Background Effects */}
             <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                 <div className="absolute inset-0 bg-grid-pattern bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] opacity-20"></div>
                 {/* Aurora */}
                 <div className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vh] bg-brand-600/20 rounded-full blur-[150px] animate-blob"></div>
                 <div className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[50vh] bg-amber-600/10 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
                 <div className="absolute top-[40%] left-[-10%] w-[40vw] h-[40vh] bg-indigo-600/10 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
            </div>

             <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                 <div className="container mx-auto px-6 py-5 flex justify-between items-center">
                     <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
                         <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20 shadow-glow group-hover:scale-110 transition-transform">
                             <GraduationCap size={20} className="text-brand-500" />
                         </div>
                         <span className="text-xl font-black tracking-tight flex items-center gap-1 text-white">Enid<span className="text-brand-500">AI</span></span>
                     </div>
                     <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-widest text-gray-400">
                         <button onClick={() => scrollToSection('features')} className="hover:text-white hover:scale-105 transition-all duration-300">Teknoloji</button>
                         <button onClick={() => scrollToSection('stats')} className="hover:text-white hover:scale-105 transition-all duration-300">Başarılar</button>
                         <button onClick={() => scrollToSection('about')} className="hover:text-white hover:scale-105 transition-all duration-300">Kurumsal</button>
                     </div>
                     <div className="flex gap-4">
                         <Button onClick={() => openAuth('LOGIN')} variant="ghost" className="text-gray-400 hover:text-white h-10 px-6 hidden sm:flex text-xs font-bold uppercase tracking-widest">Giriş</Button>
                         <Button onClick={() => openAuth('REGISTER')} variant="luxury" className="h-10 px-6 text-xs font-bold uppercase tracking-widest">Başvur</Button>
                     </div>
                 </div>
             </nav>

             {/* HERO SECTION */}
             <div className="relative z-10 container mx-auto px-6 pt-32 lg:pt-48 pb-20">
                 <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                     <div className="flex-1 space-y-10 animate-slide-up text-center lg:text-left">
                         <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-brand-300 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow backdrop-blur-md hover:bg-white/10 transition-colors">
                             <Sparkles size={12} className="text-amber-500" /> Geleceğin Eğitim Standartı
                         </div>
                         <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-white drop-shadow-2xl">
                             Eğitimin <br/>
                             <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 animate-text-shimmer">Dijital Zirvesi.</span>
                         </h1>
                         <p className="text-xl text-gray-400 max-w-2xl leading-relaxed font-light mx-auto lg:mx-0">
                             Yapay zeka, kurumunuzun DNA'sına işleniyor. Veri odaklı analiz, kişiselleştirilmiş koçluk ve kusursuz yönetim tek bir lüks panelde.
                         </p>
                         <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
                             <Button onClick={() => openAuth('REGISTER')} variant="luxury" className="h-16 px-12 text-lg rounded-2xl w-full sm:w-auto shadow-glow-amber">Hemen Başla</Button>
                             <Button onClick={() => scrollToSection('features')} variant="secondary" className="h-16 px-12 text-lg rounded-2xl w-full sm:w-auto">
                                <PlayCircle className="mr-3 text-amber-500" size={20} /> Keşfet
                             </Button>
                         </div>
                     </div>
                     <div className="flex-1 w-full perspective-1000 hidden lg:block animate-spotlight">
                         <div className="relative w-full aspect-[4/5] rotate-y-12 transition-transform duration-700 hover:rotate-y-0 transform-style-3d group cursor-pointer">
                              {/* Glowing Backdrops */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-amber-500 blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                              
                              {/* Main Card */}
                              <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-[#0f172a]/80 backdrop-blur-2xl shadow-2xl overflow-hidden z-10 ring-1 ring-white/5 transition-all">
                                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
                                   <div className="p-8 h-full flex flex-col relative z-20">
                                       <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                           <div className="flex gap-2">
                                               <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                               <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                           </div>
                                           <div className="text-xs font-mono text-gray-500 opacity-50">SYSTEM: ONLINE</div>
                                       </div>
                                       <div className="flex-1 relative">
                                            {/* Floating Elements inside 3D card */}
                                            <div className="absolute top-0 right-0 p-4 bg-black/60 rounded-2xl border border-white/10 text-green-400 text-xs font-bold animate-float shadow-lg backdrop-blur-md">
                                                <TrendingUp size={16} className="mb-1"/> +%35 Başarı Artışı
                                            </div>
                                            
                                            <div className="absolute bottom-12 left-0 right-0 p-6 bg-white/5 rounded-3xl border border-white/10 shadow-xl backdrop-blur-md">
                                                <div className="flex gap-4 items-center mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 p-[2px] shadow-glow"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="rounded-full bg-black"/></div>
                                                    <div className="w-full">
                                                        <div className="h-2 w-24 bg-white/20 rounded-full mb-2"></div>
                                                        <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full w-[80%] bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                                                </div>
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 opacity-80 mix-blend-screen pointer-events-none">
                                                <BrainCircuit size={200} className="text-brand-500 animate-pulse-slow" strokeWidth={0.5} />
                                            </div>
                                       </div>
                                   </div>
                              </div>
                         </div>
                     </div>
                 </div>
             </div>
             
             {/* MARQUEE */}
             <div className="relative z-20">
                 <div className="container mx-auto py-2">
                     <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-4">Referanslarımız ve Kazananlar</p>
                 </div>
                 <Marquee items={["ODTÜ Bilgisayar", "İTÜ Mimarlık", "Boğaziçi İşletme", "Koç Tıp", "Bilkent Hukuk", "Galatasaray Üniversitesi", "Stanford Kabul", "MIT Kabul"]} />
             </div>
             
             {/* FEATURES SECTION (Bento Grid) */}
             <div id="features" className="container mx-auto px-6 py-24 relative z-10">
                 <div className="text-center mb-20">
                     <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">Sınırları Zorlayan <span className="text-gradient">Teknoloji.</span></h2>
                     <p className="text-gray-400 max-w-2xl mx-auto">Eğitim süreçlerini optimize etmek için tasarlanmış, yapay zeka destekli modüller.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="glass-panel p-8 rounded-[2.5rem] col-span-1 md:col-span-2 hover:bg-white/5 transition-colors group">
                         <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-6 text-brand-500 group-hover:scale-110 transition-transform"><Bot size={32}/></div>
                         <h3 className="text-2xl font-bold text-white mb-4">Gemini AI Destekli Koçluk</h3>
                         <p className="text-gray-400">Öğrencilerin eksiklerini analiz eder, kişiye özel çalışma programı hazırlar ve 7/24 soruları yanıtlar. Sadece bir yazılım değil, sanal bir rehber öğretmen.</p>
                     </div>
                     <div className="glass-panel p-8 rounded-[2.5rem] hover:bg-white/5 transition-colors group">
                         <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform"><PieChart size={32}/></div>
                         <h3 className="text-2xl font-bold text-white mb-4">Veri Analitiği</h3>
                         <p className="text-gray-400">Deneme sınavlarından ödevlere kadar her veriyi işleyerek başarı grafiklerini görselleştirir.</p>
                     </div>
                     <div className="glass-panel p-8 rounded-[2.5rem] hover:bg-white/5 transition-colors group">
                         <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-500 group-hover:scale-110 transition-transform"><Fingerprint size={32}/></div>
                         <h3 className="text-2xl font-bold text-white mb-4">Dijital Yoklama</h3>
                         <p className="text-gray-400">QR ve parmak izi simülasyonu ile anlık giriş-çıkış takibi. Velilere otomatik bildirim.</p>
                     </div>
                     <div className="glass-panel p-8 rounded-[2.5rem] col-span-1 md:col-span-2 hover:bg-white/5 transition-colors group">
                         <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform"><Video size={32}/></div>
                         <h3 className="text-2xl font-bold text-white mb-4">Hibrit İletişim</h3>
                         <p className="text-gray-400">Entegre görüntülü ve sesli görüşme modülü ile öğretmen ve öğrenci arasındaki mesafeleri kaldırın.</p>
                     </div>
                 </div>
             </div>

             {/* STATS SECTION */}
             <div id="stats" className="container mx-auto px-6 py-20 relative z-10">
                 <div className="glass-panel p-12 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-brand-900/20 to-amber-900/20 opacity-50"></div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
                          {[
                            { num: "12K+", label: "Analiz Edilen Soru", icon: FileCheck, color: "text-brand-400" },
                            { num: "%98", label: "Yerleştirme Oranı", icon: Trophy, color: "text-amber-400" },
                            { num: "45", label: "Partner Kurum", icon: Building2, color: "text-green-400" },
                            { num: "24/7", label: "Aktif Sistem", icon: Activity, color: "text-purple-400" }
                          ].map((stat, i) => (
                            <div key={i} className="text-center group">
                               <div className="mb-4 inline-flex p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform duration-300 border border-white/5"><stat.icon size={24} className={stat.color}/></div>
                               <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">{stat.num}</h3>
                               <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
                            </div>
                          ))}
                     </div>
                 </div>
             </div>
             
             {/* FOOTER */}
             <footer id="about" className="border-t border-white/10 bg-[#020617] pt-20 pb-10">
                 <div className="container mx-auto px-6">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                         <div className="col-span-1 md:col-span-2">
                             <div className="flex items-center gap-3 mb-6">
                                 <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center border border-brand-500/20"><GraduationCap size={16} className="text-brand-500"/></div>
                                 <span className="text-2xl font-black text-white tracking-tight">Enid<span className="text-brand-500">AI</span></span>
                             </div>
                             <p className="text-gray-400 max-w-sm leading-relaxed">
                                 Eğitim kurumlarını dijital çağa taşıyan, yapay zeka tabanlı yönetim ve öğrenme platformu. Geleceği bugünden inşa edin.
                             </p>
                         </div>
                         <div>
                             <h4 className="font-bold text-white mb-6">Platform</h4>
                             <ul className="space-y-4 text-sm text-gray-400">
                                 <li><button onClick={() => scrollToSection('features')} className="hover:text-brand-500 transition-colors">Özellikler</button></li>
                                 <li><button onClick={() => scrollToSection('stats')} className="hover:text-brand-500 transition-colors">Başarılar</button></li>
                                 <li><button onClick={() => openAuth('LOGIN')} className="hover:text-brand-500 transition-colors">Giriş Yap</button></li>
                             </ul>
                         </div>
                         <div>
                             <h4 className="font-bold text-white mb-6">İletişim</h4>
                             <ul className="space-y-4 text-sm text-gray-400">
                                 <li className="flex items-center gap-2"><Mail size={16}/> info@enidai.com</li>
                                 <li className="flex items-center gap-2"><Phone size={16}/> +90 (212) 555 0123</li>
                                 <li className="flex items-center gap-2"><MapPin size={16}/> Maslak, İstanbul</li>
                             </ul>
                         </div>
                     </div>
                     <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                         <p className="text-xs text-gray-600">© 2024 Enid AI Inc. Tüm hakları saklıdır.</p>
                         <div className="flex gap-4">
                             <Linkedin size={18} className="text-gray-600 hover:text-white cursor-pointer transition-colors"/>
                             <Twitter size={18} className="text-gray-600 hover:text-white cursor-pointer transition-colors"/>
                             <Instagram size={18} className="text-gray-600 hover:text-white cursor-pointer transition-colors"/>
                         </div>
                     </div>
                 </div>
             </footer>

             {/* ULTRA MODERN AUTH MODAL (Split Screen) */}
             {isAuthModalOpen && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
                     <div className="relative w-full max-w-6xl h-[800px] bg-[#020617] rounded-[3rem] shadow-2xl flex overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500 ring-1 ring-white/5">
                         <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5 cursor-pointer hover:rotate-90 duration-300"><X size={20} /></button>
                         
                         {/* Left Side: Art & Motivation */}
                         <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 overflow-hidden border-r border-white/5">
                             {/* Dynamic Backgrounds */}
                             <div className="absolute inset-0 bg-[#0f172a]"></div>
                             <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[100px] animate-blob"></div>
                             <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                             
                             <div className="relative z-10">
                                 <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 mb-8">
                                     <Sparkles className="text-amber-400" size={24}/>
                                 </div>
                                 <h2 className="text-5xl font-black tracking-tighter text-white mb-6 leading-tight">
                                     Potansiyelini <br/>
                                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Keşfetmeye</span> <br/>
                                     Hazır mısın?
                                 </h2>
                                 <p className="text-gray-400 text-lg leading-relaxed max-w-md">Enid AI ile öğrenme sürecini kişiselleştir, hedeflerine en kısa yoldan ulaş.</p>
                             </div>

                             <div className="relative z-10 mt-auto">
                                 <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-brand-500 backdrop-blur-xl bg-white/5">
                                     <div className="flex gap-4 items-center mb-3">
                                         <div className="flex -space-x-3">
                                             {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gray-800 border-2 border-[#020617] flex items-center justify-center text-xs">🎓</div>)}
                                         </div>
                                         <p className="text-xs font-bold text-gray-300">500+ Yeni Katılımcı</p>
                                     </div>
                                     <p className="text-sm text-gray-400 italic">"Bu platform sayesinde YKS sıralamamı 20 bin kişi ileri çektim. Kesinlikle tavsiye ediyorum."</p>
                                     <p className="text-xs font-bold text-brand-400 mt-2">— Zeynep K., Tıp Fakültesi Öğrencisi</p>
                                 </div>
                             </div>
                         </div>

                         {/* Right Side: Form */}
                         <div className="flex-1 p-12 lg:p-20 flex flex-col justify-center relative bg-[#020617]/50 backdrop-blur-3xl">
                             <div className="max-w-md mx-auto w-full">
                                 <div className="mb-10 text-center">
                                     <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                                        {loginRole === UserRole.INSTRUCTOR 
                                            ? (authMode === 'LOGIN' ? 'Eğitmen Girişi' : 'Eğitmen Kaydı')
                                            : (authMode === 'LOGIN' ? 'Öğrenci Girişi' : 'Aramıza Katıl')}
                                     </h2>
                                     <p className="text-gray-500 text-sm">
                                        {loginRole === UserRole.INSTRUCTOR 
                                            ? 'Kurumsal hesabınızla devam edin.' 
                                            : 'Eğitim yolculuğun burada başlıyor.'}
                                     </p>
                                 </div>
                                 
                                 {error && (
                                     <div className="mb-6 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold text-center animate-pulse flex flex-col gap-2 items-center">
                                         <AlertCircle size={20}/>
                                         <p>{error}</p>
                                     </div>
                                 )}

                                 <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/10">
                                      <button onClick={() => setLoginRole(UserRole.STUDENT)} className={`py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${loginRole === UserRole.STUDENT ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><GraduationCap size={16}/> Öğrenci</button>
                                      <button onClick={() => setLoginRole(UserRole.INSTRUCTOR)} className={`py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${loginRole === UserRole.INSTRUCTOR ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><Briefcase size={16}/> Eğitmen</button>
                                  </div>

                                  {loginRole === UserRole.INSTRUCTOR && !isInstructorVerified ? (
                                     <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="text-center p-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 border border-amber-500/20"><Lock size={32} /></div>
                                            <p className="text-sm text-gray-400 mb-6">Güvenlik gereği özel erişim kodunuzu giriniz.</p>
                                            <div className="space-y-2 relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 transition-colors"><Key size={18} /></div>
                                                <input type="password" value={instructorCode} onChange={e => setInstructorCode(e.target.value)} placeholder="Erişim Kodu" className="w-full pl-12 pr-5 py-4 rounded-2xl bg-[#0f172a] border border-white/10 text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:shadow-glow-amber transition-all"/>
                                            </div>
                                        </div>
                                        <Button onClick={handleVerifyInstructor} variant="luxury" className="w-full py-5 text-lg font-bold rounded-2xl shadow-glow-amber">Doğrula <Unlock size={18} className="ml-2"/></Button>
                                     </div>
                                  ) : (
                                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                                        {authMode === 'LOGIN' ? (
                                            <div className="space-y-5">
                                                <div className="space-y-2 group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase ml-2 group-focus-within:text-brand-400 transition-colors">E-posta</label>
                                                    <div className="relative">
                                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-400 transition-colors"/>
                                                        <input type="email" name="loginEmail" autoComplete="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all focus:shadow-glow" placeholder="ornek@enid.com" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-xs font-bold text-gray-500 uppercase ml-2 group-focus-within:text-brand-400 transition-colors">Şifre</label>
                                                    <div className="relative">
                                                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-400 transition-colors"/>
                                                        <input type="password" name="loginPassword" autoComplete="current-password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all focus:shadow-glow" placeholder="••••••" />
                                                    </div>
                                                </div>
                                                <Button onClick={handleAuthSubmit} variant={loginRole === UserRole.INSTRUCTOR ? "luxury" : "primary"} className="w-full py-5 text-lg font-bold mt-4 rounded-2xl shadow-glow" disabled={loading} isLoading={loading}>Giriş Yap</Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                <input type="text" name="registerName" placeholder="Ad Soyad" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-brand-500/50 focus:bg-white/10 focus:shadow-glow transition-all" />
                                                <input type="email" name="registerEmail" autoComplete="email" placeholder="E-posta" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-brand-500/50 focus:bg-white/10 focus:shadow-glow transition-all" />
                                                <input type="text" name="registerTc" placeholder="TC Kimlik No" value={registerForm.tcNo} onChange={e => setRegisterForm({...registerForm, tcNo: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-brand-500/50 focus:bg-white/10 focus:shadow-glow transition-all" />
                                                {loginRole === UserRole.STUDENT && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <select value={registerForm.className} onChange={e => setRegisterForm({...registerForm, className: e.target.value})} className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 bg-[#020617] focus:border-brand-500/50 outline-none appearance-none cursor-pointer hover:bg-white/10">
                                                            <option value="">Sınıf Seçiniz</option>
                                                            {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                        <select value={registerForm.field} onChange={e => setRegisterForm({...registerForm, field: e.target.value})} className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 bg-[#020617] focus:border-brand-500/50 outline-none appearance-none cursor-pointer hover:bg-white/10">
                                                            <option value="">Alan Seçiniz</option>
                                                            {FIELD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                                <input type="password" name="registerPassword" autoComplete="new-password" placeholder="Şifre Belirle" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-brand-500/50 focus:bg-white/10 focus:shadow-glow transition-all" />
                                                <Button onClick={handleAuthSubmit} variant={loginRole === UserRole.INSTRUCTOR ? "luxury" : "primary"} className="w-full py-5 text-lg font-bold rounded-2xl shadow-glow" disabled={loading} isLoading={loading}>Kayıt Ol</Button>
                                            </div>
                                        )}
                                        <div className="mt-8 text-center">
                                            <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">{authMode === 'LOGIN' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}</button>
                                        </div>
                                    </div>
                                  )}
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // --- DATA STATES ---
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState<{type: string, isOpen: boolean}>({type: '', isOpen: false});
  const [formData, setFormData] = useState<any>({});
  
  // Filtering
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(null);
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string | null>(null);

  // Modules State
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [todayAttendanceState, setTodayAttendanceState] = useState<'NONE' | 'CHECKED_IN' | 'CHECKED_OUT'>('NONE');

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'model', text: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Messaging State
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
      const unsubStudents = db.collection("users").where("role", "==", UserRole.STUDENT).onSnapshot((snapshot) => setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User))));
      const unsubAssignments = db.collection("assignments").orderBy("createdAt", "desc").onSnapshot((snapshot) => setAssignments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Assignment))));
      const unsubExams = db.collection("exams").orderBy("createdAt", "desc").onSnapshot((snapshot) => setExams(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam))));
      const unsubAnnouncements = db.collection("announcements").orderBy("date", "desc").onSnapshot((snapshot) => setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement))));
      const unsubClasses = db.collection("classes").onSnapshot((snapshot) => setClasses(snapshot.docs.map(d => d.data().name)));
      const unsubFields = db.collection("fields").onSnapshot((snapshot) => setFields(snapshot.docs.map(d => d.data().name)));
      const unsubStudy = db.collection("studySessions").onSnapshot((snapshot) => setStudySessions(snapshot.docs.map(d => ({id: d.id, ...d.data()} as StudySession))));
      const unsubProjects = db.collection("projects").onSnapshot((snapshot) => setProjects(snapshot.docs.map(d => ({id: d.id, ...d.data()} as Project))));

      return () => { unsubStudents(); unsubAssignments(); unsubExams(); unsubAnnouncements(); unsubClasses(); unsubFields(); unsubStudy(); unsubProjects(); };
  }, [user]);

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

  const handleLogout = async () => { await auth.signOut(); setUser(null); setActiveTab('dashboard'); };
  
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
      await db.collection("studySessions").add({ subject: formData.subject, teacherName: formData.teacherName, date: formData.date, time: formData.time, location: 'Etüt Odası 3', status: 'UPCOMING' });
      setIsModalOpen({type: '', isOpen: false});
  };
  const handleAddAnnouncement = async () => {
      await db.collection("announcements").add({ title: formData.title, content: formData.content, date: new Date().toISOString(), authorName: user!.name, priority: 'NORMAL' });
      setIsModalOpen({type:'', isOpen:false});
  };
  const handleAddClass = async () => { await db.collection("classes").add({ name: formData.name }); setIsModalOpen({type:'', isOpen:false}); };
  const handleAddField = async () => { await db.collection("fields").add({ name: formData.name }); setIsModalOpen({type:'', isOpen:false}); };

  const handleDeleteStudent = async (studentId: string) => {
      if (window.confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) {
          try {
              await db.collection("users").doc(studentId).delete();
          } catch (error) {
              console.error("Öğrenci silinirken hata oluştu:", error);
          }
      }
  };

  const handleStartExam = (exam: Exam) => { setActiveExamSession({ exam, currentQuestion: 0, answers: {}, timeLeft: exam.durationMinutes * 60 }); };
  const handleAnswerExam = (option: string) => { if (!activeExamSession) return; setActiveExamSession({ ...activeExamSession, answers: { ...activeExamSession.answers, [activeExamSession.exam.questions[activeExamSession.currentQuestion].id]: option } }); };
  const submitExam = () => {
      if (!activeExamSession) return;
      let score = 0; let correct = 0; let wrong = 0;
      activeExamSession.exam.questions.forEach(q => { if (activeExamSession.answers[q.id] === q.correctAnswer) { score += q.points; correct++; } else { wrong++; } });
      setExamResult({ id: Date.now().toString(), examId: activeExamSession.exam.id, studentId: user!.id, score, correctCount: correct, wrongCount: wrong, submittedAt: new Date().toISOString() });
      setActiveExamSession(null);
  };

  const handleGenerateAssignment = async () => {
    if (!assignmentTopic) return;
    setIsGeneratingAssignment(true);
    try { const result = await generateAssignmentIdea(assignmentTopic); setGeneratedAssignment(result); } catch (error) { console.error(error); } finally { setIsGeneratingAssignment(false); }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMessages); setChatInput(''); setIsChatLoading(true);
    try {
      const history = newMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await chatWithStudentAssistant(chatInput, history);
      setChatMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) { console.error(error); } finally { setIsChatLoading(false); }
  };

  const handleSendMessage = (type: MessageType = 'text', content?: string) => {
      if (!activeConversationId) return;
      const newMsg: Message = { id: Date.now().toString(), senderId: user!.id, messageType: type, text: type === 'text' ? messageInput : undefined, fileUrl: type !== 'text' ? content : undefined, fileName: type === 'file' ? 'odev.pdf' : undefined, duration: type === 'audio' ? '0:12' : undefined, timestamp: new Date().toISOString() };
      setConversations(prev => prev.map(c => { if (c.id === activeConversationId) return { ...c, messages: [...c.messages, newMsg], lastMessage: 'Yeni Mesaj' }; return c; }));
      setMessageInput('');
  };
  const handleFileUpload = () => setTimeout(() => handleSendMessage('file', '#'), 500);
  const handleVoiceRecord = () => { setIsRecording(!isRecording); if (isRecording) handleSendMessage('audio', '#'); };
  const handleStartCall = (type: 'voice' | 'video', participantName: string, participantAvatar: string) => setActiveCall({ isActive: true, participantName, participantAvatar, type, status: 'calling', duration: 0 });

  const handleCheckIn = () => { setAttendanceLoading(true); setTimeout(() => { setTodayAttendanceState('CHECKED_IN'); setAttendanceLoading(false); }, 1500); };
  const handleCheckOut = () => { setAttendanceLoading(true); setTimeout(() => { setTodayAttendanceState('CHECKED_OUT'); setAttendanceLoading(false); }, 1500); };

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white"><div className="flex flex-col items-center"><div className="w-20 h-20 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-6"></div><div className="text-xl font-black tracking-widest uppercase animate-pulse">Enid AI Yükleniyor</div></div></div>;
  if (!user) return <LandingPage onLoginSuccess={setUser} />;

  if (activeCall) return <CallOverlay session={activeCall} onEnd={() => setActiveCall(null)} />;

  const renderContent = () => {
      if (activeExamSession) {
          const q = activeExamSession.exam.questions[activeExamSession.currentQuestion];
          return (
              <div className="flex flex-col h-full animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-black text-white">{activeExamSession.exam.title}</h2>
                      <div className="px-6 py-3 bg-white/5 border border-white/10 text-brand-400 rounded-2xl font-mono text-xl shadow-glow">
                          {Math.floor(activeExamSession.timeLeft / 60)}:{(activeExamSession.timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                  </div>
                  <div className="flex-1 glass-panel rounded-[2.5rem] p-12 relative overflow-y-auto">
                      <div className="mb-6 text-brand-500 font-bold uppercase tracking-widest text-sm">Soru {activeExamSession.currentQuestion + 1} / {activeExamSession.exam.questions.length}</div>
                      <h3 className="text-2xl font-medium mb-10 leading-relaxed text-white">{q.text}</h3>
                      <div className="space-y-4 max-w-4xl">
                          {q.options?.map((opt, i) => (
                              <button key={i} onClick={() => handleAnswerExam(opt)} 
                                className={`w-full p-6 text-left rounded-2xl border transition-all duration-300 group ${activeExamSession.answers[q.id] === opt ? 'border-brand-500 bg-brand-500/20 shadow-glow' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}>
                                  <div className="flex items-center justify-between">
                                      <span className="font-medium text-white">{opt}</span>
                                      {activeExamSession.answers[q.id] === opt && <CheckCircle size={24} className="text-brand-500"/>}
                                  </div>
                              </button>
                          ))}
                      </div>
                      <div className="mt-12 flex justify-end">
                          {activeExamSession.currentQuestion < activeExamSession.exam.questions.length - 1 ? (
                              <Button onClick={() => setActiveExamSession({...activeExamSession, currentQuestion: activeExamSession.currentQuestion + 1})} variant="primary" className="px-10 py-4 text-lg rounded-2xl">Sonraki Soru <ChevronRight className="ml-2" /></Button>
                          ) : (
                              <Button onClick={submitExam} variant="luxury" className="px-10 py-4 text-lg rounded-2xl">Sınavı Bitir <CheckCircle className="ml-2" /></Button>
                          )}
                      </div>
                  </div>
              </div>
          );
      }

      if (examResult) {
          return (
              <div className="flex items-center justify-center h-full">
                  <div className="glass-panel p-16 rounded-[3rem] text-center max-w-2xl w-full relative overflow-hidden border border-white/20 shadow-2xl">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
                      <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 text-green-500 shadow-glow"><Trophy size={64}/></div>
                      <h2 className="text-4xl font-black mb-4 text-white">Sınav Tamamlandı!</h2>
                      <p className="text-gray-400 mb-10 text-lg">Sonuçlarınız yapay zeka tarafından analiz edildi ve sisteme işlendi.</p>
                      <div className="grid grid-cols-3 gap-6 mb-10">
                          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                              <div className="text-4xl font-black text-white mb-2">{examResult.score}</div>
                              <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Puan</div>
                          </div>
                          <div className="p-6 bg-green-500/10 rounded-3xl border border-green-500/20">
                              <div className="text-4xl font-black text-green-500 mb-2">{examResult.correctCount}</div>
                              <div className="text-xs text-green-600 uppercase font-bold tracking-widest">Doğru</div>
                          </div>
                          <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20">
                              <div className="text-4xl font-black text-red-500 mb-2">{examResult.wrongCount}</div>
                              <div className="text-xs text-red-600 uppercase font-bold tracking-widest">Yanlış</div>
                          </div>
                      </div>
                      <Button onClick={() => setExamResult(null)} variant="secondary" className="w-full py-4 text-lg">Panele Dön</Button>
                  </div>
              </div>
          );
      }

      // Main Switch Logic
      switch(activeTab) {
          case 'assignments':
              return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-6">
                          <div>
                              <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-400 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                              <h2 className="text-4xl font-black text-white">Ödevler</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'ASSIGNMENT', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Yeni Ödev</Button>}
                      </div>
                      <div className="grid gap-6">
                          {assignments.map(assign => (
                              <div key={assign.id} className="glass-panel p-8 rounded-[2rem] hover:bg-white/5 transition-all group border-l-4 border-l-brand-500 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                  <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                          <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-widest border border-brand-500/20">{assign.subject}</span>
                                          <span className="text-xs text-gray-500 flex items-center gap-1 font-bold"><Clock size={12}/> {new Date(assign.dueDate).toLocaleDateString()}</span>
                                      </div>
                                      <h3 className="text-2xl font-bold text-white mb-2">{assign.title}</h3>
                                      <p className="text-gray-400 text-sm">{assign.description}</p>
                                  </div>
                                  <div className="flex gap-3">
                                      {user.role === UserRole.STUDENT ? (
                                          <Button variant="outline" className="h-12 px-6">Dosya Yükle <Upload size={16} className="ml-2"/></Button>
                                      ) : (
                                          <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                              <button className="p-3 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white"><Edit2 size={20}/></button>
                                              <button className="p-3 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-500"><Trash2 size={20}/></button>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {assignments.length === 0 && <EmptyState icon={BookOpen} title="Ödev Bulunamadı" description="Şu an için aktif bir ödev bulunmuyor." />}
                      </div>
                  </div>
              );
            
          // ... Other cases follow the same premium styling pattern ...
          // Keeping existing logic for exams, students, chat etc. but wrapping in premium containers
          
          case 'exams':
              return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-6">
                          <div>
                               <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-400 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                               <h2 className="text-4xl font-black text-white">Sınavlar</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'EXAM', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Sınav Oluştur</Button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {exams.map(exam => (
                              <div key={exam.id} className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 border border-white/10 hover:border-brand-500/30">
                                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity text-white"><FileText size={150}/></div>
                                  <div className="relative z-10">
                                      <span className="inline-block px-3 py-1 rounded-lg bg-white/10 text-xs font-bold text-white mb-6 border border-white/5 shadow-inner">{exam.subject}</span>
                                      <h3 className="text-3xl font-bold text-white mb-2">{exam.title}</h3>
                                      <p className="text-gray-400 text-sm mb-8 font-medium">{exam.durationMinutes} Dakika • {exam.questions.length} Soru</p>
                                      {user.role === UserRole.STUDENT && <Button onClick={() => handleStartExam(exam)} variant="gold" className="w-full h-14 text-lg rounded-2xl">Sınava Başla</Button>}
                                  </div>
                              </div>
                          ))}
                          {exams.length === 0 && <div className="col-span-full"><EmptyState icon={FileText} title="Aktif Sınav Yok" description="Şu an planlanmış bir sınav bulunmuyor." /></div>}
                      </div>
                  </div>
              );

          case 'students':
              return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="flex justify-between items-end mb-6">
                          <div>
                               <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-400 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                               <h2 className="text-4xl font-black text-white">Öğrenciler</h2>
                          </div>
                          <div className="flex gap-4">
                             {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'STUDENT', isOpen: true})} variant="luxury"><UserPlus size={18} className="mr-2"/> Öğrenci Ekle</Button>}
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {students.map(std => (
                              <div key={std.id} className="glass-panel p-6 rounded-[2rem] flex items-center gap-5 hover:bg-white/5 transition-all group hover:border-brand-500/50">
                                  <img src={std.avatarUrl} className="w-20 h-20 rounded-2xl bg-black border border-white/10 group-hover:scale-105 transition-transform" alt=""/>
                                  <div className="flex-1">
                                      <h4 className="text-lg font-bold text-white mb-1">{std.name}</h4>
                                      <p className="text-xs text-gray-400 mb-2 font-mono uppercase">{std.className} - {std.field}</p>
                                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded font-bold border border-green-500/20">AKTİF</span>
                                  </div>
                                  {user.role === UserRole.INSTRUCTOR && (
                                      <button onClick={() => handleDeleteStudent(std.id)} className="p-3 hover:bg-red-500/20 text-gray-600 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                  )}
                              </div>
                          ))}
                          {students.length === 0 && <div className="col-span-full"><EmptyState icon={Users} title="Öğrenci Yok" description="Kayıtlı öğrenci bulunmuyor." /></div>}
                      </div>
                  </div>
              );
            
          // ... Other modules (Chat, Attendance, etc) keep existing logic but updated classNames for glass-panel ...
          case 'chat':
              return (
                  <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-white/10 shadow-2xl">
                      <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center backdrop-blur-xl">
                          <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 p-[2px] animate-spin-slow shadow-glow">
                                  <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center"><Bot size={28} className="text-white"/></div>
                              </div>
                              <div>
                                  <h3 className="font-bold text-white text-xl">Enid AI</h3>
                                  <p className="text-xs text-brand-400 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online • 2.5 Flash</p>
                              </div>
                          </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#020617]/50">
                          {chatMessages.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                                  <Sparkles size={64} className="mb-6 text-brand-500 animate-pulse-slow"/>
                                  <h3 className="text-2xl font-bold text-white mb-2">Nasıl yardımcı olabilirim?</h3>
                                  <p className="text-gray-400 max-w-sm">Ders notları, ödev yardımı veya sadece sohbet.</p>
                              </div>
                          )}
                          {chatMessages.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[75%] p-5 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-sm shadow-glow' : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/10 backdrop-blur-md'}`}>
                                      {msg.text}
                                  </div>
                              </div>
                          ))}
                          {isChatLoading && <div className="flex justify-start"><div className="bg-white/10 p-4 rounded-3xl rounded-tl-none"><div className="flex gap-1.5"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span></div></div></div>}
                      </div>
                      <form onSubmit={handleChatSubmit} className="p-6 bg-white/5 border-t border-white/10 flex gap-4 backdrop-blur-xl">
                          <input 
                              value={chatInput} 
                              onChange={e => setChatInput(e.target.value)} 
                              placeholder="Enid'e bir şeyler sor..." 
                              className="flex-1 bg-[#020617]/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-brand-500/50 outline-none focus:bg-white/5 transition-all"
                          />
                          <Button type="submit" variant="luxury" className="px-6 h-auto aspect-square rounded-2xl"><Send size={24}/></Button>
                      </form>
                  </div>
              );

          case 'classes':
              return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-6">
                          <div>
                              <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-400 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                              <h2 className="text-4xl font-black text-white">Sınıflar</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'CLASS', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Sınıf Ekle</Button>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {classes.map((cls, idx) => (
                              <div key={idx} onClick={() => { setActiveTab('students'); setSelectedClassFilter(cls); }} className="glass-panel p-8 rounded-[2.5rem] text-center hover:bg-white/10 cursor-pointer hover:border-brand-500 transition-all group border border-white/10 hover:-translate-y-2">
                                  <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4 flex items-center justify-center text-gray-400 group-hover:text-brand-500 group-hover:bg-brand-500/10 transition-colors"><School size={32}/></div>
                                  <h3 className="text-3xl font-black text-white group-hover:text-brand-500 transition-colors">{cls}</h3>
                                  <p className="text-xs text-gray-500 uppercase font-bold mt-2 tracking-widest">Öğrenci Listesi</p>
                              </div>
                          ))}
                          {classes.length === 0 && <div className="col-span-full"><EmptyState icon={Layout} title="Sınıf Yok" description="Henüz sınıf eklenmemiş." /></div>}
                      </div>
                  </div>
              );
              
          // Keeping Fields, Projects, Study, Messages logic but updating container styles
          case 'fields':
              return (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-6">
                          <div>
                              <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-400 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                              <h2 className="text-4xl font-black text-white">Alanlar</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'FIELD', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Alan Ekle</Button>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {fields.map((f, idx) => (
                              <div key={idx} onClick={() => { setActiveTab('students'); setSelectedFieldFilter(f); }} className="glass-panel p-8 rounded-[2.5rem] text-center hover:bg-white/10 cursor-pointer hover:border-amber-500 transition-all group border border-white/10 hover:-translate-y-2">
                                  <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4 flex items-center justify-center text-gray-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors"><Briefcase size={32}/></div>
                                  <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors">{f}</h3>
                                  <p className="text-xs text-gray-500 uppercase font-bold mt-2 tracking-widest">Öğrenci Listesi</p>
                              </div>
                          ))}
                          {fields.length === 0 && <div className="col-span-full"><EmptyState icon={Layout} title="Alan Yok" description="Henüz alan eklenmemiş." /></div>}
                      </div>
                 </div>
              );

          default:
              // DASHBOARD (Bento Grid)
              return (
                  <div className="animate-in fade-in duration-500 space-y-10">
                      <header className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
                          <div>
                              <h1 className="text-3xl font-black text-white mb-1">Merhaba, {user?.name.split(' ')[0]} <span className="animate-wave inline-block">👋</span></h1>
                              <p className="text-gray-400 text-sm">Eğitim panelin kullanıma hazır.</p>
                          </div>
                          <div className="flex gap-4 items-center">
                              <div className="hidden md:flex flex-col items-end mr-4">
                                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{user?.role === UserRole.INSTRUCTOR ? 'Eğitmen' : 'Öğrenci'}</span>
                                  <span className="text-sm font-bold text-white">{new Date().toLocaleDateString('tr-TR', {weekday: 'long'})}</span>
                              </div>
                              <Button variant="secondary" className="h-12 w-12 rounded-full p-0 flex items-center justify-center"><Bell size={20}/></Button>
                              <img src={user?.avatarUrl} className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 object-cover" alt="Profile"/>
                          </div>
                      </header>

                      {user.role === UserRole.INSTRUCTOR ? (
                        <>
                           {/* MODERN INSTRUCTOR HERO */}
                           <div className="glass-panel rounded-[3rem] p-12 relative overflow-hidden border border-white/10 shadow-glow-lg group">
                               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-500/20 via-orange-600/10 to-transparent rounded-full blur-[100px] pointer-events-none group-hover:opacity-100 transition-opacity opacity-70"></div>
                               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                   <div className="text-center md:text-left space-y-6">
                                       <span className="inline-block px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border border-amber-500/20 shadow-glow-amber">Yönetim Paneli</span>
                                       <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter">Kurumun<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Komuta Merkezi.</span></h2>
                                       <p className="text-gray-400 max-w-md text-lg">Anlık veri akışı, öğrenci takibi ve akademik analiz tek ekranda.</p>
                                   </div>
                                   <div className="flex gap-6">
                                       <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md text-center min-w-[140px] hover:scale-105 transition-transform duration-300 shadow-2xl group/card">
                                           <div className="text-4xl font-black text-white mb-2 group-hover/card:text-brand-400 transition-colors">{students.length}</div>
                                           <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Öğrenci</div>
                                       </div>
                                       <div className="p-8 bg-green-500/10 rounded-[2.5rem] border border-green-500/20 backdrop-blur-md text-center min-w-[140px] hover:scale-105 transition-transform duration-300 shadow-2xl animate-pulse-slow">
                                            <div className="text-4xl font-black text-green-400 mb-2">ON</div>
                                            <div className="text-[10px] font-bold text-green-500/70 uppercase tracking-widest">Sistem</div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <DashboardCard title="Genel Ort." value="84.5" subtitle="Başarılı" icon={TrendingUp} trend="+2.4" colorClass="text-brand-500" />
                            <DashboardCard title="Tamamlanan" value={assignments.filter(a => false).length.toString()} subtitle="Ödev" icon={CheckCircle} colorClass="text-green-500" />
                            <DashboardCard title="Bekleyen" value={assignments.length.toString()} subtitle="Ödev" icon={Clock} colorClass="text-orange-500" />
                            <DashboardCard title="Sıralama" value="#4" subtitle="Sınıf" icon={Award} trend="+1" colorClass="text-purple-500" />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <div className="lg:col-span-2 glass-panel p-10 rounded-[2.5rem] border border-white/10">
                               <h3 className="text-2xl font-bold mb-8 flex items-center gap-3"><BookOpen size={24} className="text-brand-500"/> Son Ödevler</h3>
                               <div className="space-y-4">
                                   {assignments.slice(0, 3).map(a => (
                                       <div key={a.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition-all cursor-pointer group hover:border-brand-500/30">
                                           <div>
                                               <h4 className="font-bold text-white text-lg group-hover:text-brand-400 transition-colors">{a.title}</h4>
                                               <p className="text-sm text-gray-500 mt-1">{a.subject} • {new Date(a.dueDate).toLocaleDateString()}</p>
                                           </div>
                                           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                               <ChevronRight size={20}/>
                                           </div>
                                       </div>
                                   ))}
                                   {assignments.length === 0 && <p className="text-gray-500 text-center py-4">Henüz ödev yok.</p>}
                               </div>
                           </div>
                           <div className="glass-panel p-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent">
                                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3"><Megaphone size={24} className="text-amber-500"/> Duyurular</h3>
                                <div className="space-y-8 relative">
                                    <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-white/10"></div>
                                    {announcements.slice(0, 3).map(a => (
                                        <div key={a.id} className="relative pl-8 group">
                                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[#020617] border-2 border-brand-500 z-10 group-hover:scale-125 transition-transform shadow-glow"></div>
                                            <p className="text-sm text-gray-300 mb-2 leading-relaxed">{a.content}</p>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{new Date(a.date).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                           </div>
                      </div>
                  </div>
              );
      }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#020617] text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* SIDEBAR */}
        <aside className={`${collapsed ? 'w-24' : 'w-80'} bg-[#020617]/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-500 fixed h-full z-40 shadow-2xl`}>
            <div className="p-8 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-3 animate-in fade-in duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">E</div>
                        <span className="text-xl font-black tracking-tighter">Enid<span className="text-brand-500">AI</span></span>
                    </div>
                )}
                <button onClick={() => setCollapsed(!collapsed)} className="p-3 hover:bg-white/10 rounded-xl transition-colors group">
                    <Menu size={20} className="text-gray-400 group-hover:text-white"/>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar space-y-2">
                <div className="px-4 mb-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hidden md:block opacity-50">{!collapsed && 'Navigasyon'}</div>
                <SidebarItem icon={Layout} label="Panel" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={collapsed} />
                <SidebarItem icon={BookOpen} label="Ödevler" active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} collapsed={collapsed} />
                <SidebarItem icon={FileText} label="Sınavlar" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} collapsed={collapsed} />
                <SidebarItem icon={MessageCircle} label="Mesajlar" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} collapsed={collapsed} />
                <SidebarItem icon={Calendar} label="Etütler" active={activeTab === 'study'} onClick={() => setActiveTab('study')} collapsed={collapsed} />
                <SidebarItem icon={Layers} label="Projeler" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} collapsed={collapsed} />
                
                {user.role === UserRole.INSTRUCTOR && (
                    <>
                        <div className="my-4 h-px bg-white/5 w-full"></div>
                        <div className="px-4 mb-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hidden md:block opacity-50">{!collapsed && 'Yönetim'}</div>
                        <SidebarItem icon={Users} label="Öğrenciler" active={activeTab === 'students'} onClick={() => setActiveTab('students')} collapsed={collapsed} role={user?.role} />
                        <SidebarItem icon={School} label="Sınıflar" active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} collapsed={collapsed} />
                        <SidebarItem icon={Briefcase} label="Alanlar" active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} collapsed={collapsed} />
                    </>
                )}
                
                <div className="my-4 h-px bg-white/5 w-full"></div>
                <SidebarItem icon={Bot} label="AI Asistan" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} collapsed={collapsed} />
                <SidebarItem icon={Fingerprint} label="Yoklama" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} collapsed={collapsed} />
            </div>

            <div className="p-6 border-t border-white/10 bg-[#0f172a]/50">
                <button onClick={handleLogout} className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-4 w-full rounded-2xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all border border-white/5 hover:border-red-500/20 group`}>
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
                    {!collapsed && <span className="ml-3 font-bold text-sm">Çıkış Yap</span>}
                </button>
            </div>
        </aside>

        <main className={`flex-1 transition-all duration-500 ${collapsed ? 'ml-24' : 'ml-80'} p-8 md:p-12 relative z-10`}>
            {/* Background Texture for Dashboard */}
             <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                 <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-brand-900/10 rounded-full blur-[100px]"></div>
            </div>
            {renderContent()}
        </main>
        
        {/* Modals - Keeping Logic but updating UI */}
        {isModalOpen.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 w-full max-w-lg animate-in zoom-in-95 bg-[#020617] relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                     <div className="flex justify-between items-center mb-8 relative z-10">
                         <h3 className="text-2xl font-black text-white tracking-tight">Yeni Kayıt</h3>
                         <button onClick={() => setIsModalOpen({type:'', isOpen: false})} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className="text-gray-400 hover:text-white"/></button>
                     </div>
                     <div className="space-y-5 relative z-10">
                         {isModalOpen.type === 'ASSIGNMENT' && (
                             <>
                                <input placeholder="Başlık" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50 focus:shadow-glow transition-all" onChange={e => setFormData({...formData, title: e.target.value})} />
                                <textarea placeholder="Açıklama" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50 focus:shadow-glow transition-all min-h-[100px]" onChange={e => setFormData({...formData, description: e.target.value})} />
                                <input type="date" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50 focus:shadow-glow transition-all" onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                                <Button onClick={handleAddAssignment} className="w-full py-4 text-lg rounded-2xl shadow-glow">Oluştur</Button>
                                
                                <div className="p-6 bg-brand-500/5 rounded-2xl border border-brand-500/20 mt-4">
                                    <p className="text-xs font-bold text-brand-400 mb-3 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12}/> Yapay Zeka Desteği</p>
                                    <div className="flex gap-3">
                                        <input placeholder="Konu (örn: Kuantum Fiziği)" className="flex-1 p-3 bg-black/50 rounded-xl text-white border border-white/10 text-sm focus:border-brand-500/50 outline-none" value={assignmentTopic} onChange={e => setAssignmentTopic(e.target.value)} />
                                        <Button onClick={handleGenerateAssignment} variant="luxury" className="px-4 py-3 text-xs h-auto rounded-xl" isLoading={isGeneratingAssignment}>Üret</Button>
                                    </div>
                                    {generatedAssignment && <div onClick={() => setFormData({...formData, title: generatedAssignment.title, description: generatedAssignment.description})} className="mt-3 text-xs text-green-400 cursor-pointer hover:text-green-300 flex items-center gap-1 bg-green-500/10 p-2 rounded-lg border border-green-500/20"><CheckCircle size={12}/> Taslak hazır! Kullanmak için tıkla.</div>}
                                </div>
                             </>
                         )}
                         {/* Other modals follow the same style */}
                         {isModalOpen.type === 'EXAM' && (
                             <>
                                <input placeholder="Sınav Başlığı" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50 transition-all" onChange={e => setFormData({...formData, title: e.target.value})} />
                                <input placeholder="Konu" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50 transition-all" onChange={e => setFormData({...formData, subject: e.target.value})} />
                                <input type="number" placeholder="Süre (Dakika)" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50 transition-all" onChange={e => setFormData({...formData, duration: e.target.value})} />
                                <Button onClick={handleAddExam} variant="luxury" className="w-full py-4 text-lg rounded-2xl">Sınavı Yayınla</Button>
                             </>
                         )}
                         {isModalOpen.type === 'CLASS' && (
                             <>
                                <input placeholder="Sınıf Adı (örn: 11-F)" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50 transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
                                <Button onClick={handleAddClass} variant="primary" className="w-full py-4 text-lg rounded-2xl">Sınıf Ekle</Button>
                             </>
                         )}
                         {isModalOpen.type === 'FIELD' && (
                             <>
                                <input placeholder="Alan Adı (örn: Sözel)" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50 transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
                                <Button onClick={handleAddField} variant="primary" className="w-full py-4 text-lg rounded-2xl">Alan Ekle</Button>
                             </>
                         )}
                         {isModalOpen.type === 'STUDY' && (
                            <>
                               <input placeholder="Ders" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, subject: e.target.value})} />
                               <input placeholder="Öğretmen" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, teacherName: e.target.value})} />
                               <input type="date" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, date: e.target.value})} />
                               <input type="time" className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, time: e.target.value})} />
                               <Button onClick={handleAddStudy} className="w-full py-4 rounded-2xl">Oluştur</Button>
                            </>
                         )}
                         {isModalOpen.type === 'STUDENT' && (
                             <div className="text-center p-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                 <UserIcon size={32} className="mx-auto text-gray-500 mb-2"/>
                                 <p className="text-gray-400">Güvenlik gereği öğrenci kayıtları ana sayfadaki "Başvur" ekranından yapılmalıdır.</p>
                             </div>
                         )}
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;
