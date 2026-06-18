import { forwardRef, useId, useState, useCallback } from 'react';
import { formatIndianNumber, getAmountLabel } from '../../utils/formatters';

function parseRaw(str) {
  const raw = String(str).replace(/[₹,\s]/g, '');
  const n = Number(raw);
  return Number.isNaN(n) ? '' : n;
}

const CurrencyInput = forwardRef(({
  label,
  required = false,
  error,
  helpText,
  id: propId,
  onChange,
  onBlur,
  value,
  min,
  max,
  containerClassName = '',
  className = '',
  ...props
}, ref) => {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const hasError = Boolean(error);
  const [isFocused, setIsFocused] = useState(false);

  const numericValue = value !== '' && value !== undefined && value !== null
    ? Number(value)
    : '';

  const displayValue = isFocused
    ? (numericValue !== '' ? String(numericValue) : '')
    : (numericValue !== '' ? formatIndianNumber(numericValue) : '');

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const handleChange = useCallback((e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw === '' ? '' : Number(raw);
    const synthetic = { ...e, target: { ...e.target, value: num } };
    if (onChange) onChange(synthetic);
  }, [onChange]);

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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500 pointer-events-none" aria-hidden="true">
          ₹
        </div>
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={`${id}-error ${id}-help`}
          className={`
            field-input pl-8
            ${hasError ? 'field-input-error' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {numericValue !== '' && numericValue > 0 && !hasError && (
        <p className="text-xs text-primary-600 font-medium" aria-live="polite">
          {getAmountLabel(numericValue)}
          {min && numericValue < min && (
            <span className="text-warning-600 ml-1">
              (Min: ₹{formatIndianNumber(min)})
            </span>
          )}
          {max && numericValue > max && (
            <span className="text-error-600 ml-1">
              (Max: ₹{formatIndianNumber(max)})
            </span>
          )}
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

CurrencyInput.displayName = 'CurrencyInput';
export default CurrencyInput;