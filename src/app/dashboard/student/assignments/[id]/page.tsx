'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import { BookOpen, FileText, Bell, LayoutDashboard, Brain, ArrowLeft, Clock, Upload, CheckCircle, Send } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function SubmitAssignmentPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['STUDENT']}>
        <SubmitContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function SubmitContent() {
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();

  const fetchAssignment = useCallback(async () => {
    try {
      const { data } = await api.get(`/assignments/${id}`);
      setAssignment(data.assignment);
      const mySub = data.assignment.submissions?.find((s: any) => s.studentId);
      if (mySub) { setSubmission(mySub); setContent(mySub.content || ''); }
    } catch (err) {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

  const handleTextSubmit = async () => {
    if (!content.trim()) { toast('Enter your answer', 'error'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/assignments/${id}/submit`, { content });
      setSubmission(data.submission);
      toast('Submitted successfully!', 'success');
    } catch (err: any) { toast(err.response?.data?.message || 'Failed to submit', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleFileSubmit = async () => {
    if (!file) { toast('Select a file', 'error'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/assignments/${id}/submit/file`, formData);
      setSubmission(data.submission);
      toast('File uploaded!', 'success');
    } catch (err: any) { toast(err.response?.data?.message || 'Failed to upload', 'error'); }
    finally { setSubmitting(false); }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/student' },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/student/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/student/assignments' },
    { label: 'AI Tools', icon: Brain, href: '/dashboard/ai' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title={assignment?.title || 'Assignment'} subtitle={assignment?.course?.title} role="Student">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft size={16} /> Back</button>
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : !assignment ? (
        <div className="text-center py-16 bg-white rounded-xl border"><p className="text-gray-500">Assignment not found.</p></div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{assignment.description || 'No description'}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 text-amber-600"><Clock size={14} /> Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}</span>
              <span className="text-gray-500">Points: {assignment.totalPoints}</span>
            </div>
          </div>

          {submission && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2"><CheckCircle className="text-green-600" size={18} /><span className="font-medium text-green-800">Submitted</span>
                {submission.score !== null && <span className="ml-auto font-bold text-green-700">Score: {submission.score}/{assignment.totalPoints}</span>}
              </div>
              {submission.feedback && <p className="text-sm text-green-700 mt-1">Feedback: {submission.feedback}</p>}
              {submission.fileUrl && <a href={submission.fileUrl} target="_blank" className="text-sm text-blue-600 underline mt-1 block">View submitted file</a>}
            </div>
          )}

          {!submission?.score && (
            <>
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                <h3 className="font-semibold text-gray-900 mb-4">Submit Your Answer</h3>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
                  placeholder="Type your answer here..." className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 resize-none" />
                <button onClick={handleTextSubmit} disabled={submitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
                  <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                <h3 className="font-semibold text-gray-900 mb-4">Or Upload a File</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1E40AF] transition-colors duration-200">
                  <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                  <p className="text-sm text-gray-500 mb-3">Drag & drop or click to browse</p>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#1E40AF] file:text-white hover:file:bg-[#1D4ED8] cursor-pointer" />
                </div>
                {file && (
                  <button onClick={handleFileSubmit} disabled={submitting}
                    className="mt-4 flex items-center gap-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
                    <Upload size={16} /> {submitting ? 'Uploading...' : `Upload ${file.name}`}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}