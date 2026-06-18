import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import useLoanStore from '../../store/loanStore';
import { getStep3Schema } from '../../schemas/step3Schema';
import MaskedInput from '../common/MaskedInput';
import Checkbox from '../common/Checkbox';
import { FormField } from '../common/Input';
import StepNavigation from '../wizard/StepNavigation';
import ErrorMessage from '../common/ErrorMessage';
import useVerification from '../../hooks/useVerification';
import useAutoSave from '../../hooks/useAutoSave';

export default function Step3KYC({ isFirstStep, isLastStep, addToast }) {
  const formData           = useLoanStore((s) => s.formData);
  const setStepData        = useLoanStore((s) => s.setStepData);
  const goToNextStep       = useLoanStore((s) => s.goToNextStep);
  const goToPrevStep       = useLoanStore((s) => s.goToPrevStep);
  const verificationStatus = useLoanStore((s) => s.verificationStatus);

  const { verify, resetVerification } = useVerification();
  const { saveNow } = useAutoSave({ addToast });

  const loanType   = formData.step1?.loanType ?? 'personal';
  const loanAmount = Number(formData.step1?.loanAmount ?? 0);
  const showPassport = loanType === 'home' && loanAmount > 5000000;
  const saved = formData.step3 ?? {};

  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getStep3Schema(formData)),
    defaultValues: {
      panNumber:      saved.panNumber      ?? '',
      aadhaarNumber:  saved.aadhaarNumber  ?? '',
      aadhaarConsent: saved.aadhaarConsent ?? false,
      voterID:        saved.voterID        ?? '',
      passport:       saved.passport       ?? '',
    },
  });

  const canProceed =
    verificationStatus.pan === 'verified' &&
    verificationStatus.aadhaar === 'verified';

  const onSubmit = useCallback((data) => {
    if (!canProceed) return;
    setStepData(3, data);
    goToNextStep();
  }, [canProceed, setStepData, goToNextStep]);

  const handlePANBlur = useCallback(async (value) => {
    if (!value) return;
    resetVerification('pan');
    await verify(value, 'pan', loanType);
  }, [verify, resetVerification, loanType]);

  const handleAadhaarBlur = useCallback(async (value) => {
    if (!value) return;
    resetVerification('aadhaar');
    await verify(value.replace(/\s/g, ''), 'aadhaar', loanType);
  }, [verify, resetVerification, loanType]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">

        {/* PAN */}
        <Controller
          name="panNumber"
          control={control}
          render={({ field }) => (
            <MaskedInput
              label="PAN Number"
              required
              id="pan-number"
              data-testid="pan-number"
              maskType="pan"
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value);
                resetVerification('pan');
              }}
              onBlur={() => handlePANBlur(field.value)}
              verificationStatus={verificationStatus.pan}
              error={errors.panNumber?.message}
              helpText="Format: AAAAA9999A — 5 letters, 4 digits, 1 letter"
            />
          )}
        />

        {/* Aadhaar */}
        <Controller
          name="aadhaarNumber"
          control={control}
          render={({ field }) => (
            <MaskedInput
              label="Aadhaar Number"
              required
              id="aadhaar-number"
              data-testid="aadhaar-number"
              maskType="aadhaar"
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value);
                resetVerification('aadhaar');
              }}
              onBlur={() => handleAadhaarBlur(field.value)}
              verificationStatus={verificationStatus.aadhaar}
              error={errors.aadhaarNumber?.message}
              helpText="12-digit Aadhaar number"
            />
          )}
        />

        {/* Verification gate */}
        {!canProceed && (
          verificationStatus.pan !== 'idle' || verificationStatus.aadhaar !== 'idle'
        ) && (
          <ErrorMessage variant="info">
            Both PAN and Aadhaar must be verified before proceeding.
          </ErrorMessage>
        )}

        {/* Aadhaar consent — starts UNCHECKED */}
        <Controller
          name="aadhaarConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="aadhaar-consent"
              data-testid="aadhaar-consent"
              label="I consent to Aadhaar-based verification as per UIDAI guidelines"
              description="Required by RBI Digital Lending Guidelines. Your Aadhaar data will not be stored on our servers."
              required
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              error={errors.aadhaarConsent?.message}
            />
          )}
        />

        {/* Voter ID — optional */}
        <FormField
          label="Voter ID"
          id="voter-id"
          placeholder="Optional — 3 letters + 7 digits"
          error={errors.voterID?.message}
          helpText="e.g. ABC1234567"
          {...register('voterID')}
        />

        {/* Passport — only for Home Loan > 50L */}
        {showPassport && (
          <FormField
            label="Passport Number"
            id="passport"
            placeholder="Optional — 1 letter + 7 digits"
            error={errors.passport?.message}
            helpText="Required for Home Loans above ₹50,00,000"
            {...register('passport')}
          />
        )}
      </div>

      <StepNavigation
        onNext={handleSubmit(onSubmit)}
        onPrev={goToPrevStep}
        onSaveDraft={saveNow}
        isNextDisabled={!canProceed}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </form>
  );
}