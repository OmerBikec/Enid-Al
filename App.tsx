
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Plus, 
  CheckCircle, 
  Clock, 
  FileText, 
  LogOut, 
  Sparkles, 
  Upload, 
  ChevronRight,
  ChevronLeft, 
  MessageSquare, 
  Award, 
  Bell, 
  Megaphone, 
  ClipboardList, 
  X, 
  PlayCircle, 
  School, 
  Layout, 
  Layers, 
  Send, 
  Bot, 
  Calendar, 
  PieChart, 
  Briefcase, 
  DoorOpen, 
  ArrowLeft, 
  ArrowRight, 
  Menu, 
  MoreVertical, 
  RefreshCw, 
  Search, 
  Filter, 
  Moon, 
  Sun, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  User as UserIcon, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  AlertCircle, 
  Activity, 
  CalendarCheck, 
  Zap, 
  Wand2, 
  Calculator, 
  Globe, 
  Palette, 
  Scale, 
  Lock, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  MessageCircle, 
  Check, 
  XCircle,
  Info,
  CheckCheck,
  Scan,
  MoreHorizontal
} from 'lucide-react';
import { 
  User, UserRole, Assignment, Submission, SubmissionStatus, 
  Announcement, Notification, Exam, Question, ExamResult, ChatMessage,
  StudySession, Project, AttendanceRecord, Conversation, Message
} from './types';
import { generateAssignmentIdea, generateFeedbackSuggestion, generateQuizQuestions, chatWithStudentAssistant } from './services/geminiService';

// --- Mock Data ---
const MOCK_INSTRUCTOR: User = {
  id: 'inst-1',
  name: 'Ahmet Yılmaz',
  role: UserRole.INSTRUCTOR,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet&backgroundColor=b6e3f4',
  pin: '1234',
  className: 'Yönetim',
  email: 'ahmet.yilmaz@enidai.com',
  phone: '+90 555 123 45 67'
};

const MOCK_INSTRUCTORS_LIST: User[] = [
    MOCK_INSTRUCTOR,
    { id: 'inst-2', name: 'Mehmet Demir', role: UserRole.INSTRUCTOR, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet&backgroundColor=ffdfbf', pin: '1234', className: 'Fizik Zümresi', email: 'mehmet@enidai.com' },
    { id: 'inst-3', name: 'Ayşe Kaya', role: UserRole.INSTRUCTOR, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse&backgroundColor=c0aede', pin: '1234', className: 'Kimya Zümresi', email: 'ayse@enidai.com' },
];

const MOCK_STUDENT: User = {
  id: 'std-1',
  name: 'Zeynep Kaya',
  role: UserRole.STUDENT,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep&backgroundColor=c0aede',
  pin: '1234',
  tcNo: '12345678901',
  className: '12-A',
  field: 'Sayısal',
  parentName: 'Mustafa Kaya',
  phone: '0532 100 20 30',
  email: 'zeynep.kaya@student.com',
  address: 'Atatürk Mah. Cumhuriyet Cad. No:5, İstanbul',
  birthDate: '15.04.2006'
};

const MOCK_STUDENTS_LIST: User[] = [
  MOCK_STUDENT,
  { id: 'std-2', name: 'Can Demir', role: UserRole.STUDENT, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Can&backgroundColor=ffdfbf', pin: '1234', className: '12-A', field: 'Sayısal', parentName: 'Ali Demir', phone: '0533 200 30 40' },
  { id: 'std-3', name: 'Elif Yıldız', role: UserRole.STUDENT, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elif&backgroundColor=ffdfbf', pin: '1234', className: '12-B', field: 'Eşit Ağırlık', parentName: 'Ayşe Yıldız', phone: '0535 400 50 60' },
  { id: 'std-4', name: 'Burak Öz', role: UserRole.STUDENT, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Burak&backgroundColor=b6e3f4', pin: '1234', className: '11-A', field: 'Sayısal', parentName: 'Kemal Öz', phone: '0542 500 60 70' },
  { id: 'std-5', name: 'Ayşe Nur', role: UserRole.STUDENT, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse&backgroundColor=c0aede', pin: '1234', className: '11-B', field: 'Dil', parentName: 'Fatma Nur', phone: '0544 600 70 80' },
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'Tarih: 1. Dünya Savaşı',
    description: '1. Dünya Savaşının ekonomik ve siyasi nedenlerini analiz eden 500 kelimelik bir makale yazınız. Kaynakça belirtmeyi unutmayınız.',
    subject: 'Tarih',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days later
    createdBy: 'inst-1',
    createdAt: new Date().toISOString(),
    targetClasses: ['12-A', '12-B']
  },
  {
    id: 'asg-2',
    title: 'Fizik: Newton Yasaları',
    description: 'Günlük hayattan Newton\'un üç hareket yasasına örnekler veriniz ve şemalarla açıklayınız.',
    subject: 'Fizik',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    createdBy: 'inst-1',
    createdAt: new Date().toISOString(),
    targetClasses: ['11-A', '12-A']
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 'ann-1',
        title: 'Yarıyıl Tatili Hakkında',
        content: 'Yarıyıl tatili 20 Ocak tarihinde başlayacaktır. Tüm öğrencilerimize iyi tatiller dileriz.',
        date: new Date().toISOString(),
        authorName: 'Müdüriyet',
        priority: 'NORMAL',
        targetClasses: [], // All
        targetFields: []   // All
    },
    {
        id: 'ann-2',
        title: 'Deneme Sınavı Takvimi',
        content: '12. Sınıf Sayısal öğrencileri için Cumartesi günü saat 10:00\'da AYT denemesi yapılacaktır.',
        date: new Date(Date.now() - 86400000).toISOString(),
        authorName: 'Rehberlik Servisi',
        priority: 'HIGH',
        targetClasses: ['12-A', '12-B'],
        targetFields: ['Sayısal']
    }
];

const MOCK_EXAMS: Exam[] = [
    {
        id: 'exam-1',
        title: 'Matematik: Türev & İntegral',
        description: 'Türev alma kuralları ve belirli integral uygulamaları.',
        subject: 'Matematik',
        durationMinutes: 40,
        createdBy: 'inst-1',
        createdAt: new Date().toISOString(),
        questions: [
            { id: 'q1', text: 'f(x) = x^3 fonksiyonunun türevi nedir?', type: 'MULTIPLE_CHOICE', options: ['3x', '3x^2', 'x^2', '3'], correctAnswer: '3x^2', points: 20 },
            { id: 'q2', text: 'İntegral sembolü hangisidir?', type: 'MULTIPLE_CHOICE', options: ['∫', '∑', '∏', '∂'], correctAnswer: '∫', points: 20 },
            { id: 'q3', text: 'Sabit fonksiyonun türevi kaçtır?', type: 'MULTIPLE_CHOICE', options: ['1', 'x', '0', 'Sabit'], correctAnswer: '0', points: 20 },
            { id: 'q4', text: 'Sin(x)\'in türevi nedir?', type: 'MULTIPLE_CHOICE', options: ['Cos(x)', '-Cos(x)', 'Sin(x)', '-Sin(x)'], correctAnswer: 'Cos(x)', points: 20 },
            { id: 'q5', text: 'Log(x)\'in tabanı yazılmazsa kaçtır?', type: 'MULTIPLE_CHOICE', options: ['e', '1', '0', '10'], correctAnswer: '10', points: 20 },
        ]
    }
];

const MOCK_STUDY_SESSIONS: StudySession[] = [
    { id: 'st-1', subject: 'Matematik', teacherName: 'Ahmet Yılmaz', date: '2023-11-15', time: '14:00 - 15:30', location: 'Kütüphane Salon A', status: 'UPCOMING' },
    { id: 'st-2', subject: 'Fizik', teacherName: 'Mehmet Demir', date: '2023-11-14', time: '10:00 - 11:30', location: 'Lab 2', status: 'COMPLETED' },
    { id: 'st-3', subject: 'Kimya', teacherName: 'Ayşe Kaya', date: '2023-11-16', time: '13:00 - 14:00', location: 'Online (Zoom)', status: 'UPCOMING' },
];

const MOCK_PROJECTS: Project[] = [
    { id: 'prj-1', title: 'TÜBİTAK 4006', description: 'Yapay Zeka Destekli Tarım Sulama Sistemi', deadline: '2024-02-01', progress: 45, status: 'IN_PROGRESS', teamMembers: ['Zeynep', 'Can', 'Elif'] },
    { id: 'prj-2', title: 'Tarih Dergisi', description: 'Cumhuriyet Dönemi Ekonomisi Araştırması', deadline: '2023-12-20', progress: 80, status: 'REVIEW', teamMembers: ['Zeynep', 'Burak'] },
];

const MOCK_ATTENDANCE_LOGS: AttendanceRecord[] = [
  { id: 'att-1', date: '2023-11-20', checkIn: '08:15', checkOut: '15:30', status: 'ON_TIME' },
  { id: 'att-2', date: '2023-11-17', checkIn: '08:35', checkOut: '15:30', status: 'LATE' },
  { id: 'att-3', date: '2023-11-16', checkIn: '08:10', checkOut: '15:30', status: 'ON_TIME' },
  { id: 'att-4', date: '2023-11-15', checkIn: '---', checkOut: '---', status: 'ABSENT' },
  { id: 'att-5', date: '2023-11-14', checkIn: '08:20', checkOut: '15:40', status: 'ON_TIME' },
];

const FIELDS_DATA = [
    { name: 'Sayısal', icon: Calculator, description: 'Matematik, Fizik, Kimya, Biyoloji odaklı alan.', color: 'blue' },
    { name: 'Eşit Ağırlık', icon: Scale, description: 'Matematik, Edebiyat, Coğrafya odaklı alan.', color: 'orange' },
    { name: 'Sözel', icon: BookOpen, description: 'Edebiyat, Tarih, Coğrafya odaklı alan.', color: 'pink' },
    { name: 'Dil', icon: Globe, description: 'İngilizce ve diğer yabancı diller odaklı alan.', color: 'purple' },
];

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', isLoading?: boolean }> = ({ 
  children, variant = 'primary', className = '', isLoading, ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/40 hover:shadow-brand-500/60 hover:to-brand-600 hover:-translate-y-0.5 border border-transparent",
    secondary: "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md",
    outline: "bg-transparent border-2 border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 hover:shadow-glow",
    ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white",
    danger: "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5"
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

const Badge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
    SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
    GRADED: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
    UPCOMING: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900",
    COMPLETED: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600",
    CANCELLED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
    IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    PLANNING: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
    REVIEW: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
    REJECTED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
    
    // Field Types
    'Sayısal': "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    'Eşit Ağırlık': "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
    'Sözel': "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400",
    'Dil': "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
    'Genel': "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-gray-300",
    // Attendance
    'ON_TIME': "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
    'LATE': "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
    'ABSENT': "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
    'EXCUSED': "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    // Priority
    'HIGH': "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
    'NORMAL': "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
  };
  
  const labels: Record<string, string> = {
    PENDING: "Bekliyor",
    SUBMITTED: "Gönderildi",
    GRADED: "Notlandı",
    UPCOMING: "Yaklaşıyor",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal",
    IN_PROGRESS: "Devam Ediyor",
    PLANNING: "Planlanıyor",
    REVIEW: "İncelemede",
    ON_TIME: "Zamanında",
    LATE: "Geç Kaldı",
    ABSENT: "Gelmedi",
    EXCUSED: "İzinli",
    HIGH: "Önemli",
    NORMAL: "Genel",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
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
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 mb-1 mx-2 ${
        active 
          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800 hover:shadow-sm'
      } ${collapsed ? 'justify-center w-12' : 'w-auto'}`}
    >
      <div className="relative flex items-center justify-center">
        <Icon size={20} className={`transition-colors ${active ? 'text-white' : 'text-current group-hover:text-brand-600 dark:group-hover:text-brand-400'}`} />
        {badge !== undefined && badge > 0 && (
          <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white dark:border-slate-900`}>
            {badge}
          </span>
        )}
      </div>
      
      {!collapsed && (
        <span className="ml-3 font-semibold text-sm truncate">{label}</span>
      )}
    </button>
  );
};

const DashboardCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  trend?: string;
  warning?: boolean;
}> = ({ icon: Icon, title, value, subtitle, color, trend, warning }) => {
  const textColorClass = color.replace('bg-', 'text-');
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 rotate-12`}>
        <Icon size={120} className={textColorClass} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 ${textColorClass}`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${trend.includes('+') ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {trend}
                </div>
            )}
        </div>
        <div className="space-y-1">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</h3>
            <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">{value}</h2>
        </div>
        <div className={`mt-4 pt-4 border-t border-gray-50 dark:border-slate-700/50 flex items-center text-xs ${warning ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
            {warning && <AlertCircle size={14} className="mr-1.5" />}
            {subtitle}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Auth States
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.STUDENT); 
  const [loginForm, setLoginForm] = useState({ name: '', pin: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', tcNo: '', pin: '', className: '12-A', field: 'Sayısal', role: UserRole.STUDENT 
  });
  
  // Data States
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS);
  const [studySessions, setStudySessions] = useState<StudySession[]>(MOCK_STUDY_SESSIONS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  
  // Chat / Messaging States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAddChatModalOpen, setIsAddChatModalOpen] = useState(false);
  const humanChatEndRef = useRef<HTMLDivElement>(null);
  const [humanChatMessage, setHumanChatMessage] = useState('');

  // Lists
  const [studentList, setStudentList] = useState<User[]>(MOCK_STUDENTS_LIST);
  const [classes, setClasses] = useState([
    { name: '12-A', students: 24, advisor: 'Ahmet Yılmaz', type: 'Sayısal' },
    { name: '12-B', students: 22, advisor: 'Mehmet Demir', type: 'Eşit Ağırlık' },
    { name: '11-A', students: 26, advisor: 'Ayşe Kaya', type: 'Sayısal' },
    { name: '10-A', students: 25, advisor: 'Ali Öztürk', type: 'Genel' },
    { name: 'Mezun A', students: 18, advisor: 'Veli Can', type: 'Sayısal' },
  ]);

  // Attendance
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_LOGS);
  const [todayAttendanceState, setTodayAttendanceState] = useState<'IDLE' | 'CHECKED_IN' | 'COMPLETED'>('IDLE');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterField, setFilterField] = useState('');

  // UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // AI Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Merhaba! Ben Enid AI asistanı. Derslerinle veya programınla ilgili sana nasıl yardımcı olabilirim?' }
  ]);
  const [currentChatMessage, setCurrentChatMessage] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // AI Generation
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingAssignment, setIsGeneratingAssignment] = useState(false);

  // Modals
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false); 
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Exam
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examStatus, setExamStatus] = useState<'IDLE' | 'TAKING' | 'COMPLETED'>('IDLE');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Forms
  const [newStudentForm, setNewStudentForm] = useState({ name: '', tcNo: '', pin: '1234', className: '', field: '', photo: null as File | null });
  const [newClassForm, setNewClassForm] = useState({ name: '', type: 'Sayısal', advisor: '' });
  const [newAssignmentForm, setNewAssignmentForm] = useState({ title: '', subject: '', dueDate: '', description: '', targetClasses: [] as string[] });
  const [newAnnouncementForm, setNewAnnouncementForm] = useState({ 
    title: '', content: '', priority: 'NORMAL' as 'NORMAL' | 'HIGH', targetClasses: [] as string[], targetFields: [] as string[] 
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
      if (humanChatEndRef.current) {
          humanChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [activeConversation?.messages]);

  const handleAuthSubmit = () => {
    if (authView === 'LOGIN') {
      if (loginRole === UserRole.INSTRUCTOR) {
        if (loginForm.name && loginForm.pin) {
           setCurrentUser(MOCK_INSTRUCTOR);
           setActiveTab('dashboard');
        }
      } else {
        const student = studentList.find(s => s.name.toLowerCase() === loginForm.name.toLowerCase() && s.pin === loginForm.pin);
        if (student) {
           setCurrentUser(student);
           setActiveTab('dashboard');
        } else {
           if(loginForm.name && loginForm.pin) {
               setCurrentUser({ ...MOCK_STUDENT, name: loginForm.name });
               setActiveTab('dashboard');
           }
        }
      }
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: registerForm.name,
        tcNo: registerForm.tcNo,
        pin: registerForm.pin,
        role: registerForm.role,
        className: registerForm.className,
        field: registerForm.field,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(registerForm.name)}`
      };
      
      if (newUser.role === UserRole.STUDENT) {
        setStudentList([...studentList, newUser]);
      }
      setCurrentUser(newUser);
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ name: '', pin: '' });
    setActiveAssignment(null);
    setActiveExam(null);
    setExamStatus('IDLE');
    setNotifications([]);
    setTodayAttendanceState('IDLE');
  };

  const handleSwitchRole = () => {
    if (currentUser?.role === UserRole.INSTRUCTOR) {
        setCurrentUser(MOCK_STUDENT);
        setActiveTab('dashboard');
    } else {
        setCurrentUser(MOCK_INSTRUCTOR);
        setActiveTab('dashboard');
    }
  };

  const handleSendMessage = async () => {
    if (!currentChatMessage.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: currentChatMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setCurrentChatMessage('');
    setIsChatTyping(true);
    try {
      const history = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const responseText = await chatWithStudentAssistant(userMsg.text, history);
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: 'Bir hata oluştu.' }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const handleAttendanceAction = () => {
      setAttendanceLoading(true);
      setTimeout(() => {
          const now = new Date();
          const timeString = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          const dateString = now.toLocaleDateString('en-CA');
          if (todayAttendanceState === 'IDLE') {
              const newLog: AttendanceRecord = {
                  id: `att-now-${Date.now()}`,
                  date: dateString,
                  checkIn: timeString,
                  status: 'ON_TIME'
              };
              setAttendanceLogs([newLog, ...attendanceLogs]);
              setTodayAttendanceState('CHECKED_IN');
              setAttendanceSuccessMsg('Giriş Başarılı! İyi Dersler.');
          } else if (todayAttendanceState === 'CHECKED_IN') {
              const updatedLogs = attendanceLogs.map(log => 
                  log.date === dateString ? { ...log, checkOut: timeString } : log
              );
              setAttendanceLogs(updatedLogs);
              setTodayAttendanceState('COMPLETED');
              setAttendanceSuccessMsg('Çıkış Yapıldı. İyi Günler!');
          }
          setAttendanceLoading(false);
          setTimeout(() => setAttendanceSuccessMsg(''), 3000);
      }, 2000);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => n.userId === currentUser?.id ? { ...n, isRead: true } : n));
  };

  const handleSendChatRequest = (instructorId: string) => {
      const instructor = MOCK_INSTRUCTORS_LIST.find(i => i.id === instructorId);
      if (!instructor || !currentUser) return;
      const newConvo: Conversation = {
          id: `conv-${Date.now()}`,
          studentId: currentUser.id,
          studentName: currentUser.name,
          studentAvatar: currentUser.avatarUrl || '',
          instructorId: instructor.id,
          instructorName: instructor.name,
          instructorAvatar: instructor.avatarUrl || '',
          status: 'PENDING',
          messages: [],
          lastMessageAt: new Date().toISOString()
      };
      setConversations([...conversations, newConvo]);
      setIsAddChatModalOpen(false);
      const newNotif: Notification = {
          id: `notif-${Date.now()}`,
          userId: instructor.id,
          message: `${currentUser.name} sizinle sohbet başlatmak istiyor.`,
          type: 'REQUEST',
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: newConvo.id
      };
      setNotifications([...notifications, newNotif]);
  };

  const handleApproveRequest = (convoId: string) => {
      setConversations(conversations.map(c => c.id === convoId ? { ...c, status: 'APPROVED' } : c));
      setNotifications(notifications.map(n => n.relatedId === convoId ? { ...n, isRead: true } : n));
  };

  const handleRejectRequest = (convoId: string) => {
      setConversations(conversations.map(c => c.id === convoId ? { ...c, status: 'REJECTED' } : c));
      setNotifications(notifications.map(n => n.relatedId === convoId ? { ...n, isRead: true } : n));
  };

  const handleSendHumanMessage = () => {
      if (!activeConversation || !humanChatMessage.trim() || !currentUser) return;
      const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          text: humanChatMessage,
          timestamp: new Date().toISOString()
      };
      const updatedConvo = {
          ...activeConversation,
          messages: [...activeConversation.messages, newMessage],
          lastMessageAt: new Date().toISOString()
      };
      setConversations(conversations.map(c => c.id === activeConversation.id ? updatedConvo : c));
      setActiveConversation(updatedConvo);
      setHumanChatMessage('');
  };

  const handleAddStudent = () => {
      const newStudent: User = {
          id: `std-${Date.now()}`,
          name: newStudentForm.name,
          tcNo: newStudentForm.tcNo,
          pin: newStudentForm.pin,
          className: newStudentForm.className,
          field: newStudentForm.field,
          role: UserRole.STUDENT,
          avatarUrl: newStudentForm.photo ? URL.createObjectURL(newStudentForm.photo) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudentForm.name}`,
          photoUrl: newStudentForm.photo ? URL.createObjectURL(newStudentForm.photo) : undefined,
          phone: '05XX XXX XX XX'
      };
      setStudentList([...studentList, newStudent]);
      setIsAddStudentModalOpen(false);
      setNewStudentForm({ name: '', tcNo: '', pin: '1234', className: '', field: '', photo: null });
  };

  const handleAddClass = () => {
      setClasses([...classes, { 
          name: newClassForm.name, 
          type: newClassForm.type, 
          advisor: newClassForm.advisor || 'Atanmadı',
          students: 0
      }]);
      setIsAddClassModalOpen(false);
  };

  const handleAddAssignment = () => {
      const newAsg: Assignment = {
          id: `asg-${Date.now()}`,
          title: newAssignmentForm.title,
          description: newAssignmentForm.description,
          subject: newAssignmentForm.subject,
          dueDate: newAssignmentForm.dueDate,
          targetClasses: newAssignmentForm.targetClasses,
          createdBy: currentUser?.id || '',
          createdAt: new Date().toISOString()
      };
      setAssignments([newAsg, ...assignments]);
      setIsAddAssignmentModalOpen(false);
      setNewAssignmentForm({ title: '', subject: '', dueDate: '', description: '', targetClasses: [] });
  };

  const handleGenerateAssignmentWithAI = async () => {
      if (!aiTopic) return;
      setIsGeneratingAssignment(true);
      try {
          const result = await generateAssignmentIdea(aiTopic, "Lise");
          setNewAssignmentForm(prev => ({
              ...prev,
              title: result.title,
              description: result.description,
              subject: prev.subject || aiTopic 
          }));
      } catch (error) {
          console.error("AI Generation Failed", error);
      } finally {
          setIsGeneratingAssignment(false);
      }
  };

  const handleAddAnnouncement = () => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnnouncementForm.title,
      content: newAnnouncementForm.content,
      date: new Date().toISOString(),
      authorName: currentUser?.name || 'Yönetim',
      priority: newAnnouncementForm.priority,
      targetClasses: newAnnouncementForm.targetClasses,
      targetFields: newAnnouncementForm.targetFields
    };
    setAnnouncements([newAnn, ...announcements]);
    setIsAddAnnouncementModalOpen(false);
    setNewAnnouncementForm({ title: '', content: '', priority: 'NORMAL', targetClasses: [], targetFields: [] });
  };

  const handleDeleteStudent = (id: string) => {
    setStudentList(studentList.filter(s => s.id !== id));
    setSelectedStudent(null);
  };

  const startExam = (exam: Exam) => {
      setActiveExam(exam);
      setExamStatus('TAKING');
      setCurrentQuestionIndex(0);
      setExamAnswers({});
      setExamResult(null);
  };

  const submitExam = () => {
      if (!activeExam) return;
      let correct = 0;
      let wrong = 0;
      let score = 0;
      activeExam.questions.forEach(q => {
          const answer = examAnswers[q.id];
          if (answer === q.correctAnswer) {
              correct++;
              score += q.points;
          } else {
              wrong++;
          }
      });
      setExamResult({
          id: `res-${Date.now()}`,
          examId: activeExam.id,
          studentId: currentUser?.id || '',
          score: score,
          correctCount: correct,
          wrongCount: wrong,
          submittedAt: new Date().toISOString()
      });
      setExamStatus('COMPLETED');
  };

  const toggleClassSelection = (className: string) => {
      const current = newAssignmentForm.targetClasses;
      if (current.includes(className)) {
          setNewAssignmentForm({ ...newAssignmentForm, targetClasses: current.filter(c => c !== className) });
      } else {
          setNewAssignmentForm({ ...newAssignmentForm, targetClasses: [...current, className] });
      }
  };

  const toggleAnnouncementClass = (className: string) => {
      const current = newAnnouncementForm.targetClasses;
      if (current.includes(className)) {
          setNewAnnouncementForm({ ...newAnnouncementForm, targetClasses: current.filter(c => c !== className) });
      } else {
          setNewAnnouncementForm({ ...newAnnouncementForm, targetClasses: [...current, className] });
      }
  };

  const toggleAnnouncementField = (field: string) => {
      const current = newAnnouncementForm.targetFields;
      if (current.includes(field)) {
          setNewAnnouncementForm({ ...newAnnouncementForm, targetFields: current.filter(c => c !== field) });
      } else {
          setNewAnnouncementForm({ ...newAnnouncementForm, targetFields: [...current, field] });
      }
  };

  const BackgroundBlobs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/3 w-[500px] h-[500px] bg-pink-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 relative ${darkMode ? 'bg-slate-900' : 'bg-[#F3F4F6]'}`}>
        <BackgroundBlobs />
        <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4 p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-lg z-50 hover:scale-110 transition-transform">
            {darkMode ? <Sun className="text-yellow-400 h-6 w-6" /> : <Moon className="text-slate-600 h-6 w-6" />}
        </button>
        <div className="max-w-6xl w-full glass rounded-[2.5rem] shadow-3d overflow-hidden flex flex-col md:flex-row h-auto md:min-h-[700px] z-10 relative border-0">
          <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 md:w-5/12 p-12 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10 animate-in slide-in-from-left duration-700">
                <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/30 shadow-2xl animate-float">
                  <GraduationCap className="h-10 w-10 text-white drop-shadow-md" />
                </div>
                <h1 className="text-6xl font-extrabold mb-4 tracking-tight leading-tight">Enid<br/><span className="text-brand-200">AI</span></h1>
                <p className="text-brand-100 text-xl font-light leading-relaxed">Geleceğin eğitim teknolojisi ile potansiyelini keşfet.</p>
             </div>
             <div className="absolute top-20 right-[-80px] w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-pulse"></div>
             <div className="absolute bottom-[-60px] left-[-60px] w-96 h-96 bg-brand-400 rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
             <div className="absolute top-1/2 right-10 w-12 h-12 border-4 border-white/20 rounded-full animate-spin-slow"></div>
          </div>
          <div className="md:w-7/12 p-12 lg:p-16 flex flex-col justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative">
            <div className="max-w-md mx-auto w-full">
              <div className="flex bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8 shadow-inner backdrop-blur-sm">
                 <button onClick={() => setAuthView('LOGIN')} className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${authView === 'LOGIN' ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-white shadow-md scale-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 scale-95'}`}>Giriş Yap</button>
                 <button onClick={() => setAuthView('REGISTER')} className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${authView === 'REGISTER' ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-white shadow-md scale-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 scale-95'}`}>Kayıt Ol</button>
              </div>
              {authView === 'LOGIN' ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <div className="mb-8">
                     <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Hoş Geldin!</h2>
                     <p className="text-gray-400 text-lg">Platforma erişmek için rolünü seç.</p>
                   </div>
                   <div className="flex space-x-4 mb-8">
                      <button onClick={() => setLoginRole(UserRole.STUDENT)} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${loginRole === UserRole.STUDENT ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300 shadow-glow' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-400 hover:border-gray-200 dark:hover:border-slate-600'}`}>
                         <UserIcon className="w-6 h-6 mb-2" />
                         <span className="font-bold text-sm">Öğrenci</span>
                      </button>
                      <button onClick={() => setLoginRole(UserRole.INSTRUCTOR)} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${loginRole === UserRole.INSTRUCTOR ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 shadow-glow' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-400 hover:border-gray-200 dark:hover:border-slate-600'}`}>
                         <Briefcase className="w-6 h-6 mb-2" />
                         <span className="font-bold text-sm">Eğitmen</span>
                      </button>
                   </div>
                   <div className="space-y-5">
                     <div className="group">
                       <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1">{loginRole === UserRole.STUDENT ? 'Ad Soyad / Okul No' : 'E-posta / Kullanıcı Adı'}</label>
                       <div className="relative">
                           <input type="text" value={loginForm.name} onChange={(e) => setLoginForm({...loginForm, name: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-brand-500 transition-all outline-none font-medium text-gray-700 dark:text-white shadow-sm" placeholder={loginRole === UserRole.STUDENT ? "Örn: Zeynep Kaya" : "Örn: Ahmet Yılmaz"} />
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><UserIcon size={20} /></div>
                       </div>
                     </div>
                     <div className="group">
                       <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1">PIN / Şifre</label>
                       <div className="relative">
                           <input type="password" value={loginForm.pin} onChange={(e) => setLoginForm({...loginForm, pin: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-brand-500 transition-all outline-none font-medium text-gray-700 dark:text-white shadow-sm" placeholder="••••" />
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
                       </div>
                     </div>
                   </div>
                   <Button onClick={handleAuthSubmit} className="w-full py-4 text-lg rounded-2xl mt-8 shadow-glow" disabled={!loginForm.name || !loginForm.pin}>{loginRole === UserRole.STUDENT ? 'Öğrenci Girişi' : 'Eğitmen Girişi'} <ArrowRight className="ml-2 h-5 w-5" /></Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                   <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Hemen Başla</h2>
                   <div className="flex space-x-4 mb-2">
                      <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-4 text-center transition-all hover:scale-105 active:scale-95 ${registerForm.role === UserRole.STUDENT ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-md' : 'border-gray-100 dark:border-slate-700 hover:border-brand-200'}`}><input type="radio" name="role" className="hidden" checked={registerForm.role === UserRole.STUDENT} onChange={() => setRegisterForm({...registerForm, role: UserRole.STUDENT})} /><span className="text-sm font-bold flex items-center justify-center"><UserIcon className="w-4 h-4 mr-2"/> Öğrenci</span></label>
                      <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-4 text-center transition-all hover:scale-105 active:scale-95 ${registerForm.role === UserRole.INSTRUCTOR ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-md' : 'border-gray-100 dark:border-slate-700 hover:border-brand-200'}`}><input type="radio" name="role" className="hidden" checked={registerForm.role === UserRole.INSTRUCTOR} onChange={() => setRegisterForm({...registerForm, role: UserRole.INSTRUCTOR})} /><span className="text-sm font-bold flex items-center justify-center"><School className="w-4 h-4 mr-2"/> Eğitmen</span></label>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                       <input type="text" className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none dark:text-white focus:ring-2 focus:ring-brand-500 transition-all" placeholder="Ad Soyad" value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} />
                       <input type="text" className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none dark:text-white focus:ring-2 focus:ring-brand-500 transition-all" placeholder="TC No" value={registerForm.tcNo} onChange={(e) => setRegisterForm({...registerForm, tcNo: e.target.value})} />
                   </div>
                   <input type="password" className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none dark:text-white focus:ring-2 focus:ring-brand-500 transition-all" placeholder="PIN Belirle (4 Hane)" value={registerForm.pin} onChange={(e) => setRegisterForm({...registerForm, pin: e.target.value})} />
                   {registerForm.role === UserRole.STUDENT && (
                       <div className="grid grid-cols-2 gap-3">
                           <select className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none dark:text-white" value={registerForm.className} onChange={(e) => setRegisterForm({...registerForm, className: e.target.value})}>
                               <option value="9-A">9. Sınıf</option>
                               <option value="10-A">10. Sınıf</option>
                               <option value="11-A">11. Sınıf</option>
                               <option value="12-A">12. Sınıf</option>
                               <option value="Mezun">Mezun</option>
                               <option value="Hazırlık">Hazırlık</option>
                           </select>
                           <select className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none dark:text-white" value={registerForm.field} onChange={(e) => setRegisterForm({...registerForm, field: e.target.value})}>
                               <option value="Sayısal">Sayısal</option>
                               <option value="Eşit Ağırlık">Eşit Ağırlık</option>
                               <option value="Sözel">Sözel</option>
                               <option value="Dil">Dil</option>
                           </select>
                       </div>
                   )}
                   <Button onClick={handleAuthSubmit} className="w-full mt-4 py-4 rounded-xl shadow-glow" disabled={!registerForm.name}>Kayıt Ol ve Başla</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isInstructor = currentUser.role === UserRole.INSTRUCTOR;
  
  const myNotifications = notifications
    .filter(n => n.userId === currentUser.id)
    .sort((a, b) => {
        if (a.isRead === b.isRead) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return a.isRead ? 1 : -1;
    });

  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  if (examStatus === 'TAKING' && activeExam) {
    const currentQ = activeExam.questions[currentQuestionIndex];
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
         <div className="max-w-4xl w-full glass rounded-3xl p-8 shadow-3d relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div><h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-indigo-600">{activeExam.title}</h2><p className="text-gray-500">{activeExam.subject}</p></div>
                <div className="flex items-center space-x-4"><div className="flex items-center text-red-500 font-bold bg-red-100 dark:bg-red-900/20 px-4 py-2 rounded-xl"><Clock className="w-5 h-5 mr-2 animate-pulse" /><span>24:00</span></div></div>
            </div>
            <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-400 mb-2"><span>Soru {currentQuestionIndex + 1} / {activeExam.questions.length}</span><span>%{( (currentQuestionIndex + 1) / activeExam.questions.length * 100).toFixed(0)} Tamamlandı</span></div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"><div className="bg-brand-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / activeExam.questions.length) * 100}%` }}></div></div>
            </div>
            <div className="mb-10 animate-in fade-in slide-in-from-right duration-500" key={currentQ.id}>
                <h3 className="text-2xl font-semibold mb-6 leading-relaxed">{currentQ.text}</h3>
                <div className="space-y-4">
                    {currentQ.options?.map((opt, idx) => (
                        <button key={idx} onClick={() => setExamAnswers({...examAnswers, [currentQ.id]: opt})} className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center group hover:scale-[1.01] ${examAnswers[currentQ.id] === opt ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-200' : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold ${examAnswers[currentQ.id] === opt ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-300 text-gray-400 group-hover:border-brand-400'}`}>{String.fromCharCode(65 + idx)}</div>
                            <span className="text-lg">{opt}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="secondary" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}><ChevronLeft className="mr-2 w-5 h-5" /> Önceki</Button>
                {currentQuestionIndex < activeExam.questions.length - 1 ? (
                    <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} disabled={!examAnswers[currentQ.id]}>Sonraki <ChevronRight className="ml-2 w-5 h-5" /></Button>
                ) : (
                    <Button onClick={submitExam} variant="primary" className="shadow-glow" disabled={Object.keys(examAnswers).length !== activeExam.questions.length}>Sınavı Bitir <CheckCircle className="ml-2 w-5 h-5" /></Button>
                )}
            </div>
         </div>
      </div>
    )
  }

  if (examStatus === 'COMPLETED' && examResult) {
      return (
          <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-slate-950' : 'bg-[#F3F4F6]'}`}>
              <div className="max-w-2xl w-full glass rounded-3xl p-10 text-center shadow-3d animate-in zoom-in duration-500 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-6 shadow-glow"><Award className="w-12 h-12" /></div>
                  <h2 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">Sınav Tamamlandı!</h2>
                  <p className="text-gray-500 mb-8 text-lg">Sonuçlarınız başarıyla kaydedildi.</p>
                  <div className="grid grid-cols-3 gap-6 mb-10">
                      <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-gray-100 dark:border-slate-700">
                          <div className="text-4xl font-black text-brand-600 mb-2">{examResult.score}</div>
                          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Puan</div>
                      </div>
                      <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-gray-100 dark:border-slate-700">
                          <div className="text-4xl font-black text-green-500 mb-2">{examResult.correctCount}</div>
                          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Doğru</div>
                      </div>
                      <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-gray-100 dark:border-slate-700">
                          <div className="text-4xl font-black text-red-500 mb-2">{examResult.wrongCount}</div>
                          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Yanlış</div>
                      </div>
                  </div>
                  <Button onClick={() => { setExamStatus('IDLE'); setActiveExam(null); setActiveTab('exams'); }}>Listeye Dön</Button>
              </div>
          </div>
      )
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-gray-100' : 'bg-[#F3F4F6] text-gray-900'}`}>
      <BackgroundBlobs />
      
      <aside className={`${isSidebarCollapsed ? 'w-24' : 'w-72'} m-4 rounded-[2rem] glass shadow-3d transition-all duration-500 z-20 flex flex-col relative overflow-hidden backdrop-blur-xl border border-white/40 dark:border-slate-700/50`}>
        <div className="h-24 flex items-center justify-center relative">
           {!isSidebarCollapsed && (
             <div className="flex items-center animate-in fade-in duration-500">
               <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3"><GraduationCap className="text-white w-6 h-6" /></div>
               <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400">Enid AI</span>
             </div>
           )}
           {isSidebarCollapsed && <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-bold text-lg">E</span></div>}
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors">{isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto hide-scrollbar">
           {isInstructor ? (
               <>
                 <SidebarItem icon={Layout} label="Kontrol Paneli" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={Users} label="Öğrenciler" active={activeTab === 'students'} onClick={() => setActiveTab('students')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={Layers} label="Sınıflar" active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={PieChart} label="Alanlar" active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={BookOpen} label="Ödev Yönetimi" active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={ClipboardList} label="Sınavlar" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={Megaphone} label="Duyurular" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={MessageCircle} label="Mesajlar" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} collapsed={isSidebarCollapsed} badge={myNotifications.filter(n => !n.isRead && n.type === 'REQUEST').length > 0 ? myNotifications.filter(n => !n.isRead && n.type === 'REQUEST').length : undefined} />
               </>
           ) : (
               <>
                 <SidebarItem icon={Layout} label="Genel Bakış" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={DoorOpen} label="Giriş Çıkış" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={BookOpen} label="Ödevlerim" active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={ClipboardList} label="Sınavlar" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={Clock} label="Etütler" active={activeTab === 'study'} onClick={() => setActiveTab('study')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={Briefcase} label="Projeler" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={Megaphone} label="Duyurular" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} collapsed={isSidebarCollapsed} />
                 <SidebarItem icon={MessageCircle} label="Mesajlar" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} collapsed={isSidebarCollapsed} />
               </>
           )}
        </nav>

        <div className="p-4 mt-auto">
            <div className={`glass rounded-2xl p-3 flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
               <div className="flex items-center overflow-hidden">
                   <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200" />
                   {!isSidebarCollapsed && (
                       <div className="ml-3"><p className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[100px]">{currentUser.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.role === UserRole.INSTRUCTOR ? 'Eğitmen' : currentUser.className}</p></div>
                   )}
               </div>
               {!isSidebarCollapsed && <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2"><LogOut size={18} /></button>}
            </div>
            {!isSidebarCollapsed && <button onClick={handleSwitchRole} className="mt-4 w-full text-xs text-gray-400 hover:text-brand-500 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><RefreshCw className="w-3 h-3 mr-2" /> Rol Değiştir (Demo)</button>}
        </div>
      </aside>

      <main className="flex-1 my-4 mr-4 glass rounded-[2.5rem] shadow-3d relative overflow-hidden flex flex-col z-10">
        <header className="h-20 px-8 flex items-center justify-between border-b border-gray-100 dark:border-white/5 backdrop-blur-md sticky top-0 z-30">
           <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize animate-in slide-in-from-top duration-500">
                  {activeTab === 'dashboard' ? 'Kontrol Paneli' : activeTab === 'students' ? 'Öğrenci Listesi' : activeTab === 'assignments' ? 'Ödev Merkezi' : activeTab === 'exams' ? 'Sınav Merkezi' : activeTab === 'attendance' ? 'Giriş & Çıkış' : activeTab === 'fields' ? 'Alan Yönetimi' : activeTab === 'messages' ? 'Mesajlar' : activeTab === 'announcements' ? 'Duyuru Panosu' : activeTab === 'study' ? 'Etüt Takvimi' : activeTab === 'projects' ? 'Projeler' : activeTab}
              </h2>
           </div>
           
           <div className="flex items-center space-x-4">
              <div className="relative group">
                 <button className={`p-3 rounded-full transition-colors relative ${isNotificationsOpen ? 'bg-brand-50 dark:bg-slate-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`} onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                    <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-brand-500' : 'text-gray-500 dark:text-gray-300'}`} />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>}
                 </button>
                 {isNotificationsOpen && (
                     <div className="absolute right-0 top-full mt-4 w-96 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-3d border border-gray-100 dark:border-white/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                         <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-slate-800/50">
                             <h3 className="font-bold text-gray-800 dark:text-white flex items-center">Bildirimler {unreadCount > 0 && <span className="ml-2 px-2 py-0.5 bg-brand-100 text-brand-600 text-xs rounded-full">{unreadCount}</span>}</h3>
                             {unreadCount > 0 && <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center"><CheckCheck className="w-3 h-3 mr-1"/> Tümünü Okundu Say</button>}
                         </div>
                         <div className="max-h-[400px] overflow-y-auto">
                             {myNotifications.length === 0 ? <div className="p-8 text-center text-gray-500 dark:text-gray-400"><Bell className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-sm">Hiç bildiriminiz yok.</p></div> : (
                                 <div className="divide-y divide-gray-100 dark:divide-white/5">
                                     {myNotifications.map(n => (
                                         <div key={n.id} className={`group p-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/5 relative flex items-start gap-3 ${n.isRead ? 'opacity-75 bg-gray-50/50 dark:bg-transparent' : 'bg-white dark:bg-transparent'}`}>
                                             <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'REQUEST' ? 'bg-purple-100 text-purple-600' : n.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : n.type === 'WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{n.type === 'REQUEST' ? <UserIcon size={16}/> : n.type === 'SUCCESS' ? <CheckCircle size={16}/> : n.type === 'WARNING' ? <AlertCircle size={16}/> : <Info size={16}/>}</div>
                                             <div className="flex-1">
                                                 <p className={`text-sm mb-1 ${n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-semibold'}`}>{n.message}</p>
                                                 <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}{n.isRead && " • Okundu"}</span>
                                                 {n.type === 'REQUEST' && !n.isRead && <div className="mt-2 flex gap-2"><Button onClick={() => { setActiveTab('messages'); setIsNotificationsOpen(false); }} className="!py-1.5 !px-3 text-xs h-auto shadow-none">Yanıtla</Button></div>}
                                             </div>
                                             <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                                                 {!n.isRead && <button onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }} className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Okundu İşaretle"><Check size={14} /></button>}
                                                 <button onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Sil"><Trash2 size={14} /></button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">{darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-slate-500" />}</button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
           
           {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                {isInstructor ? (
                   <div className="relative w-full rounded-[2.5rem] overflow-hidden p-8 md:p-10 shadow-2xl group min-h-[300px] flex items-center">
                       <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black z-0"></div>
                       <div className="absolute inset-0 opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-blob"></div>
                       <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 animate-blob animation-delay-2000"></div>
                       <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8 w-full">
                           <div className="space-y-4 max-w-xl">
                               <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-brand-200 backdrop-blur-md"><School className="w-3 h-3 mr-1.5" /> Eğitmen Paneli</span>
                               <h1 className="text-5xl font-black text-white leading-tight tracking-tight">Hoş Geldin,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 animate-pulse">{currentUser.name}</span></h1>
                               <p className="text-slate-400 text-lg">Bugünkü ders programı ve öğrenci takibi için hazırsınız.</p>
                           </div>
                           <div className="flex gap-4">
                               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-36 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300 group/card">
                                   <div className="bg-blue-500/20 p-2 rounded-lg w-fit mb-3 group-hover/card:bg-blue-500/30 transition-colors"><Users className="w-6 h-6 text-blue-400" /></div>
                                   <div className="text-3xl font-bold text-white mb-1">{studentList.length}</div>
                                   <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Toplam Öğrenci</div>
                               </div>
                               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-36 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300 group/card">
                                   <div className="bg-purple-500/20 p-2 rounded-lg w-fit mb-3 group-hover/card:bg-purple-500/30 transition-colors"><Layers className="w-6 h-6 text-purple-400" /></div>
                                   <div className="text-3xl font-bold text-white mb-1">{FIELDS_DATA.length}</div>
                                   <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aktif Alan</div>
                               </div>
                               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-36 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300 group/card">
                                   <div className="bg-green-500/20 p-2 rounded-lg w-fit mb-3 group-hover/card:bg-green-500/30 transition-colors"><Activity className="w-6 h-6 text-green-400" /></div>
                                   <div className="text-3xl font-bold text-white mb-1">{Math.floor(studentList.length * 0.92)}</div>
                                   <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Günlük Giriş</div>
                               </div>
                           </div>
                       </div>
                   </div>
                ) : (
                   <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-10">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                      <div className="relative z-10"><h1 className="text-4xl font-bold mb-2">Merhaba, {currentUser.name} 👋</h1><div className="flex items-center space-x-4 mt-4"><span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold border border-white/10 flex items-center"><Users className="w-4 h-4 mr-2" /> {currentUser.className}</span><span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold border border-white/10 flex items-center"><BookOpen className="w-4 h-4 mr-2" /> {currentUser.field}</span></div></div>
                   </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {!isInstructor ? (
                        <><DashboardCard icon={TrendingUp} title="Genel Başarı" value="85.4" subtitle="Sınıf Ort: 78.2" color="bg-green-500" trend="+2.4%" /><DashboardCard icon={AlertCircle} title="Devamsızlık" value="2.5 Gün" subtitle="Kalan Hak: 7.5 Gün" color="bg-orange-500" warning={false} /><DashboardCard icon={Clock} title="Bugün Okulda" value="06s 45dk" subtitle="Giriş: 08:15" color="bg-blue-500" /></>
                    ) : (
                        <><DashboardCard icon={Users} title="Aktif Öğrenci" value={String(studentList.length)} subtitle="Geçen haftaya göre" color="bg-blue-500" trend="+5" /><DashboardCard icon={ClipboardList} title="Bekleyen Ödevler" value="12" subtitle="Değerlendirme bekleyen" color="bg-purple-500" /><DashboardCard icon={Megaphone} title="Duyurular" value={String(announcements.length)} subtitle="Bu ay yayınlanan" color="bg-pink-500" /></>
                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold flex items-center"><Megaphone className="w-5 h-5 mr-2 text-pink-500" /> Duyurular</h3>{isInstructor && <Button variant="ghost" onClick={() => setIsAddAnnouncementModalOpen(true)} className="!p-2"><Plus size={18}/></Button>}</div>
                        <div className="space-y-4">
                            {announcements.filter(a => isInstructor || ((!a.targetClasses || a.targetClasses.length === 0 || a.targetClasses.includes(currentUser.className || '')) && (!a.targetFields || a.targetFields.length === 0 || a.targetFields.includes(currentUser.field || '')))).map((ann, i) => (
                                <div key={ann.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all group animate-in slide-in-from-bottom-2 fade-in" style={{animationDelay: `${i*100}ms`}}>
                                    <div className="flex justify-between items-start mb-2"><div className="flex items-center">{ann.priority === 'HIGH' && <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>}<h4 className="font-bold text-gray-800 dark:text-gray-200">{ann.title}</h4></div><span className="text-xs text-gray-400">{new Date(ann.date).toLocaleDateString('tr-TR')}</span></div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{ann.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="glass rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold flex items-center"><BookOpen className="w-5 h-5 mr-2 text-brand-500" /> {isInstructor ? 'Son Ödevler' : 'Yaklaşan Ödevler'}</h3><Button variant="ghost" onClick={() => setActiveTab('assignments')} className="text-xs">Tümünü Gör</Button></div>
                         <div className="space-y-4">
                            {assignments.filter(a => isInstructor || (!a.targetClasses || a.targetClasses.includes(currentUser.className || ''))).slice(0, 3).map((asg, i) => (
                                <div key={asg.id} className="flex items-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 transition-all hover:scale-[1.02] cursor-pointer" onClick={() => setActiveAssignment(asg)}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-sm ${asg.subject === 'Matematik' || asg.subject === 'Fizik' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}><FileText size={20} /></div>
                                    <div className="flex-1"><h4 className="font-bold text-gray-800 dark:text-gray-200">{asg.title}</h4><p className="text-xs text-gray-500">{asg.subject} • Son: {new Date(asg.dueDate).toLocaleDateString('tr-TR')}</p></div><ChevronRight className="text-gray-400 w-5 h-5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
           )}

           {activeTab === 'students' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="relative flex-1 max-w-md">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                           <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500" placeholder="Öğrenci ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                       </div>
                       <div className="flex gap-2">
                           <select className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}><option value="">Tüm Sınıflar</option><option value="12-A">12-A</option><option value="12-B">12-B</option><option value="11-A">11-A</option></select>
                           <select className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none" value={filterField} onChange={(e) => setFilterField(e.target.value)}><option value="">Tüm Alanlar</option>{FIELDS_DATA.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}</select>
                           {isInstructor && <Button onClick={() => setIsAddStudentModalOpen(true)} className="shadow-glow"><Plus className="mr-2" size={18} /> Öğrenci Ekle</Button>}
                       </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                       {studentList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) && (filterClass ? s.className === filterClass : true) && (filterField ? s.field === filterField : true)).map((student, i) => (
                           <div key={student.id} className="glass rounded-3xl p-6 flex flex-col items-center text-center relative group hover:shadow-lg transition-all hover:-translate-y-1" style={{animationDelay: `${i * 50}ms`}}>
                               <div className="w-24 h-24 rounded-full p-1 border-2 border-brand-200 dark:border-brand-900 mb-4 relative">
                                   <img src={student.avatarUrl} alt={student.name} className="w-full h-full rounded-full object-cover" />
                                   <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 ${i % 3 === 0 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                               </div>
                               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{student.name}</h3>
                               <p className="text-sm text-gray-500 mb-4">{student.className} • {student.field}</p>
                               <div className="flex gap-2 w-full mt-auto">
                                   <Button variant="secondary" className="flex-1 text-sm" onClick={() => setSelectedStudent(student)}>Profili Gör</Button>
                                   {isInstructor && <Button variant="danger" className="p-2" onClick={() => handleDeleteStudent(student.id)}><Trash2 size={16} /></Button>}
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'classes' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Sınıflar</h3>{isInstructor && <Button onClick={() => setIsAddClassModalOpen(true)}><Plus className="mr-2" /> Yeni Sınıf</Button>}</div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {classes.map((cls, i) => (
                           <div key={i} className="glass p-6 rounded-3xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all group">
                               <div className="flex justify-between items-start mb-4">
                                   <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl"><Layers size={24} /></div>
                                   <Badge status={cls.type} />
                               </div>
                               <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{cls.name}</h3>
                               <p className="text-sm text-gray-500 mb-4">Danışman: {cls.advisor}</p>
                               <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400"><Users className="w-4 h-4 mr-2" /> {cls.students} Öğrenci</div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'fields' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                   <h3 className="text-xl font-bold">Alanlar & Bölümler</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {FIELDS_DATA.map((field, i) => (
                           <div key={i} className="glass p-8 rounded-3xl border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer group" onClick={() => { setFilterField(field.name); setActiveTab('students'); }}>
                               <div className="flex items-center gap-4 mb-4">
                                   <div className={`p-4 rounded-2xl bg-${field.color}-100 text-${field.color}-600 dark:bg-${field.color}-900/30 dark:text-${field.color}-400 group-hover:scale-110 transition-transform`}><field.icon size={32} /></div>
                                   <div><h3 className="text-2xl font-bold text-gray-800 dark:text-white">{field.name}</h3><p className="text-gray-500">{studentList.filter(s => s.field === field.name).length} Öğrenci</p></div>
                               </div>
                               <p className="text-gray-600 dark:text-gray-400">{field.description}</p>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'assignments' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Ödevler</h3>{isInstructor && <Button onClick={() => setIsAddAssignmentModalOpen(true)} className="shadow-glow"><Plus className="mr-2" /> Ödev Ekle</Button>}</div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {assignments.filter(a => isInstructor || (!a.targetClasses || a.targetClasses.includes(currentUser.className || ''))).map((asg, i) => (
                           <div key={asg.id} className="glass p-6 rounded-3xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group" onClick={() => setActiveAssignment(asg)}>
                               <div className="flex justify-between mb-4">
                                   <Badge status={new Date(asg.dueDate) < new Date() ? 'LATE' : 'UPCOMING'} />
                                   <span className="text-xs text-gray-400">{new Date(asg.createdAt).toLocaleDateString()}</span>
                               </div>
                               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">{asg.title}</h3>
                               <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{asg.description}</p>
                               <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100 dark:border-slate-700">
                                   <span className="font-medium text-gray-500">{asg.subject}</span>
                                   <span className="text-red-500 font-medium">Son: {new Date(asg.dueDate).toLocaleDateString()}</span>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'exams' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Sınavlar</h3></div>
                   <div className="grid grid-cols-1 gap-4">
                       {exams.map((exam) => (
                           <div key={exam.id} className="glass p-6 rounded-3xl flex items-center justify-between hover:shadow-md transition-all">
                               <div className="flex items-center gap-4">
                                   <div className="p-4 rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"><ClipboardList size={24} /></div>
                                   <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{exam.title}</h3><p className="text-sm text-gray-500">{exam.subject} • {exam.durationMinutes} Dakika</p></div>
                               </div>
                               {!isInstructor ? <Button onClick={() => startExam(exam)}>Sınava Başla</Button> : <span className="text-sm text-gray-400">Yayınlandı</span>}
                           </div>
                       ))}
                   </div>
               </div>
           )}

            {activeTab === 'attendance' && (
               <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
                   <div className="glass p-8 rounded-[2.5rem] text-center shadow-3d border border-white/50 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 via-indigo-500 to-purple-600"></div>
                       <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Dijital Kimlik & Yoklama</h3>
                       <div className="flex justify-center gap-8 mb-8">
                           <button onClick={handleAttendanceAction} disabled={attendanceLoading || todayAttendanceState !== 'IDLE'} className={`flex flex-col items-center justify-center w-40 h-40 rounded-3xl border-2 transition-all duration-300 ${todayAttendanceState === 'IDLE' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 hover:shadow-glow hover:scale-105 cursor-pointer' : 'border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed'}`}>
                               <Fingerprint size={48} className={`mb-2 ${todayAttendanceState === 'IDLE' ? 'text-brand-500 animate-pulse' : 'text-gray-400'}`} />
                               <span className="font-bold text-gray-700 dark:text-gray-300">Giriş Yap</span>
                           </button>
                           <button onClick={handleAttendanceAction} disabled={attendanceLoading || todayAttendanceState !== 'CHECKED_IN'} className={`flex flex-col items-center justify-center w-40 h-40 rounded-3xl border-2 transition-all duration-300 ${todayAttendanceState === 'CHECKED_IN' ? 'border-red-500 bg-red-50 dark:bg-red-900/10 hover:shadow-glow hover:scale-105 cursor-pointer' : 'border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed'}`}>
                               <LogOut size={48} className={`mb-2 ${todayAttendanceState === 'CHECKED_IN' ? 'text-red-500' : 'text-gray-400'}`} />
                               <span className="font-bold text-gray-700 dark:text-gray-300">Çıkış Yap</span>
                           </button>
                       </div>
                       {attendanceSuccessMsg && <div className="animate-in zoom-in fade-in duration-300 bg-green-100 text-green-700 px-6 py-3 rounded-xl font-bold inline-flex items-center"><CheckCircle className="mr-2" /> {attendanceSuccessMsg}</div>}
                   </div>
                   <div className="space-y-4">
                       <h4 className="font-bold text-lg px-2">Geçmiş Kayıtlar</h4>
                       {attendanceLogs.map((log) => (
                           <div key={log.id} className="glass p-4 rounded-2xl flex justify-between items-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
                               <div className="flex items-center gap-4">
                                   <div className={`p-3 rounded-xl ${log.status === 'ON_TIME' ? 'bg-green-100 text-green-600' : log.status === 'LATE' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}><CalendarCheck size={20} /></div>
                                   <div><p className="font-bold text-gray-800 dark:text-white">{log.date}</p><p className="text-xs text-gray-500">{log.status === 'ON_TIME' ? 'Zamanında' : log.status === 'LATE' ? 'Geç Kaldı' : 'Gelmedi'}</p></div>
                               </div>
                               <div className="text-right text-sm"><p className="font-semibold text-gray-700 dark:text-gray-300">Giriş: {log.checkIn}</p><p className="text-gray-400">Çıkış: {log.checkOut || '--:--'}</p></div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'study' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                   <h3 className="text-xl font-bold">Etüt Programı</h3>
                   <div className="grid grid-cols-1 gap-4">
                       {studySessions.map((st) => (
                           <div key={st.id} className="glass p-6 rounded-3xl flex justify-between items-center">
                               <div className="flex items-center gap-4">
                                   <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl"><Clock size={24} /></div>
                                   <div><h4 className="font-bold text-lg">{st.subject}</h4><p className="text-gray-500 text-sm">{st.teacherName} • {st.location}</p></div>
                               </div>
                               <div className="text-right"><p className="font-bold text-gray-800 dark:text-white">{st.time}</p><p className="text-sm text-gray-500">{st.date}</p><Badge status={st.status} /></div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'projects' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                   <h3 className="text-xl font-bold">Projeler</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {projects.map((proj) => (
                           <div key={proj.id} className="glass p-6 rounded-3xl border border-gray-100 dark:border-slate-700">
                               <div className="flex justify-between mb-4"><h4 className="font-bold text-lg">{proj.title}</h4><Badge status={proj.status} /></div>
                               <p className="text-gray-500 text-sm mb-6">{proj.description}</p>
                               <div className="mb-2 flex justify-between text-sm font-semibold"><span>İlerleme</span><span>%{proj.progress}</span></div>
                               <div className="w-full bg-gray-200 rounded-full h-2 mb-4"><div className="bg-brand-500 h-2 rounded-full" style={{ width: `${proj.progress}%` }}></div></div>
                               <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-slate-700"><div className="flex -space-x-2">{proj.teamMembers.map((m, i) => (<div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold">{m[0]}</div>))}</div><span className="text-xs text-gray-400">Son: {proj.deadline}</span></div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'announcements' && (
               <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="flex justify-between items-center"><h3 className="text-lg font-semibold text-gray-500">Duyuru Panosu</h3>{isInstructor && <Button onClick={() => setIsAddAnnouncementModalOpen(true)} className="shadow-glow"><Plus className="mr-2" /> Yeni Duyuru</Button>}</div>
                   <div className="space-y-4">
                       {announcements.filter(a => isInstructor || ((!a.targetClasses || a.targetClasses.length === 0 || a.targetClasses.includes(currentUser.className || '')) && (!a.targetFields || a.targetFields.length === 0 || a.targetFields.includes(currentUser.field || '')))).map((ann, idx) => (
                           <div key={ann.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-card hover:shadow-lg transition-all border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                               <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ann.priority === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                               <div className="flex justify-between items-start mb-3 pl-2">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded-xl ${ann.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}><Megaphone size={20} /></div>
                                       <div><h4 className="text-xl font-bold text-gray-800 dark:text-white">{ann.title}</h4><span className="text-xs text-gray-400">{new Date(ann.date).toLocaleDateString('tr-TR')} • {ann.authorName}</span></div>
                                   </div>
                                   {isInstructor && <button onClick={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>}
                               </div>
                               <p className="text-gray-600 dark:text-gray-300 pl-2 mb-4 leading-relaxed">{ann.content}</p>
                               {isInstructor && (
                                   <div className="flex flex-wrap gap-2 pl-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                                       <span className="text-xs text-gray-400 font-bold mr-2 self-center">Hedef:</span>
                                       {ann.targetClasses?.length ? ann.targetClasses.map(c => <span key={c} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs rounded">{c}</span>) : <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs rounded">Tüm Sınıflar</span>}
                                       {ann.targetFields?.length ? ann.targetFields.map(f => <span key={f} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs rounded">{f}</span>) : <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs rounded">Tüm Alanlar</span>}
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'messages' && (
             <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 h-[calc(100vh-140px)]">
               <div className="w-full md:w-1/3 glass rounded-3xl p-4 flex flex-col h-full border border-gray-100 dark:border-white/5">
                   <div className="flex justify-between items-center mb-4 px-2">
                       <h3 className="font-bold text-lg">Sohbetler</h3>
                       {!isInstructor && <Button onClick={() => setIsAddChatModalOpen(true)} className="!p-2 shadow-none bg-brand-100 text-brand-600 hover:bg-brand-200"><Plus size={18}/></Button>}
                   </div>
                   {isInstructor && <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">{conversations.filter(c => c.status === 'PENDING').map(c => (
                       <div key={c.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                           <div className="flex items-center gap-3 mb-2"><img src={c.studentAvatar} className="w-8 h-8 rounded-full" /><span className="text-sm font-bold">{c.studentName}</span></div>
                           <div className="flex gap-2"><Button onClick={() => handleApproveRequest(c.id)} className="flex-1 !py-1 text-xs h-8">Onayla</Button><Button onClick={() => handleRejectRequest(c.id)} variant="secondary" className="flex-1 !py-1 text-xs h-8">Reddet</Button></div>
                       </div>
                   ))}</div>}
                   <div className="flex-1 overflow-y-auto space-y-2">
                       {conversations.filter(c => c.status === 'APPROVED').map(c => (
                           <div key={c.id} onClick={() => setActiveConversation(c)} className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${activeConversation?.id === c.id ? 'bg-brand-500 text-white shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                               <img src={isInstructor ? c.studentAvatar : c.instructorAvatar} className="w-10 h-10 rounded-full bg-white" />
                               <div className="flex-1 overflow-hidden"><h4 className="font-bold truncate">{isInstructor ? c.studentName : c.instructorName}</h4><p className={`text-xs truncate ${activeConversation?.id === c.id ? 'text-brand-100' : 'text-gray-400'}`}>{c.messages[c.messages.length-1]?.text || 'Sohbet başladı.'}</p></div>
                           </div>
                       ))}
                   </div>
               </div>
               <div className="flex-1 glass rounded-3xl p-0 overflow-hidden flex flex-col border border-gray-100 dark:border-white/5 h-full">
                   {activeConversation ? (
                       <>
                           <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-slate-800/50 flex items-center gap-3">
                               <img src={isInstructor ? activeConversation.studentAvatar : activeConversation.instructorAvatar} className="w-10 h-10 rounded-full" />
                               <h3 className="font-bold text-lg">{isInstructor ? activeConversation.studentName : activeConversation.instructorName}</h3>
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 space-y-4">
                               {activeConversation.messages.map(m => (
                                   <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                       <div className={`max-w-[70%] p-3 rounded-2xl ${m.senderId === currentUser.id ? 'bg-brand-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>{m.text}</div>
                                   </div>
                               ))}
                               <div ref={humanChatEndRef} />
                           </div>
                           <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white/50 dark:bg-slate-800/50 flex gap-2">
                               <input type="text" className="flex-1 bg-white dark:bg-slate-900 border-none rounded-xl px-4 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Mesaj yaz..." value={humanChatMessage} onChange={(e) => setHumanChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendHumanMessage()} />
                               <Button onClick={handleSendHumanMessage} className="!p-3 rounded-xl"><Send size={20} /></Button>
                           </div>
                       </>
                   ) : (
                       <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                           <MessageCircle size={64} className="mb-4 opacity-20" />
                           <p>Bir sohbet seçin veya başlatın.</p>
                       </div>
                   )}
               </div>
             </div>
           )}
        </div>
      </main>

      {/* --- Floating Chat Assistant --- */}
      {!isInstructor && (
        <>
            <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-glow-lg hover:scale-110 transition-transform z-50">
                {isChatOpen ? <X size={24} /> : <Bot size={24} />}
            </button>
            {isChatOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] glass rounded-3xl shadow-3d flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 border border-white/40 dark:border-slate-600">
                    <div className="p-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-md"><Sparkles size={20} className="animate-pulse" /></div>
                        <div><h3 className="font-bold">Enid AI</h3><p className="text-xs text-brand-100">Canlı Öğrenci Asistanı</p></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/80 dark:bg-slate-900/80">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-brand-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 shadow-sm rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isChatTyping && <div className="flex justify-start"><div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-bl-none shadow-sm"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div></div></div></div>}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 flex gap-2">
                        <input type="text" className="flex-1 bg-gray-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Bir şeyler sor..." value={currentChatMessage} onChange={(e) => setCurrentChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                        <button onClick={handleSendMessage} disabled={!currentChatMessage.trim()} className="p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"><Send size={18} /></button>
                    </div>
                </div>
            )}
        </>
      )}

      {/* --- Modals --- */}
      {isAddAnnouncementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
                  <button onClick={() => setIsAddAnnouncementModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  <h3 className="text-2xl font-bold mb-6">Yeni Duyuru</h3>
                  <div className="space-y-4">
                      <input type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none focus:ring-2 focus:ring-brand-500" placeholder="Başlık" value={newAnnouncementForm.title} onChange={(e) => setNewAnnouncementForm({...newAnnouncementForm, title: e.target.value})} />
                      <textarea className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none focus:ring-2 focus:ring-brand-500 h-32 resize-none" placeholder="Duyuru içeriği..." value={newAnnouncementForm.content} onChange={(e) => setNewAnnouncementForm({...newAnnouncementForm, content: e.target.value})} />
                      <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newAnnouncementForm.priority === 'HIGH'} onChange={(e) => setNewAnnouncementForm({...newAnnouncementForm, priority: e.target.checked ? 'HIGH' : 'NORMAL'})} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" /><span className="text-sm font-semibold">Acil / Önemli</span></label>
                      </div>
                      <div>
                          <label className="block text-sm font-bold mb-2">Hedef Sınıflar</label>
                          <div className="flex flex-wrap gap-2">{['12-A','12-B','11-A','11-B'].map(cls => (
                              <button key={cls} onClick={() => toggleAnnouncementClass(cls)} className={`px-3 py-1 rounded-full text-xs font-bold border ${newAnnouncementForm.targetClasses.includes(cls) ? 'bg-brand-500 text-white border-brand-500' : 'bg-white dark:bg-slate-700 text-gray-500 border-gray-200'}`}>{cls}</button>
                          ))}</div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold mb-2">Hedef Alanlar</label>
                          <div className="flex flex-wrap gap-2">{FIELDS_DATA.map(f => (
                              <button key={f.name} onClick={() => toggleAnnouncementField(f.name)} className={`px-3 py-1 rounded-full text-xs font-bold border ${newAnnouncementForm.targetFields.includes(f.name) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white dark:bg-slate-700 text-gray-500 border-gray-200'}`}>{f.name}</button>
                          ))}</div>
                      </div>
                      <Button onClick={handleAddAnnouncement} className="w-full mt-2" disabled={!newAnnouncementForm.title}>Yayınla</Button>
                  </div>
              </div>
          </div>
      )}

      {isAddAssignmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setIsAddAssignmentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  <h3 className="text-2xl font-bold mb-6">Yeni Ödev Ekle</h3>
                  
                  {/* AI Generation Box */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-2xl mb-6 border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold"><Sparkles size={16} /><span>Enid AI ile Oluştur</span></div>
                      <div className="flex gap-2">
                          <input type="text" placeholder="Örn: Türev Alma Kuralları" className="flex-1 bg-white dark:bg-slate-700 border-none rounded-xl px-3 text-sm outline-none" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
                          <Button onClick={handleGenerateAssignmentWithAI} isLoading={isGeneratingAssignment} disabled={!aiTopic} className="!py-2 !px-4 text-xs">Oluştur</Button>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <input type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none focus:ring-2 focus:ring-brand-500" placeholder="Ödev Başlığı" value={newAssignmentForm.title} onChange={(e) => setNewAssignmentForm({...newAssignmentForm, title: e.target.value})} />
                      <input type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none focus:ring-2 focus:ring-brand-500" placeholder="Ders (Matematik, Fizik vb.)" value={newAssignmentForm.subject} onChange={(e) => setNewAssignmentForm({...newAssignmentForm, subject: e.target.value})} />
                      <input type="date" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none focus:ring-2 focus:ring-brand-500" value={newAssignmentForm.dueDate} onChange={(e) => setNewAssignmentForm({...newAssignmentForm, dueDate: e.target.value})} />
                      <textarea className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none focus:ring-2 focus:ring-brand-500 h-32 resize-none" placeholder="Açıklama..." value={newAssignmentForm.description} onChange={(e) => setNewAssignmentForm({...newAssignmentForm, description: e.target.value})} />
                      <div>
                          <label className="block text-sm font-bold mb-2">Hedef Sınıflar</label>
                          <div className="flex flex-wrap gap-2">{['12-A','12-B','11-A','11-B'].map(cls => (
                              <button key={cls} onClick={() => toggleClassSelection(cls)} className={`px-3 py-1 rounded-full text-xs font-bold border ${newAssignmentForm.targetClasses.includes(cls) ? 'bg-brand-500 text-white border-brand-500' : 'bg-white dark:bg-slate-700 text-gray-500 border-gray-200'}`}>{cls}</button>
                          ))}</div>
                      </div>
                      <Button onClick={handleAddAssignment} className="w-full mt-2" disabled={!newAssignmentForm.title}>Kaydet ve Gönder</Button>
                  </div>
              </div>
          </div>
      )}

      {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
                  <button onClick={() => setIsAddStudentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  <h3 className="text-2xl font-bold mb-6">Öğrenci Ekle</h3>
                  <div className="space-y-4">
                      <div className="flex justify-center mb-4">
                          <label className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative overflow-hidden group">
                              {newStudentForm.photo ? <img src={URL.createObjectURL(newStudentForm.photo)} className="w-full h-full object-cover" /> : <Camera size={32} className="text-gray-400" />}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setNewStudentForm({...newStudentForm, photo: e.target.files[0]})} />
                          </label>
                      </div>
                      <input type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none" placeholder="Ad Soyad" value={newStudentForm.name} onChange={(e) => setNewStudentForm({...newStudentForm, name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                          <input type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none" placeholder="TC Kimlik No" value={newStudentForm.tcNo} onChange={(e) => setNewStudentForm({...newStudentForm, tcNo: e.target.value})} />
                          <input type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none" placeholder="Okul No (PIN)" value={newStudentForm.pin} onChange={(e) => setNewStudentForm({...newStudentForm, pin: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <select className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none" value={newStudentForm.className} onChange={(e) => setNewStudentForm({...newStudentForm, className: e.target.value})}><option value="">Sınıf Seç</option><option value="12-A">12-A</option><option value="12-B">12-B</option><option value="11-A">11-A</option></select>
                           <select className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700 border-none outline-none" value={newStudentForm.field} onChange={(e) => setNewStudentForm({...newStudentForm, field: e.target.value})}><option value="">Alan Seç</option><option value="Sayısal">Sayısal</option><option value="Eşit Ağırlık">Eşit Ağırlık</option></select>
                      </div>
                      <Button onClick={handleAddStudent} className="w-full mt-2" disabled={!newStudentForm.name}>Kaydet</Button>
                  </div>
              </div>
          </div>
      )}

      {isAddChatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
                  <button onClick={() => setIsAddChatModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  <h3 className="text-2xl font-bold mb-6">Sohbet Başlat</h3>
                  <div className="space-y-2">
                      {MOCK_INSTRUCTORS_LIST.map(inst => (
                          <div key={inst.id} onClick={() => handleSendChatRequest(inst.id)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                              <img src={inst.avatarUrl} className="w-10 h-10 rounded-full bg-white" />
                              <div className="flex-1"><h4 className="font-bold text-gray-800 dark:text-white">{inst.name}</h4><p className="text-xs text-gray-500">{inst.className}</p></div>
                              <Button variant="secondary" className="!p-2 shadow-none"><MessageSquare size={16} /></Button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                 <button onClick={() => setActiveAssignment(null)} className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700"><X size={20} /></button>
                 <div className="flex items-center gap-4 mb-6"><div className="p-4 rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/20"><FileText size={32} /></div><div><h2 className="text-3xl font-bold text-gray-800 dark:text-white leading-tight">{activeAssignment.title}</h2><p className="text-gray-500 font-medium">{activeAssignment.subject} • <span className="text-brand-500">Son: {new Date(activeAssignment.dueDate).toLocaleDateString()}</span></p></div></div>
                 <div className="prose dark:prose-invert max-w-none mb-8 bg-gray-50 dark:bg-slate-700/50 p-6 rounded-2xl"><p>{activeAssignment.description}</p></div>
                 <div className="flex justify-end gap-4 border-t pt-6 border-gray-100 dark:border-slate-700">
                     {!isInstructor && <Button className="shadow-glow"><Upload className="mr-2" size={18} /> Ödev Yükle</Button>}
                     {!isInstructor && <Button variant="secondary"><MessageSquare className="mr-2" size={18} /> Eğitmene Sor</Button>}
                     {isInstructor && <Button variant="danger"><Trash2 className="mr-2" size={18} /> Ödevi Sil</Button>}
                 </div>
             </div>
          </div>
      )}

       {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
              <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2rem] p-8 shadow-3d relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-500 to-purple-600"></div>
                   <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-white hover:opacity-80"><X size={24} /></button>
                   <div className="relative flex flex-col items-center -mt-12 mb-6">
                       <img src={selectedStudent.avatarUrl} className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl bg-white" />
                       <h2 className="text-3xl font-bold mt-4 text-gray-800 dark:text-white">{selectedStudent.name}</h2>
                       <p className="text-gray-500 font-medium">{selectedStudent.className} - {selectedStudent.field}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl"><p className="text-xs text-gray-400 font-bold uppercase">Okul No</p><p className="font-semibold">{selectedStudent.pin}</p></div>
                       <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl"><p className="text-xs text-gray-400 font-bold uppercase">TC Kimlik</p><p className="font-semibold">{selectedStudent.tcNo || '---'}</p></div>
                       <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl"><p className="text-xs text-gray-400 font-bold uppercase">Veli Adı</p><p className="font-semibold">{selectedStudent.parentName || 'Ali Kaya'}</p></div>
                       <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl"><p className="text-xs text-gray-400 font-bold uppercase">Telefon</p><p className="font-semibold">{selectedStudent.phone || '05XX XXX XX XX'}</p></div>
                   </div>
                   <div className="flex gap-4">
                       <Button className="flex-1 shadow-glow"><MessageSquare className="mr-2" size={18} /> Mesaj Gönder</Button>
                       <Button variant="secondary" className="flex-1"><FileText className="mr-2" size={18} /> Karne Görüntüle</Button>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
}
