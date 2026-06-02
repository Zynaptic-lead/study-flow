'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { BookOpen, FileText, Bell, LayoutDashboard, Brain, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentAssignmentsPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['STUDENT']}>
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
    try { const { data } = await api.get('/assignments'); setAssignments(data.assignments || []); } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/student' },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/student/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/student/assignments', active: true },
    { label: 'AI Tools', icon: Brain, href: '/dashboard/ai' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Assignments" subtitle={`${assignments.length} assignments`} role="Student">
      {loading ? (
        <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border"><FileText className="mx-auto text-gray-300 mb-3" size={48} /><p className="text-gray-500">No assignments yet.</p></div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a: any) => (
            <div key={a.id} onClick={() => router.push(`/dashboard/student/assignments/${a.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a._count?.submissions > 0 ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {a._count?.submissions > 0 ? <CheckCircle className="text-green-600" size={16} /> : <Clock className="text-amber-600" size={16} />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{a.title}</h4>
                  <p className="text-xs text-gray-500">{a.course?.title} • {a.totalPoints} pts</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1E40AF] transition-all" />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}