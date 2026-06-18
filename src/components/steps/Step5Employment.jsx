import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import useLoanStore from '../../store/loanStore';
import { getStep5Schema } from '../../schemas/step5Schema';
import { FormField } from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import CurrencyInput from '../common/CurrencyInput';
import ErrorMessage from '../common/ErrorMessage';
import StepNavigation from '../wizard/StepNavigation';
import useAutoSave from '../../hooks/useAutoSave';
import { formatINR } from '../../utils/formatters';
import { calculateEMI } from '../../utils/emiCalculator';

const EMPLOYMENT_OPTIONS = [
  { value: 'salaried',      label: 'Salaried',       description: 'Working for an employer' },
  { value: 'selfEmployed',  label: 'Self-Employed',  description: 'Running your own business' },
  { value: 'businessOwner', label: 'Business Owner', description: 'Owner of a registered company' },
];

const BUSINESS_TYPES = [
  'Retail', 'Manufacturing', 'Services',
  'Trading', 'Consulting', 'Healthcare',
  'Education', 'Technology', 'Other',
];

const SALARIED_FIELDS   = ['companyName', 'designation', 'monthlyNetSalary', 'yearsOfExperience'];
const SELF_EMP_FIELDS   = ['businessName', 'businessType', 'annualTurnover', 'yearsInBusiness', 'monthlyIncome', 'officeAddress'];
const BIZ_OWNER_FIELDS  = [...SELF_EMP_FIELDS, 'gstNumber'];

