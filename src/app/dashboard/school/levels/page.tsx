'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import {
  BookOpen, Clock, Users, Building2, Layers, Calendar, LayoutDashboard, RefreshCw, Plus, Trash2, Edit3,
} from 'lucide-react';

export default function LevelsPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SCHOOL_ADMIN']}>
        <LevelsContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function LevelsContent() {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', sortOrder: '1' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchLevels = useCallback(async () => {
    try {
      const { data } = await api.get('/levels');
      setLevels(data.levels || []);
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  const resetForm = () => {
    setForm({ name: '', code: '', sortOrder: '1' });
    setEditingId(null);
    setShowAdd(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 1 };
      if (editingId) {
        await api.patch(`/levels/${editingId}`, payload);
        toast('Level updated!', 'success');
      } else {
        await api.post('/levels', payload);
        toast('Level created!', 'success');
      }
      resetForm();
      fetchLevels();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (level: any) => {
    setForm({ name: level.name, code: level.code || '', sortOrder: String(level.sortOrder || 1) });
    setEditingId(level.id);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this level?')) return;
    try { await api.delete(`/levels/${id}`); toast('Level deleted', 'success'); fetchLevels(); }
    catch (err: any) { toast(err.response?.data?.message || 'Failed to delete', 'error'); }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/school' },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/school/pending' },
    { label: 'Users', icon: Users, href: '/dashboard/school/users' },
    { label: 'Sessions', icon: Calendar, href: '/dashboard/school/sessions' },
    { label: 'Departments', icon: Building2, href: '/dashboard/school/departments' },
    { label: 'Levels', icon: Layers, href: '/dashboard/school/levels', active: true },
    { label: 'Courses', icon: BookOpen, href: '/dashboard/school/courses' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Levels" subtitle={`${levels.length} levels`} role="School Admin">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button onClick={() => { resetForm(); setShowAdd(!showAdd); }}
          className="flex items-center gap-2 bg-[#1E40AF] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D4ED8]">
          <Plus size={16} /> {showAdd ? 'Cancel' : 'Add Level'}
        </button>
        <button onClick={fetchLevels} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-slide-up">
          <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Level' : 'New Level'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="100 Level" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="100L" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              placeholder="Sort order" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
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
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : levels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Layers className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No levels yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {levels.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.code || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(l)} className="text-gray-400 hover:text-blue-600 p-1"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(l.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}