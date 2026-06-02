'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import { BookOpen, Clock, FileText, Bell, LayoutDashboard, ArrowLeft, CheckCircle, Download } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function SubmissionsPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['TEACHER', 'SCHOOL_ADMIN']}>
        <SubmissionsContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function SubmissionsContent() {
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get(`/assignments/${id}`);
      setAssignment(data.assignment);
      setSubmissions(data.assignment?.submissions || []);
    } catch (err) {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGrade = async (submissionId: string) => {
    const score = parseFloat(scores[submissionId]);
    if (isNaN(score)) { toast('Enter a valid score', 'error'); return; }
    setGrading(submissionId);
    try {
      await api.patch(`/assignments/submissions/${submissionId}/grade`, {
        score,
        feedback: feedback[submissionId] || undefined,
      });
      toast('Graded!', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to grade', 'error');
    } finally { setGrading(null); }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/teacher' },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/teacher/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/teacher/assignments' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title={assignment?.title || 'Submissions'} role="Teacher">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <FileText className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{sub.student?.fullName}</h4>
                  <p className="text-sm text-gray-500">{sub.student?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                  {sub.content && <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg">{sub.content}</p>}
                  {sub.fileUrl && (
                    <a href={sub.fileUrl} target="_blank" className="text-blue-600 text-sm flex items-center gap-1 mt-2 hover:underline">
                      <Download size={14} /> View File
                    </a>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  sub.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{sub.status}</span>
              </div>

              {sub.status === 'GRADED' ? (
                <div className="bg-green-50 rounded-lg p-3 text-sm">
                  <p><strong>Score:</strong> {sub.score}/{assignment?.totalPoints}</p>
                  {sub.feedback && <p className="mt-1"><strong>Feedback:</strong> {sub.feedback}</p>}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <input type="number" placeholder="Score" value={scores[sub.id] || ''}
                    onChange={(e) => setScores({ ...scores, [sub.id]: e.target.value })}
                    className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <input type="text" placeholder="Feedback (optional)" value={feedback[sub.id] || ''}
                    onChange={(e) => setFeedback({ ...feedback, [sub.id]: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  <button onClick={() => handleGrade(sub.id)} disabled={grading === sub.id}
                    className="bg-[#1E40AF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50">
                    {grading === sub.id ? 'Grading...' : 'Submit Grade'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}