

export enum UserRole {
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string; // Ad Soyad
  role: UserRole;
  avatarUrl?: string;
  photoUrl?: string; // Uploaded photo
  // New auth fields
  tcNo?: string;
  pin: string;
  className?: string; // 12-A, 11-B, Mezun A vb.
  field?: string; // Sayısal, Eşit Ağırlık, Hazırlık vb.
  // Profile Details
  email?: string;
  phone?: string;
  parentName?: string;
  address?: string;
  birthDate?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string; // ISO String
  createdBy: string;
  createdAt: string;
  targetClasses?: string[]; // Classes assigned to this homework
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED'
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string; 
  fileUrl?: string; 
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: SubmissionStatus;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  authorName: string;
  priority: 'NORMAL' | 'HIGH';
  targetClasses?: string[]; // New: Which classes can see this
  targetFields?: string[];  // New: Which fields can see this (e.g. only Sayısal)
}

export interface Notification {
  id: string;
  userId: string; // Who receives this
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'REQUEST';
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // e.g. conversationId
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; 
  correctAnswer?: string; 
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  questions: Question[];
  createdBy: string;
  createdAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  submittedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Human to Human Chat
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  messages: Message[];
  lastMessageAt: string;
}

// New Modules
export interface StudySession {
  id: string;
  subject: string;
  teacherName: string;
  date: string;
  time: string;
  location: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number; // 0-100
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  teamMembers: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string; // Time string like "08:30"
  checkOut?: string; // Time string like "15:45"
  status: 'ON_TIME' | 'LATE' | 'ABSENT' | 'EXCUSED';
}