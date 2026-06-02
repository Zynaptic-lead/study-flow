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
  Users, BookOpen, Clock, Building2, Layers, Calendar, Bell, LayoutDashboard, CheckCircle, XCircle, RefreshCw, UserCheck, UserX, AlertTriangle, X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ConfirmModal stays the same

export default function PendingPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SCHOOL_ADMIN', 'TEACHER']}>
        <PendingContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function PendingContent() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>({ open: false });
  const { toast } = useToast();
  const router = useRouter();

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/pending');
      setPendingUsers(data.users || []);
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPendingUsers(); }, [fetchPendingUsers]);

  const handleApprove = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/approve`);
      toast('User approved successfully', 'success');
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to approve user', 'error');
    }
  };

  const confirmReject = (userId: string) => {
    setModal({ open: true, title: 'Reject User', message: 'Are you sure?', confirmLabel: 'Yes, Reject', confirmVariant: 'danger', onConfirm: () => handleReject(userId) });
  };

  const handleReject = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/reject`);
      toast('User rejected', 'success');
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to reject user', 'error');
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/school' },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/school/pending', active: true, badge: pendingUsers.length },
    { label: 'Users', icon: Users, href: '/dashboard/school/users' },
    { label: 'Sessions', icon: Calendar, href: '/dashboard/school/sessions' },
    { label: 'Departments', icon: Building2, href: '/dashboard/school/departments' },
    { label: 'Levels', icon: Layers, href: '/dashboard/school/levels' },
    { label: 'Courses', icon: BookOpen, href: '/dashboard/school/courses' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Pending Approvals" subtitle="Approve or reject registrations" role="School Admin">
      <div className="flex justify-end mb-4">
        <button onClick={fetchPendingUsers} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><RefreshCw size={16} /> Refresh</button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <CheckCircle className="mx-auto text-green-500 mb-2" size={40} />
          <p className="text-gray-500">No pending approvals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((pu) => (
            <div key={pu.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-700">{pu.fullName.charAt(0)}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{pu.fullName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadge(pu.role)}`}>{pu.role}</span>
                  </div>
                  <p className="text-sm text-gray-500">{pu.email}</p>
                  {pu.department && <p className="text-xs text-gray-400">{pu.department.name}{pu.level ? ` • ${pu.level.name}` : ''}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleApprove(pu.id)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"><UserCheck size={16} /> Approve</button>
                <button onClick={() => confirmReject(pu.id)} className="flex items-center gap-1 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50"><UserX size={16} /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}