import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import useLoanStore from '../../store/loanStore';
import { getStep2Schema } from '../../schemas/step2Schema';
import { FormField } from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import DatePicker from '../common/DatePicker';
import StepNavigation from '../wizard/StepNavigation';
import useAutoSave from '../../hooks/useAutoSave';

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male'   },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other'  },
];

const MARITAL_OPTIONS = [
  { value: 'single',   label: 'Single'   },
  { value: 'married',  label: 'Married'  },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed',  label: 'Widowed'  },
];

export default function Step2PersonalInfo({ isFirstStep, isLastStep, addToast }) {
  const formData     = useLoanStore((s) => s.formData);
  const setStepData  = useLoanStore((s) => s.setStepData);
  const goToNextStep = useLoanStore((s) => s.goToNextStep);
  const goToPrevStep = useLoanStore((s) => s.goToPrevStep);

  const { saveNow } = useAutoSave({ addToast });
  const saved = formData.step2 ?? {};

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getStep2Schema()),
    defaultValues: {
      fullName:        saved.fullName        ?? '',
      dateOfBirth:     saved.dateOfBirth     ?? '',
      gender:          saved.gender          ?? '',
      maritalStatus:   saved.maritalStatus   ?? '',
      fatherName:      saved.fatherName      ?? '',
      motherName:      saved.motherName      ?? '',
      email:           saved.email           ?? '',
      mobile:          saved.mobile          ?? '',
      alternateMobile: saved.alternateMobile ?? '',
    },
  });

  const onSubmit = useCallback((data) => {
    setStepData(2, data);
    goToNextStep();
  }, [setStepData, goToNextStep]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5">

        <FormField
          label="Full Name (as per PAN)"
          required
          id="full-name"
          data-testid="full-name"
          placeholder="As on your PAN card"
          helpText="Enter exactly as on your government ID"
          error={errors.fullName?.message}
          autoComplete="name"
          {...register('fullName')}
        />

       <Controller
  name="dateOfBirth"
  control={control}
  render={({ field }) => (
    <DatePicker
      label="Date of Birth"
      required
      id="date-of-birth"
      data-testid="date-of-birth"
      minAge={21}
      maxAge={65}
      helpText="You must be 21–65 years old"
      error={errors.dateOfBirth?.message}
      autoComplete="bday"
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  )}
/>

<Controller
  name="gender"
  control={control}
  render={({ field }) => (
    <RadioGroup
      label="Gender"
      required
      name="gender"
      layout="horizontal"
      options={GENDER_OPTIONS}
      value={field.value}
      onChange={(e) => field.onChange(e.target.value)}
      error={errors.gender?.message}
    />
  )}
/>
     

        <Select
          label="Marital Status"
          required
          id="marital-status"
          options={MARITAL_OPTIONS}
          placeholder="Select marital status"
          error={errors.maritalStatus?.message}
          autoComplete="off"
          {...register('maritalStatus')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Father's Name"
            required
            id="father-name"
            placeholder="Father's full name"
            error={errors.fatherName?.message}
            {...register('fatherName')}
          />
          <FormField
            label="Mother's Name"
            required
            id="mother-name"
            placeholder="Mother's full name"
            error={errors.motherName?.message}
            {...register('motherName')}
          />
        </div>

        <FormField
          label="Email Address"
          required
          id="email"
          type="email"
          placeholder="you@example.com"
          helpText="For application updates and communication"
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <FormField
          label="Mobile Number"
          required
          id="mobile"
          type="tel"
          placeholder="10-digit mobile number"
          helpText="Indian mobile number starting with 6, 7, 8, or 9"
          error={errors.mobile?.message}
          autoComplete="tel"
          {...register('mobile')}
        />

        <FormField
          label="Alternate Mobile"
          id="alternate-mobile"
          type="tel"
          placeholder="Optional — different from primary"
          error={errors.alternateMobile?.message}
          autoComplete="tel"
          {...register('alternateMobile')}
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
