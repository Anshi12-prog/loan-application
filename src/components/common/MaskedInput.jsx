import { forwardRef, useId, useState, useCallback } from 'react';

function maskPAN(value) {
  if (!value || value.length <= 4) return value;
  return '•'.repeat(value.length - 4) + value.slice(-4);
}

function maskAadhaar(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return '•••• •••• ' + digits.slice(-4);
}

function applyMask(value, maskType) {
  if (!value) return '';
  if (maskType === 'pan') return maskPAN(value);
  if (maskType === 'aadhaar') return maskAadhaar(value);
  const s = String(value);
  return s.length <= 4 ? s : '•'.repeat(s.length - 4) + s.slice(-4);
}

const MaskedInput = forwardRef(({
  label,
  required = false,
  error,
  helpText,
  id: propId,
  maskType = 'generic',
  value = '',
  onChange,
  onBlur,
  verificationStatus = 'idle',
  containerClassName = '',
  className = '',
  ...props
}, ref) => {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const hasError = Boolean(error) || verificationStatus === 'failed';
  const isVerified  = verificationStatus === 'verified';
  const isVerifying = verificationStatus === 'verifying';

  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur  = useCallback((e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const handleChange = useCallback((e) => {
    let val = e.target.value;
    if (maskType === 'aadhaar') val = val.replace(/\D/g, '').slice(0, 12);
    if (maskType === 'pan')     val = val.toUpperCase().slice(0, 10);
    const synthetic = { ...e, target: { ...e.target, value: val } };
    if (onChange) onChange(synthetic);
  }, [onChange, maskType]);

  const displayValue = isFocused
    ? (value ?? '')
    : applyMask(value ?? '', maskType);

  const maxLen = maskType === 'pan' ? 10 : maskType === 'aadhaar' ? 12 : undefined;

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
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode={maskType === 'aadhaar' ? 'numeric' : 'text'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLen}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={`${id}-error ${id}-help`}
          className={`
            field-input pr-10 font-mono tracking-wider
            ${hasError ? 'field-input-error' : ''}
            ${isVerified ? 'field-input-success' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Status icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
          {isVerifying && (
            <span className="verify-spinner block" />
          )}
          {isVerified && !isVerifying && (
            <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {verificationStatus === 'failed' && !isVerifying && (
            <svg className="w-5 h-5 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>

      {isVerified && (
        <p className="flex items-center gap-1 text-xs text-success-500 font-medium" aria-live="polite">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Verified successfully
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

MaskedInput.displayName = 'MaskedInput';
export default MaskedInput;