import { describe, it, expect } from 'vitest';
import {
  validateVerhoeff,
  validateAadhaar,
  validatePAN,
  validateGST,
} from '../utils/validators';

// ── Verhoeff checksum ─────────────────────────────────────────────
describe('validateVerhoeff', () => {
  it('returns true for a known valid Aadhaar number', () => {
    expect(validateVerhoeff('499118665120')).toBe(true);
  });

  it('returns false when last digit is wrong', () => {
    expect(validateVerhoeff('499118665121')).toBe(false);
  });

  it('returns false for all zeros', () => {
    expect(validateVerhoeff('000000000000')).toBe(false);
  });
});

// ── Aadhaar validation ────────────────────────────────────────────
describe('validateAadhaar', () => {
  it('accepts a known valid Aadhaar (499118665120)', () => {
    const result = validateAadhaar('499118665120');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('rejects Aadhaar with wrong checksum (499118665121)', () => {
    const result = validateAadhaar('499118665121');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects Aadhaar with only 11 digits', () => {
    const result = validateAadhaar('49911866512');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/12 digits/);
  });

  it('rejects Aadhaar with 13 digits', () => {
    const result = validateAadhaar('4991186651201');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/12 digits/);
  });

  it('rejects Aadhaar starting with 0', () => {
    const result = validateAadhaar('099118665120');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/0/);
  });

  it('rejects Aadhaar starting with 1', () => {
    const result = validateAadhaar('199118665120');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/1/);
  });

  it('strips spaces before validating', () => {
    // 4991 1866 5120 with spaces
    const result = validateAadhaar('4991 1866 5120');
    expect(result.valid).toBe(true);
  });

  it('rejects non-numeric characters', () => {
    const result = validateAadhaar('4991ABC65120');
    expect(result.valid).toBe(false);
  });
});

// ── PAN validation ────────────────────────────────────────────────
describe('validatePAN', () => {
  it('accepts ABCPE1234F for personal loan (P = Individual)', () => {
    const result = validatePAN('ABCPE1234F', 'personal');
    expect(result.valid).toBe(true);
    expect(result.entityType).toBe('P');
  });

  it('rejects ABCDE1234F — D is not a valid entity type', () => {
    const result = validatePAN('ABCDE1234F', 'personal');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/D/);
    expect(result.error).toMatch(/not a valid entity type/);
  });

  it('rejects ABCCE1234F for personal loan — Company PAN not valid', () => {
    const result = validatePAN('ABCCE1234F', 'personal');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('accepts ABCCE1234F for business loan (C = Company)', () => {
    const result = validatePAN('ABCCE1234F', 'business');
    expect(result.valid).toBe(true);
  });

  it('rejects PAN shorter than 10 chars', () => {
    const result = validatePAN('ABCPE123', 'personal');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/10 characters/);
  });

  it('rejects PAN longer than 10 chars', () => {
    const result = validatePAN('ABCPE1234FX', 'personal');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/10 characters/);
  });

  it('rejects wrong format (digits in wrong position)', () => {
    const result = validatePAN('1BCPE1234F', 'personal');
    expect(result.valid).toBe(false);
  });

  it('is case-insensitive — accepts lowercase', () => {
    const result = validatePAN('abcpe1234f', 'personal');
    expect(result.valid).toBe(true);
  });

  it('requires PAN to be provided', () => {
    const result = validatePAN('', 'personal');
    expect(result.valid).toBe(false);
  });

  it('entity type error message contains specific character', () => {
    const result = validatePAN('ABCEE1234F', 'personal');
    expect(result.error).toContain("'E'");
    expect(result.error).toContain('P (Individual)');
  });
});

// ── GST validation ────────────────────────────────────────────────
describe('validateGST', () => {
  it('rejects GST shorter than 15 chars', () => {
    const result = validateGST('29ABCPE1234F1Z');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/15 characters/);
  });

  it('rejects invalid state code 00', () => {
    const result = validateGST('00ABCPE1234F1Z5');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/state code/i);
  });

  it('rejects invalid state code 38', () => {
    const result = validateGST('38ABCPE1234F1Z5');
    expect(result.valid).toBe(false);
  });

  it('rejects GST where 14th char is not Z', () => {
    const result = validateGST('29ABCPE1234F1A5');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Z/);
  });

  it('requires GST to be provided', () => {
    const result = validateGST('');
    expect(result.valid).toBe(false);
  });
});