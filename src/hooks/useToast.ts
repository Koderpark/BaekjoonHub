/*
useToast.ts

알림 상태 전역 관리 (Zustand)
타입별 토스트 메시지 (success, error, warning, info)
자동 제거 타이머
접근성 지원
*/
import { useCallback } from 'react';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: Math.random().toString(36).substring(2, 9),
          ...toast,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export function useToast() {
  const { addToast, removeToast } = useToastStore();

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);

      addToast({
        id,
        message,
        type,
        duration,
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [addToast, removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => toast(message, 'success', duration),
    [toast]
  );

  const error = useCallback(
    (message: string, duration?: number) => toast(message, 'error', duration),
    [toast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => toast(message, 'warning', duration),
    [toast]
  );

  const info = useCallback(
    (message: string, duration?: number) => toast(message, 'info', duration),
    [toast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
  };
}

// Toast 컴포넌트에서 사용할 수 있는 selector
export const useToasts = () => useToastStore((state) => state.toasts);

// ToastProvider를 렌더링할 때 필요한 타입과 상수들
export const TOAST_LIMIT = 5;
export const TOAST_REMOVE_DELAY = 250;

export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// 접근성을 위한 ARIA 타입 정의
export const TOAST_TYPES = {
  success: {
    icon: '✓',
    className: 'bg-success text-success-foreground',
    ariaLabel: 'Success message',
  },
  error: {
    icon: '✕',
    className: 'bg-destructive text-destructive-foreground',
    ariaLabel: 'Error message',
  },
  warning: {
    icon: '⚠',
    className: 'bg-warning text-warning-foreground',
    ariaLabel: 'Warning message',
  },
  info: {
    icon: 'ℹ',
    className: 'bg-primary text-primary-foreground',
    ariaLabel: 'Information message',
  },
} as const;
