'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { BookOpen, FileText, Bell, LayoutDashboard, Brain, CheckCheck, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const role = user?.role || 'STUDENT';

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast('All marked as read', 'success');
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: role === 'STUDENT' ? '/dashboard/student' : '/dashboard/teacher' },
    { label: 'My Courses', icon: BookOpen, href: role === 'STUDENT' ? '/dashboard/student/courses' : '/dashboard/teacher/courses' },
    { label: 'Assignments', icon: FileText, href: role === 'STUDENT' ? '/dashboard/student/assignments' : '/dashboard/teacher/assignments' },
    { label: 'AI Tools', icon: Brain, href: '/dashboard/ai' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications', active: true, badge: unreadCount },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'} role={role}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end gap-3 mb-4">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1 text-sm text-[#1E40AF] font-medium hover:underline">
              <CheckCheck size={16} /> Mark all as read
            </button>
          )}
          <button onClick={fetchNotifications} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <Bell className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div key={n.id} onClick={() => !n.isRead && markAsRead(n.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  !n.isRead ? 'border-l-4 border-l-[#1E40AF] bg-blue-50/50' : 'border-gray-200'
                }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-[#1E40AF] rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}