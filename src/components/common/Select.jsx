import { forwardRef, useId } from 'react';

const Select = forwardRef(({
  label,
  required = false,
  error,
  helpText,
  options = [],
  placeholder = 'Select an option',
  id: propId,
  containerClassName = '',
  className = '',
  ...props
}, ref) => {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const hasError = Boolean(error);

  const normalized = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

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

      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={`${id}-error ${id}-help`}
          className={`
            field-input appearance-none pr-9 cursor-pointer
            ${hasError ? 'field-input-error' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {normalized.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

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

Select.displayName = 'Select';
export default Select;