const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const VERHOEFF_INV = [0, 4, 3, 2, 1, 9, 8, 7, 6, 5];

const PAN_ENTITY_MAP = {
  P: 'Individual',
  C: 'Company',
  H: 'HUF',
  A: 'AOP',
  B: 'BOI',
  G: 'Government',
  J: 'Juridical',
  L: 'Local Authority',
  F: 'Firm',
  T: 'Trust',
};

const INVALID_ENTITY_TYPE_MESSAGE = (char) =>
  `PAN 4th character '${char}' is not a valid entity type. Must be P (Individual), C (Company), H (HUF), A (AOP), B (BOI), G (Government), J (Juridical), L (Local Authority), F (Firm), or T (Trust)`;

const GST_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function validateVerhoeff(num) {
  const digits = String(num).replace(/\D/g, '');
  if (!digits) return false;

  let checksum = 0;
  const reversed = digits.split('').reverse().map(Number);

  for (let i = 0; i < reversed.length; i += 1) {
    checksum = VERHOEFF_D[checksum][VERHOEFF_P[i % 8][reversed[i]]];
  }

  return checksum === 0;
}

export function validateAadhaar(aadhaar) {
  const normalized = String(aadhaar ?? '').replace(/\s+/g, '');

  if (!/^\d+$/.test(normalized)) {
    return { valid: false, error: 'Aadhaar must contain only digits' };
  }

  if (normalized.length < 12) {
    return { valid: false, error: `Aadhaar must be exactly 12 digits (received ${normalized.length})` };
  }

  if (normalized.length > 12) {
    return { valid: false, error: `Aadhaar must be exactly 12 digits (received ${normalized.length})` };
  }

  if (/^0/.test(normalized)) {
    return { valid: false, error: 'Aadhaar cannot start with 0' };
  }

  if (/^1/.test(normalized)) {
    return { valid: false, error: 'Aadhaar cannot start with 1' };
  }

  if (!validateVerhoeff(normalized)) {
    return { valid: false, error: 'Aadhaar checksum validation failed' };
  }

  return { valid: true, error: null };
}

export function validatePAN(pan, loanType) {
  if (!pan) {
    return { valid: false, error: 'PAN is required', entityType: null };
  }

  const normalized = String(pan).toUpperCase().trim();

  if (normalized.length < 10) {
    return {
      valid: false,
      error: `PAN must be exactly 10 characters (received ${normalized.length})`,
      entityType: null,
    };
  }

  if (normalized.length > 10) {
    return {
      valid: false,
      error: `PAN must be exactly 10 characters (received ${normalized.length})`,
      entityType: null,
    };
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalized)) {
    return {
      valid: false,
      error: 'PAN format invalid. Expected AAAAA9999A',
      entityType: null,
    };
  }

  const fourthChar = normalized[3];
  const entityType = PAN_ENTITY_MAP[fourthChar];

  if (!entityType) {
    return {
      valid: false,
      error: INVALID_ENTITY_TYPE_MESSAGE(fourthChar),
      entityType: null,
    };
  }

  if (loanType === 'personal' || loanType === 'home') {
    if (fourthChar !== 'P') {
      return {
        valid: false,
        error: 'PAN entity must be P (Individual) for personal/home loans',
        entityType,
      };
    }
  }

  if (loanType === 'business') {
    if (!['P', 'C', 'F'].includes(fourthChar)) {
      return {
        valid: false,
        error: 'Business loans accept PAN entity types P, C or F only',
        entityType,
      };
    }
  }

  return { valid: true, error: null, entityType };
}

function validateGSTChecksum(gstin) {
  let factor = 2;
  let sum = 0;
  const mod = 36;

  for (let i = 13; i >= 0; i -= 1) {
    const codePoint = GST_CHARSET.indexOf(gstin[i]);
    if (codePoint === -1) return false;

    let addend = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / mod) + (addend % mod);
    sum += addend;
  }

  const expectedCodePoint = (mod - (sum % mod)) % mod;
  return GST_CHARSET[expectedCodePoint] === gstin[14];
}

export function validateGST(gst) {
  if (!gst) {
    return { valid: false, error: 'GSTIN is required' };
  }

  const normalized = String(gst).toUpperCase().trim();

  if (normalized.length !== 15) {
    return { valid: false, error: 'GST must be exactly 15 characters' };
  }

  const stateCode = Number(normalized.slice(0, 2));
  if (Number.isNaN(stateCode) || stateCode < 1 || stateCode > 37) {
    return { valid: false, error: 'GST state code must be between 01 and 37' };
  }

  const embeddedPan = normalized.slice(2, 12);
  const panResult = validatePAN(embeddedPan);
  if (!panResult.valid) {
    return { valid: false, error: 'GST contains invalid PAN in characters 3-12' };
  }

  const entityNumber = normalized[12];
  if (!/^[1-9A-Z]$/.test(entityNumber)) {
    return { valid: false, error: 'GST 13th character must be 1-9 or A-Z' };
  }

  if (normalized[13] !== 'Z') {
    return { valid: false, error: "GST 14th character must be 'Z'" };
  }

  if (!/^[0-9A-Z]$/.test(normalized[14])) {
    return { valid: false, error: 'GST checksum character is invalid' };
  }

  if (!validateGSTChecksum(normalized)) {
    return { valid: false, error: 'GST checksum validation failed' };
  }

  return { valid: true, error: null };
}

export { VERHOEFF_D, VERHOEFF_P, VERHOEFF_INV };
