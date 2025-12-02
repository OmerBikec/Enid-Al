
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
  Cpu, Server, Radio, BarChart3, Grip, Paperclip, Mic, Video, Laptop, Folder
} from 'lucide-react';
import { 
  User, UserRole, Assignment, Submission, SubmissionStatus, 
  Announcement, Notification, Exam, Question, ExamResult, ChatMessage,
  StudySession, Project, AttendanceRecord, Conversation, Message
} from './types';
import { generateAssignmentIdea, generateFeedbackSuggestion, generateQuizQuestions, chatWithStudentAssistant } from './services/geminiService';
import { db, auth } from './services/firebase';

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'luxury', isLoading?: boolean }> = ({ 
  children, variant = 'primary', className = '', isLoading, ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] text-sm tracking-wide";
  
  const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:bg-brand-700 border border-transparent hover:-translate-y-0.5",
    secondary: "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    outline: "bg-transparent border-2 border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 hover:shadow-glow",
    ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white",
    danger: "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:bg-red-600 border border-transparent",
    luxury: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-1 border-0"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
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

const Badge: React.FC<{ status: string, className?: string }> = ({ status, className = '' }) => {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    SUBMITTED: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    GRADED: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800",
    UPCOMING: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    COMPLETED: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    CANCELLED: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
    IN_PROGRESS: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800",
    ON_TIME: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    LATE: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
    ABSENT: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
    HIGH: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    NORMAL: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  };
  
  const labels: Record<string, string> = {
    PENDING: "Bekliyor", SUBMITTED: "Teslim Edildi", GRADED: "Notlandı",
    UPCOMING: "Yaklaşıyor", COMPLETED: "Tamamlandı", CANCELLED: "İptal",
    IN_PROGRESS: "Sürüyor", ON_TIME: "Zamanında", LATE: "Geç",
    ABSENT: "Yok", HIGH: "Önemli", NORMAL: "Normal"
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${styles[status] || 'bg-gray-100 text-gray-600'} ${className}`}>
      {labels[status] || status}
    </span>
  );
};

const SidebarItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  collapsed?: boolean;
  onClick: () => void;
  colorClass?: string;
}> = ({ icon: Icon, label, isActive, collapsed, onClick, colorClass = "text-brand-500" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center transition-all duration-300 group relative mb-2
      ${collapsed ? 'justify-center p-3' : 'px-4 py-3.5'}
      ${isActive 
        ? 'bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md shadow-glow border border-white/10' 
        : 'hover:bg-white/5 hover:backdrop-blur-sm text-slate-400 hover:text-white'}
      rounded-2xl
    `}
  >
    {isActive && (
       <div className={`absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-transparent via-current to-transparent opacity-50 ${colorClass}`}></div>
    )}
    <Icon 
      size={collapsed ? 24 : 20} 
      className={`transition-all duration-300 ${isActive ? `${colorClass} scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]` : 'group-hover:text-white group-hover:scale-105'}`} 
    />
    {!collapsed && (
      <span className={`ml-3.5 font-semibold tracking-tight ${isActive ? 'text-white' : ''}`}>
        {label}
      </span>
    )}
    {collapsed && isActive && (
        <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-xs rounded-md shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-2">
            {label}
        </div>
    )}
  </button>
);

const DashboardCard: React.FC<{
  title: string; value: string; subtitle: string; icon: React.ElementType; trend?: string; colorClass: string; className?: string;
}> = ({ title, value, subtitle, icon: Icon, trend, colorClass, className = '' }) => (
  <div className={`group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0f172a]/40 p-6 transition-all duration-500 hover:border-white/10 hover:-translate-y-1 ${className}`}>
        {/* Subtle Background Icon Watermark */}
        <Icon className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 ${colorClass}`} />
        
        <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm ${colorClass}`}>
                  <Icon size={20} />
               </div>
               {trend && (
                 <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-white/5 border border-white/5 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trend}
                 </span>
               )}
            </div>

            {/* Value & Title */}
            <div>
                <h3 className="text-5xl font-extralight tracking-tighter text-white tabular-nums mb-1">{value}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{title}</p>
            </div>
            
            {/* Footer / Subtitle */}
            <div className="mt-6 flex items-center justify-between">
               <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
            </div>
        </div>

        {/* Bottom Active Line */}
        <div className={`absolute bottom-0 left-0 h-0.5 w-full ${colorClass.replace('text-', 'bg-')} opacity-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left`}></div>
  </div>
);

const EmptyState: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
      <Icon size={40} className="text-slate-500 opacity-50" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">{description}</p>
    {action && (
      <Button variant="outline" onClick={action.onClick} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
        {action.label}
      </Button>
    )}
  </div>
);

// --- Main App ---

