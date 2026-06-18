import { create } from 'zustand';

const STEP_LABELS = {
  1: 'Loan Details',
  2: 'Personal Info',
  3: 'KYC Verification',
  4: 'Address',
  5: 'Employment',
  6: 'Co-Applicant',
  7: 'Documents',
  8: 'Review & Submit',
};

const ARRAY_FILE_KEYS = new Set([
  'salarySlips',
  'bankStatements',
  'itr',
  'propertyDocuments',
  'gstReturns',
]);

function createInitialFormData() {
  return {
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5: null,
    step6: null,
    step7: null,
    step8: null,
  };
}

function createInitialVerificationStatus() {
  return {
    pan: 'idle',
    aadhaar: 'idle',
    coApplicantPan: 'idle',
  };
}

function createInitialUploadedFiles() {
  return {
    panCard: null,
    aadhaarFront: null,
    aadhaarBack: null,
    salarySlips: [],
    bankStatements: [],
    itr: [],
    propertyDocuments: [],
    businessRegistration: null,
    gstReturns: [],
    photograph: null,
  };
}

function createInitialState() {
  return {
    formData: createInitialFormData(),
    currentStep: 1,
    verificationStatus: createInitialVerificationStatus(),
    uploadedFiles: createInitialUploadedFiles(),
    signature: null,
    completedSteps: [],
    draftSavedAt: null,
    isSubmitted: false,
    applicationReference: null,
  };
}

/**
 * Determines whether step 6 (Co-Applicant) is included in the wizard flow.
 *
 * Rules (strictly greater than thresholds):
 * - home loan: always included
 * - personal loan: included when loanAmount > 500000
 * - business loan: included when loanAmount > 2000000
 */
function shouldIncludeStep6(loanType, loanAmount) {
  if (loanType === 'home') return true;
  if (loanType === 'personal' && loanAmount > 500000) return true;
  if (loanType === 'business' && loanAmount > 2000000) return true;
  return false;
}

function computeActiveSteps(formData) {
  const step1 = formData?.step1 ?? {};
  const loanType = step1.loanType;
  const loanAmount = Number(step1.loanAmount ?? 0);

  const include6 = shouldIncludeStep6(loanType, loanAmount);

  return include6
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [1, 2, 3, 4, 5, 7, 8];
}

export const useLoanStore = create((set, get) => ({
  ...createInitialState(),

  setStepData(stepNumber, data) {
    set((state) => ({
      formData: {
        ...state.formData,
        [`step${stepNumber}`]: data,
      },
      completedSteps: state.completedSteps.includes(stepNumber)
        ? state.completedSteps
        : [...state.completedSteps, stepNumber],
    }));

    if (stepNumber === 1) {
      get().ensureValidCurrentStep();
    }
  },

  goToNextStep() {
    const { currentStep } = get();
    const active = get().getActiveSteps();
    const idx = active.indexOf(currentStep);

    if (idx >= 0 && idx < active.length - 1) {
      set({ currentStep: active[idx + 1] });
    }
  },

  goToPrevStep() {
    const { currentStep } = get();
    const active = get().getActiveSteps();
    const idx = active.indexOf(currentStep);

    if (idx > 0) {
      set({ currentStep: active[idx - 1] });
    }
  },

  setCurrentStep(stepNumber) {
    const active = get().getActiveSteps();
    if (active.includes(stepNumber)) {
      set({ currentStep: stepNumber });
    }
  },

  setVerificationStatus(field, status) {
    set((state) => ({
      verificationStatus: {
        ...state.verificationStatus,
        [field]: status,
      },
    }));
  },

  setUploadedFile(docType, fileData) {
    set((state) => {
      const current = state.uploadedFiles[docType];

      if (ARRAY_FILE_KEYS.has(docType)) {
        const nextValue = Array.isArray(fileData)
          ? fileData
          : [...(current ?? []), fileData];

        return {
          uploadedFiles: {
            ...state.uploadedFiles,
            [docType]: nextValue,
          },
        };
      }

      return {
        uploadedFiles: {
          ...state.uploadedFiles,
          [docType]: fileData,
        },
      };
    });
  },

  setSignature(base64String) {
    set({ signature: base64String });
  },

  setDraftSavedAt(timestamp) {
    set({ draftSavedAt: timestamp });
  },

  setSubmitted(referenceNumber) {
    set({
      isSubmitted: true,
      applicationReference: referenceNumber,
    });
  },

  resetForm() {
    set(createInitialState());
  },

  restoreFromDraft(savedState) {
    if (!savedState || typeof savedState !== 'object') return;

    set((state) => ({
      ...state,
      formData: {
        ...state.formData,
        ...(savedState.formData ?? {}),
      },
      currentStep: savedState.currentStep ?? state.currentStep,
      verificationStatus: {
        ...state.verificationStatus,
        ...(savedState.verificationStatus ?? {}),
      },
      uploadedFiles: {
        ...state.uploadedFiles,
        ...(savedState.uploadedFiles ?? {}),
      },
      signature: savedState.signature ?? state.signature,
      completedSteps: savedState.completedSteps ?? state.completedSteps,
      draftSavedAt: savedState.draftSavedAt ?? state.draftSavedAt,
      isSubmitted: false,
      applicationReference: null,
    }));

    get().ensureValidCurrentStep();
  },

  ensureValidCurrentStep() {
    const active = get().getActiveSteps();
    const { currentStep } = get();

    if (active.includes(currentStep)) return;

    const nextStep = active.find((step) => step > currentStep)
      ?? active[active.length - 1];

    set({ currentStep: nextStep });
  },

  getActiveSteps() {
    return computeActiveSteps(get().formData);
  },

  getProgress() {
    const active = get().getActiveSteps();
    const completed = get().completedSteps;

    if (active.length === 0) return 0;

    const completedCount = active.filter((step) => completed.includes(step)).length;
    return Math.round((completedCount / active.length) * 100);
  },

  getStepLabel(stepNumber) {
    return STEP_LABELS[stepNumber] ?? `Step ${stepNumber}`;
  },

  isStepCompleted(stepNumber) {
    return get().completedSteps.includes(stepNumber);
  },
}));

export default useLoanStore;
