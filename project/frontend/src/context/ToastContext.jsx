import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => removeToast(id), TOAST_DURATION_MS);
  }, [removeToast]);

  const toast = useMemo(() => ({
    success: (message) => addToast('success', message),
    error: (message) => addToast('error', message),
    warning: (message) => addToast('warning', message),
  }), [addToast]);

  const value = useMemo(() => ({ toasts, removeToast, toast }), [toasts, removeToast, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx.toast;
}

export function useToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastContainer must be used within ToastProvider');
  }
  return { toasts: ctx.toasts, removeToast: ctx.removeToast };
}
