'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { BookOpen, FileText, Bell, LayoutDashboard, Brain, ChevronRight, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentCoursesPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['STUDENT']}>
        <CoursesContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function CoursesContent() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCourses = useCallback(async () => {
    try { const { data } = await api.get('/courses'); setCourses(data.courses || []); } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/student' },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/student/courses', active: true },
    { label: 'Assignments', icon: FileText, href: '/dashboard/student/assignments' },
    { label: 'AI Tools', icon: Brain, href: '/dashboard/ai' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="My Courses" subtitle={`${courses.length} enrolled courses`} role="Student">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border"><BookOpen className="mx-auto text-gray-300 mb-3" size={48} /><p className="text-gray-500">No courses yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: any) => (
            <div key={course.id} onClick={() => router.push(`/dashboard/student/courses/${course.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><BookOpen className="text-blue-600" size={18} /></div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1E40AF] group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
              {course.code && <p className="text-xs text-blue-600 font-medium mb-2">{course.code}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {course.teacher && <span>{course.teacher.fullName}</span>}
                {course.department && <span className="flex items-center gap-1"><Users size={12} /> {course.department.name}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}