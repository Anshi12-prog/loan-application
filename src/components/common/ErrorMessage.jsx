const VARIANTS = {
  error:   { container: 'bg-error-50 border-error-500/20 text-error-700',   role: 'alert',  icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' },
  warning: { container: 'bg-warning-50 border-warning-500/20 text-warning-700', role: 'status', icon: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' },
  info:    { container: 'bg-primary-50 border-primary-700/20 text-primary-700',  role: 'status', icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' },
  success: { container: 'bg-success-50 border-success-500/20 text-success-700', role: 'status', icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' },
};

export default function ErrorMessage({
  children,
  variant = 'error',
  id,
  className = '',
  dismissable = false,
  onDismiss,
}) {
  if (!children) return null;
  const cfg = VARIANTS[variant] ?? VARIANTS.error;

  return (
    <div
      id={id}
      role={cfg.role}
      aria-live="polite"
      className={`
        flex items-start gap-2.5 p-3 rounded-lg border text-sm
        ${cfg.container} ${className}
      `}
    >
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d={cfg.icon} clipRule="evenodd" />
      </svg>
      <div className="flex-1 min-w-0">
        {typeof children === 'string' ? <p>{children}</p> : children}
      </div>
      {dismissable && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-current"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}