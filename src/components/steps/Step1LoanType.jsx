import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import useLoanStore from '../../store/loanStore';
import { getStep1Schema, LOAN_PURPOSES, TENURE_RANGES } from '../../schemas/step1Schema';
import { FormField } from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import CurrencyInput from '../common/CurrencyInput';
import StepNavigation from '../wizard/StepNavigation';
import { formatINR } from '../../utils/formatters';
import { calculateEMI, getInterestRate } from '../../utils/emiCalculator';
import useAutoSave from '../../hooks/useAutoSave';

const LOAN_TYPE_OPTIONS = [
  {
    value: 'personal',
    label: 'Personal Loan',
    description: 'For medical, education, travel and more',
    meta: 'Up to ₹10,00,000 • 10.5% p.a.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    value: 'home',
    label: 'Home Loan',
    description: 'Purchase, construct or renovate your home',
    meta: 'Up to ₹1,00,00,000 • 8.5% p.a.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    value: 'business',
    label: 'Business Loan',
    description: 'Fuel your business growth',
    meta: 'Up to ₹50,00,000 • 14% p.a.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

function getTenureOptions(loanType) {
  const range = TENURE_RANGES[loanType];
  if (!range) return [];
  const options = [];
  const step = loanType === 'home' ? 12 : 6;
  for (let m = range.min; m <= range.max; m += step) {
    const years = m / 12;
    options.push({
      value: String(m),
      label: m % 12 === 0 ? `${years} ${years === 1 ? 'Year' : 'Years'} (${m} months)` : `${m} months`,
    });
  }
  return options;
}

export default function Step1LoanType({ isFirstStep, isLastStep, addToast }) {
  const formData    = useLoanStore((s) => s.formData);
  const setStepData = useLoanStore((s) => s.setStepData);
  const goToNextStep = useLoanStore((s) => s.goToNextStep);

  const { saveNow, resumeModal, handleResume, handleStartFresh } = useAutoSave({ addToast });

  const saved = formData.step1 ?? {};

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getStep1Schema(formData)),
    defaultValues: {
      loanType:     saved.loanType     ?? '',
      loanAmount: saved.loanAmount ? Number(saved.loanAmount) : undefined,
       loanTenure: saved.loanTenure ? Number(saved.loanTenure) : undefined,
      loanPurpose:  saved.loanPurpose  ?? '',
      referralCode: saved.referralCode ?? '',
    },
  });

  const loanType   = watch('loanType');
  const loanAmount = watch('loanAmount');
  const loanTenure = watch('loanTenure');

  const emi = loanType && loanAmount && loanTenure
    ? calculateEMI(Number(loanAmount), Number(loanTenure), loanType)
    : null;

  const onSubmit = useCallback((data) => {
    setStepData(1, {
      ...data,
      loanAmount: Number(data.loanAmount),
      loanTenure: Number(data.loanTenure),
    });
    goToNextStep();
  }, [setStepData, goToNextStep]);

  // Reset purpose when loan type changes
  useEffect(() => {
    if (loanType) setValue('loanPurpose', '');
  }, [loanType, setValue]);

  const purposeOptions = loanType ? (LOAN_PURPOSES[loanType] ?? []) : [];
  const tenureOptions  = loanType ? getTenureOptions(loanType) : [];

  return (
    <>
      {/* Resume modal */}
      {resumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="resume-title">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h2 id="resume-title" className="text-lg font-semibold text-neutral-900 mb-2">Resume Application?</h2>
            <p className="text-sm text-neutral-600 mb-5">
              You have a saved {resumeModal.loanType} loan application from{' '}
              {new Date(resumeModal.savedAt).toLocaleString('en-IN')}.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={handleResume} className="btn-primary flex-1">Resume</button>
              <button type="button" onClick={handleStartFresh} className="btn-secondary flex-1">Start Fresh</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Loan type cards */}
        <div className="mb-6">
          <Controller
            name="loanType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Select Loan Type"
                required
                name="loanType"
                variant="card"
                options={LOAN_TYPE_OPTIONS}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.loanType?.message}
              />
            )}
          />
        </div>

        {/* Conditional fields — only shown after loan type selected */}
        {loanType && (
          <div className="space-y-5 anim-slide-up">
            {/* Loan Amount */}
            <Controller
              name="loanAmount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Loan Amount"
                  required
                  id="loan-amount"
                  data-testid="loan-amount"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || '')}
                  onBlur={field.onBlur}
                  error={errors.loanAmount?.message}
                  helpText={
                    loanType === 'personal' ? 'Maximum ₹10,00,000' :
                    loanType === 'home'     ? 'Maximum ₹1,00,00,000' :
                    'Maximum ₹50,00,000'
                  }
                />
              )}
            />

            {/* Loan Tenure */}
            <Select
               label="Loan Tenure"
  required
  id="loan-tenure"
  data-testid="loan-tenure"
  options={tenureOptions}
  placeholder="Select tenure"
  error={errors.loanTenure?.message}
  {...register('loanTenure', { valueAsNumber: true })}
            />

            {/* Loan Purpose */}
            <Select
              label="Loan Purpose"
              required
              id="loan-purpose"
              data-testid="loan-purpose"
              options={purposeOptions}
              placeholder="Select purpose"
              error={errors.loanPurpose?.message}
              {...register('loanPurpose')}
            />

            {/* Referral Code */}
            <FormField
              label="Referral Code"
              id="referral-code"
              data-testid="referral-code"
              placeholder="Optional"
              error={errors.referralCode?.message}
              helpText="6–10 alphanumeric characters"
              {...register('referralCode')}
            />

            {/* Live EMI preview */}
            {emi !== null && emi > 0 && (
              <div className="bg-primary-50 border border-primary-700/20 rounded-lg p-4 anim-fade-in">
                <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
                  Estimated Monthly EMI
                </p>
                <p className="text-2xl font-bold text-primary-700">
                  {formatINR(emi)}
                  <span className="text-sm font-normal text-neutral-500 ml-1">/month</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  At {getInterestRate(loanType)}% p.a. — indicative only
                </p>
              </div>
            )}
          </div>
        )}

        <StepNavigation
          onNext={handleSubmit(onSubmit)}
          onSaveDraft={saveNow}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </form>
    </>
  );
}

