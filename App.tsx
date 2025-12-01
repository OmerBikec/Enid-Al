
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

const Marquee: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="w-full overflow-hidden bg-white/5 border-y border-white/10 py-4 mb-20 backdrop-blur-sm">
    <div className="animate-scroll whitespace-nowrap flex gap-12 text-gray-400 font-bold uppercase tracking-widest text-sm items-center">
      {items.map((item, i) => <span key={i} className="flex items-center gap-2"><Star size={12} className="text-amber-500"/> {item}</span>)}
      {items.map((item, i) => <span key={`dup-${i}`} className="flex items-center gap-2"><Star size={12} className="text-amber-500"/> {item}</span>)}
      {items.map((item, i) => <span key={`dup2-${i}`} className="flex items-center gap-2"><Star size={12} className="text-amber-500"/> {item}</span>)}
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/5 text-center w-full">
    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-500">
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
                
                // FIX: Ensure no undefined values are sent to Firestore
                const userData: User = {
                    id: userCredential.user!.uid,
                    name: registerForm.name,
                    role: loginRole,
                    email: email,
                    pin: '', 
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.name}`,
                    tcNo: registerForm.tcNo || '',
                    // Use null if undefined to avoid Firestore "Unsupported field value: undefined" error
                    className: loginRole === UserRole.STUDENT && registerForm.className ? registerForm.className : undefined,
                    field: loginRole === UserRole.STUDENT && registerForm.field ? registerForm.field : undefined
                };

                // Remove undefined keys before saving
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
             {/* ... (Existing CSS Backgrounds) ... */}
             <div className="fixed inset-0 pointer-events-none z-0">
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
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
                         <div className="relative w-full aspect-[4/5] rotate-y-12 transition-transform duration-700 hover:rotate-y-0 transform-style-3d group">
                              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-indigo-500 blur-[80px] opacity-20"></div>
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
             
             {/* FEATURES SECTION, STATS, ABOUT, FOOTER */}
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

             {/* AUTH MODAL */}
             {isAuthModalOpen && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
                     <div className="relative w-full max-w-5xl h-[750px] bg-[#020617] rounded-[3rem] shadow-2xl flex overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500 ring-1 ring-white/5 relative">
                         <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px] animate-blob"></div>
                            <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
                         </div>
                         <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5 cursor-pointer"><X size={20} /></button>
                         
                         <div className="hidden lg:flex w-5/12 bg-black relative flex-col justify-between p-12 text-white overflow-hidden border-r border-white/5 z-10">
                             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                             <div className="relative z-10 mt-auto">
                                 <h2 className="text-4xl font-black tracking-tighter mb-4 text-white">Geleceğe <br/>Hoş Geldin.</h2>
                                 <p className="text-gray-400 text-sm font-light leading-relaxed">Enid AI ile potansiyelini keşfet. Giriş yaparak eğitim yolculuğuna başla.</p>
                             </div>
                         </div>

                         <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center relative z-10">
                             <div className="max-w-md mx-auto w-full">
                                 <div className="mb-8 text-center">
                                     <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-glow"><UserIcon size={24} className="text-amber-500"/></div>
                                     <h2 className="text-3xl font-black text-white tracking-tight">
                                        {loginRole === UserRole.INSTRUCTOR 
                                            ? (authMode === 'LOGIN' ? 'Eğitmen Girişi' : 'Eğitmen Kaydı')
                                            : (authMode === 'LOGIN' ? 'Öğrenci Girişi' : 'Yeni Kayıt Oluştur')}
                                     </h2>
                                     <p className="text-gray-500 text-sm mt-2">
                                        {loginRole === UserRole.INSTRUCTOR 
                                            ? 'Yetkili personel erişim paneli.' 
                                            : 'Eğitim yolculuğunuza devam etmek için bilgilerinizi giriniz.'}
                                     </p>
                                 </div>
                                 
                                 {error && (
                                     <div className="mb-6 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold text-center animate-pulse flex flex-col gap-2">
                                         <p>{error}</p>
                                     </div>
                                 )}

                                 <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/10">
                                      <button onClick={() => setLoginRole(UserRole.STUDENT)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${loginRole === UserRole.STUDENT ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Öğrenci</button>
                                      <button onClick={() => setLoginRole(UserRole.INSTRUCTOR)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${loginRole === UserRole.INSTRUCTOR ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Eğitmen</button>
                                  </div>

                                  {loginRole === UserRole.INSTRUCTOR && !isInstructorVerified ? (
                                     <div className="space-y-6">
                                        <div className="text-center p-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                            <div className="mb-4 text-amber-500 flex justify-center"><Lock size={32} /></div>
                                            <p className="text-sm text-gray-400 mb-4">Bu alan sadece yetkili eğitmenler içindir.</p>
                                            <div className="space-y-2 relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Key size={18} /></div>
                                                <input type="password" value={instructorCode} onChange={e => setInstructorCode(e.target.value)} placeholder="Özel Eğitmen Kodu" className="w-full pl-12 pr-5 py-4 rounded-2xl bg-black border border-white/10 text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all"/>
                                            </div>
                                        </div>
                                        <Button onClick={handleVerifyInstructor} variant="gold" className="w-full py-5 text-lg font-bold rounded-2xl">Kod Doğrula <Unlock size={18} className="ml-2"/></Button>
                                     </div>
                                  ) : (
                                    <>
                                        {authMode === 'LOGIN' ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase ml-2">E-posta</label>
                                                    <div className="relative">
                                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"/>
                                                        <input type="email" name="loginEmail" autoComplete="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]" placeholder="ornek@enid.com" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase ml-2">Şifre</label>
                                                    <div className="relative">
                                                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"/>
                                                        <input type="password" name="loginPassword" autoComplete="current-password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]" placeholder="••••••" />
                                                    </div>
                                                </div>
                                                <Button onClick={handleAuthSubmit} variant="gold" className="w-full py-5 text-lg font-bold mt-4 rounded-2xl" disabled={loading} isLoading={loading}>Giriş Yap</Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                                <input type="text" name="registerName" placeholder="Ad Soyad" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all" />
                                                <input type="email" name="registerEmail" autoComplete="email" placeholder="E-posta" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all" />
                                                <input type="text" name="registerTc" placeholder="TC Kimlik No" value={registerForm.tcNo} onChange={e => setRegisterForm({...registerForm, tcNo: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all" />
                                                {loginRole === UserRole.STUDENT && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <select value={registerForm.className} onChange={e => setRegisterForm({...registerForm, className: e.target.value})} className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 bg-black focus:border-amber-500/50 outline-none appearance-none">
                                                            <option value="">Sınıf Seçiniz</option>
                                                            {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                        <select value={registerForm.field} onChange={e => setRegisterForm({...registerForm, field: e.target.value})} className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 bg-black focus:border-amber-500/50 outline-none appearance-none">
                                                            <option value="">Alan Seçiniz</option>
                                                            {FIELD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                                <input type="password" name="registerPassword" autoComplete="new-password" placeholder="Şifre Belirle" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all" />
                                                <Button onClick={handleAuthSubmit} variant="gold" className="w-full py-5 text-lg font-bold rounded-2xl" disabled={loading} isLoading={loading}>Kayıt Ol</Button>
                                            </div>
                                        )}
                                        <div className="mt-8 text-center">
                                            <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="text-sm font-bold text-gray-500 hover:text-amber-400 uppercase tracking-widest transition-colors">{authMode === 'LOGIN' ? (loginRole === UserRole.INSTRUCTOR ? 'Hesap Oluştur' : 'Hesap Oluştur') : 'Giriş Yap'}</button>
                                        </div>
                                    </>
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

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white"><div className="flex flex-col items-center"><div className="w-16 h-16 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mb-4"></div><div className="text-xl font-bold animate-pulse">Enid AI Yükleniyor...</div></div></div>;
  if (!user) return <LandingPage onLoginSuccess={setUser} />;

  if (activeCall) return <CallOverlay session={activeCall} onEnd={() => setActiveCall(null)} />;

  const renderContent = () => {
      if (activeExamSession) {
          // Exam taking UI (unchanged from good version)
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
                              <Button onClick={() => setActiveExamSession({...activeExamSession, currentQuestion: activeExamSession.currentQuestion + 1})} variant="primary" className="px-8 py-4 text-lg">Sonraki Soru <ChevronRight className="ml-2" /></Button>
                          ) : (
                              <Button onClick={submitExam} variant="gold" className="px-8 py-4 text-lg">Sınavı Bitir <CheckCircle className="ml-2" /></Button>
                          )}
                      </div>
                  </div>
              </div>
          );
      }

      if (examResult) {
          return (
              <div className="flex items-center justify-center h-full">
                  <div className="glass-panel p-12 rounded-[3rem] text-center max-w-lg w-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
                      <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 text-green-500"><Trophy size={48}/></div>
                      <h2 className="text-3xl font-black mb-2">Sınav Tamamlandı!</h2>
                      <p className="text-gray-400 mb-8">Sonuçlarınız sisteme kaydedildi.</p>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                              <div className="text-2xl font-bold text-white">{examResult.score}</div>
                              <div className="text-xs text-gray-500 uppercase font-bold">Puan</div>
                          </div>
                          <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/10">
                              <div className="text-2xl font-bold text-green-500">{examResult.correctCount}</div>
                              <div className="text-xs text-green-600 uppercase font-bold">Doğru</div>
                          </div>
                          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/10">
                              <div className="text-2xl font-bold text-red-500">{examResult.wrongCount}</div>
                              <div className="text-xs text-red-600 uppercase font-bold">Yanlış</div>
                          </div>
                      </div>
                      <Button onClick={() => setExamResult(null)} variant="primary" className="w-full">Panela Dön</Button>
                  </div>
              </div>
          );
      }

      // Main Switch Logic
      switch(activeTab) {
          case 'assignments':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-500 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                              <h2 className="text-3xl font-black text-white">Ödevler</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'ASSIGNMENT', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Yeni Ödev</Button>}
                      </div>
                      <div className="grid gap-4">
                          {assignments.map(assign => (
                              <div key={assign.id} className="glass-panel p-6 rounded-[2rem] hover:bg-white/5 transition-all group border-l-4 border-l-brand-500">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <div className="flex items-center gap-3 mb-2">
                                              <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase">{assign.subject}</span>
                                              <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {new Date(assign.dueDate).toLocaleDateString()}</span>
                                          </div>
                                          <h3 className="text-xl font-bold text-white mb-2">{assign.title}</h3>
                                          <p className="text-gray-400 text-sm line-clamp-2">{assign.description}</p>
                                      </div>
                                      {user.role === UserRole.STUDENT ? (
                                          <Button variant="outline" className="h-10 px-4 text-xs">Teslim Et</Button>
                                      ) : (
                                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Edit2 size={16}/></button>
                                              <button className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {assignments.length === 0 && <EmptyState icon={BookOpen} title="Ödev Bulunamadı" description="Şu an için aktif bir ödev bulunmuyor." />}
                      </div>
                  </div>
              );

          case 'exams':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                               <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-500 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                               <h2 className="text-3xl font-black text-white">Sınavlar</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'EXAM', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Sınav Oluştur</Button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {exams.map(exam => (
                              <div key={exam.id} className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><FileText size={100}/></div>
                                  <div className="relative z-10">
                                      <span className="inline-block px-3 py-1 rounded-lg bg-white/10 text-xs font-bold text-white mb-4 border border-white/5">{exam.subject}</span>
                                      <h3 className="text-2xl font-bold text-white mb-2">{exam.title}</h3>
                                      <p className="text-gray-400 text-sm mb-6">{exam.durationMinutes} Dakika • {exam.questions.length} Soru</p>
                                      {user.role === UserRole.STUDENT && <Button onClick={() => handleStartExam(exam)} variant="gold" className="w-full">Sınava Başla</Button>}
                                  </div>
                              </div>
                          ))}
                          {exams.length === 0 && <div className="col-span-full"><EmptyState icon={FileText} title="Aktif Sınav Yok" description="Şu an planlanmış bir sınav bulunmuyor." /></div>}
                      </div>
                  </div>
              );

          case 'students':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="flex justify-between items-end mb-4">
                          <div>
                               <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-500 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                               <h2 className="text-3xl font-black text-white">Öğrenciler</h2>
                          </div>
                          <div className="flex gap-2">
                             {/* Filters could go here */}
                             {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'STUDENT', isOpen: true})} variant="luxury"><UserPlus size={18} className="mr-2"/> Öğrenci Ekle</Button>}
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {students.map(std => (
                              <div key={std.id} className="glass-panel p-6 rounded-[2rem] flex items-center gap-4 hover:border-brand-500/50 transition-colors group">
                                  <img src={std.avatarUrl} className="w-16 h-16 rounded-2xl bg-black border border-white/10" alt=""/>
                                  <div className="flex-1">
                                      <h4 className="font-bold text-white">{std.name}</h4>
                                      <p className="text-xs text-gray-400 mb-1">{std.className} - {std.field}</p>
                                      <div className="flex gap-2">
                                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Aktif</span>
                                      </div>
                                  </div>
                                  {user.role === UserRole.INSTRUCTOR && (
                                      <button onClick={() => handleDeleteStudent(std.id)} className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              );

          case 'chat':
              return (
                  <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 p-[2px] animate-spin-slow">
                                  <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center"><Bot size={24} className="text-white"/></div>
                              </div>
                              <div>
                                  <h3 className="font-bold text-white text-lg">Enid AI Asistan</h3>
                                  <p className="text-xs text-brand-400 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</p>
                              </div>
                          </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                          {chatMessages.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                  <Sparkles size={48} className="mb-4 text-brand-500"/>
                                  <p>Merhaba! Ben Enid. Derslerin, ödevlerin veya planlaman hakkında bana her şeyi sorabilirsin.</p>
                              </div>
                          )}
                          {chatMessages.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'}`}>
                                      {msg.text}
                                  </div>
                              </div>
                          ))}
                          {isChatLoading && <div className="flex justify-start"><div className="bg-white/10 p-4 rounded-2xl rounded-tl-none"><div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span></div></div></div>}
                      </div>
                      <form onSubmit={handleChatSubmit} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                          <input 
                              value={chatInput} 
                              onChange={e => setChatInput(e.target.value)} 
                              placeholder="Bir şeyler sor..." 
                              className="flex-1 bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500/50 outline-none"
                          />
                          <Button type="submit" variant="luxury" className="px-4"><Send size={20}/></Button>
                      </form>
                  </div>
              );

          case 'attendance':
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex justify-between items-end">
                          <div>
                               <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-500 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                               <h2 className="text-3xl font-black text-white">Dijital Yoklama</h2>
                          </div>
                      </div>
                      
                      {/* Interactive Card */}
                      <div className="glass-panel p-8 rounded-[3rem] relative overflow-hidden text-center max-w-xl mx-auto border-t border-white/20 shadow-glow">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-amber-500 to-red-500"></div>
                          
                          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-700 ${todayAttendanceState === 'CHECKED_IN' ? 'bg-green-500/20 text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-500'}`}>
                              {attendanceLoading ? <Scan size={48} className="animate-ping"/> : (todayAttendanceState === 'CHECKED_IN' ? <UserCheck size={48}/> : <Fingerprint size={48}/>)}
                          </div>
                          
                          <h3 className="text-2xl font-bold text-white mb-2">
                              {attendanceLoading ? 'Taranıyor...' : (todayAttendanceState === 'CHECKED_IN' ? 'Okuldasın' : 'Giriş Yapılmadı')}
                          </h3>
                          <p className="text-gray-400 mb-8">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          
                          <div className="flex gap-4 justify-center">
                              <Button 
                                onClick={handleCheckIn} 
                                disabled={todayAttendanceState !== 'NONE' || attendanceLoading} 
                                variant={todayAttendanceState === 'NONE' ? 'luxury' : 'secondary'} 
                                className="w-40 h-14 text-lg"
                                isLoading={todayAttendanceState === 'NONE' && attendanceLoading}
                              >
                                  Giriş Yap
                              </Button>
                              <Button 
                                onClick={handleCheckOut} 
                                disabled={todayAttendanceState !== 'CHECKED_IN' || attendanceLoading} 
                                variant={todayAttendanceState === 'CHECKED_IN' ? 'danger' : 'secondary'}
                                className="w-40 h-14 text-lg"
                                isLoading={todayAttendanceState === 'CHECKED_IN' && attendanceLoading}
                              >
                                  Çıkış Yap
                              </Button>
                          </div>
                      </div>

                      {/* Log History */}
                      <div className="max-w-xl mx-auto">
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Bugünün Hareketleri</h4>
                          <div className="space-y-4">
                              {todayAttendanceState !== 'NONE' && (
                                  <div className="glass-panel p-4 rounded-2xl flex justify-between items-center border-l-4 border-l-green-500">
                                      <div className="flex items-center gap-4">
                                          <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><ArrowUpRight size={20}/></div>
                                          <div>
                                              <p className="font-bold text-white">Giriş Yapıldı</p>
                                              <p className="text-xs text-gray-500">Turnike 1 - Ana Giriş</p>
                                          </div>
                                      </div>
                                      <span className="font-mono text-gray-400">08:32</span>
                                  </div>
                              )}
                              {todayAttendanceState === 'CHECKED_OUT' && (
                                  <div className="glass-panel p-4 rounded-2xl flex justify-between items-center border-l-4 border-l-red-500">
                                      <div className="flex items-center gap-4">
                                          <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><ArrowDownLeft size={20}/></div>
                                          <div>
                                              <p className="font-bold text-white">Çıkış Yapıldı</p>
                                              <p className="text-xs text-gray-500">Turnike 1 - Ana Giriş</p>
                                          </div>
                                      </div>
                                      <span className="font-mono text-gray-400">15:45</span>
                                  </div>
                              )}
                          </div>
                      </div>
                </div>
            );

          case 'study':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-500 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                              <h2 className="text-3xl font-black text-white">Etütler</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'STUDY', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Etüt Ekle</Button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {studySessions.map(session => (
                              <div key={session.id} className="glass-panel p-6 rounded-[2rem] hover:bg-white/5 transition-all">
                                  <div className="flex justify-between items-start mb-4">
                                      <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase">{session.subject}</span>
                                      <span className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</span>
                                  </div>
                                  <h3 className="text-xl font-bold text-white mb-2">{session.teacherName} ile Etüt</h3>
                                  <p className="text-gray-400 text-sm mb-4"><Clock size={14} className="inline mr-1"/> {session.time} • {session.location}</p>
                                  <Button variant="outline" className="w-full">Katıl</Button>
                              </div>
                          ))}
                          {studySessions.length === 0 && <div className="col-span-full"><EmptyState icon={Calendar} title="Etüt Yok" description="Şu an planlanmış bir etüt bulunmuyor." /></div>}
                      </div>
                  </div>
              );

          case 'projects':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-500 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                              <h2 className="text-3xl font-black text-white">Projeler</h2>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          {projects.map(proj => (
                              <div key={proj.id} className="glass-panel p-6 rounded-[2rem] flex items-center justify-between">
                                  <div>
                                      <h3 className="text-xl font-bold text-white mb-1">{proj.title}</h3>
                                      <p className="text-gray-400 text-sm">{proj.description}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                          <div className="h-full bg-brand-500" style={{width: `${proj.progress}%`}}></div>
                                      </div>
                                      <span className="text-brand-500 font-bold">{proj.progress}%</span>
                                  </div>
                              </div>
                          ))}
                          {projects.length === 0 && <EmptyState icon={Layout} title="Proje Yok" description="Aktif proje bulunmuyor." />}
                      </div>
                  </div>
              );

          case 'messages':
              return (
                  <div className="h-[calc(100vh-8rem)] glass-panel rounded-[2.5rem] flex overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Conversation List */}
                      <div className="w-1/3 border-r border-white/10 bg-white/5 flex flex-col">
                          <div className="p-6 border-b border-white/10">
                              <h3 className="text-xl font-bold text-white mb-4">Mesajlar</h3>
                              <div className="relative">
                                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                                  <input placeholder="Ara..." className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-brand-500/50 outline-none"/>
                              </div>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                              {conversations.map(conv => (
                                  <div key={conv.id} onClick={() => setActiveConversationId(conv.id)} className={`p-4 flex gap-3 cursor-pointer transition-colors ${activeConversationId === conv.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                      <img src={conv.participantAvatar} className="w-12 h-12 rounded-full bg-black" alt=""/>
                                      <div className="flex-1 overflow-hidden">
                                          <div className="flex justify-between items-start">
                                              <h4 className="font-bold text-white truncate">{conv.participantName}</h4>
                                              <span className="text-xs text-gray-500">12:30</span>
                                          </div>
                                          <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      
                      {/* Chat Window */}
                      <div className="flex-1 flex flex-col bg-[#020617]/50">
                          {activeConversationId ? (
                              <>
                                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                      <div className="flex items-center gap-3">
                                          <img src={conversations.find(c => c.id === activeConversationId)?.participantAvatar} className="w-10 h-10 rounded-full bg-black" alt=""/>
                                          <h4 className="font-bold text-white">{conversations.find(c => c.id === activeConversationId)?.participantName}</h4>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => handleStartCall('voice', conversations.find(c => c.id === activeConversationId)?.participantName || '', conversations.find(c => c.id === activeConversationId)?.participantAvatar || '')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><Phone size={20}/></button>
                                          <button onClick={() => handleStartCall('video', conversations.find(c => c.id === activeConversationId)?.participantName || '', conversations.find(c => c.id === activeConversationId)?.participantAvatar || '')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><Video size={20}/></button>
                                      </div>
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                      {conversations.find(c => c.id === activeConversationId)?.messages.map(msg => (
                                          <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                              <div className={`max-w-[70%] p-3 rounded-2xl ${msg.senderId === user.id ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                                                  {msg.messageType === 'text' && <p>{msg.text}</p>}
                                                  {msg.messageType === 'image' && <img src={msg.fileUrl} className="rounded-lg max-w-full" alt="Shared"/>}
                                                  {msg.messageType === 'file' && <div className="flex items-center gap-2"><FileText size={20}/> <span className="underline">{msg.fileName}</span></div>}
                                                  {msg.messageType === 'audio' && <div className="flex items-center gap-2"><PlayCircle size={20}/> <span>Ses Kaydı ({msg.duration})</span></div>}
                                                  <span className="text-[10px] opacity-50 block text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2 items-center">
                                      <button onClick={handleFileUpload} className="p-2 text-gray-400 hover:text-white"><Paperclip size={20}/></button>
                                      <input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Mesaj yaz..." className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-500/50 outline-none"/>
                                      {messageInput ? (
                                          <button onClick={() => handleSendMessage('text')} className="p-2 bg-brand-600 text-white rounded-full"><Send size={18}/></button>
                                      ) : (
                                          <button onClick={handleVoiceRecord} className={`p-2 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white'}`}><Mic size={20}/></button>
                                      )}
                                  </div>
                              </>
                          ) : (
                              <div className="flex-1 flex items-center justify-center text-gray-500">Sohbet seçiniz</div>
                          )}
                      </div>
                  </div>
              );

          case 'classes':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-500 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                              <h2 className="text-3xl font-black text-white">Sınıflar</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'CLASS', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Sınıf Ekle</Button>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {classes.map((cls, idx) => (
                              <div key={idx} onClick={() => { setActiveTab('students'); setSelectedClassFilter(cls); }} className="glass-panel p-6 rounded-[2rem] text-center hover:bg-white/5 cursor-pointer hover:border-brand-500 transition-all group">
                                  <h3 className="text-2xl font-black text-white group-hover:text-brand-500 transition-colors">{cls}</h3>
                                  <p className="text-xs text-gray-500 uppercase font-bold mt-2">Öğrencileri Gör</p>
                              </div>
                          ))}
                          {classes.length === 0 && <EmptyState icon={Layout} title="Sınıf Yok" description="Henüz sınıf eklenmemiş." />}
                      </div>
                  </div>
              );

          case 'fields':
               return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <button onClick={() => setActiveTab('dashboard')} className="flex items-center text-sm text-gray-500 hover:text-white mb-2 transition-colors"><ChevronLeft size={16}/> Geri Dön</button>
                              <h2 className="text-3xl font-black text-white">Alanlar</h2>
                          </div>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'FIELD', isOpen: true})} variant="luxury"><Plus size={18} className="mr-2"/> Alan Ekle</Button>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {fields.map((f, idx) => (
                              <div key={idx} onClick={() => { setActiveTab('students'); setSelectedFieldFilter(f); }} className="glass-panel p-6 rounded-[2rem] text-center hover:bg-white/5 cursor-pointer hover:border-brand-500 transition-all group">
                                  <h3 className="text-xl font-black text-white group-hover:text-brand-500 transition-colors">{f}</h3>
                                  <p className="text-xs text-gray-500 uppercase font-bold mt-2">Öğrencileri Gör</p>
                              </div>
                          ))}
                           {fields.length === 0 && <EmptyState icon={Layout} title="Alan Yok" description="Henüz alan eklenmemiş." />}
                      </div>
                  </div>
              );

          default:
              // Dashboard View (Bento Grid)
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

                      {user.role === UserRole.INSTRUCTOR ? (
                        <>
                           {/* MODERN INSTRUCTOR HERO */}
                           <div className="glass-panel rounded-[3rem] p-10 mb-10 relative overflow-hidden border border-white/10 shadow-glow-lg">
                               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-500/20 via-orange-600/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
                               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                   <div className="text-center md:text-left">
                                       <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-widest mb-4 border border-amber-500/20">Yönetim Paneli</span>
                                       <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">Kurumun<br/>Komuta Merkezi.</h2>
                                       <p className="text-gray-400 max-w-md">Anlık veri akışı, öğrenci takibi ve akademik analiz tek ekranda.</p>
                                   </div>
                                   <div className="flex gap-4">
                                       <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md text-center w-32 hover:scale-105 transition-transform duration-300 shadow-xl">
                                           <div className="text-3xl font-black text-white mb-1">{students.length}</div>
                                           <div className="text-[10px] font-bold text-gray-500 uppercase">Öğrenci</div>
                                       </div>
                                       <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md text-center w-32 hover:scale-105 transition-transform duration-300 shadow-xl">
                                            <div className="text-3xl font-black text-white mb-1">{fields.length}</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase">Aktif Alan</div>
                                       </div>
                                       <div className="p-6 bg-green-500/10 rounded-[2rem] border border-green-500/20 backdrop-blur-md text-center w-32 hover:scale-105 transition-transform duration-300 shadow-xl animate-pulse-slow">
                                            <div className="text-3xl font-black text-green-400 mb-1">248</div>
                                            <div className="text-[10px] font-bold text-green-500/70 uppercase">Günlük Giriş</div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <DashboardCard title="Genel Ort." value="84.5" subtitle="Başarılı" icon={TrendingUp} trend="+2.4" colorClass="text-brand-500" />
                            <DashboardCard title="Tamamlanan" value="12" subtitle="Ödev" icon={CheckCircle} colorClass="text-green-500" />
                            <DashboardCard title="Bekleyen" value="3" subtitle="Ödev" icon={Clock} colorClass="text-orange-500" />
                            <DashboardCard title="Sıralama" value="#4" subtitle="Sınıf" icon={Award} trend="+1" colorClass="text-purple-500" />
                        </div>
                      )}
                      
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
      }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#020617] text-white' : 'bg-gray-50 text-gray-900'}`}>
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
                <SidebarItem icon={MessageCircle} label="Mesajlar" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} collapsed={collapsed} />
                <SidebarItem icon={Calendar} label="Etütler" active={activeTab === 'study'} onClick={() => setActiveTab('study')} collapsed={collapsed} />
                <SidebarItem icon={Layers} label="Projeler" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} collapsed={collapsed} />
                
                {user.role === UserRole.INSTRUCTOR && (
                    <>
                        <SidebarItem icon={Users} label="Öğrenciler" active={activeTab === 'students'} onClick={() => setActiveTab('students')} collapsed={collapsed} role={user?.role} />
                        <SidebarItem icon={School} label="Sınıflar" active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} collapsed={collapsed} />
                        <SidebarItem icon={Briefcase} label="Alanlar" active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} collapsed={collapsed} />
                    </>
                )}
                
                <SidebarItem icon={Bot} label="AI Asistan" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} collapsed={collapsed} />
                <SidebarItem icon={Fingerprint} label="Yoklama" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} collapsed={collapsed} />
            </div>

            <div className="p-4 border-t border-white/10">
                <button onClick={handleLogout} className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 w-full rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors`}>
                    <LogOut size={20} />
                    {!collapsed && <span className="ml-3 font-medium">Çıkış Yap</span>}
                </button>
            </div>
        </aside>

        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-72'} p-8 md:p-12`}>
            {renderContent()}
        </main>
        
        {/* Modals */}
        {isModalOpen.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/10 w-full max-w-md animate-in zoom-in-95">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="text-xl font-bold text-white">Yeni Ekle</h3>
                         <button onClick={() => setIsModalOpen({type:'', isOpen: false})}><X size={24} className="text-gray-500"/></button>
                     </div>
                     <div className="space-y-4">
                         {isModalOpen.type === 'ASSIGNMENT' && (
                             <>
                                <input placeholder="Başlık" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, title: e.target.value})} />
                                <textarea placeholder="Açıklama" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, description: e.target.value})} />
                                <input type="date" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                                <Button onClick={handleAddAssignment} className="w-full py-4">Oluştur</Button>
                                
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-4">
                                    <p className="text-sm text-gray-400 mb-2">Yapay Zeka ile Oluştur</p>
                                    <div className="flex gap-2">
                                        <input placeholder="Konu (örn: Fizik)" className="flex-1 p-2 bg-black rounded-lg text-white border border-white/10 text-sm" value={assignmentTopic} onChange={e => setAssignmentTopic(e.target.value)} />
                                        <Button onClick={handleGenerateAssignment} variant="luxury" className="px-3 py-2 text-xs" isLoading={isGeneratingAssignment}>AI Üret</Button>
                                    </div>
                                    {generatedAssignment && <div onClick={() => setFormData({...formData, title: generatedAssignment.title, description: generatedAssignment.description})} className="mt-2 text-xs text-green-400 cursor-pointer hover:underline">Taslak hazır! Kullanmak için tıkla.</div>}
                                </div>
                             </>
                         )}
                         {isModalOpen.type === 'EXAM' && (
                             <>
                                <input placeholder="Sınav Başlığı" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, title: e.target.value})} />
                                <input placeholder="Konu" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, subject: e.target.value})} />
                                <input type="number" placeholder="Süre (Dakika)" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, duration: e.target.value})} />
                                <Button onClick={handleAddExam} className="w-full py-4">Sınavı Yayınla</Button>
                             </>
                         )}
                         {isModalOpen.type === 'STUDY' && (
                             <>
                                <input placeholder="Ders/Konu" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, subject: e.target.value})} />
                                <input placeholder="Öğretmen Adı" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, teacherName: e.target.value})} />
                                <input type="date" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, date: e.target.value})} />
                                <input type="time" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, time: e.target.value})} />
                                <Button onClick={handleAddStudy} className="w-full py-4">Etüt Oluştur</Button>
                             </>
                         )}
                         {isModalOpen.type === 'CLASS' && (
                             <>
                                <input placeholder="Sınıf Adı (örn: 11-F)" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, name: e.target.value})} />
                                <Button onClick={handleAddClass} className="w-full py-4">Sınıf Ekle</Button>
                             </>
                         )}
                         {isModalOpen.type === 'FIELD' && (
                             <>
                                <input placeholder="Alan Adı (örn: Sözel)" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-brand-500/50" onChange={e => setFormData({...formData, name: e.target.value})} />
                                <Button onClick={handleAddField} className="w-full py-4">Alan Ekle</Button>
                             </>
                         )}
                         {isModalOpen.type === 'STUDENT' && (
                             <p className="text-gray-400 text-center">Öğrenci kaydı ana sayfadan yapılmalıdır.</p>
                         )}
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;