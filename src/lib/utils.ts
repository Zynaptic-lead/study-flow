export function formatDate(date: string) {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export function formatDateTime(date: string) {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 border-green-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    SUSPENDED: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getRoleBadge(role: string) {
  const styles: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    SCHOOL_ADMIN: 'bg-blue-100 text-blue-700',
    TEACHER: 'bg-cyan-100 text-cyan-700',
    STUDENT: 'bg-emerald-100 text-emerald-700',
  };
  return styles[role] || 'bg-gray-100 text-gray-700';
}