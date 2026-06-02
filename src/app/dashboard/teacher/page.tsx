'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import {
  BookOpen, Clock, FileText, Bell, LayoutDashboard, Users, CheckCircle, ChevronRight, Plus, ClipboardList,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['TEACHER']}>
        <TeacherContent />
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

function TeacherContent() {
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

  const pendingGrading = assignments.reduce((count: number, a: any) => {
    return count + (a.submissions?.filter((s: any) => s.status === 'SUBMITTED').length || 0);
  }, 0);

  const totalStudents = courses.reduce((count: number, c: any) => {
    return count + (c._count?.enrollments || 0);
  }, 0);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/teacher', active: true },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/teacher/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/teacher/assignments' },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/teacher/pending' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout
      menuItems={menuItems}
      title="Teacher Dashboard"
      subtitle={`${getGreeting()}, ${user?.fullName?.split(' ')[0]}`}
      role="Teacher"
    >
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-2xl p-6 lg:p-8 mb-8 text-white animate-fade-in">
        <h2 className="text-xl lg:text-2xl font-bold">
          {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h2>
        <p className="text-blue-100 mt-1 text-sm lg:text-base">
          {pendingGrading > 0
            ? `You have ${pendingGrading} submission${pendingGrading > 1 ? 's' : ''} to grade.`
            : 'All submissions are graded. Great work!'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : courses.length}</p>
              <p className="text-sm text-gray-500">My Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : totalStudents}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : pendingGrading}</p>
              <p className="text-sm text-gray-500">To Grade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => router.push('/dashboard/teacher/assignments/create')}
            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="text-blue-600" size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Create Assignment</p>
                <p className="text-xs text-gray-500">Add a new assignment</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <button
            onClick={() => router.push('/dashboard/teacher/assignments')}
            className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="text-amber-600" size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">View Submissions</p>
                <p className="text-xs text-gray-500">Grade student work</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-amber-600 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <button
            onClick={() => router.push('/dashboard/teacher/pending')}
            className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Pending Approvals</p>
                <p className="text-xs text-gray-500">Approve students</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-purple-600 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* My Courses */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
          <button onClick={() => router.push('/dashboard/teacher/courses')} className="text-sm text-[#1E40AF] font-medium">
            View All
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="text-gray-500">No courses assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                onClick={() => router.push(`/dashboard/teacher/courses/${course.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-blue-600" size={18} />
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1E40AF] transition-all" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                {course.code && <p className="text-xs text-blue-600 font-medium mb-2">{course.code}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users size={12} /> {course._count?.enrollments || 0} students</span>
                  <span className="flex items-center gap-1"><FileText size={12} /> {course._count?.assignments || 0} assignments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Assignments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Assignments</h3>
          <button onClick={() => router.push('/dashboard/teacher/assignments')} className="text-sm text-[#1E40AF] font-medium">
            View All
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <FileText className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-gray-500 text-sm">No assignments created yet.</p>
            <button onClick={() => router.push('/dashboard/teacher/assignments/create')} className="mt-2 text-sm text-[#1E40AF] font-medium">
              Create your first assignment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.slice(0, 5).map((assignment: any) => (
              <div key={assignment.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-amber-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{assignment.title}</h4>
                      <p className="text-xs text-gray-500">{assignment.course?.title} • {assignment._count?.submissions || 0} submissions</p>
                    </div>
                  </div>
                  <button onClick={() => router.push(`/dashboard/teacher/submissions/${assignment.id}`)}
                    className="text-xs text-[#1E40AF] font-medium hover:underline">
                    View Submissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}