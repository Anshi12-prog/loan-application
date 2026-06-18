import { forwardRef, useId } from 'react';

const RadioGroup = forwardRef(({
  label,
  name,
  options = [],
  value,
  onChange,
  error,
  helpText,
  required = false,
  variant = 'default',
  layout = 'vertical',
  id: propId,
  className = '',
}, ref) => {
  const generatedId = useId();
  const groupId = propId ?? generatedId;
  const hasError = Boolean(error);

  return (
    <fieldset className={`border-0 p-0 m-0 ${className}`}>
      {label && (
        <legend className="field-label mb-3">
          {label}
          {required && (
            <>
              <span className="text-error-500 ml-0.5" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </>
          )}
        </legend>
      )}

      <div className={
        variant === 'card'
          ? 'grid grid-cols-1 sm:grid-cols-3 gap-3'
          : layout === 'horizontal'
            ? 'flex flex-wrap gap-4'
            : 'flex flex-col gap-3'
      }>
        {options.map((option) => {
          const optId = `${groupId}-${option.value}`;
          const isSelected = value === option.value;
          const isDisabled = option.disabled ?? false;

          if (variant === 'card') {
            return (
              <label
                key={option.value}
                htmlFor={optId}
                className={`
                  relative flex flex-col gap-2 p-4 rounded-xl border-2
                  cursor-pointer select-none
                  motion-safe:transition-all motion-safe:duration-200
                  ${isSelected
                    ? 'border-primary-700 bg-primary-50 shadow-md'
                    : 'border-neutral-200 bg-white hover:-translate-y-0.5 hover:shadow-md hover:border-primary-300'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${hasError ? 'border-error-300' : ''}
                `}
              >
                <input
                  ref={ref}
                  type="radio"
                  id={optId}
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={onChange}
                  disabled={isDisabled}
                  className="sr-only"
                  data-testid={`${name}-${option.value}`}
                />

                {/* Checkmark badge */}
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-primary-700 rounded-full flex items-center justify-center motion-safe:animate-[scale-in_200ms_ease-out]">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}

                {option.icon && (
                  <span className={`text-2xl ${isSelected ? 'text-primary-700' : 'text-neutral-400'}`} aria-hidden="true">
                    {option.icon}
                  </span>
                )}

                <div>
                  <span className={`text-sm font-semibold block ${isSelected ? 'text-primary-800' : 'text-neutral-800'}`}>
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="text-xs text-neutral-500 mt-0.5 block">
                      {option.description}
                    </span>
                  )}
                  {option.meta && (
                    <span className="text-xs text-primary-600 font-medium mt-1 block">
                      {option.meta}
                    </span>
                  )}
                </div>
              </label>
            );
          }

          return (
            <label
              key={option.value}
              htmlFor={optId}
              className={`flex items-start gap-3 cursor-pointer group ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={ref}
                type="radio"
                id={optId}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={onChange}
                disabled={isDisabled}
                className="mt-0.5 w-4 h-4 accent-primary-700 flex-shrink-0 cursor-pointer"
                data-testid={`${name}-${option.value}`}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-neutral-800">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-xs text-neutral-500 mt-0.5">{option.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={`${groupId}-error`} role="alert" aria-live="polite" className="field-error mt-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
      {helpText && !error && (
        <p id={`${groupId}-help`} className="field-help mt-2">{helpText}</p>
      )}
    </fieldset>
  );
});

RadioGroup.displayName = 'RadioGroup';
export default RadioGroup;