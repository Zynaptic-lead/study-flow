'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { getStatusBadge, getRoleBadge } from '@/lib/utils';
import { Users, BookOpen, Clock, Building2, Layers, Calendar, LayoutDashboard, RefreshCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SCHOOL_ADMIN']}>
        <UsersContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function UsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try { const { data } = await api.get('/users'); setUsers(data.users || []); } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/school' },
    { label: 'Pending Approvals', icon: Clock, href: '/dashboard/school/pending' },
    { label: 'Users', icon: Users, href: '/dashboard/school/users', active: true },
    { label: 'Sessions', icon: Calendar, href: '/dashboard/school/sessions' },
    { label: 'Departments', icon: Building2, href: '/dashboard/school/departments' },
    { label: 'Levels', icon: Layers, href: '/dashboard/school/levels' },
    { label: 'Courses', icon: BookOpen, href: '/dashboard/school/courses' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Users" subtitle={`${users.length} total users`} role="School Admin">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
        </div>
        <button onClick={fetchUsers} className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-3 py-2"><RefreshCw size={16} /> Refresh</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getStatusBadge(u.accountStatus)}`}>{u.accountStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}