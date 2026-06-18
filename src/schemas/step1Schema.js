import { z } from 'zod';

const LOAN_PURPOSES = {
  personal: ['Medical', 'Education', 'Travel', 'Wedding', 'Home Renovation', 'Debt Consolidation', 'Other'],
  home:     ['Purchase', 'Construction', 'Renovation', 'Plot Purchase', 'Balance Transfer'],
  business: ['Working Capital', 'Equipment Purchase', 'Business Expansion', 'Inventory', 'Other'],
};

const TENURE_RANGES = {
  personal: { min: 12,  max: 360  },
  home:     { min: 60,  max: 360  },
  business: { min: 12,  max: 120  },
};

const AMOUNT_LIMITS = {
  personal: { min: 50000,   max: 1000000  },
  home:     { min: 500000,  max: 10000000 },
  business: { min: 50000,   max: 5000000  },
};

/**
 * getStep1Schema — returns Zod schema for Step 1.
 * Accepts formData so it can apply the DOB cross-step rule.
 *
 * @param {object} formData — full store formData
 */
export function getStep1Schema(formData) {
  const dob = formData?.step2?.dateOfBirth;

  return z.object({
    loanType: z.enum(['personal', 'home', 'business'], {
      required_error: 'Please select a loan type',
      invalid_type_error: 'Please select a valid loan type',
    }),

    loanAmount: z
      .number({
        required_error: 'Loan amount is required',
        invalid_type_error: 'Please enter a valid loan amount',
      })
      .min(50000, 'Minimum loan amount is ₹50,000'),

    loanTenure: z
      .number({
        required_error: 'Loan tenure is required',
        invalid_type_error: 'Please select a valid tenure',
      })
      .min(1, 'Tenure must be at least 1 month'),

    loanPurpose: z
      .string({ required_error: 'Please select a loan purpose' })
      .min(1, 'Please select a loan purpose'),

    referralCode: z
      .string()
      .regex(/^[A-Za-z0-9]{6,10}$/, 'Referral code must be 6–10 alphanumeric characters')
      .optional()
      .or(z.literal('')),

  }).superRefine((data, ctx) => {
    const { loanType, loanAmount, loanTenure } = data;
    if (!loanType) return;

    // Amount limits by loan type
    const limits = AMOUNT_LIMITS[loanType];
    if (limits && loanAmount > limits.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: limits.max,
        type: 'number',
        inclusive: true,
        path: ['loanAmount'],
        message: loanType === 'personal'
          ? 'Personal loans maximum ₹10,00,000'
          : loanType === 'home'
            ? 'Home loans maximum ₹1,00,00,000'
            : 'Business loans maximum ₹50,00,000',
      });
    }

    // Tenure ranges by loan type
    const range = TENURE_RANGES[loanType];
    if (range) {
      if (loanTenure < range.min) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: range.min,
          type: 'number',
          inclusive: true,
          path: ['loanTenure'],
          message: `Minimum tenure for ${loanType} loans is ${range.min} months`,
        });
      }
      if (loanTenure > range.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: range.max,
          type: 'number',
          inclusive: true,
          path: ['loanTenure'],
          message: `Maximum tenure for ${loanType} loans is ${range.max} months`,
        });
      }
    }

    // Cross-step: age + tenure must not exceed 65 years
    if (dob && loanTenure) {
      const birthDate  = new Date(dob);
      const today      = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age -= 1;

      const tenureYears    = loanTenure / 12;
      const ageAtMaturity  = age + tenureYears;

      if (ageAtMaturity > 65) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenure'],
          message: `Loan tenure would make you ${Math.ceil(ageAtMaturity)} at maturity. Maximum age at maturity is 65 years.`,
        });
      }
    }

    // Purpose must be valid for selected loan type
    if (loanType && data.loanPurpose) {
      const validPurposes = LOAN_PURPOSES[loanType] ?? [];
      if (validPurposes.length > 0 && !validPurposes.includes(data.loanPurpose)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanPurpose'],
          message: 'Please select a valid purpose for your loan type',
        });
      }
    }
  });
}

export { LOAN_PURPOSES, TENURE_RANGES, AMOUNT_LIMITS };