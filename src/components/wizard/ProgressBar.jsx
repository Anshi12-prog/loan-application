import { memo } from 'react';
import useLoanStore from '../../store/loanStore';

const ProgressBar = memo(({ onStepClick }) => {
  const currentStep    = useLoanStore((s) => s.currentStep);
  const getActiveSteps = useLoanStore((s) => s.getActiveSteps);
  const getStepLabel   = useLoanStore((s) => s.getStepLabel);
  const isStepCompleted = useLoanStore((s) => s.isStepCompleted);

  const activeSteps    = getActiveSteps();
  const currentIndex   = activeSteps.indexOf(currentStep);
  const pct            = activeSteps.length > 1
    ? Math.round((currentIndex / (activeSteps.length - 1)) * 100)
    : 0;

  return (
    <nav
      aria-label={`Application progress: Step ${currentIndex + 1} of ${activeSteps.length}, ${getStepLabel(currentStep)}`}
      className="w-full"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
          Progress
        </span>
        <span className="text-xs font-semibold text-neutral-500">
          Step {currentIndex + 1} of {activeSteps.length}
        </span>
      </div>

      {/* Linear track */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${pct}% complete`}
        className="relative h-2 rounded-full overflow-hidden bg-neutral-200/70 mb-5"
      >
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 rounded-full motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, rgba(37,99,235,0.6) 0%, #1F4E79 100%)',
          }}
        />
      </div>

      {/* Step dots — desktop only */}
      <ol
        className="hidden sm:flex items-start justify-between"
        aria-label="Application steps"
      >
        {activeSteps.map((stepNum, idx) => {
          const completed  = isStepCompleted(stepNum);
          const active     = stepNum === currentStep;
          const label      = getStepLabel(stepNum);

          return (
            <li
              key={stepNum}
              className="flex-1 flex flex-col items-center"
              aria-current={active ? 'step' : undefined}
            >
              {/* 44×44 touch target */}
              <div className="relative flex items-center justify-center w-11 h-11">

                {completed ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(stepNum)}
                    aria-label={`${label}, completed. Click to go back.`}
                    className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center
                               cursor-pointer hover:bg-primary-800
                               motion-safe:transition-colors motion-safe:duration-200
                               focus-visible:outline-none focus-visible:ring-2
                               focus-visible:ring-primary-700 focus-visible:ring-offset-2"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <div
                    aria-hidden="true"
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center
                      motion-safe:transition-all motion-safe:duration-300
                      ${active
                        ? 'bg-white border-2 border-primary-700'
                        : 'bg-white border border-neutral-300'
                      }
                    `}
                    style={{
                      transform: active ? 'scale(1.12)' : 'scale(1)',
                      boxShadow: active ? '0 4px 16px rgba(31,78,121,0.2)' : 'none',
                    }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full motion-safe:transition-colors motion-safe:duration-200
                        ${active ? 'bg-primary-600' : 'bg-neutral-300'}`}
                    />
                  </div>
                )}

                {/* Pulse ring for active */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full pointer-events-none pulse-ring"
                  />
                )}
              </div>

              {/* Label */}
              <span
                title={label}
                className={`
                  mt-1 text-xs text-center leading-tight px-0.5 truncate w-full
                  motion-safe:transition-colors motion-safe:duration-200
                  ${active
                    ? 'text-primary-700 font-semibold'
                    : completed
                      ? 'text-neutral-500 font-medium'
                      : 'text-neutral-400'
                  }
                `}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Mobile: just current step name */}
      <p className="sm:hidden text-sm font-medium text-neutral-700 mt-1" aria-hidden="true">
        {getStepLabel(currentStep)}
      </p>
    </nav>
  );
});

ProgressBar.displayName = 'ProgressBar';
export default ProgressBar;
