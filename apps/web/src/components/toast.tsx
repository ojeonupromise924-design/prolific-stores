'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastState { id: number; message: string; }
let pushToast: ((message: string) => void) | null = null;

export function showToast(message: string) {
  pushToast?.(message);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    pushToast = (message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
    };
    return () => { pushToast = null; };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-100 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="animate-toast-in flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCircle2 size={18} className="animate-toast-check text-forest" />
          {t.message}
        </div>
      ))}
    </div>
  );
}