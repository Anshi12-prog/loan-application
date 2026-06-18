import { useState, useCallback } from 'react';
import PIN_CODE_DATA from '../utils/pinCodeData';

/**
 * usePinCodeLookup — simulates PIN code API lookup.
 *
 * Returns { lookup, result, isLoading, error, reset }
 *
 * lookup(pinCode) — call this on blur of PIN code field
 *   - validates 6 digits
 *   - simulates 300ms network delay
 *   - returns { city, state, postOffice } or sets error
 */
export default function usePinCodeLookup() {
  const [result, setResult]     = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);

  const lookup = useCallback(async (pinCode) => {
    const clean = String(pinCode ?? '').replace(/\D/g, '');

    // Reset previous result
    setResult(null);
    setError(null);

    if (!clean) return null;

    if (clean.length !== 6) {
      setError('PIN code must be exactly 6 digits');
      return null;
    }

    setLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const found = PIN_CODE_DATA[clean];
    setLoading(false);

    if (!found) {
      setError('PIN code not found. Please enter city and state manually.');
      return null;
    }

    setResult(found);
    setError(null);
    return found;
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { lookup, result, isLoading, error, reset };
}