import { z } from 'zod';

const addressBlock = z.object({
  addressLine1: z
    .string({ required_error: 'Address is required' })
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be at most 200 characters'),

  addressLine2: z.string().optional().or(z.literal('')),

  pinCode: z
    .string({ required_error: 'PIN code is required' })
    .regex(/^[0-9]{6}$/, 'PIN code must be exactly 6 digits'),

  city: z
    .string({ required_error: 'City is required' })
    .min(2, 'City must be at least 2 characters'),

  state: z
    .string({ required_error: 'State is required' })
    .min(2, 'State must be at least 2 characters'),
});

export function getStep4Schema() {
  return z
    .object({
      // Current address
      addressLine1:    addressBlock.shape.addressLine1,
      addressLine2:    addressBlock.shape.addressLine2,
      pinCode:         addressBlock.shape.pinCode,
      city:            addressBlock.shape.city,
      state:           addressBlock.shape.state,

      residenceType: z.enum(
        ['owned', 'rented', 'company', 'family'],
        { required_error: 'Please select your residence type' },
      ),

      monthlyRent: z.any().optional().transform((val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        return Number(val);
      }),

      yearsAtAddress: z
        .number({ required_error: 'Years at address is required' })
        .min(0, 'Cannot be negative')
        .max(50, 'Please enter a valid number of years'),

      // Previous address (shown when yearsAtAddress < 1)
      prevAddressLine1: z.string().optional().or(z.literal('')),
      prevAddressLine2: z.string().optional().or(z.literal('')),
      prevPinCode:      z.string().optional().or(z.literal('')),
      prevCity:         z.string().optional().or(z.literal('')),
      prevState:        z.string().optional().or(z.literal('')),

      // Permanent address
      sameAsPermanent:  z.boolean().default(true),
      permAddressLine1: z.string().optional().or(z.literal('')),
      permAddressLine2: z.string().optional().or(z.literal('')),
      permPinCode:      z.string().optional().or(z.literal('')),
      permCity:         z.string().optional().or(z.literal('')),
      permState:        z.string().optional().or(z.literal('')),
    })
    .superRefine((data, ctx) => {
      // Rent required when rented
      if (data.residenceType === 'rented' && !data.monthlyRent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['monthlyRent'],
          message: 'Monthly rent amount is required',
        });
      }

      // Previous address required when less than 1 year at current
      if (data.yearsAtAddress < 1) {
        if (!data.prevAddressLine1 || data.prevAddressLine1.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['prevAddressLine1'],
            message: 'Previous address is required when less than 1 year at current address',
          });
        }
        if (!data.prevPinCode || !/^[0-9]{6}$/.test(data.prevPinCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['prevPinCode'],
            message: 'Previous PIN code is required',
          });
        }
        if (!data.prevCity) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['prevCity'],
            message: 'Previous city is required',
          });
        }
        if (!data.prevState) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['prevState'],
            message: 'Previous state is required',
          });
        }
      }

      // Permanent address required when not same as current
      if (!data.sameAsPermanent) {
        if (!data.permAddressLine1 || data.permAddressLine1.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permAddressLine1'],
            message: 'Permanent address is required',
          });
        }
        if (!data.permPinCode || !/^[0-9]{6}$/.test(data.permPinCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permPinCode'],
            message: 'Permanent PIN code is required',
          });
        }
        if (!data.permCity) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permCity'],
            message: 'Permanent city is required',
          });
        }
        if (!data.permState) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permState'],
            message: 'Permanent state is required',
          });
        }
      }
    });
}