/**
 * formatIndianNumber — Indian number system formatting.
 * 100000  → "1,00,000"
 * 1000000 → "10,00,000"
 *
 * @param {number} num
 * @returns {string}
 */
export function formatIndianNumber(num) {
  if (num === null || num === undefined || num === '') return '';
  const n = Math.round(Number(num));
  if (Number.isNaN(n)) return '';
  return n.toLocaleString('en-IN');
}

/**
 * formatINR — formats number as Indian Rupees.
 * 100000 → "₹1,00,000"
 *
 * @param {number} num
 * @returns {string}
 */
export function formatINR(num) {
  if (num === null || num === undefined || num === '') return '';
  return `₹${formatIndianNumber(num)}`;
}

/**
 * getAmountLabel — human readable Indian amount label.
 * 100000   → "1 Lakh"
 * 500000   → "5 Lakh"
 * 1000000  → "10 Lakh"
 * 10000000 → "1 Crore"
 *
 * @param {number} num
 * @returns {string}
 */
export function getAmountLabel(num) {
  if (!num || Number.isNaN(Number(num))) return '';
  const n = Number(num);
  if (n >= 10000000) {
    const val = n / 10000000;
    return `${val % 1 === 0 ? val : val.toFixed(2)} Crore`;
  }
  if (n >= 100000) {
    const val = n / 100000;
    return `${val % 1 === 0 ? val : val.toFixed(2)} Lakh`;
  }
  if (n >= 1000) {
    const val = n / 1000;
    return `${val % 1 === 0 ? val : val.toFixed(1)}K`;
  }
  return String(n);
}

/**
 * formatDate — formats ISO date string to Indian format.
 * "1990-05-15" → "15 May 1990"
 *
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * maskValue — masks all but the last 4 characters.
 * "ABCPE1234F" → "••••••1234F" (wait, PAN has 10)
 * Actually shows last 4 only.
 *
 * @param {string} value
 * @param {number} visibleChars — how many chars to show at end
 * @returns {string}
 */
export function maskValue(value, visibleChars = 4) {
  if (!value) return '';
  const str = String(value);
  if (str.length <= visibleChars) return str;
  return '•'.repeat(str.length - visibleChars) + str.slice(-visibleChars);
}
