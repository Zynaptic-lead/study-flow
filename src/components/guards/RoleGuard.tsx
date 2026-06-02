'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      router.push('/login');
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, router]);

  if (isLoading || !user) return null;

  if (!allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}