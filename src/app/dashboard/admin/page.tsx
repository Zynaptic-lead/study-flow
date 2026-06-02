'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import { PendingSchool } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  GraduationCap,
  Building2,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  Trash2,
  School,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SUPER_ADMIN']}>
        <DashboardContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant: 'danger' | 'warning';
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              confirmVariant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
            }`}
          >
            <AlertTriangle
              size={20}
              className={confirmVariant === 'danger' ? 'text-red-600' : 'text-amber-600'}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [pendingSchools, setPendingSchools] = useState<PendingSchool[]>([]);
  const [approvedSchools, setApprovedSchools] = useState<PendingSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant: 'danger' | 'warning';
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', confirmLabel: '', confirmVariant: 'danger', onConfirm: () => {} });
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const fetchPendingSchools = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/schools/pending');
      setPendingSchools(data.schools);
    } catch (err: any) {
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApprovedSchools = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/schools');
      setApprovedSchools(data.schools || []);
    } catch (err: any) {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchPendingSchools();
    fetchApprovedSchools();
  }, [fetchPendingSchools, fetchApprovedSchools]);

  const handleApprove = async (schoolId: string) => {
    try {
      await api.patch(`/admin/schools/${schoolId}/approve`);
      toast('School approved successfully', 'success');
      setPendingSchools((prev) => prev.filter((s) => s.id !== schoolId));
      fetchApprovedSchools();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to approve school', 'error');
    }
  };

  const confirmReject = (schoolId: string) => {
    setModal({
      open: true,
      title: 'Reject School',
      message: 'Are you sure you want to reject this school? This action cannot be undone.',
      confirmLabel: 'Yes, Reject',
      confirmVariant: 'danger',
      onConfirm: () => handleReject(schoolId),
    });
  };

  const handleReject = async (schoolId: string) => {
    try {
      await api.patch(`/admin/schools/${schoolId}/reject`);
      toast('School rejected', 'success');
      setPendingSchools((prev) => prev.filter((s) => s.id !== schoolId));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to reject school', 'error');
    }
  };

  const confirmDelete = (schoolId: string) => {
    setModal({
      open: true,
      title: 'Delete School',
      message: 'Delete this school? All users, courses, and data will be permanently removed. This action cannot be undone.',
      confirmLabel: 'Yes, Delete',
      confirmVariant: 'danger',
      onConfirm: () => handleDelete(schoolId),
    });
  };

  const handleDelete = async (schoolId: string) => {
    try {
      await api.delete(`/admin/schools/${schoolId}`);
      toast('School deleted successfully', 'success');
      setApprovedSchools((prev) => prev.filter((s) => s.id !== schoolId));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete school', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Confirm Modal */}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        confirmVariant={modal.confirmVariant}
        onConfirm={modal.onConfirm}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E40AF] rounded-xl flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sm">StudyFlow</h1>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 w-full ${
              activeTab === 'pending'
                ? 'bg-[#1E40AF] text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Clock size={18} />
            Pending
            {pendingSchools.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {pendingSchools.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('approved');
              fetchApprovedSchools();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 w-full ${
              activeTab === 'approved'
                ? 'bg-[#1E40AF] text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <School size={18} />
            Approved Schools
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#1E40AF] rounded-full flex items-center justify-center text-xs font-bold text-white">
              {user?.fullName?.charAt(0) || 'SA'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors duration-200 w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'pending' ? 'School Approvals' : 'Approved Schools'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'pending'
                ? 'Review and approve new school registrations'
                : 'All active schools on the platform'}
            </p>
          </div>
          <button
            onClick={() => {
              fetchPendingSchools();
              fetchApprovedSchools();
            }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="space-y-4 animate-fade-in">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-red-500" size={32} />
            </div>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchPendingSchools}
              className="bg-[#1E40AF] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1D4ED8] transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && activeTab === 'pending' && pendingSchools.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No pending school approvals.</p>
          </div>
        )}

        {!loading && !error && activeTab === 'approved' && approvedSchools.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="text-[#1E40AF]" size={40} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schools Yet</h3>
            <p className="text-gray-500">Approved schools will appear here.</p>
          </div>
        )}

        {!loading && !error && activeTab === 'pending' && pendingSchools.length > 0 && (
          <div className="space-y-4">
            {pendingSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Building2 className="text-amber-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                        <p className="text-sm text-gray-500">{school.type}</p>
                      </div>
                    </div>
                    {school.users?.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 border-gray-100 ml-13">
                        <p className="text-xs text-gray-500 mb-1">Admin Account</p>
                        <p className="text-sm font-medium text-gray-700">{school.users[0].fullName}</p>
                        <p className="text-sm text-gray-500">{school.users[0].email}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">Registered {formatDateTime(school.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(school.id)}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => confirmReject(school.id)}
                      className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors duration-200"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && activeTab === 'approved' && approvedSchools.length > 0 && (
          <div className="space-y-4">
            {approvedSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building2 className="text-green-600" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{school.type || 'University'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Created {formatDateTime(school.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => confirmDelete(school.id)}
                    className="flex items-center gap-2 bg-white border border-red-200 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}