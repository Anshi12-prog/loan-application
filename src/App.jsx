import { useState, useCallback } from 'react';
import Wizard from './components/wizard/Wizard';
import useLoanStore from './store/loanStore';

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} role="status" aria-live="polite" style={{
          padding: '10px 16px', borderRadius: 8,
          background: t.variant === 'error' ? '#E74C3C' : t.variant === 'warning' ? '#F39C12' : '#27AE60',
          color: '#fff', fontSize: '0.875rem', fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function SuccessScreen({ reference, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [reference]);

  const msg = encodeURIComponent('LendSwift loan application submitted. Reference: ' + reference);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F0FDF4 0%, #fff 50%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0FDF4', border: '4px solid rgba(39,174,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#27AE60" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
          Application Submitted!
        </h1>
        <p style={{ color: '#6B7280', margin: '0 0 1.5rem' }}>
          Your loan application has been received successfully.
        </p>

        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 6 }}>Application Reference Number</p>
        <button type="button" onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: '#1F4E79', marginBottom: '1.5rem' }}>
          {reference}
          {copied && <span style={{ color: '#27AE60', fontSize: '0.75rem', fontFamily: 'sans-serif' }}>Copied!</span>}
        </button>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: '0 0 0.875rem' }}>What happens next?</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Our team will verify your documents within 24 hours', 'You will receive an SMS and email confirmation shortly', 'A loan officer may contact you for additional details', 'Disbursement within 2-3 working days after approval'].map((step, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', color: '#374151', marginBottom: 10 }}>
                <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: '#EFF6FF', color: '#1F4E79', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div style={{ background: '#FFFBEB', border: '1px solid rgba(243,156,18,0.25)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#92400e', textAlign: 'left', marginBottom: '1.25rem' }}>
          <strong>Cooling-Off Period:</strong> You have the right to cancel this loan within 3 days of disbursement without any prepayment penalty, as per RBI guidelines.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
          <a href={'https://wa.me/?text=' + msg} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', borderRadius: 8, background: '#25D366', color: '#fff', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}>
            Share on WhatsApp
          </a>
          <button type="button" onClick={onReset} style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', border: '1px solid #E5E7EB', color: '#1F4E79', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
            Start New Application
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
          Grievance: <a href="mailto:grievance@lendswift.in" style={{ color: '#2563EB' }}>grievance@lendswift.in</a>
          {' | '}
          <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB' }}>RBI Ombudsman</a>
        </p>

      </div>
    </div>
  );
}

export default function App() {
  const isSubmitted          = useLoanStore((s) => s.isSubmitted);
  const applicationReference = useLoanStore((s) => s.applicationReference);
  const resetForm            = useLoanStore((s) => s.resetForm);
  const [toasts, setToasts]  = useState([]);

  const addToast = useCallback((message, variant) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant: variant || 'success' }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  if (isSubmitted && applicationReference) {
    return <SuccessScreen reference={applicationReference} onReset={resetForm} />;
  }

  return (
    <div>
      <Wizard addToast={addToast} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}
