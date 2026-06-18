import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useLoanStore from '../../store/loanStore';
import { getStep8Schema } from '../../schemas/step8Schema';
import Checkbox from '../common/Checkbox';
import ErrorMessage from '../common/ErrorMessage';
import StepNavigation from '../wizard/StepNavigation';
import useAutoSave from '../../hooks/useAutoSave';
import { formatINR, formatDate, maskValue } from '../../utils/formatters';
import { calculateEMI, calculateProcessingFee, calculateTotalCost, getInterestRate } from '../../utils/emiCalculator';
import { clearDraft } from '../../utils/encryption';

// ── Review section card ───────────────────────────────────────────
function ReviewSection({ title, stepNumber, onEdit, children }) {
  const setCurrentStep = useLoanStore((s) => s.setCurrentStep);
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        <button
          type="button"
          onClick={() => setCurrentStep(stepNumber)}
          className="text-xs text-primary-700 font-medium hover:underline focus-visible:underline"
        >
          Edit
        </button>
      </div>
      <div className="px-4 py-3 text-sm text-neutral-700 space-y-1">
        {children}
      </div>
    </div>
  );
}

function DataRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2">
      <span className="text-neutral-500 min-w-[140px] flex-shrink-0">{label}:</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}

// ── Step 8 main component ─────────────────────────────────────────
export default function Step8Review({ isFirstStep, isLastStep, addToast }) {
  const formData           = useLoanStore((s) => s.formData);
  const uploadedFiles      = useLoanStore((s) => s.uploadedFiles);
  const signature          = useLoanStore((s) => s.signature);
  const setSubmitted       = useLoanStore((s) => s.setSubmitted);
  const goToPrevStep       = useLoanStore((s) => s.goToPrevStep);
  const getActiveSteps     = useLoanStore((s) => s.getActiveSteps);

  const { saveNow } = useAutoSave({ addToast });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step1 = formData.step1 ?? {};
  const step2 = formData.step2 ?? {};
  const step5 = formData.step5 ?? {};
  const step6 = formData.step6 ?? {};

  const loanType    = step1.loanType    ?? 'personal';
  const loanAmount  = Number(step1.loanAmount  ?? 0);
  const loanTenure  = Number(step1.loanTenure  ?? 0);
  const income      = Number(step5.monthlyNetSalary ?? step5.monthlyIncome ?? 0);
  const coIncome    = Number(step6.coApplicantIncome ?? 0);
  const totalIncome = income + coIncome;

  const emi           = calculateEMI(loanAmount, loanTenure, loanType);
  const processingFee = calculateProcessingFee(loanAmount);
  const totalCost     = calculateTotalCost(emi, loanTenure, loanAmount);
  const interestRate  = getInterestRate(loanType);
  const emiRatio      = totalIncome > 0 ? emi / totalIncome : 0;
  const highEMI       = emiRatio > 0.5;

  const activeSteps   = getActiveSteps();
  const hasStep6      = activeSteps.includes(6);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getStep8Schema(formData)),
    defaultValues: {
      consent1:      false,
      consent2:      false,
      consent3:      false,
      consent4:      false,
      highEMIConsent: false,
    },
  });

  const onSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const ref = `LS-${uuidv4().split('-')[0].toUpperCase()}`;
      clearDraft(loanType);
      setSubmitted(ref);
    } catch (err) {
      addToast?.('Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [loanType, setSubmitted, addToast]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">

        {/* ── Left: Data review ── */}
        <div>
          <ReviewSection title="Loan Details" stepNumber={1}>
            <DataRow label="Loan Type"    value={step1.loanType?.charAt(0).toUpperCase() + step1.loanType?.slice(1)} />
            <DataRow label="Loan Amount"  value={formatINR(step1.loanAmount)} />
            <DataRow label="Tenure"       value={`${step1.loanTenure} months`} />
            <DataRow label="Purpose"      value={step1.loanPurpose} />
          </ReviewSection>

          <ReviewSection title="Personal Information" stepNumber={2}>
            <DataRow label="Name"          value={step2.fullName} />
            <DataRow label="Date of Birth" value={formatDate(step2.dateOfBirth)} />
            <DataRow label="Gender"        value={step2.gender} />
            <DataRow label="Marital Status" value={step2.maritalStatus} />
            <DataRow label="Email"         value={step2.email} />
            <DataRow label="Mobile"        value={step2.mobile ? maskValue(step2.mobile, 4) : ''} />
          </ReviewSection>

          <ReviewSection title="KYC Verification" stepNumber={3}>
            <DataRow label="PAN"     value={formData.step3?.panNumber ? maskValue(formData.step3.panNumber, 4) : ''} />
            <DataRow label="Aadhaar" value={formData.step3?.aadhaarNumber ? 'XXXX XXXX ' + String(formData.step3.aadhaarNumber).slice(-4) : ''} />
          </ReviewSection>

          <ReviewSection title="Address" stepNumber={4}>
            <DataRow label="Address"        value={formData.step4?.addressLine1} />
            <DataRow label="City"           value={formData.step4?.city} />
            <DataRow label="State"          value={formData.step4?.state} />
            <DataRow label="PIN Code"       value={formData.step4?.pinCode} />
            <DataRow label="Residence Type" value={formData.step4?.residenceType} />
          </ReviewSection>

          <ReviewSection title="Employment" stepNumber={5}>
            <DataRow label="Employment Type" value={step5.employmentType} />
            <DataRow label="Company/Business" value={step5.companyName ?? step5.businessName} />
            <DataRow label="Monthly Income"  value={formatINR(step5.monthlyNetSalary ?? step5.monthlyIncome)} />
          </ReviewSection>

          {hasStep6 && (
            <ReviewSection title="Co-Applicant" stepNumber={6}>
              <DataRow label="Name"         value={step6.coApplicantName} />
              <DataRow label="Relationship" value={step6.relationship} />
              <DataRow label="Income"       value={formatINR(step6.coApplicantIncome)} />
            </ReviewSection>
          )}

          <ReviewSection title="Documents" stepNumber={7}>
            {Object.entries(uploadedFiles).map(([key, val]) => {
              if (!val) return null;
              const name = val?.name ?? key;
              return <DataRow key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={name} />;
            })}
            {signature && <DataRow label="E-Signature" value="Captured ✓" />}
          </ReviewSection>

          {/* Signature display */}
          {signature && (
            <div className="mb-4">
              <p className="text-xs text-neutral-500 mb-1">Your captured signature:</p>
              <img
                src={signature}
                alt="Your digital signature"
                className="border border-neutral-200 rounded-lg max-h-20 bg-white p-2"
              />
            </div>
          )}
        </div>

        {/* ── Right: Pre-approval summary ── */}
        <div>
          <div className="lg:sticky lg:top-24">
            <div className="card bg-gradient-to-br from-primary-700 to-primary-800 text-white mb-6">
              <h2 className="text-base font-semibold mb-4 text-white/90">
                Pre-Approval Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70 text-sm">Loan Amount</span>
                  <span className="font-bold">{formatINR(loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70 text-sm">Tenure</span>
                  <span className="font-semibold">{loanTenure} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70 text-sm">Interest Rate</span>
                  <span className="font-semibold">{interestRate}% p.a.</span>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-white/70 text-sm">Monthly EMI</span>
                    <span className="text-xl font-bold">{formatINR(emi)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Total Cost of Borrowing</span>
                  <span>{formatINR(totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Processing Fee</span>
                  <span>{formatINR(processingFee)}</span>
                </div>
              </div>
            </div>

            {/* High EMI warning */}
            {highEMI && (
              <ErrorMessage variant="warning" className="mb-4">
                Your EMI ({formatINR(emi)}) is {(emiRatio * 100).toFixed(1)}% of your
                monthly income ({formatINR(totalIncome)}). Lenders recommend EMI below 50%.
              </ErrorMessage>
            )}

            {/* 4 consent checkboxes — ALL start unchecked */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-neutral-800">
                Please confirm all consents before submitting:
              </p>

              {[
                { name: 'consent1', id: 'consent-1', label: 'I confirm all information provided is accurate and complete' },
                { name: 'consent2', id: 'consent-2', label: 'I authorise LendSwift to check my credit score via CIBIL/Equifax' },
                { name: 'consent3', id: 'consent-3', label: 'I agree to the Terms and Conditions and Key Fact Statement', link: '/terms.pdf' },
                { name: 'consent4', id: 'consent-4', label: 'I consent to receive communications regarding this application' },
              ].map(({ name, id, label, link }) => (
                <Controller
                  key={name}
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={id}
                      data-testid={id}
                      label={link
                        ? <span>{label.replace('Terms and Conditions', '')} <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary-700 underline">Terms and Conditions</a></span>
                        : label
                      }
                      required
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      error={errors[name]?.message}
                    />
                  )}
                />
              ))}

              {highEMI && (
                <Controller
                  name="highEMIConsent"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="high-emi-consent"
                      label="I understand my EMI exceeds 50% of my income and still wish to proceed"
                      required
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      error={errors.highEMIConsent?.message}
                    />
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <StepNavigation
        onNext={handleSubmit(onSubmit)}
        onPrev={goToPrevStep}
        onSaveDraft={saveNow}
        isNextLoading={isSubmitting}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        nextLabel="Submit Application"
      />
    </form>
  );
}