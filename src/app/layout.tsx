import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { ToasterProvider } from '@/components/ui/Toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudyFlow — Smart Learning, Organized',
  description: 'AI-Powered Multi-School Learning Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          <ToasterProvider>
            {children}
          </ToasterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}