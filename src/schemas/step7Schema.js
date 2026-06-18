import { z } from 'zod';

export function getStep7Schema(formData, verificationStatus) {
  const loanType       = formData?.step1?.loanType ?? 'personal';
  const employmentType = formData?.step5?.employmentType ?? 'salaried';
  const panVerified    = verificationStatus?.pan === 'verified';

  return z.object({
    panCard:        panVerified
                      ? z.any().optional()
                      : z.any({ required_error: 'PAN card copy is required' })
                          .refine((v) => v !== null && v !== undefined, 'PAN card copy is required'),

    aadhaarFront:   z.any({ required_error: 'Aadhaar front is required' })
                     .refine((v) => v !== null && v !== undefined, 'Aadhaar card front is required'),

    aadhaarBack:    z.any({ required_error: 'Aadhaar back is required' })
                     .refine((v) => v !== null && v !== undefined, 'Aadhaar card back is required'),

    bankStatements: z.any({ required_error: 'Bank statements are required' })
                     .refine((v) => v !== null && v !== undefined, 'Bank statements (last 6 months) are required'),

    photograph:     z.any({ required_error: 'Photograph is required' })
                     .refine((v) => v !== null && v !== undefined, 'Passport-size photograph is required'),

    salarySlips:    employmentType === 'salaried'
                      ? z.any().refine((v) => v !== null && v !== undefined, 'Salary slips (last 3 months) are required')
                      : z.any().optional(),

    itr:            ['selfEmployed', 'businessOwner'].includes(employmentType)
                      ? z.any().refine((v) => v !== null && v !== undefined, 'ITR (last 2 years) is required')
                      : z.any().optional(),

    propertyDocuments: loanType === 'home'
                         ? z.any().refine((v) => v !== null && v !== undefined, 'Property documents are required')
                         : z.any().optional(),

    businessRegistration: loanType === 'business'
                            ? z.any().refine((v) => v !== null && v !== undefined, 'Business registration certificate is required')
                            : z.any().optional(),

    gstReturns:     loanType === 'business'
                      ? z.any().refine((v) => v !== null && v !== undefined, 'GST returns (last 4 quarters) are required')
                      : z.any().optional(),

    signature:      z.string({ required_error: 'E-signature is required' })
                     .min(1, 'Please capture your signature before proceeding'),
  });
}