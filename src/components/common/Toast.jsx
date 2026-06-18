import { useEffect, useState } from 'react';

export function Toast({ message, variant = 'success', duration = 2000, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 200);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);

  const bg = {
    success: 'bg-success-500',
    error:   'bg-error-500',
    warning: 'bg-warning-500',
    info:    'bg-primary-700',
  }[variant] ?? 'bg-success-500';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg
        text-sm font-medium text-white
        motion-safe:transition-all motion-safe:duration-200
        ${bg}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {message}
    </div>
  );
}

export function ToastContainer({ toasts = [], onRemove }) {
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast
            message={t.message}
            variant={t.variant}
            duration={t.duration ?? 2000}
            onDismiss={() => onRemove(t.id)}
          />
        </div>
      ))}
    </div>
  );
}