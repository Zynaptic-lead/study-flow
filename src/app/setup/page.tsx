'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toaster';
import api from '@/lib/api';
import {
  GraduationCap,
  Calendar,
  Building2,
  Layers,
  BookOpen,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Plus,
  Trash2,
  LogOut,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Session', icon: Calendar },
  { id: 2, label: 'Departments', icon: Building2 },
  { id: 3, label: 'Levels', icon: Layers },
  { id: 4, label: 'Courses', icon: BookOpen },
];

export default function SetupPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['SCHOOL_ADMIN']}>
        <SetupWizard />
      </RoleGuard>
    </AuthGuard>
  );
}

function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const markComplete = (step: number) => {
    setCompleted((prev) => [...new Set([...prev, step])]);
  };

  const handleFinish = () => {
    toast('Setup completed! Redirecting to dashboard...', 'success');
    setTimeout(() => router.push('/dashboard/school'), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sm">StudyFlow</h1>
              <p className="text-xs text-gray-400">Setup Wizard</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Progress
          </p>
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = completed.includes(step.id);

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full ${
                  isActive
                    ? 'bg-[#1E40AF] text-white shadow-md'
                    : isDone
                    ? 'text-green-400 hover:bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20'
                      : isDone
                      ? 'bg-green-500/20'
                      : 'bg-gray-700'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <StepIcon size={16} />
                  )}
                </div>
                <span>{step.label}</span>
                {isDone && <CheckCircle size={14} className="ml-auto text-green-400" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center text-xs font-bold text-white">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors duration-200 w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Step Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-700 mb-4">
              <Sparkles size={14} />
              Step {currentStep} of {STEPS.length}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {STEPS[currentStep - 1].label}
            </h2>
            <p className="text-gray-500 mt-1">
              {currentStep === 1 && 'Create your first academic session'}
              {currentStep === 2 && 'Add departments in your school'}
              {currentStep === 3 && 'Define levels for your institution'}
              {currentStep === 4 && 'Add courses (optional — you can do this later)'}
            </p>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 animate-slide-up">
            {currentStep === 1 && <SessionStep onComplete={() => markComplete(1)} />}
            {currentStep === 2 && <DepartmentStep onComplete={() => markComplete(2)} />}
            {currentStep === 3 && <LevelStep onComplete={() => markComplete(3)} />}
            {currentStep === 4 && <CourseStep onComplete={() => markComplete(4)} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-40"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1E40AF] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] hover:shadow-lg transition-all duration-200"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200"
              >
                Finish Setup
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleFinish}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              Skip setup, go to dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ==================== STEP 1: SESSION ====================
function SessionStep({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/sessions', { name, startDate, endDate });
      toast('Session created!', 'success');
      setCreated(true);
      onComplete();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to create session', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="text-center py-8 animate-scale-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Session Created!</h3>
        <p className="text-gray-500 text-sm">Click Next to continue.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="2025/2026"
          required
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1E40AF] text-white rounded-xl py-3 font-medium text-sm hover:bg-[#1D4ED8] transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Session'}
      </button>
    </form>
  );
}

// ==================== STEP 2: DEPARTMENTS ====================
function DepartmentStep({ onComplete }: { onComplete: () => void }) {
  const [departments, setDepartments] = useState<{ name: string; code: string }[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addDepartment = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.post('/departments', { name: name.trim(), code: code.trim() || undefined });
      setDepartments((prev) => [...prev, { name: name.trim(), code: code.trim() }]);
      setName('');
      setCode('');
      toast('Department added!', 'success');
      onComplete();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to add department', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Computer Science"
          className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
        />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CSC"
          className="w-24 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
        />
        <button
          onClick={addDepartment}
          disabled={loading || !name.trim()}
          className="px-4 py-3 bg-[#1E40AF] text-white rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 disabled:opacity-50"
        >
          <Plus size={20} />
        </button>
      </div>

      {departments.length > 0 && (
        <div className="space-y-2">
          {departments.map((dept, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 animate-slide-up">
              <div>
                <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                {dept.code && <span className="text-xs text-gray-500 ml-2">({dept.code})</span>}
              </div>
              <button
                onClick={() => setDepartments((prev) => prev.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {departments.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">No departments added yet.</p>
      )}
    </div>
  );
}

// ==================== STEP 3: LEVELS ====================
function LevelStep({ onComplete }: { onComplete: () => void }) {
  const [levels, setLevels] = useState<{ name: string; code: string; sortOrder: number }[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addLevel = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const sortOrder = levels.length + 1;
      await api.post('/levels', { name: name.trim(), code: code.trim() || undefined, sortOrder });
      setLevels((prev) => [...prev, { name: name.trim(), code: code.trim(), sortOrder }]);
      setName('');
      setCode('');
      toast('Level added!', 'success');
      onComplete();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to add level', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="100 Level"
          className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
        />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="100L"
          className="w-24 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
        />
        <button
          onClick={addLevel}
          disabled={loading || !name.trim()}
          className="px-4 py-3 bg-[#1E40AF] text-white rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 disabled:opacity-50"
        >
          <Plus size={20} />
        </button>
      </div>

      {levels.length > 0 && (
        <div className="space-y-2">
          {levels.map((level, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 animate-slide-up">
              <div>
                <span className="text-sm font-medium text-gray-900">{level.name}</span>
                {level.code && <span className="text-xs text-gray-500 ml-2">({level.code})</span>}
              </div>
              <button
                onClick={() => setLevels((prev) => prev.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {levels.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">No levels added yet.</p>
      )}
    </div>
  );
}

// ==================== STEP 4: COURSES ====================
function CourseStep({ onComplete }: { onComplete: () => void }) {
  const [courses, setCourses] = useState<{ title: string; code: string }[]>([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addCourse = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.post('/courses', { title: title.trim(), code: code.trim() || undefined, units: 2 });
      setCourses((prev) => [...prev, { title: title.trim(), code: code.trim() }]);
      setTitle('');
      setCode('');
      toast('Course added!', 'success');
      onComplete();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to add course', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Introduction to Programming"
          className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
        />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CSC 101"
          className="w-28 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E40AF] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200"
        />
        <button
          onClick={addCourse}
          disabled={loading || !title.trim()}
          className="px-4 py-3 bg-[#1E40AF] text-white rounded-xl hover:bg-[#1D4ED8] transition-all duration-200 disabled:opacity-50"
        >
          <Plus size={20} />
        </button>
      </div>

      {courses.length > 0 && (
        <div className="space-y-2">
          {courses.map((course, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 animate-slide-up">
              <div>
                <span className="text-sm font-medium text-gray-900">{course.title}</span>
                {course.code && <span className="text-xs text-gray-500 ml-2">({course.code})</span>}
              </div>
              <button
                onClick={() => setCourses((prev) => prev.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {courses.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">No courses added yet. You can skip this.</p>
      )}
    </div>
  );
}