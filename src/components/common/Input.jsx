import { forwardRef, useId } from 'react';

function Label({ children, htmlFor, required = false, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`field-label ${className}`}>
      {children}
      {required && (
        <>
          <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </>
      )}
    </label>
  );
}

const Field = forwardRef(({
  id, type = 'text', error, success = false,
  prefix, suffix, className = '', ...props
}, ref) => {
  const hasError = Boolean(error);
  return (
    <div className="relative">
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none" aria-hidden="true">
          {prefix}
        </div>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={id ? `${id}-error ${id}-help` : undefined}
        className={`field-input ${hasError ? 'field-input-error' : ''} ${success && !hasError ? 'field-input-success' : ''} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-10' : ''} ${className}`}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none" aria-hidden="true">
          {suffix}
        </div>
      )}
    </div>
  );
});
Field.displayName = 'Input.Field';

function ErrorMsg({ children, id, className = '' }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" aria-live="polite" className={`field-error ${className}`}>
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

function HelpText({ children, id, className = '' }) {
  if (!children) return null;
  return <p id={id} className={`field-help ${className}`}>{children}</p>;
}

function Input({ children, className = '' }) {
  return <div className={`field-group ${className}`}>{children}</div>;
}

Input.Label    = Label;
Input.Field    = Field;
Input.Error    = ErrorMsg;
Input.HelpText = HelpText;

export default Input;

export const FormField = forwardRef(({
  label, required = false, error, helpText,
  id: propId, type = 'text', containerClassName = '',
  className = '', prefix, suffix, success, ...fieldProps
}, ref) => {
  const generatedId = useId();
  const id = propId ?? generatedId;
  return (
    <Input className={containerClassName}>
      {label && <Input.Label htmlFor={id} required={required}>{label}</Input.Label>}
      <Input.Field ref={ref} id={id} type={type} error={error} success={success} prefix={prefix} suffix={suffix} className={className} {...fieldProps} />
      <Input.Error id={`${id}-error`}>{error}</Input.Error>
      <Input.HelpText id={`${id}-help`}>{helpText}</Input.HelpText>
    </Input>
  );
});
FormField.displayName = 'FormField';
