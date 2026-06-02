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

export default function CoursesPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SCHOOL_ADMIN']}>
        <CoursesContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function CoursesContent() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', code: '', units: '2', departmentId: '', levelId: '', teacherId: '' });
  const [departments, setDepartments] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, deptRes, levelsRes, usersRes] = await Promise.all([
        api.get('/courses'),
        api.get('/departments'),
        api.get('/levels'),
        api.get('/users'),
      ]);
      setCourses(coursesRes.data.courses || []);
      setDepartments(deptRes.data.departments || []);
      setLevels(levelsRes.data.levels || []);
      setTeachers((usersRes.data.users || []).filter((u: any) => u.role === 'TEACHER'));
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm({ title: '', code: '', units: '2', departmentId: '', levelId: '', teacherId: '' });
    setEditingId(null);
    setShowAdd(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        code: form.code || undefined,
        units: parseInt(form.units) || 2,
        departmentId: form.departmentId || undefined,
        levelId: form.levelId || undefined,
        teacherId: form.teacherId || undefined,
      };
      if (editingId) {
        await api.patch(`/courses/${editingId}`, payload);
        toast('Course updated!', 'success');
      } else {
        await api.post('/courses', payload);
        toast('Course created!', 'success');
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (course: any) => {
    setForm({
      title: course.title,
      code: course.code || '',
      units: String(course.units || 2),
      departmentId: course.departmentId || '',
      levelId: course.levelId || '',
      teacherId: course.teacherId || '',
    });
    setEditingId(course.id);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try { await api.delete(`/courses/${id}`); toast('Course deleted', 'success'); fetchData(); }
    catch (err: any) { toast(err.response?.data?.message || 'Failed to delete', 'error'); }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/school' },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/school/pending' },
    { label: 'Users', icon: Users, href: '/dashboard/school/users' },
    { label: 'Sessions', icon: Calendar, href: '/dashboard/school/sessions' },
    { label: 'Departments', icon: Building2, href: '/dashboard/school/departments' },
    { label: 'Levels', icon: Layers, href: '/dashboard/school/levels' },
    { label: 'Courses', icon: BookOpen, href: '/dashboard/school/courses', active: true },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Courses" subtitle={`${courses.length} courses`} role="School Admin">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button onClick={() => { resetForm(); setShowAdd(!showAdd); }}
          className="flex items-center gap-2 bg-[#1E40AF] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D4ED8]">
          <Plus size={16} /> {showAdd ? 'Cancel' : 'Add Course'}
        </button>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-slide-up">
          <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Course' : 'New Course'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Course title" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="CSC 101" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <input type="number" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })}
              placeholder="Units" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
              <option value="">Select department</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={form.levelId} onChange={(e) => setForm({ ...form, levelId: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
              <option value="">Select level</option>
              {levels.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
              <option value="">Select teacher</option>
              {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
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
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <BookOpen className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No courses yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Dept</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.code || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.level?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.teacher?.fullName || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(c)} className="text-gray-400 hover:text-blue-600 p-1"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
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