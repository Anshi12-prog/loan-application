import { useEffect, useRef, useCallback, useState } from 'react';
import useLoanStore from '../store/loanStore';
import { saveToLocalStorage, loadFromLocalStorage, isExpired } from '../utils/encryption';

const SAVE_INTERVAL_MS = 30000; // 30 seconds
const DRAFT_KEY_PREFIX = 'lendswift_draft';
const META_KEY         = 'lendswift_draft_meta';
const SCHEMA_VERSION   = '1.0';

function getDraftKey(loanType) {
  return `${DRAFT_KEY_PREFIX}_${loanType || 'unknown'}`;
}

/**
 * useAutoSave — encrypted auto-save to localStorage.
 *
 * - Saves every 30 seconds silently
 * - Never prompts user for passphrase
 * - On mount: checks for existing draft, shows resume modal if found
 * - Returns { lastSavedAt, isSaving, saveNow }
 */
export default function useAutoSave({ addToast } = {}) {
  const formData      = useLoanStore((s) => s.formData);
  const currentStep   = useLoanStore((s) => s.currentStep);
  const signature     = useLoanStore((s) => s.signature);
  const completedSteps = useLoanStore((s) => s.completedSteps);
  const verificationStatus = useLoanStore((s) => s.verificationStatus);
  const setDraftSavedAt  = useLoanStore((s) => s.setDraftSavedAt);
  const restoreFromDraft = useLoanStore((s) => s.restoreFromDraft);
  const resetForm        = useLoanStore((s) => s.resetForm);

  const [isSaving, setIsSaving]       = useState(false);
  const [resumeModal, setResumeModal] = useState(null); // { loanType, savedAt, key }
  const intervalRef = useRef(null);
  const isMounted   = useRef(true);

  const getLoanType = useCallback(() => {
    return formData?.step1?.loanType || 'unknown';
  }, [formData]);

  // ── Core save function ──────────────────────────────────────────
  const performSave = useCallback(async () => {
    try {
      const loanType = getLoanType();
      const key      = getDraftKey(loanType);

      const stateToSave = {
        formData,
        currentStep,
        signature,
        completedSteps,
        verificationStatus,
      };

      const metadata = {
        version:   SCHEMA_VERSION,
        timestamp: new Date().toISOString(),
        step:      currentStep,
        loanType,
      };

      await saveToLocalStorage(key, stateToSave, metadata);

      // Also save readable metadata for quick lookup on page load
      localStorage.setItem(META_KEY, JSON.stringify(metadata));

      const now = new Date().toISOString();
      if (isMounted.current) {
        setDraftSavedAt(now);

        const timeStr = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit',
        });

        addToast?.(`Draft saved at ${timeStr}`, 'success');
      }
    } catch (err) {
      // Non-blocking — never throw to caller
      console.warn('[AutoSave] Save failed:', err);
    }
  }, [
    formData, currentStep, signature,
    completedSteps, verificationStatus,
    getLoanType, setDraftSavedAt, addToast,
  ]);

  // ── Public saveNow ──────────────────────────────────────────────
  const saveNow = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    await performSave();
    if (isMounted.current) setIsSaving(false);
  }, [isSaving, performSave]);

  // ── Auto-save interval ──────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Only save if there's something worth saving
      if (formData?.step1) {
        // Non-blocking: use setTimeout to not freeze UI
        setTimeout(() => performSave(), 0);
      }
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [formData, performSave]);

  // ── Check for existing draft on mount ──────────────────────────
  useEffect(() => {
    isMounted.current = true;

    async function checkDraft() {
      try {
        const rawMeta = localStorage.getItem(META_KEY);
        if (!rawMeta) return;

        const meta = JSON.parse(rawMeta);
        const { timestamp, loanType, version } = meta;

        // Check version compatibility
        if (version !== SCHEMA_VERSION) {
          localStorage.removeItem(META_KEY);
          return;
        }

        // Check expiry (72 hours)
        if (isExpired(timestamp, 72)) {
          // Clean up expired draft
          const key = getDraftKey(loanType);
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_meta`);
          localStorage.removeItem(META_KEY);
          return;
        }

        // Valid draft found — show resume modal
        if (isMounted.current) {
          setResumeModal({ loanType, savedAt: timestamp, key: getDraftKey(loanType) });
        }
      } catch {
        // Corrupted meta — clean up silently
        localStorage.removeItem(META_KEY);
      }
    }

    // Small delay so store initializes first
    const t = setTimeout(checkDraft, 200);
    return () => {
      isMounted.current = false;
      clearTimeout(t);
    };
  }, []);

  // ── Resume handler ──────────────────────────────────────────────
  const handleResume = useCallback(async () => {
    if (!resumeModal) return;
    try {
      const saved = await loadFromLocalStorage(resumeModal.key);
      if (saved?.data) {
        restoreFromDraft(saved.data);
        addToast?.('Application resumed successfully', 'success');
      }
    } catch {
      addToast?.('Could not restore draft. Starting fresh.', 'error');
      resetForm();
    }
    setResumeModal(null);
  }, [resumeModal, restoreFromDraft, resetForm, addToast]);

  const handleStartFresh = useCallback(() => {
    if (!resumeModal) return;
    // Clean up the draft
    const key = resumeModal.key;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_meta`);
    localStorage.removeItem(META_KEY);
    resetForm();
    setResumeModal(null);
  }, [resumeModal, resetForm]);

  return {
    isSaving,
    saveNow,
    resumeModal,
    handleResume,
    handleStartFresh,
  };
}