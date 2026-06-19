import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import useLoanStore from '../../store/loanStore';
import { getStep4Schema } from '../../schemas/step4Schema';
import { FormField } from '../common/Input';
import Select from '../common/Select';
import Checkbox from '../common/Checkbox';
import ErrorMessage from '../common/ErrorMessage';
import StepNavigation from '../wizard/StepNavigation';
import usePinCodeLookup from '../../hooks/usePinCodeLookup';
import useAutoSave from '../../hooks/useAutoSave';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar','Chandigarh','Dadra & Nagar Haveli','Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const RESIDENCE_OPTIONS = [
  { value: 'owned',   label: 'Owned'            },
  { value: 'rented',  label: 'Rented'           },
  { value: 'company', label: 'Company Provided' },
  { value: 'family',  label: 'Family Owned'     },
];

function AddressBlock({ prefix, register, errors, watch, setValue, pinLookup }) {
  const pinField  = `${prefix}pinCode`;
  const cityField = `${prefix}city`;
  const stateField = `${prefix}state`;
  const pinValue  = watch(pinField);

  const handlePINBlur = useCallback(async () => {
    if (!pinValue || pinValue.length !== 6) return;
    const result = await pinLookup.lookup(pinValue);
    if (result) {
      setValue(cityField,  result.city,  { shouldValidate: true });
      setValue(stateField, result.state, { shouldValidate: true });
    }
  }, [pinValue, pinLookup, setValue, cityField, stateField]);

  const fieldKey = (name) => `${prefix}${name.charAt(0).toUpperCase() + name.slice(1)}`;

  return (
    <div className="space-y-4">
      <FormField
        label="Address Line 1"
        required
        id={`${prefix}address-line-1`}
        placeholder="House/Flat No., Street Name"
        error={errors[fieldKey('addressLine1')]?.message || errors.addressLine1?.message}
        autoComplete="address-line1"
        {...register(prefix ? fieldKey('addressLine1') : 'addressLine1')}
      />
      <FormField
        label="Address Line 2"
        id={`${prefix}address-line-2`}
        placeholder="Landmark, Area (optional)"
        autoComplete="address-line2"
        {...register(prefix ? fieldKey('addressLine2') : 'addressLine2')}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <FormField
          label="PIN Code"
          required
          id={`${prefix}pin-code`}
          data-testid={prefix ? `${prefix}pin-code` : 'pin-code'}
          placeholder="6 digits"
          inputMode="numeric"
          maxLength={6}
          error={errors[pinField]?.message || errors.pinCode?.message}
          autoComplete="postal-code"
          onBlur={handlePINBlur}
          {...register(pinField || 'pinCode')}
        />
        <FormField
          label="City"
          required
          id={`${prefix}city`}
          placeholder="Auto-filled"
          error={errors[cityField]?.message || errors.city?.message}
          autoComplete="address-level2"
          {...register(cityField || 'city')}
        />
        <Select
          label="State"
          required
          id={`${prefix}state`}
          options={INDIAN_STATES}
          placeholder="Select state"
          error={errors[stateField]?.message || errors.state?.message}
          autoComplete="address-level1"
          {...register(stateField || 'state')}
        />
      </div>
      {pinLookup.error && (
        <ErrorMessage variant="warning">{pinLookup.error}</ErrorMessage>
      )}
    </div>
  );
}

export default function Step4Address({ isFirstStep, isLastStep, addToast }) {
  const formData     = useLoanStore((s) => s.formData);
  const setStepData  = useLoanStore((s) => s.setStepData);
  const goToNextStep = useLoanStore((s) => s.goToNextStep);
  const goToPrevStep = useLoanStore((s) => s.goToPrevStep);

  const { saveNow } = useAutoSave({ addToast });
  const pinLookup   = usePinCodeLookup();
  const saved = formData.step4 ?? {};

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getStep4Schema()),
    defaultValues: {
      addressLine1:    saved.addressLine1    ?? '',
      addressLine2:    saved.addressLine2    ?? '',
      pinCode:         saved.pinCode         ?? '',
      city:            saved.city            ?? '',
      state:           saved.state           ?? '',
      residenceType:   saved.residenceType   ?? '',
      monthlyRent:     saved.monthlyRent     ?? '',
      yearsAtAddress:  saved.yearsAtAddress  ?? '',
      sameAsPermanent: saved.sameAsPermanent ?? true,
      permAddressLine1: saved.permAddressLine1 ?? '',
      permAddressLine2: saved.permAddressLine2 ?? '',
      permPinCode:      saved.permPinCode      ?? '',
      permCity:         saved.permCity         ?? '',
      permState:        saved.permState        ?? '',
      prevAddressLine1: saved.prevAddressLine1 ?? '',
      prevAddressLine2: saved.prevAddressLine2 ?? '',
      prevPinCode:      saved.prevPinCode      ?? '',
      prevCity:         saved.prevCity         ?? '',
      prevState:        saved.prevState        ?? '',
    },
  });

  const residenceType   = watch('residenceType');
const yearsAtAddress  = watch('yearsAtAddress');
const sameAsPermanent = watch('sameAsPermanent');

const onSubmit = useCallback((data) => {
  console.log('Step 4 data:', data);
  setStepData(4, data);
  goToNextStep();
}, [setStepData, goToNextStep]);

const onError = useCallback((errs) => {
  console.log('Step 4 errors:', errs);
}, []);


  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <div className="space-y-6">

        {/* Current address */}
        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-4">Current Address</h2>
          <AddressBlock
            prefix=""
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            pinLookup={pinLookup}
          />
        </section>

        {/* Residence type */}
        <Select
          label="Residence Type"
          required
          id="residence-type"
          options={RESIDENCE_OPTIONS}
          placeholder="Select residence type"
          error={errors.residenceType?.message}
          {...register('residenceType')}
        />

        {residenceType === 'rented' && (
          <FormField
            label="Monthly Rent Amount"
            required
            id="monthly-rent"
            type="number"
            placeholder="Monthly rent in ₹"
            prefix="₹"
            error={errors.monthlyRent?.message}
            {...register('monthlyRent', { valueAsNumber: true })}
          />
        )}

        <FormField
          label="Years at Current Address"
          required
          id="years-at-address"
          type="number"
          placeholder="0"
          min={0}
          max={50}
          error={errors.yearsAtAddress?.message}
          helpText="Enter 0 if less than 1 year"
          {...register('yearsAtAddress', { valueAsNumber: true })}
        />

        {/* Previous address — shown when < 1 year */}
        {Number(yearsAtAddress) < 1 && yearsAtAddress !== '' && (
          <section className="anim-slide-up">
            <h2 className="text-base font-semibold text-neutral-800 mb-4">
              Previous Address
              <span className="text-xs font-normal text-neutral-500 ml-2">(Required — less than 1 year at current address)</span>
            </h2>
            <AddressBlock
              prefix="prev"
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              pinLookup={usePinCodeLookup()}
            />
          </section>
        )}

        {/* Same as permanent */}
        <Controller
          name="sameAsPermanent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="same-as-permanent"
              data-testid="same-as-permanent"
              label="Permanent address same as current address"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />

        {/* Permanent address — shown when not same */}
        {!sameAsPermanent && (
          <section className="anim-slide-up">
            <h2 className="text-base font-semibold text-neutral-800 mb-4">Permanent Address</h2>
            <AddressBlock
              prefix="perm"
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              pinLookup={usePinCodeLookup()}
            />
          </section>
        )}
      </div>

      <StepNavigation
        onNext={handleSubmit(onSubmit,  onError)}
        onPrev={goToPrevStep}
        onSaveDraft={saveNow}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </form>
  );
}