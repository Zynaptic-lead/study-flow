'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import {
  Users, BookOpen, Clock, School, ChevronRight, Building2, Layers, Calendar, UserPlus, Bell, LayoutDashboard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SchoolAdminDashboard() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SCHOOL_ADMIN']}>
        <DashboardContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function DashboardContent() {
  const [stats, setStats] = useState({ users: 0, courses: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    try {
      const [usersRes, coursesRes, pendingRes] = await Promise.all([
        api.get('/users'),
        api.get('/courses'),
        api.get('/users/pending'),
      ]);
      setStats({
        users: usersRes.data.users?.length || 0,
        courses: coursesRes.data.courses?.length || 0,
        pending: pendingRes.data.users?.length || 0,
      });
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/school', active: true },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/school/pending', badge: stats.pending },
    { label: 'Users', icon: Users, href: '/dashboard/school/users' },
    { label: 'Sessions', icon: Calendar, href: '/dashboard/school/sessions' },
    { label: 'Departments', icon: Building2, href: '/dashboard/school/departments' },
    { label: 'Levels', icon: Layers, href: '/dashboard/school/levels' },
    { label: 'Courses', icon: BookOpen, href: '/dashboard/school/courses' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Courses', value: stats.courses, icon: BookOpen, color: 'bg-green-100 text-green-600' },
    { label: 'Pending Approvals', value: stats.pending, icon: Clock, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Dashboard" subtitle={`${getGreeting()}, ${user?.fullName?.split(' ')[0]}`} role="School Admin">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon size={20} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => router.push('/dashboard/school/pending')} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <Clock className="text-amber-600" size={20} />
              <div className="text-left"><p className="text-sm font-medium">Pending Approvals</p><p className="text-xs text-gray-500">Approve users</p></div>
            </div>
            <ChevronRight size={18} className="text-amber-600" />
          </button>
          <button onClick={() => router.push('/setup')} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <School className="text-blue-600" size={20} />
              <div className="text-left"><p className="text-sm font-medium">Setup Wizard</p><p className="text-xs text-gray-500">Add departments & levels</p></div>
            </div>
            <ChevronRight size={18} className="text-blue-600" />
          </button>
          <button onClick={() => router.push('/dashboard/school/users')} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <UserPlus className="text-green-600" size={20} />
              <div className="text-left"><p className="text-sm font-medium">Manage Users</p><p className="text-xs text-gray-500">View all users</p></div>
            </div>
            <ChevronRight size={18} className="text-green-600" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}