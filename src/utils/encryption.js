const PASSPHRASE = 'lendswift-autosave-2024';
const SALT       = 'lendswift-salt-2024';
const ITERATIONS = 100000;
const KEY_LENGTH = 256;

// ── Internal helpers ──────────────────────────────────────────────

async function deriveKey() {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(SALT),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

// ── Public API ────────────────────────────────────────────────────

/**
 * encrypt — AES-256-GCM encrypt any serialisable object.
 * Returns { iv: number[], data: number[] }
 */
export async function encrypt(obj) {
  const key       = await deriveKey();
  const iv        = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded   = new TextEncoder().encode(JSON.stringify(obj));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  );
  return {
    iv:   Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  };
}

/**
 * decrypt — AES-256-GCM decrypt a payload from encrypt().
 * Returns the original object, or throws on failure.
 */
export async function decrypt(payload) {
  if (!payload?.iv || !payload?.data) throw new Error('Invalid payload');
  const key       = await deriveKey();
  const iv        = new Uint8Array(payload.iv);
  const data      = new Uint8Array(payload.data);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

/**
 * saveToLocalStorage — encrypt and save data + metadata.
 *
 * @param {string} key       — localStorage key
 * @param {object} data      — the form state to save
 * @param {object} metadata  — { version, timestamp, step, loanType }
 */
export async function saveToLocalStorage(key, data, metadata) {
  const payload   = await encrypt({ data, metadata });
  const metaKey   = `${key}_meta`;
  localStorage.setItem(key, JSON.stringify(payload));
  localStorage.setItem(metaKey, JSON.stringify(metadata));
}

/**
 * loadFromLocalStorage — load and decrypt saved state.
 * Returns { data, metadata } or null if not found / corrupted.
 *
 * @param {string} key
 */
export async function loadFromLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const payload   = JSON.parse(raw);
    const decrypted = await decrypt(payload);
    return decrypted;
  } catch {
    // Corrupted — clean up
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_meta`);
    return null;
  }
}

/**
 * isExpired — returns true if timestamp is older than hoursLimit.
 *
 * @param {string|number} timestamp — ISO string or ms since epoch
 * @param {number}        hoursLimit — default 72
 */
export function isExpired(timestamp, hoursLimit = 72) {
  if (!timestamp) return true;
  const saved = new Date(timestamp).getTime();
  const now   = Date.now();
  const ms    = hoursLimit * 60 * 60 * 1000;
  return now - saved > ms;
}

/**
 * clearDraft — removes draft and its metadata from localStorage.
 *
 * @param {string} loanType
 */
export function clearDraft(loanType) {
  const key = `lendswift_draft_${loanType || 'unknown'}`;
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_meta`);
  localStorage.removeItem('lendswift_draft_meta');
}
