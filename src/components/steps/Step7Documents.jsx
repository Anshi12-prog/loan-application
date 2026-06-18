import { useCallback, useRef, useState } from 'react';
import useLoanStore from '../../store/loanStore';
import StepNavigation from '../wizard/StepNavigation';
import useAutoSave from '../../hooks/useAutoSave';

// ── Image compression ─────────────────────────────────────────────
async function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio  = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      function tryCompress(q) {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(null); return; }
          if (blob.size > 2 * 1024 * 1024 && q > 0.3) {
            tryCompress(Math.round((q - 0.1) * 10) / 10);
          } else {
            resolve(blob);
          }
        }, 'image/jpeg', q);
      }
      tryCompress(quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// ── Single file upload zone ───────────────────────────────────────
function FileZone({ label, required, acceptedTypes, maxSizeMB, value, onChange }) {
  const [dragging, setDragging]       = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [sizeInfo, setSizeInfo]       = useState(null);
  const [error, setError]             = useState(null);
  const [progress, setProgress]       = useState(0);
  const inputRef = useRef(null);

  const ACCEPTED = acceptedTypes ?? ['image/jpeg', 'image/png', 'application/pdf'];
  const MAX_BYTES = (maxSizeMB ?? 5) * 1024 * 1024;

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setError(null);
    setSizeInfo(null);
    setProgress(0);

    if (!ACCEPTED.includes(file.type)) {
      setError(`Invalid type. Accepted: ${ACCEPTED.map((t) => t.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Too large. Max ${maxSizeMB ?? 5}MB`);
      return;
    }

    let finalFile = file;
    if (file.type.startsWith('image/')) {
      setCompressing(true);
      const originalSize = file.size;
      const blob = await compressImage(file);
      setCompressing(false);
      if (blob) {
        finalFile = new File([blob], file.name, { type: 'image/jpeg' });
        setSizeInfo({
          original:   (originalSize / 1024).toFixed(0),
          compressed: (blob.size   / 1024).toFixed(0),
        });
      }
    }

    setProgress(10);
    await new Promise((r) => setTimeout(r, 300));
    setProgress(50);
    await new Promise((r) => setTimeout(r, 600));
    setProgress(100);
    onChange(finalFile);
  }, [ACCEPTED, MAX_BYTES, maxSizeMB, onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  }, []);

  return (
    <div className="field-group">
      {/* Always render the input — just hidden */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <label className="field-label">
          {label}
          {required && <span style={{ color: '#E74C3C' }} aria-hidden="true"> *</span>}
        </label>
        <span style={{
          fontSize: '0.7rem', fontWeight: 600, padding: '2px 10px',
          borderRadius: '9999px',
          background: required ? '#FEF2F2' : '#EFF6FF',
          color: required ? '#b91c1c' : '#1F4E79',
          border: `1px solid ${required ? '#FECACA' : '#BFDBFE'}`,
        }}>
          {required ? 'Required' : 'Optional'}
        </span>
      </div>

      {!value ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
          style={{
            border: `2px dashed ${dragging ? '#1F4E79' : '#D1D5DB'}`,
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? '#EFF6FF' : '#F9FAFB',
            transition: 'all 0.15s',
            userSelect: 'none',
          }}
        >
          <svg
            style={{ width: 32, height: 32, color: '#9CA3AF', margin: '0 auto 8px', display: 'block' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0 }}>
            {compressing ? 'Compressing image…' : 'Click to upload or drag and drop'}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>
            {ACCEPTED.map((t) => t.split('/')[1].toUpperCase()).join(', ')} — max {maxSizeMB ?? 5}MB
          </p>
        </div>
      ) : (
        <div style={{
          border: '1px solid #E5E7EB', borderRadius: '0.5rem',
          padding: '0.75rem', display: 'flex', alignItems: 'center',
          gap: '0.75rem', background: '#F9FAFB',
        }}>
          {value.type?.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(value)}
              alt={label}
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #E5E7EB', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 56, height: 56, background: '#FEF2F2', borderRadius: 6,
              border: '1px solid #FECACA', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <svg style={{ width: 24, height: 24, color: '#E74C3C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {value.name}
            </p>
            {sizeInfo && (
              <p style={{ fontSize: '0.75rem', color: '#15803d', margin: '2px 0 0' }}>
                Compressed: {sizeInfo.original}KB → {sizeInfo.compressed}KB
              </p>
            )}
            {progress > 0 && progress < 100 && (
              <div style={{ marginTop: 4, height: 4, background: '#E5E7EB', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#1F4E79', width: `${progress}%`, transition: 'width 0.3s' }} />
              </div>
            )}
            {progress === 100 && (
              <p style={{ fontSize: '0.75rem', color: '#15803d', margin: '2px 0 0' }}>✓ Uploaded</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setProgress(0); setSizeInfo(null); setError(null); }}
            style={{
              padding: 6, background: 'none', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', borderRadius: 4, flexShrink: 0,
            }}
            aria-label={`Remove ${label}`}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <p role="alert" aria-live="polite" style={{ fontSize: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function SignaturePad({ onSave, onClear }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    isDrawing.current = true;
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1F4E79';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const endDraw = (e) => {
    e?.preventDefault();
    isDrawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onClear?.();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return false;
    onSave?.(canvas.toDataURL('image/png'));
    return true;
  };

  return (
    <div>
      <div style={{ border: '2px solid #D1D5DB', borderRadius: '0.75rem', overflow: 'hidden', background: '#fff', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          data-testid="signature-canvas"
          style={{ width: '100%', height: 160, display: 'block', cursor: 'crosshair' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" data-testid="clear-signature" onClick={handleClear}
          style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#fff', border: '1px solid #FECACA', color: '#dc2626', borderRadius: 6, cursor: 'pointer' }}>
          Clear Signature
        </button>
        <button type="button" onClick={handleSave}
          style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#fff', border: '1px solid #BFDBFE', color: '#1F4E79', borderRadius: 6, cursor: 'pointer' }}>
          Confirm Signature
        </button>
      </div>
      {hasSignature && (
        <p style={{ fontSize: '0.75rem', color: '#15803d', marginTop: 4 }}>
          ✓ Signature drawn — click Confirm to save
        </p>
      )}
    </div>
  );
}


export default function Step7Documents({ isFirstStep, isLastStep, addToast }) {
  const formData        = useLoanStore((s) => s.formData);
  const uploadedFiles   = useLoanStore((s) => s.uploadedFiles);
  const setUploadedFile = useLoanStore((s) => s.setUploadedFile);
  const verificationStatus = useLoanStore((s) => s.verificationStatus);
  const signature       = useLoanStore((s) => s.signature);
  const setSignature    = useLoanStore((s) => s.setSignature);
  const setStepData     = useLoanStore((s) => s.setStepData);
  const goToNextStep    = useLoanStore((s) => s.goToNextStep);
  const goToPrevStep    = useLoanStore((s) => s.goToPrevStep);

  const { saveNow } = useAutoSave({ addToast });
  const [sigError, setSigError] = useState('');

  const loanType       = formData.step1?.loanType ?? 'personal';
  const employmentType = formData.step5?.employmentType ?? 'salaried';
  const panVerified    = verificationStatus?.pan === 'verified';
  const isSalaried     = employmentType === 'salaried';
  const isNonSalaried  = employmentType === 'selfEmployed' || employmentType === 'businessOwner';

  const handleNext = useCallback(() => {
    if (!signature) {
      setSigError('Please draw and confirm your signature before proceeding');
      return;
    }
    setSigError('');
    setStepData(7, { documentsUploaded: true });
    goToNextStep();
  }, [signature, setStepData, goToNextStep]);

  const SectionHeading = ({ children }) => (
    <h2 style={{
      fontSize: '0.75rem', fontWeight: 600, color: '#6B7280',
      textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem',
    }}>
      {children}
    </h2>
  );

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <section>
          <SectionHeading>Identity Documents</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FileZone label="PAN Card Copy" required={!panVerified}
              acceptedTypes={['image/jpeg','image/png','application/pdf']} maxSizeMB={5}
              value={uploadedFiles.panCard} onChange={(f) => setUploadedFile('panCard', f)} />
            <FileZone label="Aadhaar Card — Front" required
              acceptedTypes={['image/jpeg','image/png','application/pdf']} maxSizeMB={5}
              value={uploadedFiles.aadhaarFront} onChange={(f) => setUploadedFile('aadhaarFront', f)} />
            <FileZone label="Aadhaar Card — Back" required
              acceptedTypes={['image/jpeg','image/png','application/pdf']} maxSizeMB={5}
              value={uploadedFiles.aadhaarBack} onChange={(f) => setUploadedFile('aadhaarBack', f)} />
            <FileZone label="Passport-size Photograph" required
              acceptedTypes={['image/jpeg','image/png']} maxSizeMB={2}
              value={uploadedFiles.photograph} onChange={(f) => setUploadedFile('photograph', f)} />
          </div>
        </section>

        <section>
          <SectionHeading>Financial Documents</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FileZone label="Bank Statements (Last 6 months)" required
              acceptedTypes={['application/pdf']} maxSizeMB={10}
              value={uploadedFiles.bankStatements} onChange={(f) => setUploadedFile('bankStatements', f)} />
            {isSalaried && (
              <FileZone label="Salary Slips (Last 3 months)" required
                acceptedTypes={['application/pdf']} maxSizeMB={5}
                value={uploadedFiles.salarySlips} onChange={(f) => setUploadedFile('salarySlips', f)} />
            )}
            {isNonSalaried && (
              <FileZone label="Income Tax Returns (Last 2 years)" required
                acceptedTypes={['application/pdf']} maxSizeMB={5}
                value={uploadedFiles.itr} onChange={(f) => setUploadedFile('itr', f)} />
            )}
          </div>
        </section>

        {(loanType === 'home' || loanType === 'business') && (
          <section>
            <SectionHeading>
              {loanType === 'home' ? 'Property Documents' : 'Business Documents'}
            </SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loanType === 'home' && (
                <FileZone label="Property Documents" required
                  acceptedTypes={['application/pdf']} maxSizeMB={10}
                  value={uploadedFiles.propertyDocuments} onChange={(f) => setUploadedFile('propertyDocuments', f)} />
              )}
              {loanType === 'business' && (
                <>
                  <FileZone label="Business Registration Certificate" required
                    acceptedTypes={['application/pdf']} maxSizeMB={5}
                    value={uploadedFiles.businessRegistration} onChange={(f) => setUploadedFile('businessRegistration', f)} />
                  <FileZone label="GST Returns (Last 4 quarters)" required
                    acceptedTypes={['application/pdf']} maxSizeMB={5}
                    value={uploadedFiles.gstReturns} onChange={(f) => setUploadedFile('gstReturns', f)} />
                </>
              )}
            </div>
          </section>
        )}

        <section>
          <SectionHeading>Your Digital Signature</SectionHeading>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.75rem' }}>
            Draw your signature below using your mouse or finger, then click Confirm.
          </p>
          <SignaturePad
            onSave={(dataUrl) => {
              setSignature(dataUrl);
              setSigError('');
              addToast?.('Signature saved', 'success');
            }}
            onClear={() => setSignature(null)}
          />
          {signature && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 4 }}>Saved signature:</p>
              <img src={signature} alt="Your saved signature"
                style={{ maxHeight: 60, border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', padding: 8 }} />
            </div>
          )}
          {sigError && (
            <p role="alert" aria-live="polite" style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 8 }}>
              {sigError}
            </p>
          )}
        </section>
      </div>

      <StepNavigation
        onNext={handleNext}
        onPrev={goToPrevStep}
        onSaveDraft={saveNow}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </div>
  );
}
