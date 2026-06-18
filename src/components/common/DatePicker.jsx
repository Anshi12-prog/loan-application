import { forwardRef, useId } from 'react';

export function yearsAgo(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().split('T')[0];
}

export function calculateAge(dobString) {
  if (!dobString) return null;
  const dob   = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

const DatePicker = forwardRef(({
  label,
  required = false,
  error,
  helpText,
  id: propId,
  minAge,
  maxAge,
  value,
  containerClassName = '',
  className = '',
  ...props
}, ref) => {
  const generatedId = useId();
  const id      = propId ?? generatedId;
  const hasError = Boolean(error);

  const maxDate = minAge ? yearsAgo(minAge) : undefined;
  const minDate = maxAge ? yearsAgo(maxAge) : undefined;
  const age     = value ? calculateAge(value) : null;

  return (
    <div className={`field-group ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && (
            <>
              <span className="text-error-500 ml-0.5" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </>
          )}
        </label>
      )}

      <input
        ref={ref}
        id={id}
        type="date"
        value={value ?? ''}
        min={minDate}
        max={maxDate}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={`${id}-error ${id}-help`}
        className={`
          field-input
          ${hasError ? 'field-input-error' : ''}
          ${className}
        `}
        {...props}
      />

      {age !== null && !hasError && (
        <p className="text-xs text-primary-600 font-medium" aria-live="polite">
          Age: {age} years
        </p>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" aria-live="polite" className="field-error">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
      {helpText && !error && (
        <p id={`${id}-help`} className="field-help">{helpText}</p>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';
export default DatePicker;