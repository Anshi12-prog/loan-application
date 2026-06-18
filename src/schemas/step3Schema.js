import { z } from 'zod';
import { validatePAN, validateAadhaar } from '../utils/validators';

export function getStep3Schema(formData) {
  const loanType = formData?.step1?.loanType ?? 'personal';
  const loanAmount = Number(formData?.step1?.loanAmount ?? 0);
  const showPassport = loanType === 'home' && loanAmount > 5000000;

  return z.object({
    panNumber: z
      .string({ required_error: 'PAN number is required' })
      .min(1, 'PAN number is required')
      .superRefine((val, ctx) => {
        const result = validatePAN(val, loanType);
        if (!result.valid) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
        }
      }),

    aadhaarNumber: z
      .string({ required_error: 'Aadhaar number is required' })
      .min(1, 'Aadhaar number is required')
      .superRefine((val, ctx) => {
        const clean  = val.replace(/\s/g, '');
        const result = validateAadhaar(clean);
        if (!result.valid) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
        }
      }),

    aadhaarConsent: z
      .boolean({ required_error: 'Aadhaar consent is required' })
      .refine((v) => v === true, {
        message: 'You must consent to Aadhaar verification to proceed',
      }),

    voterID: z
      .string()
      .regex(/^[A-Z]{3}[0-9]{7}$/, 'Voter ID must be 3 letters followed by 7 digits')
      .optional()
      .or(z.literal('')),

    passport: showPassport
      ? z
          .string()
          .regex(/^[A-Z][0-9]{7}$/, 'Passport must be 1 letter followed by 7 digits')
          .optional()
          .or(z.literal(''))
      : z.string().optional().or(z.literal('')),
  });
}