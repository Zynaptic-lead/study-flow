'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { BookOpen, FileText, Bell, LayoutDashboard, Brain, ArrowLeft, Users, Bookmark, Download } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function CourseDetailPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['STUDENT']}>
        <CourseDetailContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function CourseDetailContent() {
  const [course, setCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      const [courseRes, materialsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/materials?courseId=${id}`),
      ]);
      setCourse(courseRes.data.course);
      setMaterials(materialsRes.data.materials || []);
    } catch (err) {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/student' },
    { label: 'My Courses', icon: BookOpen, href: '/dashboard/student/courses' },
    { label: 'Assignments', icon: FileText, href: '/dashboard/student/assignments' },
    { label: 'AI Tools', icon: Brain, href: '/dashboard/ai' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title={course?.title || 'Course'} subtitle={course?.code} role="Student">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft size={16} /> Back</button>
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : !course ? (
        <div className="text-center py-16 bg-white rounded-xl border"><p className="text-gray-500">Course not found.</p></div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
            {course.code && <p className="text-blue-600 font-medium text-sm mb-3">{course.code}</p>}
            <p className="text-gray-500 text-sm mb-4">{course.description || 'No description'}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {course.teacher && <span className="flex items-center gap-1"><Users size={14} /> {course.teacher.fullName}</span>}
              {course.department && <span className="flex items-center gap-1"><Bookmark size={14} /> {course.department.name}</span>}
              {course.level && <span className="flex items-center gap-1"><Bookmark size={14} /> {course.level.name}</span>}
              <span>{course.units} Units</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Materials</h3>
            {materials.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No materials uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {materials.map((mat: any) => (
                  <div key={mat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="text-blue-600" size={16} /></div>
                      <div><p className="text-sm font-medium text-gray-900">{mat.title}</p><p className="text-xs text-gray-500">{mat.type} • {mat.uploadedBy?.fullName}</p></div>
                    </div>
                    {mat.fileUrl && <a href={mat.fileUrl} target="_blank" className="text-[#1E40AF] hover:underline text-sm flex items-center gap-1"><Download size={14} /> Download</a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}