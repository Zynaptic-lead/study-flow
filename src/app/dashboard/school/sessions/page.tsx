'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import {
  BookOpen, Clock, Users, Building2, Layers, Calendar, LayoutDashboard, RefreshCw, Plus, Trash2, Edit3, CheckCircle, XCircle,
} from 'lucide-react';

export default function SessionsPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SCHOOL_ADMIN']}>
        <SessionsContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function SessionsContent() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await api.get('/sessions');
      setSessions(data.sessions || []);
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const resetForm = () => {
    setForm({ name: '', startDate: '', endDate: '' });
    setEditingId(null);
    setShowAdd(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/sessions/${editingId}`, form);
        toast('Session updated!', 'success');
      } else {
        await api.post('/sessions', form);
        toast('Session created!', 'success');
      }
      resetForm();
      fetchSessions();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (session: any) => {
    setForm({
      name: session.name,
      startDate: session.startDate?.split('T')[0] || '',
      endDate: session.endDate?.split('T')[0] || '',
    });
    setEditingId(session.id);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      toast('Session deleted', 'success');
      fetchSessions();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/school' },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/school/pending' },
    { label: 'Users', icon: Users, href: '/dashboard/school/users' },
    { label: 'Sessions', icon: Calendar, href: '/dashboard/school/sessions', active: true },
    { label: 'Departments', icon: Building2, href: '/dashboard/school/departments' },
    { label: 'Levels', icon: Layers, href: '/dashboard/school/levels' },
    { label: 'Courses', icon: BookOpen, href: '/dashboard/school/courses' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Sessions" subtitle={`${sessions.length} academic sessions`} role="School Admin">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button onClick={() => { resetForm(); setShowAdd(!showAdd); }}
          className="flex items-center gap-2 bg-[#1E40AF] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D4ED8]">
          <Plus size={16} /> {showAdd ? 'Cancel' : 'Add Session'}
        </button>
        <button onClick={fetchSessions} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-slide-up">
          <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Session' : 'New Session'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="2025/2026" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-[#1E40AF] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50">
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No sessions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {s.isActive ? <CheckCircle className="text-green-600" size={16} /> : <XCircle className="text-gray-400" size={16} />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{s.name}</h4>
                  <p className="text-xs text-gray-500">
                    {s.startDate ? new Date(s.startDate).toLocaleDateString() : 'N/A'} — {s.endDate ? new Date(s.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(s)} className="text-gray-400 hover:text-blue-600 p-2"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}