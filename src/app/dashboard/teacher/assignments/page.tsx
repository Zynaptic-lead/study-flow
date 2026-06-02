'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { BookOpen, Clock, FileText, Bell, LayoutDashboard, ChevronRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeacherAssignmentsPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['TEACHER', 'SCHOOL_ADMIN']}>
        <AssignmentsContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function AssignmentsContent() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAssignments = useCallback(async () => {
    try {
      const { data } = await api.get('/assignments');
      setAssignments(data.assignments || []);
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/teacher' },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/teacher/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/teacher/assignments', active: true },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/teacher/pending' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Assignments" subtitle={`${assignments.length} assignments`} role="Teacher">
      <button onClick={() => router.push('/dashboard/teacher/assignments/create')}
        className="flex items-center gap-2 bg-[#1E40AF] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D4ED8] mb-6">
        <Plus size={16} /> Create Assignment
      </button>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <FileText className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{a.title}</h4>
                  <p className="text-sm text-gray-500">{a.course?.title} • {a._count?.submissions || 0} submissions • {a.totalPoints} pts</p>
                </div>
                <button onClick={() => router.push(`/dashboard/teacher/submissions/${a.id}`)}
                  className="text-sm text-[#1E40AF] font-medium hover:underline">
                  View Submissions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}