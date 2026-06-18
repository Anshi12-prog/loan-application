import { getStep1Schema } from './step1Schema';
import { getStep2Schema } from './step2Schema';
import { getStep3Schema } from './step3Schema';
import { getStep4Schema } from './step4Schema';
import { getStep5Schema } from './step5Schema';
import { getStep6Schema } from './step6Schema';
import { getStep7Schema } from './step7Schema';
import { getStep8Schema } from './step8Schema';

/**
 * getSchemaForStep — returns the correct Zod schema for any step.
 * Passes formData and verificationStatus for cross-step validation.
 *
 * @param {number} stepNumber
 * @param {object} formData
 * @param {object} verificationStatus
 */
export function getSchemaForStep(stepNumber, formData, verificationStatus) {
  switch (stepNumber) {
    case 1: return getStep1Schema(formData);
    case 2: return getStep2Schema();
    case 3: return getStep3Schema(formData);
    case 4: return getStep4Schema();
    case 5: return getStep5Schema(formData);
    case 6: return getStep6Schema(formData);
    case 7: return getStep7Schema(formData, verificationStatus);
    case 8: return getStep8Schema(formData);
    default: throw new Error(`No schema defined for step ${stepNumber}`);
  }
}