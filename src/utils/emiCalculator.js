// ─── Interest rates by loan type (fixed for simulation) ──────────
const RATES = {
  personal: 10.5,
  home:     8.5,
  business: 14.0,
};

/**
 * calculateEMI — reducing balance EMI formula.
 * EMI = P × r × (1+r)^n / ((1+r)^n – 1)
 *
 * @param {number} principal    — loan amount in ₹
 * @param {number} tenureMonths — loan tenure in months
 * @param {'personal'|'home'|'business'} loanType
 * @returns {number} — EMI rounded to nearest rupee
 */
export function calculateEMI(principal, tenureMonths, loanType) {
  const P = Number(principal);
  const n = Number(tenureMonths);
  const annualRate = RATES[loanType] ?? 10.5;
  const r = annualRate / 12 / 100;

  if (!P || !n || P <= 0 || n <= 0) return 0;
  if (r === 0) return Math.round(P / n);

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * calculateProcessingFee — 1% of principal.
 * Minimum ₹2,000. Maximum ₹25,000.
 *
 * @param {number} principal
 * @returns {number}
 */
export function calculateProcessingFee(principal) {
  const fee = Number(principal) * 0.01;
  return Math.min(Math.max(Math.round(fee), 2000), 25000);
}

/**
 * calculateTotalCost — total interest paid over tenure.
 * Total Cost = (EMI × n) – Principal
 *
 * @param {number} emi
 * @param {number} tenureMonths
 * @param {number} principal
 * @returns {number}
 */
export function calculateTotalCost(emi, tenureMonths, principal) {
  return Math.round((emi * tenureMonths) - principal);
}

/**
 * getInterestRate — returns the annual interest rate for a loan type.
 *
 * @param {'personal'|'home'|'business'} loanType
 * @returns {number}
 */
export function getInterestRate(loanType) {
  return RATES[loanType] ?? 10.5;
}
