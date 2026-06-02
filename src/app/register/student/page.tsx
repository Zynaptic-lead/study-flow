'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import {
  GraduationCap,
  ArrowLeft,
  User,
  Mail,
  Lock,
  School,
  Building2,
  Layers,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Suspense } from 'react';

function StudentRegisterForm() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId');
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    departmentId: '',
    levelId: '',
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (schoolId) fetchSchoolData();
    else setPageLoading(false);
  }, [schoolId]);

  const fetchSchoolData = async () => {
    try {
      const [deptRes, levelRes] = await Promise.all([
        api.get(`/departments/public?schoolId=${schoolId}`),
        api.get(`/levels/public?schoolId=${schoolId}`),
      ]);
      setDepartments(deptRes.data.departments || []);
      setLevels(levelRes.data.levels || []);

      // Get school name
      const schoolRes = await api.get('/schools');
      const school = (schoolRes.data.schools || []).find((s: any) => s.id === schoolId);
      if (school) setSchoolName(school.name);
    } catch (err) {
      // Silently fail
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register/student', {
        ...form,
        schoolId,
        departmentId: form.departmentId || undefined,
        levelId: form.levelId || undefined,
      });
      setSuccess(true);
      toast('Registration submitted! Waiting for admin approval.', 'success');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      toast(message, 'error');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
            <p className="text-gray-500 mb-6">
              Your account has been submitted for review. Your school admin will approve it shortly.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white rounded-xl py-3 font-semibold text-sm hover:shadow-lg transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <a href={schoolId ? `/?schoolId=${schoolId}` : '/'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={16} /> Back
        </a>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register as Student</h1>
          <p className="text-gray-500 mt-1">{schoolName || 'Join your school'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 animate-slide-up">
          {pageLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-11 bg-gray-100 rounded-xl" />
              <div className="h-11 bg-gray-100 rounded-xl" />
              <div className="h-11 bg-gray-100 rounded-xl" />
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-5 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-100 transition-all duration-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="student@school.edu.ng" required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-100 transition-all duration-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-100 transition-all duration-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select name="departmentId" value={form.departmentId} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-100 transition-all duration-200 appearance-none">
                      <option value="">Select department (optional)</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select name="levelId" value={form.levelId} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-100 transition-all duration-200 appearance-none">
                      <option value="">Select level (optional)</option>
                      {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white rounded-xl py-3.5 font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Register'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Already have an account? <a href="/login" className="text-[#1E40AF] font-medium">Sign in</a></p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-blue-200 border-t-[#1E40AF] rounded-full animate-spin" /></div>}>
      <StudentRegisterForm />
    </Suspense>
  );
}