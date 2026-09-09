import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import ToastStack from '../components/ToastStack';

const ToastContext = createContext(null);

const VISIBLE_FOR_MS = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, tone = 'error') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, tone }]);
      setTimeout(() => dismiss(id), VISIBLE_FOR_MS);
      return id;
    },
    [dismiss]
  );

  // showToast is stable, so consumers can safely depend on it.
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