export default function App() {
  // Auth & User State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.STUDENT);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [instructorCode, setInstructorCode] = useState('');
  const [isInstructorVerified, setIsInstructorVerified] = useState(false);

  // App Data State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default dark
  
  // Dynamic Data (from Firebase)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classesList, setClassesList] = useState<string[]>([]);
  const [fieldsList, setFieldsList] = useState<string[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  // UI State for Modals/Filters
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterField, setFilterField] = useState('');
  const [selectedUserForChat, setSelectedUserForChat] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Exam Taking State
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [examTimer, setExamTimer] = useState(0);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'model', parts: {text: string}[]}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Auth Form State
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', pin: '', 
    tcNo: '', className: '', field: ''
  });
  const [authError, setAuthError] = useState('');

  // --- Effects ---

  useEffect(() => {
    // Dark mode init
    document.documentElement.classList.add('dark');
    
    // Auth Listener
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user details from Firestore
        const docRef = db.collection('users').doc(firebaseUser.uid);
        const doc = await docRef.get();
        if (doc.exists) {
          setUser({ id: doc.id, ...doc.data() } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Real-time Listeners
    const unsubAnnouncements = db.collection('announcements')
      .orderBy('date', 'desc')
      .onSnapshot(snapshot => {
        setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
      });

    const unsubAssignments = db.collection('assignments')
      .orderBy('dueDate', 'asc')
      .onSnapshot(snapshot => {
        setAssignments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)));
      });

    const unsubExams = db.collection('exams')
      .onSnapshot(snapshot => {
        setExams(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exam)));
      });
      
    // Fetch students/classes/fields if Instructor
    let unsubStudents = () => {};
    if (user.role === UserRole.INSTRUCTOR) {
        unsubStudents = db.collection('users')
        .where('role', '==', 'STUDENT')
        .onSnapshot(snapshot => {
            const studs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
            setStudents(studs);
            
            // Extract unique classes and fields
            const classes = Array.from(new Set(studs.map(s => s.className).filter(Boolean))) as string[];
            const fields = Array.from(new Set(studs.map(s => s.field).filter(Boolean))) as string[];
            setClassesList(classes.sort());
            setFieldsList(fields.sort());
        });
    }

    // Projects & Study & Attendance Listener (Mocked connection to generic collections for demo)
    const unsubProjects = db.collection('projects').onSnapshot(snap => setProjects(snap.docs.map(d => ({id: d.id, ...d.data()} as Project))));
    const unsubStudy = db.collection('study').onSnapshot(snap => setStudySessions(snap.docs.map(d => ({id: d.id, ...d.data()} as StudySession))));
    const unsubAttendance = db.collection('attendance').orderBy('date', 'desc').limit(50).onSnapshot(snap => setAttendanceRecords(snap.docs.map(d => ({id: d.id, ...d.data()} as AttendanceRecord))));

    return () => {
      unsubAnnouncements();
      unsubAssignments();
      unsubExams();
      unsubStudents();
      unsubProjects();
      unsubStudy();
      unsubAttendance();
    };
  }, [user]);

  // Exam Timer
  useEffect(() => {
    if (activeExam && !examResult) {
      const interval = setInterval(() => setExamTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [activeExam, examResult]);


  // --- Logic Helpers ---

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setShowAuthModal(false);
    setIsInstructorVerified(false);
    setInstructorCode('');
    setActiveTab('dashboard');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const { email, password, name, tcNo, pin, className, field } = formData;
      
      // Basic Validation
      if (!email.includes('@')) throw new Error('Geçersiz e-posta adresi.');
      if (password.length < 6) throw new Error('Şifre en az 6 karakter olmalı.');

      if (authMode === 'register') {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        const newUser: User = {
          id: cred.user!.uid,
          name,
          role: loginRole,
          pin,
          email,
          ...(loginRole === UserRole.STUDENT ? { tcNo, className, field } : {})
        };
        await db.collection('users').doc(newUser.id).set(newUser);
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }
      setShowAuthModal(false);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Bu e-posta adresi zaten kullanımda.');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('E-posta formatı hatalı.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setAuthError('E-posta veya şifre hatalı.');
      } else {
        setAuthError(error.message || 'Bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatLoading(true);
    
    const newHistory = [...chatHistory, { role: 'user' as const, parts: [{ text: userMsg }] }];
    setChatHistory(newHistory);
    
    const response = await chatWithStudentAssistant(userMsg, newHistory);
    setChatHistory([...newHistory, { role: 'model' as const, parts: [{ text: response }] }]);
    setChatLoading(false);
  };

  const handleCreateAssignment = async (data: Partial<Assignment>) => {
    await db.collection('assignments').add({
       ...data,
       createdBy: user?.id,
       createdAt: new Date().toISOString()
    });
    setIsAddAssignmentModalOpen(false);
  };

  const handleCreateAnnouncement = async (title: string, content: string, priority: 'NORMAL' | 'HIGH', classes: string[], fields: string[]) => {
      await db.collection('announcements').add({
          title, content, priority, targetClasses: classes, targetFields: fields,
          date: new Date().toISOString(),
          authorName: user?.name || 'Yönetim'
      });
      setIsAddAnnouncementModalOpen(false);
  };

  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setExamTimer(0);
    setExamResult(null);
    setExamAnswers({});
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    let correct = 0;
    let wrong = 0;
    
    activeExam.questions.forEach(q => {
        if (examAnswers[q.id] === q.correctAnswer) correct++;
        else wrong++;
    });

    const score = Math.round((correct / activeExam.questions.length) * 100);
    const result: ExamResult = {
        id: Math.random().toString(),
        examId: activeExam.id,
        studentId: user!.id,
        score, correctCount: correct, wrongCount: wrong,
        submittedAt: new Date().toISOString()
    };
    
    setExamResult(result);
    await db.collection('exam_results').add(result);
  };

  // --- Render Views ---

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center text-white">
         <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-t-4 border-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-4 border-indigo-500 rounded-full animate-spin-slow"></div>
         </div>
         <h1 className="text-3xl font-black tracking-tight animate-pulse">ENID AI</h1>
         <p className="text-gray-500 mt-2 font-mono">Sistem Başlatılıyor...</p>
      </div>
    );
  }

  // --- Landing Page & Auth ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden selection:bg-amber-500/30">
        
        {/* Navigation */}
        <nav className="fixed w-full z-50 top-0 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center font-bold text-black text-xl">E</div>
                <span className="font-black text-2xl tracking-tight">ENID AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition-colors">Özellikler</button>
                <button onClick={() => document.getElementById('stats')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition-colors">Başarılar</button>
                <button onClick={() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition-colors">Hakkımızda</button>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="text-white hover:bg-white/5" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>Giriş Yap</Button>
                <Button variant="luxury" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>Kayıt Ol</Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
             <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-amber-600/10 rounded-full blur-[100px] -z-10"></div>

             <div className="max-w-7xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm font-bold mb-8 animate-fade-in-up">
                    <Sparkles size={16} />
                    <span>Yapay Zeka Destekli Eğitim Platformu</span>
                </div>
                <h1 className="text-5xl lg:text-8xl font-black tracking-tight mb-8 leading-tight">
                    Geleceğin Eğitimini <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 animate-shimmer bg-[length:200%_auto]">Bugün Yönetin.</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Enid AI, öğrenci takibini, ödev yönetimini ve sınav analizlerini yapay zeka ile otomatikleştirir. 
                    Eğitmenler için zaman, öğrenciler için başarı kazandırır.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button variant="luxury" className="px-8 py-4 text-lg w-full sm:w-auto" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>
                        Hemen Başla <ChevronRight className="ml-2" />
                    </Button>
                    <Button variant="secondary" className="px-8 py-4 text-lg w-full sm:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}>
                        Özellikleri Keşfet
                    </Button>
                </div>
             </div>
             
             {/* Hero Image / 3D Element */}
             <div className="mt-20 relative max-w-5xl mx-auto perspective-1000 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative glass-panel bg-[#0f172a]/80 p-4 rounded-2xl border border-white/10 shadow-2xl transform rotate-x-12 group-hover:rotate-x-0 transition-all duration-700">
                    <img src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Preview" className="rounded-lg w-full h-auto opacity-90" />
                </div>
             </div>
        </header>

        {/* Marquee Stats */}
        <div id="stats" className="py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden relative">
             <div className="flex gap-16 items-center animate-marquee whitespace-nowrap min-w-full">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 text-2xl font-black text-gray-500/50 uppercase">
                        <Star size={24} className="text-amber-500/50" />
                        <span>ODTÜ</span>
                        <span>BOĞAZİÇİ</span>
                        <span>İTÜ</span>
                        <span>KOÇ</span>
                        <span>SABANCI</span>
                        <span>BİLKENT</span>
                    </div>
                ))}
             </div>
        </div>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
            <h2 className="text-4xl font-black text-center mb-16">Eğitimin Yeni Standardı</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-8 rounded-3xl col-span-1 md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity"><Bot size={120} /></div>
                    <h3 className="text-2xl font-bold mb-4">Gemini AI Asistanı</h3>
                    <p className="text-gray-400 mb-6 max-w-md">Öğrenciler için 7/24 özel ders asistanı. Soru çözümü, konu anlatımı ve motivasyon desteği anında cebinizde.</p>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 max-w-sm">
                        <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-xs text-gray-400">Enid AI yazıyor...</span></div>
                        <p className="text-sm text-indigo-300">"Türev alma kurallarını senin için özetleyebilirim, hazır mısın?"</p>
                    </div>
                </div>
                <div className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-amber-900/20 to-transparent border-amber-500/20">
                    <PieChart size={48} className="text-amber-400 mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Akıllı Analiz</h3>
                    <p className="text-gray-400">Öğrenci performansını yapay zeka ile analiz edin, eksik konuları nokta atışı tespit edin.</p>
                </div>
                <div className="glass-panel p-8 rounded-3xl">
                    <Users size={48} className="text-blue-400 mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Sınıf Yönetimi</h3>
                    <p className="text-gray-400">Yoklama, ödev takibi ve veli bilgilendirme tek ekranda.</p>
                </div>
                 <div className="glass-panel p-8 rounded-3xl col-span-1 md:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                         <h3 className="text-2xl font-bold">Hibrit Sınav Sistemi</h3>
                         <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <p className="text-gray-400">Hem online hem yüz yüze sınavlar oluşturun. Sonuçlar anında sisteme işlensin.</p>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer id="about" className="bg-[#0f172a] border-t border-white/10 pt-20 pb-10 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                         <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-bold text-black">E</div>
                         <span className="font-black text-2xl">ENID AI</span>
                    </div>
                    <p className="text-gray-400 max-w-sm">Eğitim teknolojilerinde devrim yaratan yapay zeka çözümleri. Öğrenci başarısını şansa bırakmayın.</p>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6">Platform</h4>
                    <ul className="space-y-4 text-gray-400 text-sm">
                        <li><a href="#" className="hover:text-amber-400">Özellikler</a></li>
                        <li><a href="#" className="hover:text-amber-400">Fiyatlandırma</a></li>
                        <li><a href="#" className="hover:text-amber-400">Güvenlik</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6">İletişim</h4>
                    <ul className="space-y-4 text-gray-400 text-sm">
                        <li>info@enidai.com</li>
                        <li>+90 (212) 555 00 00</li>
                        <li>İstanbul, Türkiye</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
                &copy; 2024 Enid AI Teknoloji A.Ş. Tüm hakları saklıdır.
            </div>
        </footer>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowAuthModal(false)}></div>
             <div className="relative z-10 w-full max-w-5xl bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden min-h-[600px] animate-in zoom-in-95 duration-300">
                
                {/* Left Side Visual */}
                <div className="hidden lg:flex w-1/2 bg-[#020617] relative items-center justify-center p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-4xl mb-8 mx-auto shadow-glow">E</div>
                        <h2 className="text-3xl font-black text-white mb-4">Hoş Geldiniz</h2>
                        <p className="text-gray-400 leading-relaxed">Enid AI ile eğitim hayatınızı dijitalleştirin. Tek platform, sınırsız potansiyel.</p>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-[#0f172a]">
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                    </div>
                    
                    <div className="mb-8">
                        <div className="flex gap-4 p-1 bg-white/5 rounded-xl border border-white/10 mb-8">
                             <button onClick={() => { setLoginRole(UserRole.STUDENT); setIsInstructorVerified(false); }} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${loginRole === UserRole.STUDENT ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Öğrenci</button>
                             <button onClick={() => { setLoginRole(UserRole.INSTRUCTOR); setAuthMode('login'); }} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${loginRole === UserRole.INSTRUCTOR ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Eğitmen</button>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{authMode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</h3>
                        <p className="text-gray-400 text-sm">Devam etmek için bilgilerinizi giriniz.</p>
                    </div>

                    {loginRole === UserRole.INSTRUCTOR && !isInstructorVerified ? (
                         <div className="space-y-4">
                            <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                                <Lock className="text-amber-500 mt-1 shrink-0" size={20} />
                                <p className="text-amber-200 text-sm">Eğitmen paneli sadece yetkili personel içindir. Lütfen size verilen erişim kodunu giriniz.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Erişim Kodu</label>
                                <input 
                                    type="password"
                                    value={instructorCode}
                                    onChange={(e) => setInstructorCode(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none"
                                    placeholder="Kodu giriniz..."
                                />
                            </div>
                            <Button 
                                className="w-full" variant="primary"
                                onClick={() => {
                                    if(instructorCode === 'wasd123wasd') setIsInstructorVerified(true);
                                    else setAuthError('Hatalı erişim kodu.');
                                }}
                            >
                                Doğrula
                            </Button>
                            {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
                         </div>
                    ) : (
                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            {authMode === 'register' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ad Soyad</label>
                                        <input required name="name" autoComplete="name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 transition-all outline-none" placeholder="Örn: Ahmet Yılmaz" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    {loginRole === UserRole.STUDENT && (
                                        <>
                                            <div className="col-span-2">
                                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">TC Kimlik No</label>
                                                 <input required name="tcNo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 transition-all outline-none" placeholder="11 haneli TC" value={formData.tcNo} onChange={e => setFormData({...formData, tcNo: e.target.value})} />
                                            </div>
                                            <div>
                                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sınıf</label>
                                                 <select required name="className" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 transition-all outline-none" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})}>
                                                    <option value="">Seçiniz</option>
                                                    {['9-A','9-B','10-A','10-B','11-A','11-B','12-A','12-B','Mezun','Hazırlık'].map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                                 </select>
                                            </div>
                                            <div>
                                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alan</label>
                                                 <select required name="field" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 transition-all outline-none" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})}>
                                                    <option value="">Seçiniz</option>
                                                    {['Sayısal','Eşit Ağırlık','Sözel','Dil'].map(f => <option key={f} value={f} className="text-black">{f}</option>)}
                                                 </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">E-posta Adresi</label>
                                <input required type="email" name="email" autoComplete="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 transition-all outline-none" placeholder="ornek@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Şifre</label>
                                    <input required type="password" name="password" autoComplete="new-password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 transition-all outline-none" placeholder="******" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Güvenlik PIN</label>
                                    <input required type="text" name="pin" autoComplete="off" maxLength={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 transition-all outline-none" placeholder="4 hane" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} />
                                </div>
                            </div>

                            {authError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle size={16} />
                                    {authError}
                                </div>
                            )}

                            <Button variant="luxury" type="submit" className="w-full py-4 text-base" isLoading={loading}>
                                {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                            </Button>

                            <div className="text-center mt-6">
                                <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                                    {authMode === 'login' ? 'Hesabın yok mu? Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // --- Authenticated Layout ---

  // Decide Navigation Items based on Role
  const navItems = user.role === UserRole.INSTRUCTOR ? [
    { id: 'dashboard', icon: Layout, label: 'Kontrol Merkezi' },
    { id: 'students', icon: Users, label: 'Öğrenciler' },
    { id: 'classes', icon: School, label: 'Sınıflar' },
    { id: 'fields', icon: Layers, label: 'Alanlar' },
    { id: 'assignments', icon: FileText, label: 'Ödev Yönetimi' },
    { id: 'exams', icon: Edit2, label: 'Sınavlar' },
    { id: 'attendance', icon: DoorOpen, label: 'Giriş/Çıkış Logları' },
    { id: 'announcements', icon: Megaphone, label: 'Duyurular' },
    { id: 'messages', icon: MessageSquare, label: 'Mesajlar' },
  ] : [
    { id: 'dashboard', icon: Layout, label: 'Sınıfım' },
    { id: 'assignments', icon: BookOpen, label: 'Ödevlerim' },
    { id: 'exams', icon: Edit2, label: 'Sınavlarım' },
    { id: 'attendance', icon: DoorOpen, label: 'Yoklama' },
    { id: 'study', icon: Clock, label: 'Etüt Programı' },
    { id: 'projects', icon: Briefcase, label: 'Projelerim' },
    { id: 'messages', icon: MessageSquare, label: 'Eğitmenle Sohbet' },
  ];

  const renderContent = () => {
    // === Exam Taking View ===
    if (activeExam) {
      return (
        <div className="fixed inset-0 z-50 bg-[#020617] text-white flex flex-col">
            {/* Header */}
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Edit2 size={24}/></div>
                    <div>
                        <h2 className="text-xl font-bold">{activeExam.title}</h2>
                        <p className="text-sm text-gray-400">{activeExam.subject}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-white/10 font-mono text-amber-400">
                        <Timer size={18} />
                        {Math.floor(examTimer / 60)}:{(examTimer % 60).toString().padStart(2, '0')}
                    </div>
                    <Button variant="danger" onClick={() => { if(confirm('Sınavdan çıkmak istediğine emin misin?')) setActiveExam(null); }}>Çıkış</Button>
                    {!examResult && <Button variant="primary" onClick={handleSubmitExam}>Sınavı Bitir</Button>}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                {examResult ? (
                    <div className="glass-panel p-12 rounded-3xl text-center animate-fade-in-up">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 mx-auto mb-8 flex items-center justify-center shadow-glow">
                             <Trophy size={64} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-black mb-2">Sınav Tamamlandı!</h2>
                        <p className="text-gray-400 text-lg mb-8">Sonuçların aşağıda yer almaktadır.</p>
                        
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl font-black text-indigo-400 mb-1">{examResult.score}</div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Puan</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl font-black text-green-400 mb-1">{examResult.correctCount}</div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Doğru</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl font-black text-red-400 mb-1">{examResult.wrongCount}</div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Yanlış</div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setActiveExam(null)}>Listeye Dön</Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {activeExam.questions.map((q, idx) => (
                            <div key={q.id} className="glass-panel p-8 rounded-3xl">
                                <div className="flex items-start gap-4 mb-6">
                                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</span>
                                    <p className="text-lg font-medium leading-relaxed">{q.text}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12">
                                    {q.options?.map((opt, optIdx) => (
                                        <button 
                                            key={optIdx}
                                            onClick={() => setExamAnswers({...examAnswers, [q.id]: opt})}
                                            className={`p-4 rounded-xl text-left border transition-all ${
                                                examAnswers[q.id] === opt 
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                                            }`}
                                        >
                                            <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + optIdx)})</span> {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return user.role === UserRole.INSTRUCTOR ? (
          <div className="space-y-8 animate-fade-in-up">
            {/* Instructor Hero - Cinematic Glass Cockpit */}
            <div className="relative h-[450px] rounded-[3rem] overflow-hidden group shadow-2xl border border-white/10 bg-[#0f172a]">
                {/* 3D Background Element */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-blob opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-blob animation-delay-4000 opacity-50"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                <div className="relative z-10 h-full flex flex-col justify-between p-12">
                     <div className="flex justify-between items-start">
                         <div>
                             <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Enid AI Online
                            </div>
                            <h2 className="text-7xl font-thin text-white tracking-tighter mb-4">
                                Merhaba, <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{user.name.split(' ')[0]}</span>
                            </h2>
                            <p className="text-gray-400 text-xl max-w-xl leading-relaxed">
                                Eğitim yönetimi için yapay zeka sistemleri hazır. 
                                Bugün odaklanmanız gereken <span className="text-white font-bold">{assignments.length} yeni ödev</span> ve <span className="text-white font-bold">{students.length} öğrenci</span> var.
                            </p>
                         </div>
                         
                         {/* AI System Health HUD */}
                         <div className="hidden lg:flex w-80 h-48 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex-col overflow-hidden relative shadow-2xl">
                             <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
                             
                             <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/5">
                                 <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-widest">SYSTEM_DIAGNOSTICS</span>
                                 <div className="flex gap-1">
                                     <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                     <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                 </div>
                             </div>

                             <div className="flex-1 p-4 relative">
                                 {/* Rotating Rings */}
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-indigo-500/30 border-t-indigo-500 animate-spin-slow"></div>
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-purple-500/30 border-b-purple-500 animate-spin reverse duration-1000"></div>
                                 
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                     <div className="text-2xl font-black text-white">98%</div>
                                     <div className="text-[9px] text-gray-500 uppercase tracking-widest">Efficiency</div>
                                 </div>

                                 {/* Fake Code Stream */}
                                 <div className="absolute bottom-2 left-4 text-[9px] font-mono text-emerald-500/70">
                                     > Analyzing logs...<br/>
                                     > Sync complete.
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="flex gap-4">
                         <Button variant="luxury" onClick={() => setActiveTab('students')} className="px-8 py-4 text-base">Öğrenci Paneli</Button>
                         <Button variant="secondary" onClick={() => setIsAddAssignmentModalOpen(true)} className="px-8 py-4 text-base bg-white/5 text-white border-white/10 hover:bg-white/10">Hızlı Ödev Ata</Button>
                     </div>
                </div>
            </div>

            {/* Bento Grid Stats - Ultramodern & Minimal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <DashboardCard 
                    title="TOPLAM ÖĞRENCİ" 
                    value={students.length.toString()} 
                    subtitle="Aktif Kayıt" 
                    icon={Users} 
                    colorClass="text-indigo-400"
                    trend="+5%"
                />
                <DashboardCard 
                    title="SINIF SAYISI" 
                    value={classesList.length.toString()} 
                    subtitle="Eğitim Grubu" 
                    icon={School} 
                    colorClass="text-purple-400"
                />
                <DashboardCard 
                    title="GÜNLÜK GİRİŞ" 
                    value={attendanceRecords.filter(r => r.date.startsWith(new Date().toISOString().split('T')[0])).length.toString()} 
                    subtitle="Canlı Takip" 
                    icon={Fingerprint} 
                    colorClass="text-emerald-400" 
                    trend="+12%"
                />
                <DashboardCard 
                    title="BEKLEYENLER" 
                    value={assignments.length.toString()} 
                    subtitle="Onay Süreci" 
                    icon={FileText} 
                    colorClass="text-amber-400"
                    trend="-2%"
                />
            </div>
            
            {/* Quick Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Activity size={20} className="text-orange-400"/>
                            Son Aktiviteler
                        </h3>
                        <Button variant="ghost" className="text-xs">Tümünü Gör</Button>
                    </div>
                    <div className="space-y-4">
                        {[1,2,3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Yeni bir duyuru yayınlandı.</p>
                                        <p className="text-xs text-gray-500">2 saat önce • Sistem</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white"/>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-b from-indigo-900/10 to-transparent flex flex-col items-center justify-center text-center">
                     <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-glow">
                         <Plus size={32} className="text-white"/>
                     </div>
                     <h3 className="text-lg font-bold text-white mb-2">Hızlı İşlem</h3>
                     <p className="text-gray-400 text-sm mb-6">Yeni sınıf, öğrenci veya sınav oluştur.</p>
                     <div className="grid grid-cols-2 gap-3 w-full">
                         <Button variant="secondary" className="text-xs py-2 h-auto" onClick={() => setIsAddClassModalOpen(true)}>Sınıf Ekle</Button>
                         <Button variant="secondary" className="text-xs py-2 h-auto" onClick={() => setIsAddStudentModalOpen(true)}>Öğrenci Ekle</Button>
                     </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
              {/* Student Personal Dashboard */}
              <div className="p-1 rounded-[2.5rem] bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500">
                  <div className="bg-[#0f172a] rounded-[2.4rem] p-8 md:p-12 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Rocket size={200} className="text-white"/></div>
                       <div className="relative z-10">
                           <h2 className="text-4xl font-black text-white mb-2">Hoş geldin, {user.name.split(' ')[0]} 👋</h2>
                           <p className="text-gray-400 text-lg mb-8">{user.className} - {user.field} | Başarı yolculuğunda bugün harika bir gün!</p>
                           
                           <div className="flex flex-wrap gap-4">
                               <div className="glass-panel px-6 py-4 rounded-2xl bg-white/5 border-white/10 flex items-center gap-4">
                                   <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><CheckCircle size={20}/></div>
                                   <div>
                                       <div className="text-2xl font-bold text-white">85%</div>
                                       <div className="text-xs text-gray-400">Ödev Başarısı</div>
                                   </div>
                               </div>
                               <div className="glass-panel px-6 py-4 rounded-2xl bg-white/5 border-white/10 flex items-center gap-4">
                                   <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><Clock size={20}/></div>
                                   <div>
                                       <div className="text-2xl font-bold text-white">12</div>
                                       <div className="text-xs text-gray-400">Kalan Etüt Saati</div>
                                   </div>
                               </div>
                           </div>
                       </div>
                  </div>
              </div>

              {/* Next Up / Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem]">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Target className="text-indigo-400"/> Sırada Ne Var?</h3>
                      {assignments.filter(a => !a.targetClasses || a.targetClasses.includes(user.className!)).slice(0, 3).map(assignment => (
                          <div key={assignment.id} className="mb-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg group-hover:scale-110 transition-transform">
                                      {assignment.subject.substring(0,2)}
                                  </div>
                                  <div>
                                      <h4 className="text-white font-bold">{assignment.title}</h4>
                                      <p className="text-sm text-gray-400">{new Date(assignment.dueDate).toLocaleDateString('tr-TR')} • {assignment.subject}</p>
                                  </div>
                              </div>
                              <Button variant="secondary" className="px-4 py-2 h-auto text-xs" onClick={() => setActiveTab('assignments')}>Detay</Button>
                          </div>
                      ))}
                      {assignments.length === 0 && <p className="text-gray-500 text-center py-8">Bekleyen ödevin yok. Harika!</p>}
                  </div>

                  <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-b from-indigo-900/20 to-transparent border-indigo-500/20">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Bot className="text-indigo-400"/> Enid AI</h3>
                      <div className="bg-[#020617]/50 rounded-2xl p-6 border border-white/5 mb-6 text-sm text-gray-300 italic">
                          "Merhaba {user.name}! Bugün matematik tekrarı yapmaya ne dersin? Sana yardımcı olabilirim."
                      </div>
                      <Button variant="luxury" className="w-full" onClick={() => setIsChatOpen(true)}>Sohbet Başlat</Button>
                  </div>
              </div>
          </div>
        );

      case 'students':
        return (
          <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Öğrenciler</h2>
                    <p className="text-gray-400">Toplam {students.length} kayıtlı öğrenci</p>
                  </div>
                  <div className="flex gap-3">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" placeholder="Ara..." 
                            className="pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 w-64"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        />
                     </div>
                     <select 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                        value={filterClass} onChange={e => setFilterClass(e.target.value)}
                     >
                        <option value="" className="text-black">Tüm Sınıflar</option>
                        {classesList.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                     </select>
                     {user.role === UserRole.INSTRUCTOR && (
                        <Button onClick={() => setIsAddStudentModalOpen(true)} variant="luxury"><Plus size={18} className="mr-2"/> Ekle</Button>
                     )}
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .filter(s => !filterClass || s.className === filterClass)
                    .map(student => (
                      <div key={student.id} className="glass-panel p-6 rounded-3xl group relative hover:border-indigo-500/30 transition-all">
                          <div className="flex items-start justify-between mb-4">
                              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                                  {student.photoUrl ? <img src={student.photoUrl} className="w-full h-full object-cover" /> : student.name.charAt(0)}
                              </div>
                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-300">{student.className}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">{student.name}</h3>
                          <p className="text-sm text-gray-400 mb-4">{student.field} • {student.email}</p>
                          <div className="flex gap-2">
                              <Button variant="secondary" className="flex-1 h-10 py-0 text-xs">Profili Gör</Button>
                              <Button variant="secondary" className="h-10 w-10 p-0 flex items-center justify-center text-red-400 border-red-500/20 hover:bg-red-500/10" onClick={async () => { if(confirm('Silmek istediğine emin misin?')) await db.collection('users').doc(student.id).delete(); }}><Trash2 size={16}/></Button>
                          </div>
                      </div>
                  ))}
              </div>
              {students.length === 0 && <EmptyState icon={Users} title="Henüz öğrenci yok" description="Sisteme öğrenci ekleyerek başlayın." />}
          </div>
        );

      case 'assignments':
        return (
             <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Ödevler</h2>
                        <p className="text-gray-400">Aktif ve geçmiş ödevler</p>
                    </div>
                    {user.role === UserRole.INSTRUCTOR && (
                        <Button onClick={() => setIsAddAssignmentModalOpen(true)} variant="luxury"><Plus size={18} className="mr-2"/> Ödev Oluştur</Button>
                    )}
                </div>
                
                <div className="grid gap-4">
                    {assignments.map(assignment => (
                        <div key={assignment.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:bg-white/5 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{assignment.title}</h3>
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2 max-w-xl">{assignment.description}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1"><Clock size={12}/> {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}</span>
                                        <span className="flex items-center gap-1"><School size={12}/> {assignment.targetClasses?.join(', ') || 'Tümü'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {user.role === UserRole.STUDENT && (
                                    <Button variant="secondary" className="text-xs">Detay & Yükle</Button>
                                )}
                                {user.role === UserRole.INSTRUCTOR && (
                                    <Button variant="ghost" className="text-red-400 hover:text-red-300" onClick={async () => { if(confirm('Sil?')) await db.collection('assignments').doc(assignment.id).delete(); }}><Trash2 size={18}/></Button>
                                )}
                            </div>
                        </div>
                    ))}
                    {assignments.length === 0 && <EmptyState icon={FileText} title="Ödev bulunamadı" description="Şu an için listelenecek bir ödev yok." />}
                </div>
             </div>
        );

      case 'exams':
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Sınavlar</h2>
                        <p className="text-gray-400">Online sınav yönetimi</p>
                    </div>
                    {user.role === UserRole.INSTRUCTOR && (
                        <Button onClick={() => setIsExamModalOpen(true)} variant="luxury"><Plus size={18} className="mr-2"/> Sınav Hazırla</Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map(exam => (
                        <div key={exam.id} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-500"><Award size={100} className="text-white"/></div>
                            <div className="relative z-10">
                                <Badge status="UPCOMING" className="mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">{exam.title}</h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{exam.description}</p>
                                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={14}/> {exam.durationMinutes} Dk</span>
                                    <span className="flex items-center gap-1"><BookOpen size={14}/> {exam.questions.length} Soru</span>
                                </div>
                                {user.role === UserRole.STUDENT ? (
                                    <Button variant="primary" className="w-full" onClick={() => handleStartExam(exam)}>Sınava Başla</Button>
                                ) : (
                                    <Button variant="secondary" className="w-full" onClick={async () => { if(confirm('Sil?')) await db.collection('exams').doc(exam.id).delete(); }}>Sınavı Sil</Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {exams.length === 0 && <EmptyState icon={Award} title="Sınav Yok" description="Aktif bir sınav bulunmuyor." />}
            </div>
        );

      case 'classes':
        return (
             <div className="space-y-6 animate-fade-in-up">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Sınıflar</h2>
                        <p className="text-gray-400">Okuldaki şubeler ve mevcutlar</p>
                    </div>
                    {user.role === UserRole.INSTRUCTOR && (
                        <Button onClick={() => setIsAddClassModalOpen(true)} variant="luxury"><Plus size={18} className="mr-2"/> Sınıf Ekle</Button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {classesList.map(cls => (
                        <div key={cls} onClick={() => { setFilterClass(cls); setActiveTab('students'); }} className="glass-panel p-6 rounded-2xl text-center cursor-pointer hover:border-indigo-500 transition-all group">
                             <div className="text-3xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{cls}</div>
                             <div className="text-xs text-gray-400 uppercase font-bold">{students.filter(s => s.className === cls).length} Öğrenci</div>
                        </div>
                    ))}
                </div>
                {classesList.length === 0 && <EmptyState icon={School} title="Sınıf Yok" description="Henüz bir sınıf tanımlanmamış." />}
             </div>
        );

      case 'fields':
          return (
             <div className="space-y-6 animate-fade-in-up">
                 <div className="mb-6">
                    <h2 className="text-3xl font-black text-white tracking-tight">Alanlar</h2>
                    <p className="text-gray-400">Eğitim bölümleri</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {fieldsList.map(field => (
                        <div key={field} onClick={() => { setFilterField(field); setActiveTab('students'); }} className="glass-panel p-8 rounded-3xl relative overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform">
                             <div className="absolute top-0 right-0 p-4 opacity-10"><Layers size={80} className="text-white"/></div>
                             <h3 className="text-2xl font-bold text-white mb-2">{field}</h3>
                             <p className="text-gray-400">{students.filter(s => s.field === field).length} Öğrenci kayıtlı</p>
                        </div>
                    ))}
                </div>
             </div>
          );
      
      case 'attendance':
          return user.role === UserRole.STUDENT ? (
              <div className="max-w-xl mx-auto space-y-8 animate-fade-in-up">
                  <div className="glass-panel p-10 rounded-[3rem] text-center relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px] animate-pulse-slow"></div>
                      <div className="relative z-10">
                          <Fingerprint size={80} className="text-indigo-400 mx-auto mb-6" />
                          <h2 className="text-3xl font-black text-white mb-2">Dijital Yoklama</h2>
                          <p className="text-gray-400 mb-8">Okula giriş ve çıkışlarda QR veya parmak izi yerine bu butonu kullan.</p>
                          
                          <div className="flex gap-4 justify-center">
                              <Button variant="luxury" className="px-10 py-5 text-lg" onClick={async () => {
                                  await db.collection('attendance').add({
                                      studentId: user.id, date: new Date().toISOString(), type: 'CHECK_IN'
                                  });
                                  alert('Giriş kaydedildi! Hoş geldin.');
                              }}>Giriş Yap</Button>
                              <Button variant="secondary" className="px-10 py-5 text-lg" onClick={async () => {
                                  await db.collection('attendance').add({
                                      studentId: user.id, date: new Date().toISOString(), type: 'CHECK_OUT'
                                  });
                                  alert('Çıkış kaydedildi! İyi akşamlar.');
                              }}>Çıkış Yap</Button>
                          </div>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="space-y-6 animate-fade-in-up">
                   <div className="mb-6"><h2 className="text-3xl font-black text-white">Giriş / Çıkış Logları</h2></div>
                   <div className="glass-panel p-0 rounded-3xl overflow-hidden">
                       <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm text-gray-400">
                               <thead className="bg-white/5 text-xs uppercase font-bold text-gray-200">
                                   <tr>
                                       <th className="px-6 py-4">Öğrenci ID</th>
                                       <th className="px-6 py-4">İşlem</th>
                                       <th className="px-6 py-4">Tarih / Saat</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {attendanceRecords.map(record => (
                                       <tr key={record.id} className="border-b border-white/5 hover:bg-white/5">
                                           <td className="px-6 py-4">{record.studentId}</td>
                                           <td className="px-6 py-4">
                                               <span className={`px-2 py-1 rounded text-xs font-bold ${record.type === 'CHECK_IN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                   {record.type === 'CHECK_IN' ? 'Giriş' : 'Çıkış'}
                                               </span>
                                           </td>
                                           <td className="px-6 py-4">{new Date(record.date).toLocaleString('tr-TR')}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                           {attendanceRecords.length === 0 && <p className="text-center py-8">Kayıt yok.</p>}
                       </div>
                   </div>
              </div>
          );

      case 'messages':
        return (
            <div className="flex h-[80vh] gap-6 animate-fade-in-up">
                 {/* Contacts List */}
                 <div className="w-80 glass-panel rounded-3xl p-4 flex flex-col">
                     <h3 className="text-lg font-bold text-white mb-4 px-2">Mesajlar</h3>
                     <div className="space-y-2 overflow-y-auto flex-1">
                         {students.map(s => (
                             <div key={s.id} onClick={() => setSelectedUserForChat(s)} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${selectedUserForChat?.id === s.id ? 'bg-indigo-600' : 'hover:bg-white/5'}`}>
                                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">{s.name.charAt(0)}</div>
                                 <div className="flex-1 min-w-0">
                                     <h4 className="font-bold text-white text-sm truncate">{s.name}</h4>
                                     <p className="text-xs text-gray-400 truncate">{s.className}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Chat Area */}
                 <div className="flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden relative">
                     {selectedUserForChat ? (
                         <>
                             <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">{selectedUserForChat.name.charAt(0)}</div>
                                     <h3 className="font-bold text-white">{selectedUserForChat.name}</h3>
                                 </div>
                             </div>
                             <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                 <p className="text-center text-gray-500 text-sm my-4">Sohbet başlangıcı</p>
                                 {/* Messages would map here from 'conversations' collection */}
                             </div>
                             <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                                 <Button variant="ghost" className="px-3"><Paperclip size={20}/></Button>
                                 <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none" placeholder="Mesaj yaz..." />
                                 <Button variant="primary" className="w-12 px-0"><Send size={18}/></Button>
                             </div>
                         </>
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-500">
                             <MessageSquare size={48} className="mb-4 opacity-50"/>
                             <p>Sohbet etmek için bir kişi seçin.</p>
                         </div>
                     )}
                 </div>
            </div>
        );

      case 'announcements':
          return (
             <div className="space-y-6 animate-fade-in-up">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Duyurular</h2>
                        <p className="text-gray-400">Kurum içi bildirimler</p>
                    </div>
                    {user.role === UserRole.INSTRUCTOR && (
                        <Button onClick={() => setIsAddAnnouncementModalOpen(true)} variant="luxury"><Plus size={18} className="mr-2"/> Duyuru Ekle</Button>
                    )}
                </div>
                <div className="grid gap-4">
                    {announcements.map(ann => (
                        <div key={ann.id} className={`glass-panel p-6 rounded-2xl relative overflow-hidden ${ann.priority === 'HIGH' ? 'border-l-4 border-l-red-500' : ''}`}>
                             <div className="flex justify-between items-start mb-2">
                                 <h3 className="text-xl font-bold text-white">{ann.title}</h3>
                                 <span className="text-xs text-gray-400">{new Date(ann.date).toLocaleDateString('tr-TR')}</span>
                             </div>
                             <p className="text-gray-300 leading-relaxed mb-4">{ann.content}</p>
                             <div className="flex items-center gap-2 text-xs text-gray-500">
                                 <UserIcon size={12}/> <span>{ann.authorName}</span>
                                 {ann.priority === 'HIGH' && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded ml-2 font-bold">ÖNEMLİ</span>}
                             </div>
                        </div>
                    ))}
                    {announcements.length === 0 && <EmptyState icon={Megaphone} title="Duyuru Yok" description="Henüz yayınlanmış bir duyuru bulunmuyor." />}
                </div>
             </div>
          );

      case 'study':
          return (
             <div className="space-y-6 animate-fade-in-up">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Etüt Programı</h2>
                        <p className="text-gray-400">Birebir ve grup çalışmaları</p>
                    </div>
                     <Button variant="luxury" onClick={async () => {
                         const subj = prompt("Ders?");
                         if(subj) await db.collection('study').add({subject: subj, date: new Date().toISOString(), status: 'UPCOMING', studentId: user.id});
                     }}><Plus size={18} className="mr-2"/> Talep Oluştur</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {studySessions.map(study => (
                        <div key={study.id} className="glass-panel p-6 rounded-2xl border-t-4 border-t-indigo-500">
                             <h3 className="font-bold text-white text-lg mb-1">{study.subject}</h3>
                             <p className="text-gray-400 text-sm mb-4">Eğitmen: {study.teacherName || 'Atanıyor...'}</p>
                             <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                 <Calendar size={16}/> <span>{new Date(study.date).toLocaleDateString()}</span>
                                 <Clock size={16} className="ml-2"/> <span>{study.time || '10:00'}</span>
                             </div>
                        </div>
                    ))}
                    {studySessions.length === 0 && <EmptyState icon={Clock} title="Etüt Yok" description="Planlanmış bir etüt çalışması yok." />}
                </div>
             </div>
          );

      case 'projects':
          return (
             <div className="space-y-6 animate-fade-in-up">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Projeler</h2>
                        <p className="text-gray-400">Dönem ödevleri ve grup çalışmaları</p>
                    </div>
                     <Button variant="luxury" onClick={async () => {
                         const title = prompt("Proje Başlığı?");
                         if(title) await db.collection('projects').add({title, progress: 0, status: 'PLANNING', studentId: user.id});
                     }}><Plus size={18} className="mr-2"/> Proje Ekle</Button>
                </div>
                <div className="space-y-4">
                    {projects.map(proj => (
                        <div key={proj.id} className="glass-panel p-6 rounded-2xl">
                             <div className="flex justify-between items-center mb-4">
                                 <h3 className="font-bold text-white text-xl">{proj.title}</h3>
                                 <Badge status={proj.status} />
                             </div>
                             <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                 <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: `${proj.progress}%`}}></div>
                             </div>
                             <div className="flex justify-between text-xs text-gray-400">
                                 <span>İlerleme: %{proj.progress}</span>
                                 <span>Teslim: {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'Belirlenmedi'}</span>
                             </div>
                        </div>
                    ))}
                    {projects.length === 0 && <EmptyState icon={Briefcase} title="Proje Yok" description="Henüz bir proje kaydı oluşturmadın." />}
                </div>
             </div>
          );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-[#020617] text-white flex transition-all duration-500 font-sans selection:bg-indigo-500/30`}>
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 bg-[#0f172a]/80 backdrop-blur-xl border-r border-white/5 h-screen transition-all duration-500 ease-spring ${sidebarCollapsed ? 'w-20' : 'w-72'} flex flex-col`}>
        <div className={`p-6 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
           {!sidebarCollapsed && (
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center font-bold text-black">E</div>
                <span className="font-black text-2xl tracking-tight">ENID AI</span>
             </div>
           )}
           <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 hide-scrollbar">
           {navItems.map(item => (
              <SidebarItem 
                key={item.id} 
                icon={item.icon} 
                label={item.label} 
                isActive={activeTab === item.id} 
                collapsed={sidebarCollapsed}
                onClick={() => setActiveTab(item.id)}
                colorClass={user.role === UserRole.INSTRUCTOR ? 'text-amber-500' : 'text-indigo-400'}
              />
           ))}
        </div>

        <div className="p-4 border-t border-white/5">
            <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <LogOut size={20} />
                {!sidebarCollapsed && <span className="font-bold">Çıkış Yap</span>}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
         {/* Top Header */}
         <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0f172a]/50 backdrop-blur-sm z-30">
             <div className="flex items-center gap-4">
                 {activeTab !== 'dashboard' && (
                     <Button variant="ghost" onClick={() => setActiveTab('dashboard')} className="p-2 h-auto text-gray-400 hover:text-white">
                         <ArrowLeft size={20} />
                     </Button>
                 )}
                 <h1 className="text-xl font-bold text-gray-200 capitalize">{navItems.find(n => n.id === activeTab)?.label || 'Enid AI'}</h1>
             </div>
             <div className="flex items-center gap-6">
                 <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm font-mono text-gray-400">
                     <Calendar size={14} className="text-amber-500" />
                     {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                 </div>
                 <div className="relative cursor-pointer group">
                     <Bell size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                     <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-glow">
                     <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center font-bold text-sm">
                         {user.name.charAt(0)}
                     </div>
                 </div>
             </div>
         </header>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-6 md:p-8 relative scroll-smooth">
             {renderContent()}
         </div>
      </main>

      {/* Floating Chat Button */}
      {user.role === UserRole.STUDENT && (
        <div className="fixed bottom-8 right-8 z-50">
            <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300"
            >
                {isChatOpen ? <X size={28} /> : <Bot size={28} />}
            </button>
        </div>
      )}

      {/* Chat Window */}
      {isChatOpen && (
          <div className="fixed bottom-28 right-8 w-96 h-[500px] glass-panel bg-[#0f172a]/95 rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="p-4 border-b border-white/10 bg-indigo-600/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center"><Bot size={16}/></div>
                      <div>
                          <h4 className="font-bold text-white">Enid AI</h4>
                          <p className="text-xs text-indigo-300">Öğrenci Asistanı</p>
                      </div>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 && (
                      <div className="text-center text-gray-500 text-sm mt-10">
                          <Bot size={40} className="mx-auto mb-4 opacity-50"/>
                          <p>Merhaba! Derslerinle ilgili bana her şeyi sorabilirsin.</p>
                      </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'}`}>
                              {msg.parts[0].text}
                          </div>
                      </div>
                  ))}
                  {chatLoading && <div className="text-xs text-gray-500 ml-4">Enid yazıyor...</div>}
              </div>
              <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                  <input 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-indigo-500"
                    placeholder="Bir şeyler yaz..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button variant="primary" className="h-10 w-10 p-0 flex items-center justify-center rounded-xl" onClick={handleSendMessage} disabled={chatLoading}><Send size={18}/></Button>
              </div>
          </div>
      )}

      {/* --- MODALS --- */}
      
      {/* Add Assignment Modal */}
      {isAddAssignmentModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddAssignmentModalOpen(false)}></div>
              <div className="relative z-10 w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-white/10 p-8">
                   <h2 className="text-2xl font-black text-white mb-6">Yeni Ödev Oluştur</h2>
                   <div className="space-y-4">
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Ödev Başlığı" id="newAssignTitle"/>
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-32" placeholder="Açıklama" id="newAssignDesc"/>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" id="newAssignDate"/>
                            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" id="newAssignSubject">
                                <option>Matematik</option><option>Fizik</option><option>Kimya</option><option>Biyoloji</option><option>Türkçe</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setIsAddAssignmentModalOpen(false)}>İptal</Button>
                            <Button variant="luxury" onClick={() => {
                                const title = (document.getElementById('newAssignTitle') as HTMLInputElement).value;
                                const description = (document.getElementById('newAssignDesc') as HTMLTextAreaElement).value;
                                const dueDate = (document.getElementById('newAssignDate') as HTMLInputElement).value;
                                const subject = (document.getElementById('newAssignSubject') as HTMLSelectElement).value;
                                handleCreateAssignment({title, description, dueDate, subject});
                            }}>Oluştur</Button>
                        </div>
                   </div>
              </div>
          </div>
      )}
      
      {/* Add Announcement Modal */}
      {isAddAnnouncementModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddAnnouncementModalOpen(false)}></div>
              <div className="relative z-10 w-full max-w-lg bg-[#0f172a] rounded-3xl border border-white/10 p-8">
                   <h2 className="text-2xl font-black text-white mb-6">Yeni Duyuru</h2>
                   <div className="space-y-4">
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Başlık" id="newAnnounceTitle"/>
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-32" placeholder="Duyuru içeriği..." id="newAnnounceContent"/>
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" id="newAnnouncePriority">
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">Acil / Önemli</option>
                        </select>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setIsAddAnnouncementModalOpen(false)}>İptal</Button>
                            <Button variant="luxury" onClick={() => {
                                const title = (document.getElementById('newAnnounceTitle') as HTMLInputElement).value;
                                const content = (document.getElementById('newAnnounceContent') as HTMLTextAreaElement).value;
                                const priority = (document.getElementById('newAnnouncePriority') as HTMLSelectElement).value as any;
                                handleCreateAnnouncement(title, content, priority, [], []);
                            }}>Yayınla</Button>
                        </div>
                   </div>
              </div>
          </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddStudentModalOpen(false)}></div>
              <div className="relative z-10 w-full max-w-lg bg-[#0f172a] rounded-3xl border border-white/10 p-8">
                   <h2 className="text-2xl font-black text-white mb-6">Öğrenci Ekle</h2>
                   <p className="text-gray-400 mb-6">Öğrencinin sisteme kayıt olması için bilgilerini girin veya davet kodu oluşturun.</p>
                   <div className="space-y-4">
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Ad Soyad" />
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="E-posta" />
                        <div className="grid grid-cols-2 gap-4">
                            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                <option>Sınıf Seç</option>
                                {classesList.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                <option>Alan Seç</option>
                                {fieldsList.map(f => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                   </div>
                   <div className="flex justify-end gap-3 mt-8">
                        <Button variant="ghost" onClick={() => setIsAddStudentModalOpen(false)}>İptal</Button>
                        <Button variant="primary">Ekle</Button>
                   </div>
              </div>
          </div>
      )}

      {/* Add Class Modal */}
      {isAddClassModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddClassModalOpen(false)}></div>
              <div className="relative z-10 w-full max-w-md bg-[#0f172a] rounded-3xl border border-white/10 p-8">
                   <h2 className="text-2xl font-black text-white mb-6">Sınıf Oluştur</h2>
                   <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-6" placeholder="Örn: 12-A" />
                   <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsAddClassModalOpen(false)}>İptal</Button>
                        <Button variant="primary" onClick={() => { setClassesList([...classesList, "Yeni Sınıf"]); setIsAddClassModalOpen(false); }}>Kaydet</Button>
                   </div>
              </div>
          </div>
      )}

    </div>
  );
}
