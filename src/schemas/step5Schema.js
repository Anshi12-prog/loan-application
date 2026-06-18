import { z } from 'zod';
import { validateGST } from '../utils/validators';

const addressSchema = z.object({
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional().or(z.literal('')),
  pinCode:      z.string().regex(/^[0-9]{6}$/, 'PIN code must be 6 digits'),
  city:         z.string().min(2, 'City is required'),
  state:        z.string().min(2, 'State is required'),
});

const salariedSchema = z.object({
  employmentType:    z.literal('salaried'),
  companyName:       z.string({ required_error: 'Company name is required' }).min(2, 'Company name is required'),
  designation:       z.string({ required_error: 'Designation is required' }).min(2, 'Designation is required'),
  monthlyNetSalary:  z.number({ required_error: 'Monthly salary is required' })
                      .min(15000, 'Minimum salary ₹15,000 required for loan eligibility'),
  yearsOfExperience: z.number().min(0).max(50),
});

const selfEmployedSchema = z.object({
  employmentType:  z.literal('selfEmployed'),
  businessName:    z.string({ required_error: 'Business name is required' }).min(2, 'Business name is required'),
  businessType:    z.string({ required_error: 'Business type is required' }).min(1, 'Please select a business type'),
  annualTurnover:  z.number({ required_error: 'Annual turnover is required' })
                    .min(300000, 'Minimum annual turnover ₹3,00,000 required'),
  yearsInBusiness: z.number({ required_error: 'Years in business is required' })
                    .min(2, 'Business must be at least 2 years old'),
  monthlyIncome:   z.number({ required_error: 'Monthly income is required' }).min(1, 'Monthly income is required'),
  officeAddress:   addressSchema,
});

const businessOwnerSchema = z.object({
  employmentType:  z.literal('businessOwner'),
  businessName:    z.string({ required_error: 'Business name is required' }).min(2, 'Business name is required'),
  businessType:    z.string({ required_error: 'Business type is required' }).min(1, 'Please select a business type'),
  annualTurnover:  z.number({ required_error: 'Annual turnover is required' })
                    .min(300000, 'Minimum annual turnover ₹3,00,000 required'),
  yearsInBusiness: z.number({ required_error: 'Years in business is required' })
                    .min(2, 'Business must be at least 2 years old'),
  monthlyIncome:   z.number({ required_error: 'Monthly income is required' }).min(1, 'Monthly income is required'),
  gstNumber: z.string({ required_error: 'GST number is required' })
              .superRefine((val, ctx) => {
                const result = validateGST(val);
                if (!result.valid) {
                  ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
                }
              }),
  officeAddress: addressSchema,
});

export function getStep5Schema(formData) {
  const loanType = formData?.step1?.loanType;

  const baseSchema = z.discriminatedUnion('employmentType', [
    salariedSchema,
    selfEmployedSchema,
    businessOwnerSchema,
  ]);

  if (loanType === 'business') {
    return baseSchema.superRefine((data, ctx) => {
      if (data.employmentType === 'salaried') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['employmentType'],
          message: 'Business loans require Self-Employed or Business Owner employment type',
        });
      }
    });
  }

  return baseSchema;
}