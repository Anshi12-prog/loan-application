import { forwardRef, useId } from 'react';

const Checkbox = forwardRef(({
  label,
  description,
  error,
  helpText,
  id: propId,
  required = false,
  className = '',
  labelClassName = '',
  ...props
}, ref) => {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const hasError = Boolean(error);

  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={`${id}-error ${id}-help`}
            aria-required={required}
            className={`
              w-4 h-4 rounded cursor-pointer accent-primary-700
              border-2 transition-colors duration-150
              ${hasError ? 'border-error-500' : 'border-neutral-300'}
              focus-visible:ring-2 focus-visible:ring-primary-700
              focus-visible:ring-offset-1
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            {...props}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label
            htmlFor={id}
            className={`text-sm text-neutral-700 cursor-pointer leading-snug ${labelClassName}`}
          >
            {label}
            {required && (
              <>
                <span className="text-error-500 ml-0.5" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </>
            )}
          </label>
          {description && (
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" aria-live="polite" className="field-error mt-1.5 ml-7">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
      {helpText && !error && (
        <p id={`${id}-help`} className="field-help mt-1 ml-7">{helpText}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;