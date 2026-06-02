'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  BookOpen, Clock, CheckCircle, ChevronRight, LayoutDashboard, Bell, FileText, Brain,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function StudentDashboard() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['STUDENT']}>
        <StudentContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function StudentContent() {
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/assignments'),
      ]);
      setCourses(coursesRes.data.courses || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pendingAssignments = assignments.filter((a: any) => {
    return a._count?.submissions === 0;
  });

  const firstName = user?.fullName?.split(' ')[0] || 'Student';

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/student', active: true },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/student/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/student/assignments' },
    { label: 'AI Tools', icon: Brain, href: '/dashboard/ai' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      title="Student Dashboard"
      subtitle={`${getGreeting()}, ${firstName}`}
      role="Student"
    >
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-2xl p-6 lg:p-8 mb-8 text-white animate-fade-in">
        <h2 className="text-xl lg:text-2xl font-bold">
          {getGreeting()}, {firstName} 👋
        </h2>
        <p className="text-blue-100 mt-1 text-sm lg:text-base">
          {loading
            ? 'Loading your dashboard...'
            : pendingAssignments.length > 0
              ? `You have ${pendingAssignments.length} pending assignment${pendingAssignments.length > 1 ? 's' : ''}. Let's get to work!`
              : "You're all caught up! Keep up the great work."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : courses.length}</p>
              <p className="text-sm text-gray-500">Enrolled Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : pendingAssignments.length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : assignments.length - pendingAssignments.length}</p>
              <p className="text-sm text-gray-500">Submitted</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
          <button onClick={() => router.push('/dashboard/student/courses')} className="text-sm text-[#1E40AF] hover:text-[#1D4ED8] font-medium transition-colors duration-200">
            View All
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 text-sm">No courses yet.</p>
            <p className="text-gray-400 text-xs mt-1">Ask your admin to enroll you in courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course: any) => (
              <div
                key={course.id}
                onClick={() => router.push(`/dashboard/student/courses/${course.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-blue-600" size={18} />
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1E40AF] group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                {course.code && <p className="text-xs text-blue-600 font-medium mb-2">{course.code}</p>}
                {course.teacher && (
                  <p className="text-xs text-gray-500">{course.teacher.fullName}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Assignments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pending Assignments</h3>
          <button onClick={() => router.push('/dashboard/student/assignments')} className="text-sm text-[#1E40AF] hover:text-[#1D4ED8] font-medium transition-colors duration-200">
            View All
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : pendingAssignments.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="text-green-500" size={28} />
            </div>
            <p className="text-gray-500 text-sm">All caught up!</p>
            <p className="text-gray-400 text-xs mt-1">No pending assignments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAssignments.slice(0, 5).map((assignment: any) => (
              <div
                key={assignment.id}
                onClick={() => router.push(`/dashboard/student/assignments/${assignment.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-amber-600" size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{assignment.title}</h4>
                    <p className="text-xs text-gray-500">{assignment.course?.title || 'No course'}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1E40AF] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}