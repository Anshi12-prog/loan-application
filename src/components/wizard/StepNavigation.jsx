import { memo } from 'react';
import useLoanStore from '../../store/loanStore';

const StepNavigation = memo(({
  onNext,
  onPrev,
  onSaveDraft,
  isNextLoading   = false,
  isNextDisabled  = false,
  isLastStep      = false,
  isFirstStep     = false,
  nextLabel,
}) => {
  const draftSavedAt = useLoanStore((s) => s.draftSavedAt);

  const resolvedLabel = nextLabel
    ?? (isLastStep ? 'Submit Application' : 'Continue');

  const savedTime = draftSavedAt
    ? new Date(draftSavedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden sm:flex items-center justify-between pt-6 mt-6 border-t border-neutral-200">
        <div className="flex items-center gap-3">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrev}
              className="btn-secondary"
              data-testid="prev-button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          )}

          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              data-testid="save-draft-button"
              className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1.5 motion-safe:transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Draft
              {savedTime && (
                <span className="text-xs text-neutral-400">({savedTime})</span>
              )}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isNextLoading}
          data-testid="next-button"
          aria-busy={isNextLoading}
          className={`
            btn-primary group min-w-[140px]
            ${isLastStep ? 'bg-success-500 hover:bg-success-600' : ''}
          `}
        >
          {isNextLoading ? (
            <>
              <span className="verify-spinner" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              {resolvedLabel}
              {!isLastStep && (
                <svg
                  className="w-4 h-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </>
          )}
        </button>
      </div>

      {/* Mobile sticky nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg px-4 py-3 flex items-center gap-2">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrev}
            data-testid="prev-button"
            className="btn-secondary flex-shrink-0 px-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            data-testid="save-draft-button"
            className="btn-secondary flex-shrink-0 px-3 text-xs"
          >
            Save
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isNextLoading}
          data-testid="next-button"
          aria-busy={isNextLoading}
          className={`
            btn-primary flex-1
            ${isLastStep ? 'bg-success-500 hover:bg-success-600' : ''}
          `}
        >
          {isNextLoading ? 'Processing…' : resolvedLabel}
        </button>
      </div>

      {/* Mobile bottom padding so content clears sticky nav */}
      <div className="sm:hidden h-20" aria-hidden="true" />
    </>
  );
});

StepNavigation.displayName = 'StepNavigation';
export default StepNavigation;
