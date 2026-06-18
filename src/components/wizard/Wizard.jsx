import { Suspense, useEffect, useRef } from 'react';
import useLoanStore from '../../store/loanStore';
import ProgressBar from './ProgressBar';

// ── Direct imports instead of lazy (fixes React 19 compatibility) ─
import Step1LoanType     from '../steps/Step1LoanType.jsx';
import Step2PersonalInfo from '../steps/Step2PersonalInfo.jsx';
import Step3KYC          from '../steps/Step3KYC.jsx';
import Step4Address      from '../steps/Step4Address.jsx';
import Step5Employment   from '../steps/Step5Employment.jsx';
import Step6CoApplicant  from '../steps/Step6CoApplicant.jsx';
import Step7Documents    from '../steps/Step7Documents.jsx';
import Step8Review       from '../steps/Step8Review.jsx';

const STEP_REGISTRY = {
  1: Step1LoanType,
  2: Step2PersonalInfo,
  3: Step3KYC,
  4: Step4Address,
  5: Step5Employment,
  6: Step6CoApplicant,
  7: Step7Documents,
  8: Step8Review,
};

const STEP_SUBTITLES = {
  1: 'Tell us about the loan you need',
  2: 'Basic details as per your government ID',
  3: 'Verify your PAN and Aadhaar identity',
  4: 'Your current and permanent address',
  5: 'Your employment and income details',
  6: 'Co-applicant details required for this loan',
  7: 'Upload supporting documents and sign digitally',
  8: 'Review all information before final submission',
};

function StepSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <div className="h-6 bg-neutral-200 rounded-lg w-2/5 animate-pulse" />
      <div className="h-4 bg-neutral-100 rounded w-3/5 animate-pulse" />
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-neutral-200 rounded w-1/4 animate-pulse" />
            <div className="h-10 bg-neutral-100 rounded-lg w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Wizard({ addToast }) {
  const currentStep    = useLoanStore((s) => s.currentStep);
  const getActiveSteps = useLoanStore((s) => s.getActiveSteps);
  const getStepLabel   = useLoanStore((s) => s.getStepLabel);
  const setCurrentStep = useLoanStore((s) => s.setCurrentStep);

  const activeSteps  = getActiveSteps();
  const currentIndex = activeSteps.indexOf(currentStep);
  const isFirstStep  = currentIndex === 0;
  const isLastStep   = currentIndex === activeSteps.length - 1;

  const stepHeadingRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      stepHeadingRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [currentStep]);

  const ActiveStep = STEP_REGISTRY[currentStep];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F9FAFB 0%, #fff 50%, #EFF6FF 100%)' }}>

      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 768, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1F4E79, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span style={{
              fontWeight: 800, fontSize: '1.25rem',
              background: 'linear-gradient(90deg, #1F4E79, #2563EB)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              LendSwift
            </span>
          </div>

          {/* Encryption badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 9999,
            background: '#F0FDF4', color: '#15803d',
            border: '1px solid rgba(39,174,96,0.2)',
            fontSize: '0.75rem', fontWeight: 500,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit Encrypted
          </div>
        </div>
      </header>

      {/* Main — always OUTSIDE header */}
      <main id="main-content" style={{ maxWidth: 768, margin: '0 auto', padding: '24px 16px 40px' }}>

        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <ProgressBar onStepClick={(n) => setCurrentStep(n)} />
        </div>

        {/* Step card */}
        <div style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '28px 24px' }}>

            {/* Step heading — focus target */}
            <h1
              ref={stepHeadingRef}
              tabIndex={-1}
              style={{
                fontSize: '1.375rem', fontWeight: 700,
                color: '#111827', margin: '0 0 4px',
                outline: 'none',
              }}
            >
              {getStepLabel(currentStep)}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 28px' }}>
              {STEP_SUBTITLES[currentStep]}
            </p>

            {/* Active step */}
            {ActiveStep ? (
              <ActiveStep
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                addToast={addToast}
              />
            ) : (
              <div role="alert" style={{ color: '#dc2626', padding: 16, border: '1px solid #FECACA', borderRadius: 8, background: '#FEF2F2' }}>
                Unknown step {currentStep}. Please refresh the page.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '0 0 4px' }}>
            Your data is encrypted and auto-saved every 30 seconds.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            Grievance Officer:{' '}
            <a href="mailto:grievance@lendswift.in" style={{ color: '#2563EB' }}>
              grievance@lendswift.in
            </a>
            {' | '}
            <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB' }}>
              RBI Ombudsman ↗
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
