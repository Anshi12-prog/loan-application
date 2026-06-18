import { z } from 'zod';
import { validatePAN } from '../utils/validators';

export function getStep6Schema(formData) {
  const loanType      = formData?.step1?.loanType ?? 'personal';
  const maritalStatus = formData?.step2?.maritalStatus;

  const relationshipOptions = ['parent', 'sibling', 'businessPartner'];
  if (maritalStatus === 'married') {
    relationshipOptions.unshift('spouse');
  }

  return z.object({
    coApplicantName: z
      .string({ required_error: 'Co-applicant name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),

    relationship: z
      .string({ required_error: 'Relationship is required' })
      .refine(
        (val) => relationshipOptions.includes(val),
        { message: 'Please select a valid relationship' },
      ),

    coApplicantPAN: z
      .string({ required_error: 'Co-applicant PAN is required' })
      .superRefine((val, ctx) => {
        const result = validatePAN(val, loanType);
        if (!result.valid) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
        }
      }),

    coApplicantIncome: z
      .number({ required_error: 'Co-applicant income is required' })
      .min(1, 'Co-applicant income is required'),

    coApplicantConsent: z
      .boolean({ required_error: 'Co-applicant consent is required' })
      .refine((v) => v === true, {
        message: 'Co-applicant must consent to be jointly liable for this loan',
      }),
  });
}