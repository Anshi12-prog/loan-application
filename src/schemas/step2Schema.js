import { z } from 'zod';

const NAME_REGEX = /^[A-Za-z\s.'-]{2,100}$/;

function calculateAge(dobString) {
  if (!dobString) return null;
  const dob   = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function getStep2Schema() {
  return z.object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .regex(NAME_REGEX, 'Name must contain only letters, spaces, hyphens, or apostrophes'),

    dateOfBirth: z
      .string({ required_error: 'Date of birth is required' })
      .min(1, 'Date of birth is required')
      .superRefine((val, ctx) => {
        const age = calculateAge(val);
        if (age === null) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid date of birth' });
          return;
        }
        if (age < 21) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Must be at least 21 years old to apply (current age: ${age} years)`,
          });
        }
        if (age > 65) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Must be below 65 years of age (current age: ${age} years)`,
          });
        }
      }),

    gender: z.enum(['male', 'female', 'other'], {
      required_error: 'Please select your gender',
    }),

    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
      required_error: 'Please select your marital status',
    }),

    fatherName: z
      .string({ required_error: "Father's name is required" })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .regex(NAME_REGEX, 'Name must contain only letters and spaces'),

    motherName: z
      .string({ required_error: "Mother's name is required" })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .regex(NAME_REGEX, 'Name must contain only letters and spaces'),

    email: z
      .string({ required_error: 'Email is required' })
      .email('Please enter a valid email address'),

    mobile: z
      .string({ required_error: 'Mobile number is required' })
      .regex(
        /^[6-9][0-9]{9}$/,
        'Mobile must be 10 digits starting with 6, 7, 8, or 9',
      ),

    alternateMobile: z
      .string()
      .regex(/^[6-9][0-9]{9}$/, 'Alternate mobile must be 10 digits starting with 6, 7, 8, or 9')
      .optional()
      .or(z.literal('')),

  }).superRefine((data, ctx) => {
    if (
      data.alternateMobile &&
      data.alternateMobile.length > 0 &&
      data.alternateMobile === data.mobile
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobile'],
        message: 'Alternate mobile must be different from primary mobile',
      });
    }
  });
}