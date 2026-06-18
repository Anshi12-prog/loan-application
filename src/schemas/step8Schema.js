import { z } from 'zod';
import { calculateEMI } from '../utils/emiCalculator';

export function getStep8Schema(formData) {
  const loanType     = formData?.step1?.loanType ?? 'personal';
  const loanAmount   = Number(formData?.step1?.loanAmount ?? 0);
  const loanTenure   = Number(formData?.step1?.loanTenure ?? 0);
  const income       = Number(formData?.step5?.monthlyNetSalary
                          ?? formData?.step5?.monthlyIncome ?? 0);
  const coIncome     = Number(formData?.step6?.coApplicantIncome ?? 0);
  const totalIncome  = income + coIncome;
  const emi          = calculateEMI(loanAmount, loanTenure, loanType);
  const emiRatio     = totalIncome > 0 ? emi / totalIncome : 0;
  const highEMI      = emiRatio > 0.5;

  return z.object({
    consent1: z
      .boolean({ required_error: 'Please confirm information accuracy' })
      .refine((v) => v === true, { message: 'Please confirm all information is accurate' }),

    consent2: z
      .boolean({ required_error: 'Credit bureau authorisation required' })
      .refine((v) => v === true, { message: 'Please authorise the credit bureau check' }),

    consent3: z
      .boolean({ required_error: 'Terms and Conditions acceptance required' })
      .refine((v) => v === true, { message: 'Please accept the Terms and Conditions' }),

    consent4: z
      .boolean({ required_error: 'Communication consent required' })
      .refine((v) => v === true, { message: 'Please provide communication consent' }),

    highEMIConsent: highEMI
      ? z.boolean().refine((v) => v === true, {
          message: 'Please acknowledge that your EMI exceeds 50% of income',
        })
      : z.boolean().optional(),
  });
}