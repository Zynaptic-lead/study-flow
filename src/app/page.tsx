'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  GraduationCap,
  ChevronDown,
  Building2,
  Sparkles,
  Users,
  Zap,
  UserPlus,
  LogIn,
} from 'lucide-react';

interface SchoolItem {
  id: string;
  name: string;
  address?: string;
  logo?: string;
}

export default function LandingPage() {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/schools');
      const filtered = (data.schools || []).filter(
        (s: SchoolItem) => s.name !== 'StudyFlow Admin'
      );
      setSchools(filtered);
    } catch (err: any) {
      setError('Failed to load schools.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSchoolName = schools.find((s) => s.id === selectedSchool)?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

      <header className="relative z-10 w-full py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900">StudyFlow</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Hero */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-700 mb-6">
              <Sparkles size={14} className="text-blue-500" />
              AI-Powered Learning Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
              Smart Learning,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]">
                Organized
              </span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
              The all-in-one platform for universities and polytechnics. Manage courses, assignments, and students — powered by AI.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Building2 className="text-[#1E40AF]" size={18} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Multi-School</h3>
              <p className="text-xs text-gray-500 mt-1">Multiple institutions on one platform</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="text-green-600" size={18} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">AI-Powered</h3>
              <p className="text-xs text-gray-500 mt-1">Summarize notes, generate quizzes</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="text-purple-600" size={18} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Collaborative</h3>
              <p className="text-xs text-gray-500 mt-1">Teachers, students, and admins together</p>
            </div>
          </div>

          {/* School Selection Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Select Your School</h2>
              <p className="text-sm text-gray-500 mt-1">Choose your institution to continue</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="space-y-3">
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse w-2/3 mx-auto" />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-3">{error}</p>
                <button onClick={fetchSchools} className="text-sm text-[#1E40AF] hover:text-[#1D4ED8] font-medium transition-colors duration-200">
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && schools.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-4">No schools available yet.</p>
                <a href="/register/admin" className="inline-flex items-center gap-2 bg-[#1E40AF] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-all duration-200 shadow-md hover:shadow-lg">
                  <Building2 size={16} />
                  Register the First School
                </a>
              </div>
            )}

            {/* School List */}
            {!loading && !error && schools.length > 0 && (
              <>
                {/* Custom Dropdown */}
                <div className="relative mb-6">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 hover:border-[#1E40AF] focus:outline-none focus:border-[#1E40AF] focus:ring-4 focus:ring-blue-100"
                  >
                    <span className={selectedSchool ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {selectedSchoolName || 'Choose a school...'}
                    </span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto animate-slide-down">
                      {schools.map((school) => (
                        <button
                          key={school.id}
                          onClick={() => { setSelectedSchool(school.id); setDropdownOpen(false); }}
                          className={`w-full text-left px-5 py-3 text-sm transition-colors duration-150 hover:bg-blue-50 first:rounded-t-xl last:rounded-b-xl ${selectedSchool === school.id ? 'bg-blue-50 text-[#1E40AF] font-medium' : 'text-gray-700'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 size={14} className="text-gray-500" />
                            </div>
                            <div>
                              <p>{school.name}</p>
                              {school.address && <p className="text-xs text-gray-400">{school.address}</p>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Options — Shows only after school is selected */}
                {selectedSchool && (
                  <div className="space-y-3 animate-slide-up mb-5">
                    <p className="text-sm font-medium text-gray-500 text-center">Continue as...</p>

                    {/* Login */}
                    <button
                      onClick={() => router.push(`/login?schoolId=${selectedSchool}`)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <LogIn size={18} />
                      Login
                    </button>

                    <div className="flex gap-3">
                      {/* Register as Student */}
                      <button
                        onClick={() => router.push(`/register/student?schoolId=${selectedSchool}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-blue-50 border border-blue-200 text-[#1E40AF] hover:bg-blue-100 hover:shadow-md transition-all duration-200"
                      >
                        <UserPlus size={16} />
                        Register as Student
                      </button>

                      {/* Register as Teacher */}
                      <button
                        onClick={() => router.push(`/register/teacher?schoolId=${selectedSchool}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:shadow-md transition-all duration-200"
                      >
                        <Users size={16} />
                        Register as Teacher
                      </button>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Create New School */}
                <a href="/register/admin"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold border-2 border-[#1E40AF] text-[#1E40AF] hover:bg-blue-50 transition-all duration-300">
                  <Building2 size={16} />
                  Create a New School
                </a>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 StudyFlow. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}