export default function Step5Employment({ isFirstStep, isLastStep, addToast }) {
  const formData     = useLoanStore((s) => s.formData);
  const setStepData  = useLoanStore((s) => s.setStepData);
  const goToNextStep = useLoanStore((s) => s.goToNextStep);
  const goToPrevStep = useLoanStore((s) => s.goToPrevStep);

  const { saveNow } = useAutoSave({ addToast });
  const loanType = formData.step1?.loanType ?? 'personal';
  const saved    = formData.step5 ?? {};

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getStep5Schema(formData)),
    defaultValues: {
      employmentType:    saved.employmentType    ?? '',
      companyName:       saved.companyName       ?? '',
      designation:       saved.designation       ?? '',
      monthlyNetSalary:  saved.monthlyNetSalary  ?? '',
      yearsOfExperience: saved.yearsOfExperience ?? '',
      businessName:      saved.businessName      ?? '',
      businessType:      saved.businessType      ?? '',
      annualTurnover:    saved.annualTurnover    ?? '',
      yearsInBusiness:   saved.yearsInBusiness   ?? '',
      monthlyIncome:     saved.monthlyIncome     ?? '',
      gstNumber:         saved.gstNumber         ?? '',
      officeAddress: {
        addressLine1: saved.officeAddress?.addressLine1 ?? '',
        addressLine2: saved.officeAddress?.addressLine2 ?? '',
        pinCode:      saved.officeAddress?.pinCode      ?? '',
        city:         saved.officeAddress?.city         ?? '',
        state:        saved.officeAddress?.state        ?? '',
      },
    },
  });

  const employmentType = watch('employmentType');
  const monthlyIncome  = watch('monthlyNetSalary') || watch('monthlyIncome') || 0;

  const loanAmount  = Number(formData.step1?.loanAmount ?? 0);
  const loanTenure  = Number(formData.step1?.loanTenure ?? 0);
  const emi         = calculateEMI(loanAmount, loanTenure, loanType);
  const emiRatio    = monthlyIncome > 0 ? (emi / monthlyIncome) * 100 : 0;
  const highEMI     = emiRatio > 50;

  const businessLoanSalariedError = loanType === 'business' && employmentType === 'salaried';

  // Clear previous employment type fields when switching
  const handleEmploymentTypeChange = useCallback((newType) => {
    const allFields = [...new Set([...SALARIED_FIELDS, ...BIZ_OWNER_FIELDS])];
    allFields.forEach((f) => {
      if (f !== 'employmentType') setValue(f, '', { shouldValidate: false });
    });
    clearErrors();
  }, [setValue, clearErrors]);

  const onSubmit = useCallback((data) => {
    setStepData(5, {
      ...data,
      monthlyNetSalary:  data.monthlyNetSalary  ? Number(data.monthlyNetSalary)  : undefined,
      annualTurnover:    data.annualTurnover     ? Number(data.annualTurnover)    : undefined,
      monthlyIncome:     data.monthlyIncome      ? Number(data.monthlyIncome)     : undefined,
      yearsOfExperience: data.yearsOfExperience  ? Number(data.yearsOfExperience) : undefined,
      yearsInBusiness:   data.yearsInBusiness    ? Number(data.yearsInBusiness)   : undefined,
    });
    goToNextStep();
  }, [setStepData, goToNextStep]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">

        {/* Employment Type */}
        <Controller
          name="employmentType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="Employment Type"
              required
              name="employmentType"
              data-testid="employment-type"
              options={EMPLOYMENT_OPTIONS}
              value={field.value}
              onChange={(e) => {
                handleEmploymentTypeChange(e.target.value);
                field.onChange(e.target.value);
              }}
              error={errors.employmentType?.message}
            />
          )}
        />

        {/* Business loan + salaried error */}
        {businessLoanSalariedError && (
          <ErrorMessage variant="error">
            Business loans require Self-Employed or Business Owner employment type.
          </ErrorMessage>
        )}

        {/* ── SALARIED sub-form ── */}
        {employmentType === 'salaried' && (
          <div className="space-y-4 anim-slide-up">
            <FormField
              label="Company Name"
              required
              id="company-name"
              placeholder="Your employer's name"
              error={errors.companyName?.message}
              {...register('companyName')}
            />
            <FormField
              label="Designation"
              required
              id="designation"
              placeholder="Your job title"
              error={errors.designation?.message}
              {...register('designation')}
            />
            <Controller
              name="monthlyNetSalary"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Monthly Net Salary"
                  required
                  id="monthly-net-salary"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  error={errors.monthlyNetSalary?.message}
                  helpText="Minimum ₹15,000"
                />
              )}
            />
            <FormField
              label="Years of Experience"
              required
              id="years-experience"
              type="number"
              min={0}
              max={50}
              placeholder="0"
              error={errors.yearsOfExperience?.message}
              {...register('yearsOfExperience', { valueAsNumber: true })}
            />
          </div>
        )}

        {/* ── SELF-EMPLOYED sub-form ── */}
        {(employmentType === 'selfEmployed' || employmentType === 'businessOwner') && (
          <div className="space-y-4 anim-slide-up">
            <FormField
              label="Business Name"
              required
              id="business-name"
              placeholder="Registered business name"
              error={errors.businessName?.message}
              {...register('businessName')}
            />
            <Select
              label="Business Type"
              required
              id="business-type"
              options={BUSINESS_TYPES}
              placeholder="Select business type"
              error={errors.businessType?.message}
              {...register('businessType')}
            />
            <Controller
              name="annualTurnover"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Annual Turnover"
                  required
                  id="annual-turnover"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  error={errors.annualTurnover?.message}
                  helpText="Minimum ₹3,00,000"
                />
              )}
            />
            <FormField
              label="Years in Business"
              required
              id="years-in-business"
              type="number"
              min={2}
              max={50}
              placeholder="Minimum 2 years"
              error={errors.yearsInBusiness?.message}
              {...register('yearsInBusiness', { valueAsNumber: true })}
            />
            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Monthly Income"
                  required
                  id="monthly-income"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  error={errors.monthlyIncome?.message}
                />
              )}
            />

            {/* GST — only for Business Owner */}
            {employmentType === 'businessOwner' && (
              <FormField
                label="GST Number"
                required
                id="gst-number"
                data-testid="gst-number"
                placeholder="15-character GSTIN"
                helpText="Format: state code + PAN + entity number + Z + checksum"
                error={errors.gstNumber?.message}
                {...register('gstNumber')}
              />
            )}

            {/* Office address */}
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                Office / Business Address
              </h3>
              <div className="space-y-3">
                <FormField
                  label="Address Line 1"
                  required
                  id="office-address-1"
                  error={errors.officeAddress?.addressLine1?.message}
                  {...register('officeAddress.addressLine1')}
                />
                <FormField
                  label="Address Line 2"
                  id="office-address-2"
                  {...register('officeAddress.addressLine2')}
                />
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    label="PIN Code"
                    required
                    id="office-pin"
                    inputMode="numeric"
                    maxLength={6}
                    error={errors.officeAddress?.pinCode?.message}
                    {...register('officeAddress.pinCode')}
                  />
                  <FormField
                    label="City"
                    required
                    id="office-city"
                    error={errors.officeAddress?.city?.message}
                    {...register('officeAddress.city')}
                  />
                  <FormField
                    label="State"
                    required
                    id="office-state"
                    error={errors.officeAddress?.state?.message}
                    {...register('officeAddress.state')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMI affordability indicator */}
        {emi > 0 && monthlyIncome > 0 && (
          <div className={`p-3 rounded-lg border text-sm ${highEMI ? 'bg-warning-50 border-warning-500/20 text-warning-700' : 'bg-success-50 border-success-500/20 text-success-700'}`}>
            <p className="font-medium">
              EMI/Income Ratio: {emiRatio.toFixed(1)}%
              {highEMI && ' ⚠️ Exceeds 50%'}
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              Estimated EMI: {formatINR(emi)} on income of {formatINR(monthlyIncome)}/month
            </p>
          </div>
        )}
      </div>

      <StepNavigation
        onNext={handleSubmit(onSubmit)}
        onPrev={goToPrevStep}
        onSaveDraft={saveNow}
        isNextDisabled={businessLoanSalariedError}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </form>
  );
}