'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import { formatDateTime, getRoleBadge } from '@/lib/utils';
import {
  BookOpen, Clock, FileText, Bell, LayoutDashboard, CheckCircle, RefreshCw, UserCheck, UserX,
  Building2, Layers, ArrowLeft, Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeacherPendingPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['TEACHER']}>
        <PendingContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function PendingContent() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchPendingUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users/pending');
      setPendingUsers(data.users || []);
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPendingUsers(); }, [fetchPendingUsers]);

  const handleApprove = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/approve`);
      toast('Student approved successfully', 'success');
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to approve', 'error');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/reject`);
      toast('Student rejected', 'success');
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to reject', 'error');
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/teacher' },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/teacher/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/teacher/assignments' },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/teacher/pending', active: true, badge: pendingUsers.length },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Pending Approvals" subtitle="Approve students in your department" role="Teacher">
      <button onClick={() => router.push('/dashboard/teacher')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex justify-end mb-4">
        <button onClick={fetchPendingUsers} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
          <p className="text-gray-500">No pending approvals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers
            .filter((u: any) => u.role === 'STUDENT')
            .map((pu: any) => (
              <div key={pu.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-700">
                    {pu.fullName?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{pu.fullName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadge(pu.role)}`}>{pu.role}</span>
                    </div>
                    <p className="text-sm text-gray-500">{pu.email}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      {pu.department && <span className="flex items-center gap-1"><Building2 size={12} /> {pu.department.name}</span>}
                      {pu.level && <span className="flex items-center gap-1"><Layers size={12} /> {pu.level.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(pu.id)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700">
                    <UserCheck size={16} /> Approve
                  </button>
                  <button onClick={() => handleReject(pu.id)} className="flex items-center gap-1 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50">
                    <UserX size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </DashboardLayout>
  );
}