
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
  Smartphone, Monitor, Lightbulb, Key, Unlock, LogIn, Hash
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
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 text-sm";
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    secondary: "bg-slate-700 text-gray-200 hover:bg-slate-600 border border-slate-600",
    outline: "bg-transparent border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20",
    luxury: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 border-0",
    gold: "bg-amber-500 text-black hover:bg-amber-400 font-bold shadow-lg shadow-amber-500/30",
    glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10"
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
}> = ({ icon: Icon, label, active, onClick, collapsed, badge }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`relative flex items-center w-full py-3 px-4 transition-colors duration-200
      ${active 
          ? 'bg-brand-600 text-white border-r-4 border-brand-300' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      } ${collapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      
      {!collapsed && (
        <span className="ml-3 font-medium text-sm">
            {label}
        </span>
      )}
       {badge !== undefined && badge > 0 && (
          <span className={`absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 text-[10px]`}>{badge}</span>
        )}
    </button>
  );
};

const StatCard: React.FC<{
  title: string; value: string; icon: React.ElementType; color: string;
}> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg flex items-start justify-between shadow-sm">
        <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')} ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const EmptyState: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/50 text-center w-full">
    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
      <Icon size={32} />
    </div>
    <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
    <p className="text-slate-500 text-sm max-w-xs">{description}</p>
  </div>
);

const Marquee: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <div className="relative flex overflow-x-hidden border-y border-white/5 bg-white/5 py-4">
      <div className="animate-marquee whitespace-nowrap flex flex-row">
        {items.map((item, index) => (
          <div key={index} className="mx-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            {item}
          </div>
        ))}
        {items.map((item, index) => (
          <div key={`dup-${index}`} className="mx-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400">
             <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- DATA STATES ---
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
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

  // Messaging State (Human)
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
      
      // Mock Data for conversations if empty
      if (conversations.length === 0) {
          setConversations([
             {
                 id: '1', participantId: 'mock1', participantName: 'Dr. Zeynep Hoca', participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep', participantRole: UserRole.INSTRUCTOR,
                 lastMessage: 'Ödevini kontrol ettim.', unreadCount: 1, status: 'active',
                 messages: [{ id: 'm1', senderId: 'mock1', text: 'Merhaba, ödevini kontrol ettim. Gayet başarılı.', messageType: 'text', timestamp: new Date().toISOString() }]
             }
          ]);
      }

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
      setFormData({});
  };
  
  const handleAddProject = async () => {
      await db.collection("projects").add({ 
          title: formData.title, 
          description: formData.description, 
          deadline: formData.deadline, 
          progress: 0, 
          status: 'PLANNING',
          teamMembers: [user!.id] 
      });
      setIsModalOpen({type: '', isOpen: false});
      setFormData({});
  };

  const handleAddAnnouncement = async () => {
      await db.collection("announcements").add({ title: formData.title, content: formData.content, date: new Date().toISOString(), authorName: user!.name, priority: 'NORMAL' });
      setIsModalOpen({type:'', isOpen:false});
      setFormData({});
  };
  const handleAddClass = async () => { await db.collection("classes").add({ name: formData.name }); setIsModalOpen({type:'', isOpen:false}); setFormData({}); };
  const handleAddField = async () => { await db.collection("fields").add({ name: formData.name }); setIsModalOpen({type:'', isOpen:false}); setFormData({}); };

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
      setConversations(prev => prev.map(c => { if (c.id === activeConversationId) return { ...c, messages: [...c.messages, newMsg], lastMessage: type === 'text' ? messageInput : 'Yeni Medya' }; return c; }));
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
          // EXAM INTERFACE (Kept Clean)
          const q = activeExamSession.exam.questions[activeExamSession.currentQuestion];
          return (
              <div className="flex flex-col h-full max-w-4xl mx-auto py-10">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-bold text-white">{activeExamSession.exam.title}</h2>
                      <div className="px-6 py-2 bg-slate-800 rounded-xl font-mono text-xl text-brand-400">
                          {Math.floor(activeExamSession.timeLeft / 60)}:{(activeExamSession.timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                  </div>
                  <div className="bg-slate-800 rounded-3xl p-10 border border-slate-700 shadow-xl">
                      <div className="mb-6 text-brand-500 font-bold uppercase tracking-widest text-sm">Soru {activeExamSession.currentQuestion + 1} / {activeExamSession.exam.questions.length}</div>
                      <h3 className="text-2xl font-medium mb-8 leading-relaxed text-white">{q.text}</h3>
                      <div className="space-y-3">
                          {q.options?.map((opt, i) => (
                              <button key={i} onClick={() => handleAnswerExam(opt)} 
                                className={`w-full p-5 text-left rounded-xl border transition-all duration-200 ${activeExamSession.answers[q.id] === opt ? 'border-brand-500 bg-brand-900/20 text-white' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300'}`}>
                                  {opt}
                              </button>
                          ))}
                      </div>
                      <div className="mt-10 flex justify-end">
                          {activeExamSession.currentQuestion < activeExamSession.exam.questions.length - 1 ? (
                              <Button onClick={() => setActiveExamSession({...activeExamSession, currentQuestion: activeExamSession.currentQuestion + 1})} variant="primary">Sonraki <ChevronRight className="ml-2" size={16} /></Button>
                          ) : (
                              <Button onClick={submitExam} variant="luxury">Sınavı Bitir <CheckCircle className="ml-2" size={16} /></Button>
                          )}
                      </div>
                  </div>
              </div>
          );
      }

      if (examResult) {
          // RESULT INTERFACE (Kept Clean)
          return (
              <div className="flex items-center justify-center h-full">
                  <div className="bg-slate-800 p-12 rounded-3xl text-center max-w-xl w-full border border-slate-700 shadow-2xl">
                      <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500"><Trophy size={48}/></div>
                      <h2 className="text-3xl font-bold mb-4 text-white">Sınav Tamamlandı</h2>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="p-4 bg-slate-900 rounded-2xl">
                              <div className="text-3xl font-bold text-white">{examResult.score}</div>
                              <div className="text-xs text-slate-500 uppercase font-bold mt-1">Puan</div>
                          </div>
                          <div className="p-4 bg-green-900/20 rounded-2xl border border-green-900/30">
                              <div className="text-3xl font-bold text-green-500">{examResult.correctCount}</div>
                              <div className="text-xs text-green-600 uppercase font-bold mt-1">Doğru</div>
                          </div>
                          <div className="p-4 bg-red-900/20 rounded-2xl border border-red-900/30">
                              <div className="text-3xl font-bold text-red-500">{examResult.wrongCount}</div>
                              <div className="text-xs text-red-600 uppercase font-bold mt-1">Yanlış</div>
                          </div>
                      </div>
                      <Button onClick={() => setExamResult(null)} variant="secondary" className="w-full">Panele Dön</Button>
                  </div>
              </div>
          );
      }

      // Standard Dashboard Logic
      switch(activeTab) {
          case 'assignments':
              return (
                  <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Ödevler</h2>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'ASSIGNMENT', isOpen: true})} variant="primary"><Plus size={18} className="mr-2"/> Yeni Ödev</Button>}
                      </div>
                      <div className="space-y-4">
                          {assignments.map(assign => (
                              <div key={assign.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-all flex justify-between items-center group">
                                  <div>
                                      <div className="flex items-center gap-3 mb-2">
                                          <span className="px-2 py-1 rounded bg-brand-900/30 text-brand-400 text-xs font-bold uppercase border border-brand-900/50">{assign.subject}</span>
                                          <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> {new Date(assign.dueDate).toLocaleDateString()}</span>
                                      </div>
                                      <h3 className="text-lg font-bold text-white">{assign.title}</h3>
                                      <p className="text-slate-400 text-sm mt-1">{assign.description}</p>
                                  </div>
                                  <div className="flex gap-2">
                                      {user.role === UserRole.STUDENT ? (
                                          <Button variant="outline" className="px-4 py-2 text-xs">Yükle</Button>
                                      ) : (
                                          <button onClick={() => {}} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {assignments.length === 0 && <EmptyState icon={BookOpen} title="Ödev Bulunamadı" description="Henüz atanmış bir ödev yok." />}
                      </div>
                  </div>
              );
          case 'exams':
              return (
                  <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Sınavlar</h2>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'EXAM', isOpen: true})} variant="primary"><Plus size={18} className="mr-2"/> Yeni Sınav</Button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {exams.map(exam => (
                              <div key={exam.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                                          <p className="text-sm text-slate-400">{exam.subject} • {exam.durationMinutes} Dakika</p>
                                      </div>
                                      <div className="bg-brand-500/10 p-2 rounded-lg text-brand-500"><Award size={24}/></div>
                                  </div>
                                  <p className="text-sm text-slate-500 mb-6">{exam.description}</p>
                                  {user.role === UserRole.STUDENT ? (
                                      <Button onClick={() => handleStartExam(exam)} variant="primary" className="w-full">Sınava Başla</Button>
                                  ) : (
                                      <div className="flex gap-2">
                                          <Button variant="outline" className="flex-1 text-xs">Düzenle</Button>
                                          <Button variant="danger" className="flex-1 text-xs">Sil</Button>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                      {exams.length === 0 && <EmptyState icon={Award} title="Sınav Yok" description="Aktif bir sınav bulunmuyor." />}
                  </div>
              );
          case 'students':
              if (user.role !== UserRole.INSTRUCTOR) return null;
              const filteredStudents = students.filter(s => 
                  (!selectedClassFilter || s.className === selectedClassFilter) &&
                  (!selectedFieldFilter || s.field === selectedFieldFilter)
              );
              return (
                  <div className="max-w-6xl mx-auto py-6 animate-in fade-in">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Öğrenciler</h2>
                          <div className="flex gap-2">
                               <select className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" onChange={e => setSelectedClassFilter(e.target.value || null)}>
                                   <option value="">Tüm Sınıflar</option>
                                   {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                               </select>
                               <select className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm" onChange={e => setSelectedFieldFilter(e.target.value || null)}>
                                   <option value="">Tüm Alanlar</option>
                                   {FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                               </select>
                          </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                          <table className="w-full text-left">
                              <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                                  <tr>
                                      <th className="p-4">Öğrenci</th>
                                      <th className="p-4">TC / PIN</th>
                                      <th className="p-4">Sınıf</th>
                                      <th className="p-4">Alan</th>
                                      <th className="p-4 text-right">İşlem</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-700">
                                  {filteredStudents.map(student => (
                                      <tr key={student.id} className="hover:bg-slate-700/50 transition-colors">
                                          <td className="p-4 flex items-center gap-3">
                                              <img src={student.avatarUrl} className="w-10 h-10 rounded-full bg-slate-700" alt=""/>
                                              <div>
                                                  <div className="font-bold text-white">{student.name}</div>
                                                  <div className="text-xs text-slate-500">{student.email}</div>
                                              </div>
                                          </td>
                                          <td className="p-4 text-slate-300">{student.tcNo || '-'}</td>
                                          <td className="p-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-bold">{student.className || '-'}</span></td>
                                          <td className="p-4 text-slate-400 text-sm">{student.field || '-'}</td>
                                          <td className="p-4 text-right">
                                              <button onClick={() => handleDeleteStudent(student.id)} className="text-slate-500 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          {filteredStudents.length === 0 && <div className="p-8 text-center text-slate-500">Öğrenci bulunamadı.</div>}
                      </div>
                  </div>
              );
          case 'classes':
              return (
                  <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
                       <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Sınıflar</h2>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'CLASS', isOpen: true})} variant="primary"><Plus size={18} className="mr-2"/> Yeni Sınıf</Button>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {classes.map((cls, i) => (
                              <div key={i} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-brand-500 cursor-pointer transition-all text-center group" onClick={() => { setSelectedClassFilter(cls); setActiveTab('students'); }}>
                                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-white group-hover:bg-brand-500 group-hover:text-white transition-colors"><Users size={20}/></div>
                                  <h3 className="text-xl font-bold text-white">{cls}</h3>
                                  <p className="text-sm text-slate-500">Öğrencileri Gör</p>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          case 'fields':
              return (
                  <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
                       <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Alanlar</h2>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'FIELD', isOpen: true})} variant="primary"><Plus size={18} className="mr-2"/> Yeni Alan</Button>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {fields.map((f, i) => (
                              <div key={i} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-amber-500 cursor-pointer transition-all text-center group" onClick={() => { setSelectedFieldFilter(f); setActiveTab('students'); }}>
                                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-white group-hover:bg-amber-500 group-hover:text-white transition-colors"><Briefcase size={20}/></div>
                                  <h3 className="text-xl font-bold text-white">{f}</h3>
                                  <p className="text-sm text-slate-500">Öğrencileri Gör</p>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          case 'attendance':
              return (
                  <div className="max-w-4xl mx-auto py-6 animate-in fade-in">
                      <h2 className="text-2xl font-bold text-white mb-6">Giriş / Çıkış Takibi</h2>
                      {user.role === UserRole.STUDENT ? (
                          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
                              <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                  {attendanceLoading && <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>}
                                  <Fingerprint size={48} className={todayAttendanceState === 'CHECKED_IN' ? 'text-green-500' : 'text-slate-400'}/>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">Dijital Yoklama</h3>
                              <p className="text-slate-400 mb-8">Okula giriş ve çıkışlarınızı buradan yapabilirsiniz.</p>
                              <div className="flex justify-center gap-4">
                                  <Button onClick={handleCheckIn} disabled={todayAttendanceState !== 'NONE' || attendanceLoading} className={`px-8 py-4 text-lg ${todayAttendanceState === 'CHECKED_IN' ? 'bg-green-600' : 'bg-brand-600'}`}>
                                      {todayAttendanceState === 'CHECKED_IN' ? 'Giriş Yapıldı' : 'Giriş Yap'}
                                  </Button>
                                  <Button onClick={handleCheckOut} disabled={todayAttendanceState !== 'CHECKED_IN' || attendanceLoading} variant="secondary" className="px-8 py-4 text-lg">
                                      {todayAttendanceState === 'CHECKED_OUT' ? 'Çıkış Yapıldı' : 'Çıkış Yap'}
                                  </Button>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {[1,2,3,4,5].map(i => (
                                  <div key={i} className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-400"><UserIcon size={20}/></div>
                                          <div>
                                              <div className="font-bold text-white">Öğrenci Adı {i}</div>
                                              <div className="text-xs text-slate-500">12-A • 08:30 Giriş</div>
                                          </div>
                                      </div>
                                      <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">OKULDA</span>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              );
          case 'study':
              return (
                  <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Etütler</h2>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'STUDY', isOpen: true})} variant="primary"><Plus size={18} className="mr-2"/> Yeni Etüt</Button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {studySessions.map(session => (
                              <div key={session.id} className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                                  <div className="flex items-center gap-2 mb-3 text-brand-400 text-sm font-bold uppercase"><Calendar size={14}/> {session.subject}</div>
                                  <div className="text-white font-bold text-lg mb-1">{session.teacherName}</div>
                                  <div className="text-slate-400 text-sm mb-4">{session.date} • {session.time}</div>
                                  <div className="flex justify-between items-center text-xs text-slate-500">
                                      <span>{session.location}</span>
                                      <span className="px-2 py-1 bg-slate-700 rounded text-slate-300">{session.status}</span>
                                  </div>
                              </div>
                          ))}
                           {studySessions.length === 0 && <EmptyState icon={Calendar} title="Etüt Yok" description="Planlanmış etüt bulunmuyor." />}
                      </div>
                  </div>
              );
          case 'projects':
              return (
                  <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
                       <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Projeler</h2>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'PROJECT', isOpen: true})} variant="primary"><Plus size={18} className="mr-2"/> Yeni Proje</Button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {projects.map(proj => (
                              <div key={proj.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                  <h3 className="text-lg font-bold text-white mb-2">{proj.title}</h3>
                                  <p className="text-slate-400 text-sm mb-4">{proj.description}</p>
                                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                                      <span>İlerleme</span>
                                      <span>{proj.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                      <div className="bg-brand-500 h-full" style={{width: `${proj.progress}%`}}></div>
                                  </div>
                              </div>
                          ))}
                          {projects.length === 0 && <EmptyState icon={Layers} title="Proje Yok" description="Aktif proje bulunmuyor." />}
                      </div>
                  </div>
              );
          case 'announcements':
              return (
                  <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white">Duyurular</h2>
                          {user.role === UserRole.INSTRUCTOR && <Button onClick={() => setIsModalOpen({type: 'ANNOUNCEMENT', isOpen: true})} variant="primary"><Plus size={18} className="mr-2"/> Yeni Duyuru</Button>}
                      </div>
                      <div className="space-y-4">
                          {announcements.map(ann => (
                              <div key={ann.id} className={`p-6 rounded-lg border flex gap-4 ${ann.priority === 'HIGH' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800 border-slate-700'}`}>
                                  <div className={`p-3 rounded-full h-fit ${ann.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                      <Megaphone size={20}/>
                                  </div>
                                  <div>
                                      <h3 className="text-lg font-bold text-white">{ann.title}</h3>
                                      <p className="text-slate-400 text-sm mt-1">{ann.content}</p>
                                      <div className="mt-3 text-xs text-slate-500 flex gap-3">
                                          <span>{new Date(ann.date).toLocaleDateString()}</span>
                                          <span>• {ann.authorName}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {announcements.length === 0 && <EmptyState icon={Megaphone} title="Duyuru Yok" description="Henüz bir duyuru yayınlanmadı." />}
                      </div>
                  </div>
              );
          case 'messages':
              return (
                  <div className="h-[calc(100vh-140px)] flex gap-4 animate-in fade-in">
                      {/* Conversations List */}
                      <div className="w-1/3 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
                          <div className="p-4 border-b border-slate-700 font-bold text-white">Mesajlar</div>
                          <div className="flex-1 overflow-y-auto">
                              {conversations.map(c => (
                                  <div key={c.id} onClick={() => setActiveConversationId(c.id)} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors ${activeConversationId === c.id ? 'bg-slate-700' : ''}`}>
                                      <img src={c.participantAvatar} className="w-10 h-10 rounded-full" alt=""/>
                                      <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-baseline">
                                              <div className="font-bold text-white truncate">{c.participantName}</div>
                                              <div className="text-[10px] text-slate-500">12:30</div>
                                          </div>
                                          <div className="text-sm text-slate-400 truncate">{c.lastMessage}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      {/* Chat Window */}
                      <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden">
                          {activeConversationId ? (
                              <>
                                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
                                      <div className="flex items-center gap-3">
                                          <img src={conversations.find(c => c.id === activeConversationId)?.participantAvatar} className="w-10 h-10 rounded-full" alt=""/>
                                          <div className="font-bold text-white">{conversations.find(c => c.id === activeConversationId)?.participantName}</div>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => handleStartCall('voice', 'Dr. Zeynep', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full"><Phone size={20}/></button>
                                          <button onClick={() => handleStartCall('video', 'Dr. Zeynep', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full"><Video size={20}/></button>
                                      </div>
                                  </div>
                                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
                                      {conversations.find(c => c.id === activeConversationId)?.messages.map(m => (
                                          <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                              <div className={`max-w-[70%] p-3 rounded-2xl ${m.senderId === user.id ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-700 text-white rounded-tl-none'}`}>
                                                  {m.messageType === 'text' && <p>{m.text}</p>}
                                                  {m.messageType === 'image' && <img src={m.fileUrl} className="rounded-lg max-w-full" alt="sent"/>}
                                                  {m.messageType === 'audio' && <div className="flex items-center gap-2"><PlayCircle size={20}/> Sesli Mesaj ({m.duration})</div>}
                                                  {m.messageType === 'file' && <div className="flex items-center gap-2 underline"><FileText size={16}/> {m.fileName}</div>}
                                                  <div className="text-[10px] opacity-50 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="p-4 bg-slate-800 border-t border-slate-700">
                                      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage('text'); }} className="flex gap-2">
                                          <button type="button" onClick={handleFileUpload} className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full"><Paperclip size={20}/></button>
                                          <button type="button" onMouseDown={handleVoiceRecord} onMouseUp={handleVoiceRecord} className={`p-3 rounded-full ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}><Mic size={20}/></button>
                                          <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Mesaj yazın..." className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 text-white focus:outline-none focus:border-brand-500" />
                                          <button type="submit" className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full"><Send size={20}/></button>
                                      </form>
                                  </div>
                              </>
                          ) : (
                              <div className="flex items-center justify-center h-full text-slate-500">Sohbet seçiniz</div>
                          )}
                      </div>
                  </div>
              );
          default: // DASHBOARD
              if (user.role === UserRole.INSTRUCTOR) {
                  return (
                      <div className="max-w-6xl mx-auto py-6 animate-in fade-in">
                          <h2 className="text-2xl font-bold text-white mb-6">Kontrol Paneli</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                              <StatCard title="Toplam Öğrenci" value={students.length.toString()} icon={Users} color="text-blue-500" />
                              <StatCard title="Aktif Sınıflar" value={classes.length.toString()} icon={School} color="text-purple-500" />
                              <StatCard title="Bekleyen Ödevler" value="12" icon={Clock} color="text-amber-500" />
                              <StatCard title="Günlük Giriş" value="85%" icon={Activity} color="text-green-500" />
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                  <div className="flex justify-between items-center mb-4">
                                      <h3 className="font-bold text-white">Son Duyurular</h3>
                                      <button onClick={() => setActiveTab('announcements')} className="text-xs text-brand-400 hover:text-brand-300">Tümü</button>
                                  </div>
                                  <div className="space-y-4">
                                      {announcements.slice(0, 3).map(a => (
                                          <div key={a.id} className="pb-3 border-b border-slate-700 last:border-0 last:pb-0">
                                              <div className="font-bold text-white text-sm">{a.title}</div>
                                              <div className="text-xs text-slate-500 mt-1">{a.content.substring(0, 60)}...</div>
                                          </div>
                                      ))}
                                      {announcements.length === 0 && <div className="text-sm text-slate-500 text-center py-4">Duyuru yok.</div>}
                                  </div>
                              </div>
                              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                  <h3 className="font-bold text-white mb-4">Hızlı İşlemler</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                      <Button onClick={() => setIsModalOpen({type: 'ANNOUNCEMENT', isOpen: true})} variant="secondary" className="justify-start"><Megaphone size={16} className="mr-2"/> Duyuru Ekle</Button>
                                      <Button onClick={() => setIsModalOpen({type: 'ASSIGNMENT', isOpen: true})} variant="secondary" className="justify-start"><BookOpen size={16} className="mr-2"/> Ödev Ver</Button>
                                      <Button onClick={() => setIsModalOpen({type: 'EXAM', isOpen: true})} variant="secondary" className="justify-start"><Award size={16} className="mr-2"/> Sınav Oluştur</Button>
                                      <Button onClick={() => setActiveTab('students')} variant="secondary" className="justify-start"><Users size={16} className="mr-2"/> Öğrenci Listesi</Button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  );
              } else {
                  return (
                      <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
                          <h2 className="text-2xl font-bold text-white mb-6">Öğrenci Paneli</h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                               <div className="bg-gradient-to-br from-brand-600 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
                                   <div className="text-brand-100 font-bold mb-1">Sırada Ne Var?</div>
                                   <div className="text-2xl font-bold mb-4">Matematik Ödevi</div>
                                   <div className="flex items-center gap-2 text-sm opacity-90"><Clock size={16}/> Yarın Son Gün</div>
                               </div>
                               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                   <div className="text-slate-400 font-bold mb-1">Başarı Puanı</div>
                                   <div className="text-3xl font-bold text-white mb-2">85.4</div>
                                   <div className="text-green-500 text-sm font-bold flex items-center"><TrendingUp size={16} className="mr-1"/> +2.4 Artış</div>
                               </div>
                               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                   <div className="text-slate-400 font-bold mb-1">Devamsızlık</div>
                                   <div className="text-3xl font-bold text-white mb-2">2.5 Gün</div>
                                   <div className="w-full bg-slate-700 h-2 rounded-full"><div className="bg-green-500 h-full w-[10%]"></div></div>
                               </div>
                          </div>
                          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                              <h3 className="font-bold text-white mb-4">Yaklaşan Ödevler</h3>
                              <div className="space-y-3">
                                  {assignments.slice(0, 3).map(a => (
                                      <div key={a.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                                          <div className="flex items-center gap-3">
                                              <div className="bg-brand-500/20 p-2 rounded text-brand-500"><BookOpen size={16}/></div>
                                              <div>
                                                  <div className="font-bold text-white text-sm">{a.title}</div>
                                                  <div className="text-xs text-slate-500">{new Date(a.dueDate).toLocaleDateString()}</div>
                                              </div>
                                          </div>
                                          <Button variant="outline" className="text-xs px-3 py-1 h-auto">Detay</Button>
                                      </div>
                                  ))}
                                  {assignments.length === 0 && <div className="text-sm text-slate-500 text-center">Ödeviniz yok.</div>}
                              </div>
                          </div>
                      </div>
                  );
              }
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 font-sans flex overflow-hidden">
      {/* SIDEBAR */}
      <div className={`flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
             {!collapsed && (
               <div className="flex items-center gap-2 font-bold text-xl text-white">
                   <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center"><GraduationCap size={16}/></div>
                   Enid<span className="text-brand-500">AI</span>
               </div>
             )}
             <button onClick={() => setCollapsed(!collapsed)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                 {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
             </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
             <SidebarItem icon={Layout} label="Panel" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={collapsed} />
             {user.role === UserRole.INSTRUCTOR && <SidebarItem icon={Users} label="Öğrenciler" active={activeTab === 'students'} onClick={() => setActiveTab('students')} collapsed={collapsed} />}
             <SidebarItem icon={School} label="Sınıflar" active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} collapsed={collapsed} />
             <SidebarItem icon={Briefcase} label="Alanlar" active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} collapsed={collapsed} />
             <SidebarItem icon={BookOpen} label="Ödevler" active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} collapsed={collapsed} />
             <SidebarItem icon={Award} label="Sınavlar" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} collapsed={collapsed} />
             <SidebarItem icon={Megaphone} label="Duyurular" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} collapsed={collapsed} badge={announcements.length > 0 ? announcements.length : undefined} />
             <SidebarItem icon={Calendar} label="Etütler" active={activeTab === 'study'} onClick={() => setActiveTab('study')} collapsed={collapsed} />
             <SidebarItem icon={Layers} label="Projeler" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} collapsed={collapsed} />
             <SidebarItem icon={Fingerprint} label="Giriş/Çıkış" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} collapsed={collapsed} />
             <SidebarItem icon={MessageCircle} label="Mesajlar" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} collapsed={collapsed} />
        </div>

        <div className="p-4 border-t border-slate-800">
             <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                 <img src={user.avatarUrl} className="w-10 h-10 rounded-full bg-slate-700" alt=""/>
                 {!collapsed && (
                     <div className="min-w-0">
                         <div className="font-bold text-sm text-white truncate">{user.name}</div>
                         <div className="text-xs text-slate-500 truncate">{user.role === UserRole.INSTRUCTOR ? 'Eğitmen' : 'Öğrenci'}</div>
                     </div>
                 )}
             </div>
             <button onClick={handleLogout} className={`mt-4 w-full flex items-center justify-center gap-2 p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? 'px-0' : ''}`}>
                 <LogOut size={18}/> {!collapsed && "Çıkış Yap"}
             </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#020617]">
          {/* Header */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 backdrop-blur-md">
               <h1 className="text-xl font-bold text-white capitalize">{activeTab === 'dashboard' ? (user.role === UserRole.INSTRUCTOR ? 'Komuta Merkezi' : 'Öğrenci Paneli') : activeTab}</h1>
               <div className="flex items-center gap-4">
                   <div className="relative">
                       <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                       <input type="text" placeholder="Ara..." className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:border-brand-500 w-64"/>
                   </div>
                   <button className="p-2 text-slate-400 hover:text-white relative"><Bell size={20}/><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span></button>
               </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
              {renderContent()}
          </main>
      </div>

      {/* GLOBAL MODALS */}
      {isModalOpen.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
               <h3 className="font-bold text-white text-lg">
                   {isModalOpen.type === 'ASSIGNMENT' && 'Yeni Ödev Ekle'}
                   {isModalOpen.type === 'EXAM' && 'Yeni Sınav Oluştur'}
                   {isModalOpen.type === 'ANNOUNCEMENT' && 'Duyuru Yayınla'}
                   {isModalOpen.type === 'CLASS' && 'Sınıf Ekle'}
                   {isModalOpen.type === 'FIELD' && 'Alan Ekle'}
                   {isModalOpen.type === 'STUDY' && 'Etüt Planla'}
                   {isModalOpen.type === 'PROJECT' && 'Proje Başlat'}
               </h3>
               <button onClick={() => setIsModalOpen({...isModalOpen, isOpen: false})} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
                {isModalOpen.type === 'ASSIGNMENT' && (
                    <>
                       {/* AI Generator */}
                       <div className="p-4 bg-brand-900/10 rounded-xl border border-brand-900/30 mb-4">
                           <div className="flex items-center gap-2 text-brand-400 font-bold mb-2 text-xs uppercase tracking-wider"><Sparkles size={14}/> AI Asistan</div>
                           <div className="flex gap-2">
                               <input type="text" placeholder="Konu (örn: Türev)" value={assignmentTopic} onChange={e => setAssignmentTopic(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm text-white focus:border-brand-500 outline-none"/>
                               <Button onClick={handleGenerateAssignment} isLoading={isGeneratingAssignment} variant="luxury" className="py-2 px-4 text-xs h-10">Oluştur</Button>
                           </div>
                       </div>
                       <input type="text" placeholder="Başlık" value={generatedAssignment?.title || formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                       <textarea placeholder="Açıklama" value={generatedAssignment?.description || formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none h-32"></textarea>
                       <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="Ders" value={formData.subject || ''} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                           <input type="date" value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                       </div>
                       <Button onClick={handleAddAssignment} variant="primary" className="w-full">Kaydet</Button>
                    </>
                )}
                
                {isModalOpen.type === 'EXAM' && (
                    <>
                        <input type="text" placeholder="Sınav Başlığı" onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                        <textarea placeholder="Açıklama" onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none h-24"></textarea>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Ders" onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                            <input type="number" placeholder="Süre (dk)" onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                        </div>
                        <Button onClick={handleAddExam} variant="primary" className="w-full">Sınavı Oluştur</Button>
                    </>
                )}

                {isModalOpen.type === 'ANNOUNCEMENT' && (
                    <>
                         <input type="text" placeholder="Başlık" onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                         <textarea placeholder="İçerik" onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none h-32"></textarea>
                         <Button onClick={handleAddAnnouncement} variant="primary" className="w-full">Yayınla</Button>
                    </>
                )}
                
                {isModalOpen.type === 'CLASS' && (
                    <>
                         <input type="text" placeholder="Sınıf Adı (Örn: 10-B)" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                         <Button onClick={handleAddClass} variant="primary" className="w-full">Ekle</Button>
                    </>
                )}
                
                {isModalOpen.type === 'FIELD' && (
                    <>
                         <input type="text" placeholder="Alan Adı (Örn: Sözel)" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                         <Button onClick={handleAddField} variant="primary" className="w-full">Ekle</Button>
                    </>
                )}
                
                {isModalOpen.type === 'STUDY' && (
                    <>
                        <input type="text" placeholder="Ders" onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                        <input type="text" placeholder="Öğretmen" onChange={e => setFormData({...formData, teacherName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                            <input type="time" onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                        </div>
                        <Button onClick={handleAddStudy} variant="primary" className="w-full">Planla</Button>
                    </>
                )}

                {isModalOpen.type === 'PROJECT' && (
                    <>
                        <input type="text" placeholder="Proje Başlığı" onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                        <textarea placeholder="Proje Detayları" onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none h-32"></textarea>
                        <input type="date" onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none"/>
                        <Button onClick={handleAddProject} variant="primary" className="w-full">Proje Başlat</Button>
                    </>
                )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI ASSISTANT */}
       <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 mb-4 overflow-hidden transition-all duration-300 origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0'}`}>
                <div className="p-4 bg-gradient-to-r from-brand-600 to-indigo-600 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <Sparkles size={16}/> Enid AI
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white"><X size={16}/></button>
                </div>
                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-900">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && <div className="flex justify-start"><div className="bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-700"><div className="flex gap-1"><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span></div></div></div>}
                </div>
                <form onSubmit={handleChatSubmit} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Bir şeyler sor..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500 outline-none"/>
                    <button type="submit" className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg"><Send size={16}/></button>
                </form>
            </div>

            {/* Floating Button */}
            <button onClick={() => setIsChatOpen(!isChatOpen)} className="pointer-events-auto w-14 h-14 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full shadow-lg shadow-brand-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform group">
                <Sparkles size={24} className={`transition-transform duration-500 ${isChatOpen ? 'rotate-180' : 'rotate-0'}`}/>
            </button>
       </div>

    </div>
  );
};

export default App;
