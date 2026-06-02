'use client';
import { useState } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toaster';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { BookOpen, FileText, Bell, LayoutDashboard, Brain, Sparkles, Send, Zap, MessageCircle } from 'lucide-react';

export default function AIPage() {
  return (
    <AuthGuard>
      <AIContent />
    </AuthGuard>
  );
}

function AIContent() {
  const [tab, setTab] = useState<'summarize' | 'quiz' | 'assist'>('summarize');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const role = user?.role || 'STUDENT';

  const handleSummarize = async () => {
    if (!content || content.length < 50) { toast('Enter at least 50 characters', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/summarize', { content });
      setResult(data);
    } catch (err: any) { toast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleQuiz = async () => {
    if (!content || content.length < 50) { toast('Enter at least 50 characters', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/quiz', { content, numberOfQuestions: 5 });
      setResult(data);
    } catch (err: any) { toast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleAssist = async () => {
    if (!question.trim()) { toast('Enter a question', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/assist', { question, context: context || undefined });
      setResult(data);
    } catch (err: any) { toast(err.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: role === 'STUDENT' ? '/dashboard/student' : '/dashboard/teacher' },
    { label: 'My Courses', icon: BookOpen, href: role === 'STUDENT' ? '/dashboard/student/courses' : '/dashboard/teacher/courses' },
    { label: 'Assignments', icon: FileText, href: role === 'STUDENT' ? '/dashboard/student/assignments' : '/dashboard/teacher/assignments' },
    { label: 'AI Tools', icon: Brain, href: '/dashboard/ai', active: true },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="AI Tools" subtitle="Summarize notes, generate quizzes, get study help" role={role}>
      <div className="max-w-3xl mx-auto">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 mb-6">
          {[
            { id: 'summarize', label: 'Summarize', icon: Sparkles },
            { id: 'quiz', label: 'Quiz', icon: Zap },
            { id: 'assist', label: 'Assist', icon: MessageCircle },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setTab(t.id as any); setResult(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t.id ? 'bg-[#1E40AF] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Summarize Tab */}
        {tab === 'summarize' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <h3 className="font-semibold text-gray-900 mb-4">Paste your notes below</h3>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
              placeholder="Paste your study notes here (minimum 50 characters)..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 resize-none" />
            <button onClick={handleSummarize} disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Summarizing...' : 'Summarize Notes'}
            </button>
          </div>
        )}

        {/* Quiz Tab */}
        {tab === 'quiz' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <h3 className="font-semibold text-gray-900 mb-4">Paste content to generate a quiz</h3>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
              placeholder="Paste content here (minimum 50 characters)..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 resize-none" />
            <button onClick={handleQuiz} disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={18} />}
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        )}

        {/* Assist Tab */}
        {tab === 'assist' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <h3 className="font-semibold text-gray-900 mb-4">Ask a question</h3>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Explain mitosis in simple terms"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50" />
            <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={3}
              placeholder="Optional: Add context or notes related to your question..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-50 resize-none" />
            <button onClick={handleAssist} disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
              {loading ? 'Asking...' : 'Ask AI'}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 mt-6 animate-slide-up">
            {result.summary && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Summary</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">{result.summary}</p>
                {result.keyPoints?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {result.keyPoints.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-[#1E40AF] font-bold mt-0.5">•</span> {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.flashcards?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Flashcards</h3>
                    <div className="space-y-3">
                      {result.flashcards.map((fc: any, i: number) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm font-medium text-gray-900">Q: {fc.question}</p>
                          <p className="text-sm text-gray-500 mt-1">A: {fc.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {result.questions && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Quiz Questions</h3>
                <div className="space-y-4">
                  {result.questions.map((q: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options?.map((opt: string, j: number) => (
                          <span key={j} className={`text-xs px-3 py-1.5 rounded-lg ${opt.startsWith(q.correctAnswer) ? 'bg-green-100 text-green-700 font-medium' : 'bg-white text-gray-600'}`}>{opt}</span>
                        ))}
                      </div>
                      {q.explanation && <p className="text-xs text-gray-500 mt-2">{q.explanation}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.answer && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Answer</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{result.answer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}