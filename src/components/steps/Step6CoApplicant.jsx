import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import useLoanStore from '../../store/loanStore';
import { getStep6Schema } from '../../schemas/step6Schema';
import { FormField } from '../common/Input';
import Select from '../common/Select';
import MaskedInput from '../common/MaskedInput';
import Checkbox from '../common/Checkbox';
import CurrencyInput from '../common/CurrencyInput';
import ErrorMessage from '../common/ErrorMessage';
import StepNavigation from '../wizard/StepNavigation';
import useVerification from '../../hooks/useVerification';
import useAutoSave from '../../hooks/useAutoSave';
import { formatINR } from '../../utils/formatters';

export default function Step6CoApplicant({ isFirstStep, isLastStep, addToast }) {
  const formData           = useLoanStore((s) => s.formData);
  const setStepData        = useLoanStore((s) => s.setStepData);
  const goToNextStep       = useLoanStore((s) => s.goToNextStep);
  const goToPrevStep       = useLoanStore((s) => s.goToPrevStep);
  const verificationStatus = useLoanStore((s) => s.verificationStatus);

  const { verifyCoApplicantPAN, resetVerification } = useVerification();
  const { saveNow } = useAutoSave({ addToast });

  const loanType      = formData.step1?.loanType ?? 'personal';
  const maritalStatus = formData.step2?.maritalStatus;
  const primaryIncome = Number(
    formData.step5?.monthlyNetSalary ?? formData.step5?.monthlyIncome ?? 0
  );
  const saved = formData.step6 ?? {};

  const relationshipOptions = [
    ...(maritalStatus === 'married' ? [{ value: 'spouse', label: 'Spouse' }] : []),
    { value: 'parent',          label: 'Parent'           },
    { value: 'sibling',         label: 'Sibling'          },
    { value: 'businessPartner', label: 'Business Partner' },
  ];

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getStep6Schema(formData)),
    defaultValues: {
      coApplicantName:    saved.coApplicantName    ?? '',
      relationship:       saved.relationship       ?? (maritalStatus === 'married' ? 'spouse' : ''),
      coApplicantPAN:     saved.coApplicantPAN     ?? '',
      coApplicantIncome:  saved.coApplicantIncome  ?? '',
      coApplicantConsent: saved.coApplicantConsent ?? false,
    },
  });

  const coIncome      = Number(watch('coApplicantIncome') ?? 0);
  const combinedIncome = primaryIncome + coIncome;

  const onSubmit = useCallback((data) => {
    setStepData(6, {
      ...data,
      coApplicantIncome: Number(data.coApplicantIncome),
    });
    goToNextStep();
  }, [setStepData, goToNextStep]);

  const handlePANBlur = useCallback(async (value) => {
    if (!value) return;
    resetVerification('coApplicantPan');
    await verifyCoApplicantPAN(value, loanType);
  }, [verifyCoApplicantPAN, resetVerification, loanType]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">

        {/* Info banner */}
        <ErrorMessage variant="info">
          A co-applicant is required for this loan. Their income will be
          combined with yours to determine loan eligibility.
        </ErrorMessage>

        <FormField
          label="Co-Applicant Full Name"
          required
          id="co-applicant-name"
          placeholder="Full name as per PAN"
          error={errors.coApplicantName?.message}
          {...register('coApplicantName')}
        />

        <Select
          label="Relationship to Applicant"
          required
          id="relationship"
          options={relationshipOptions}
          placeholder="Select relationship"
          error={errors.relationship?.message}
          {...register('relationship')}
        />

        {/* Co-applicant PAN with verification */}
        <Controller
          name="coApplicantPAN"
          control={control}
          render={({ field }) => (
            <MaskedInput
              label="Co-Applicant PAN Number"
              required
              id="co-applicant-pan"
              maskType="pan"
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value);
                resetVerification('coApplicantPan');
              }}
              onBlur={() => handlePANBlur(field.value)}
              verificationStatus={verificationStatus.coApplicantPan}
              error={errors.coApplicantPAN?.message}
              helpText="Format: AAAAA9999A"
            />
          )}
        />

        {/* Co-applicant income */}
        <Controller
          name="coApplicantIncome"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Co-Applicant Monthly Income"
              required
              id="co-applicant-income"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={errors.coApplicantIncome?.message}
              helpText="Combined with your income for eligibility"
            />
          )}
        />

        {/* Combined income display */}
        {combinedIncome > 0 && (
          <div className="bg-primary-50 border border-primary-700/20 rounded-lg p-3 text-sm anim-fade-in">
            <p className="text-primary-700 font-medium">
              Combined Monthly Income: {formatINR(combinedIncome)}
            </p>
            {primaryIncome > 0 && (
              <p className="text-xs text-neutral-500 mt-0.5">
                Your income: {formatINR(primaryIncome)} +
                Co-applicant: {formatINR(coIncome)}
              </p>
            )}
          </div>
        )}

        {/* Consent — starts UNCHECKED */}
        <Controller
          name="coApplicantConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="co-applicant-consent"
              label="The co-applicant agrees to be jointly liable for this loan"
              description="By checking this box, the co-applicant consents to their
                information being used for credit assessment and agrees to
                repay the loan jointly with the primary applicant."
              required
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              error={errors.coApplicantConsent?.message}
            />
          )}
        />
      </div>

      <StepNavigation
        onNext={handleSubmit(onSubmit)}
        onPrev={goToPrevStep}
        onSaveDraft={saveNow}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </form>
  );
}