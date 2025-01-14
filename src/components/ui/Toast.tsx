import React from 'react';
import { createPortal } from 'react-dom';
import { useToasts, TOAST_TYPES, ToastType } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const Toast = ({ id, message, type, onClose }: ToastProps) => {
  const toastType = TOAST_TYPES[type];

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
        toastType.className
      )}
      role="alert"
      aria-label={toastType.ariaLabel}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{toastType.icon}</span>
        <div className="text-sm font-semibold">{message}</div>
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-foreground/50 hover:text-foreground"
        aria-label="Close notification"
      >
        <span className="sr-only">Close</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export const ToastProvider = () => {
  const toasts = useToasts();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => {}} />
      ))}
    </div>,
    document.body
  );
};
