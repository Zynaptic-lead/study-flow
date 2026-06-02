export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  type: 'UNIVERSITY' | 'POLYTECHNIC';
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT';
  avatar?: string;
  isActive: boolean;
  accountStatus: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  schoolId: string;
  departmentId?: string;
  levelId?: string;
  school?: School;
  department?: { id: string; name: string };
  level?: { id: string; name: string };
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface PendingSchool {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  users: { id: string; fullName: string; email: string }[];
}