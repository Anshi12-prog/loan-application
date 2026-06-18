import { describe, it, expect } from 'vitest';
import {
  calculateEMI,
  calculateProcessingFee,
  calculateTotalCost,
  getInterestRate,
} from '../utils/emiCalculator';

describe('calculateEMI', () => {
  it('calculates personal loan EMI correctly', () => {
    // P=500000, r=10.5/12/100=0.00875, n=36
    const emi = calculateEMI(500000, 36, 'personal');
    // Expected ≈ 16240
    expect(emi).toBeGreaterThan(16000);
    expect(emi).toBeLessThan(16500);
  });

  it('calculates home loan EMI correctly', () => {
    // P=1000000, r=8.5/12/100, n=60
    const emi = calculateEMI(1000000, 60, 'home');
    expect(emi).toBeGreaterThan(20000);
    expect(emi).toBeLessThan(21000);
  });

  it('calculates business loan EMI correctly', () => {
    const emi = calculateEMI(500000, 24, 'business');
    expect(emi).toBeGreaterThan(23000);
    expect(emi).toBeLessThan(25000);
  });

  it('returns 0 for zero principal', () => {
    expect(calculateEMI(0, 36, 'personal')).toBe(0);
  });

  it('returns 0 for zero tenure', () => {
    expect(calculateEMI(500000, 0, 'personal')).toBe(0);
  });

  it('returns a rounded integer (no decimals)', () => {
    const emi = calculateEMI(300000, 24, 'personal');
    expect(Number.isInteger(emi)).toBe(true);
  });

  it('defaults to personal rate for unknown loan type', () => {
    const emiPersonal = calculateEMI(500000, 36, 'personal');
    const emiUnknown  = calculateEMI(500000, 36, 'unknown');
    expect(emiPersonal).toBe(emiUnknown);
  });
});

describe('calculateProcessingFee', () => {
  it('returns minimum ₹2000 for small loans', () => {
    expect(calculateProcessingFee(100000)).toBe(2000);
  });

  it('returns 1% for mid-range loans', () => {
    expect(calculateProcessingFee(500000)).toBe(5000);
  });

  it('returns 1% for ₹10,00,000', () => {
    expect(calculateProcessingFee(1000000)).toBe(10000);
  });

  it('returns maximum ₹25000 for large loans', () => {
    expect(calculateProcessingFee(5000000)).toBe(25000);
  });

  it('caps at ₹25000 even for very large amounts', () => {
    expect(calculateProcessingFee(10000000)).toBe(25000);
  });
});

describe('calculateTotalCost', () => {
  it('returns (EMI × tenure) − principal', () => {
    const emi     = calculateEMI(500000, 36, 'personal');
    const total   = calculateTotalCost(emi, 36, 500000);
    expect(total).toBe((emi * 36) - 500000);
    expect(total).toBeGreaterThan(0);
  });
});

describe('getInterestRate', () => {
  it('returns 10.5 for personal', () => {
    expect(getInterestRate('personal')).toBe(10.5);
  });
  it('returns 8.5 for home', () => {
    expect(getInterestRate('home')).toBe(8.5);
  });
  it('returns 14 for business', () => {
    expect(getInterestRate('business')).toBe(14.0);
  });
});