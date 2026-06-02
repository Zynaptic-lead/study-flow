'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import {
  BookOpen, Clock, Users, Building2, Layers, Calendar, LayoutDashboard, RefreshCw, Plus, Trash2, UserPlus, CheckCircle,
} from 'lucide-react';

export default function DepartmentsPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SCHOOL_ADMIN']}>
        <DepartmentsContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function DepartmentsContent() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '' });
  const [adding, setAdding] = useState(false);
  const [headSelections, setHeadSelections] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [deptRes, usersRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users'),
      ]);
      setDepartments(deptRes.data.departments || []);
      setTeachers((usersRes.data.users || []).filter((u: any) => u.role === 'TEACHER'));
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!newDept.name.trim()) return;
    setAdding(true);
    try {
      await api.post('/departments', newDept);
      toast('Department created!', 'success');
      setNewDept({ name: '', code: '' });
      setShowAdd(false);
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to create', 'error');
    } finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast('Department deleted', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const handleAssignHead = async (deptId: string) => {
    const teacherId = headSelections[deptId];
    if (!teacherId) { toast('Please select a teacher', 'error'); return; }
    try {
      await api.patch(`/departments/${deptId}/head/${teacherId}`);
      toast('Department head assigned!', 'success');
      setHeadSelections((prev) => ({ ...prev, [deptId]: '' }));
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to assign head', 'error');
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/school' },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/school/pending' },
    { label: 'Users', icon: Users, href: '/dashboard/school/users' },
    { label: 'Sessions', icon: Calendar, href: '/dashboard/school/sessions' },
    { label: 'Departments', icon: Building2, href: '/dashboard/school/departments', active: true },
    { label: 'Levels', icon: Layers, href: '/dashboard/school/levels' },
    { label: 'Courses', icon: BookOpen, href: '/dashboard/school/courses' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Departments" role="School Admin">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-[#1E40AF] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D4ED8]">
          <Plus size={16} /> Add Department
        </button>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              placeholder="Department name" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <input type="text" value={newDept.code} onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
              placeholder="Code (e.g. CSC)" className="w-32 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            <button onClick={handleAdd} disabled={adding}
              className="bg-[#1E40AF] text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
              {adding ? 'Adding...' : 'Add'}
            </button>
            <button onClick={() => setShowAdd(false)} className="text-gray-500 px-3 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Building2 className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No departments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {departments.map((dept: any) => (
            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{dept.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    {dept.code && <span className="bg-gray-100 px-2 py-0.5 rounded">Code: {dept.code}</span>}
                    <span>{dept._count?.users || 0} members</span>
                    <span>{dept._count?.courses || 0} courses</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(dept.id)} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Head Section */}
              <div className="bg-gray-50 rounded-xl p-3">
                {dept.head ? (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="text-gray-700">Head: <strong>{dept.head.fullName}</strong></span>
                    <button onClick={() => {
                      setHeadSelections((prev) => ({ ...prev, [dept.id]: '' }));
                      handleAssignHead(dept.id);
                    }} className="text-xs text-red-500 hover:underline ml-auto">Remove</button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-amber-600 mb-2">No head assigned</p>
                    <div className="flex gap-2">
                      <select
                        value={headSelections[dept.id] || ''}
                        onChange={(e) => setHeadSelections((prev) => ({ ...prev, [dept.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                      >
                        <option value="">Select a teacher...</option>
                        {teachers.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.fullName}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignHead(dept.id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-green-700"
                      >
                        <UserPlus size={14} /> Assign Head
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}