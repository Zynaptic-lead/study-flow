'use client';
import { useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToasterContextType {
  toast: (message: string, type: ToastType) => void;
}

const ToasterContext = createContext<ToasterContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToasterContext);

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const styles: Record<ToastType, { bg: string; border: string; text: string; icon: ReactNode }> = {
    success: {
      bg: 'bg-white',
      border: 'border-l-4 border-green-500',
      text: 'text-gray-800',
      icon: <CheckCircle className="text-green-500" size={20} />,
    },
    error: {
      bg: 'bg-white',
      border: 'border-l-4 border-red-500',
      text: 'text-gray-800',
      icon: <AlertCircle className="text-red-500" size={20} />,
    },
    warning: {
      bg: 'bg-white',
      border: 'border-l-4 border-amber-500',
      text: 'text-gray-800',
      icon: <AlertTriangle className="text-amber-500" size={20} />,
    },
    info: {
      bg: 'bg-white',
      border: 'border-l-4 border-[#1E40AF]',
      text: 'text-gray-800',
      icon: <Info className="text-[#1E40AF]" size={20} />,
    },
  };

  return (
    <ToasterContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-in-right ${styles[t.type].bg} ${styles[t.type].border} rounded-lg shadow-lg p-4 min-w-[360px] max-w-[420px] flex items-start gap-3`}
          >
            <div className="flex-shrink-0 mt-0.5">{styles[t.type].icon}</div>
            <p className={`text-sm font-medium flex-1 ${styles[t.type].text}`}>{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}