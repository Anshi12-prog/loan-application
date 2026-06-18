import { useCallback } from 'react';
import useLoanStore from '../store/loanStore';
import { validatePAN, validateAadhaar } from '../utils/validators';

/**
 * useVerification — simulates PAN and Aadhaar verification API calls.
 *
 * On blur:
 *   - If format invalid: immediately set status 'failed' with specific error
 *   - If format valid: set status 'verifying', wait 1500ms, set 'verified'
 *
 * Returns { verify, resetVerification }
 */
export default function useVerification() {
  const setVerificationStatus = useLoanStore((s) => s.setVerificationStatus);

  const verify = useCallback(async (value, type, loanType) => {
    if (!value) return { valid: false, error: `${type === 'pan' ? 'PAN' : 'Aadhaar'} is required` };

    // Run format validation immediately
    const result = type === 'pan'
      ? validatePAN(value, loanType)
      : validateAadhaar(value);

    if (!result.valid) {
      setVerificationStatus(
        type === 'pan' ? 'pan' : 'aadhaar',
        'failed',
      );
      return result;
    }

    // Format valid — simulate API call
    setVerificationStatus(
      type === 'pan' ? 'pan' : 'aadhaar',
      'verifying',
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setVerificationStatus(
      type === 'pan' ? 'pan' : 'aadhaar',
      'verified',
    );

    return { valid: true, error: null };
  }, [setVerificationStatus]);

  const verifyCoApplicantPAN = useCallback(async (value, loanType) => {
    if (!value) return { valid: false, error: 'Co-applicant PAN is required' };

    const result = validatePAN(value, loanType);

    if (!result.valid) {
      setVerificationStatus('coApplicantPan', 'failed');
      return result;
    }

    setVerificationStatus('coApplicantPan', 'verifying');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setVerificationStatus('coApplicantPan', 'verified');

    return { valid: true, error: null };
  }, [setVerificationStatus]);

  const resetVerification = useCallback((field) => {
    setVerificationStatus(field, 'idle');
  }, [setVerificationStatus]);

  return { verify, verifyCoApplicantPAN, resetVerification };
}