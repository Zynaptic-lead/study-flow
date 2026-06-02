'use client';
import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import { BookOpen, Clock, FileText, Bell, LayoutDashboard, ArrowLeft, Sparkles, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateAssignmentPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['TEACHER', 'SCHOOL_ADMIN']}>
        <CreateContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function CreateContent() {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', totalPoints: '100', courseId: '' });
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses');
        setCourses(data.courses || []);
      } catch (err) {} finally { setPageLoading(false); }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId) { toast('Select a course', 'error'); return; }
    if (!form.title.trim()) { toast('Enter a title', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/assignments', {
        ...form,
        totalPoints: parseInt(form.totalPoints) || 100,
        dueDate: form.dueDate || undefined,
      });
      toast('Assignment created successfully!', 'success');
      router.push('/dashboard/teacher/assignments');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to create', 'error');
    } finally { setLoading(false); }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/teacher' },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/teacher/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/teacher/assignments', active: true },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Create Assignment" role="Teacher">
      {pageLoading ? (
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Assignments
          </button>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] px-8 py-6">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">New Assignment</h2>
                  <p className="text-blue-100 text-sm">Create an assignment for your students</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course</label>
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 transition-all duration-200">
                  <option value="">Choose a course...</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title} {c.code ? `(${c.code})` : ''}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Mid-Semester Quiz" required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 transition-all duration-200" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Instructions for your students..."
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 transition-all duration-200 resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date (Optional)</label>
                  <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 transition-all duration-200" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Points</label>
                  <input type="number" value={form.totalPoints} onChange={(e) => setForm({ ...form, totalPoints: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 transition-all duration-200" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white rounded-xl py-3.5 font-semibold text-sm hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {loading ? 'Creating...' : 'Publish Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}