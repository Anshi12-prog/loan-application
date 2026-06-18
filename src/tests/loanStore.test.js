import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import useLoanStore from '../store/loanStore';

// Reset store before each test
beforeEach(() => {
  act(() => {
    useLoanStore.getState().resetForm();
  });
});

describe('getActiveSteps — Step 6 threshold (CRITICAL)', () => {
  it('personal loan ₹5,00,000 exactly — step 6 NOT included', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'personal',
        loanAmount: 500000,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).not.toContain(6);
  });

  it('personal loan ₹5,00,001 — step 6 IS included', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'personal',
        loanAmount: 500001,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).toContain(6);
  });

  it('personal loan ₹3,00,000 — step 6 NOT included', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'personal',
        loanAmount: 300000,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).not.toContain(6);
  });

  it('home loan any amount — step 6 ALWAYS included', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'home',
        loanAmount: 100000,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).toContain(6);
  });

  it('home loan ₹50,000 (minimum) — step 6 ALWAYS included', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'home',
        loanAmount: 50000,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).toContain(6);
  });

  it('business loan ₹20,00,000 exactly — step 6 NOT included', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'business',
        loanAmount: 2000000,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).not.toContain(6);
  });

  it('business loan ₹20,00,001 — step 6 IS included', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'business',
        loanAmount: 2000001,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).toContain(6);
  });

  it('active steps without step 6 are [1,2,3,4,5,7,8]', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'personal',
        loanAmount: 300000,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).toEqual([1, 2, 3, 4, 5, 7, 8]);
  });

  it('active steps with step 6 are [1,2,3,4,5,6,7,8]', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, {
        loanType: 'home',
        loanAmount: 5000000,
      });
    });
    const steps = useLoanStore.getState().getActiveSteps();
    expect(steps).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('Navigation', () => {
  it('starts at step 1', () => {
    expect(useLoanStore.getState().currentStep).toBe(1);
  });

  it('goToNextStep advances to next active step', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, { loanType: 'personal', loanAmount: 300000 });
      useLoanStore.getState().goToNextStep();
    });
    expect(useLoanStore.getState().currentStep).toBe(2);
  });

  it('goToPrevStep goes back', () => {
    act(() => {
      useLoanStore.getState().setCurrentStep(3);
      useLoanStore.getState().goToPrevStep();
    });
    expect(useLoanStore.getState().currentStep).toBe(2);
  });

  it('skips step 6 in navigation when not active', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, { loanType: 'personal', loanAmount: 300000 });
      useLoanStore.getState().setCurrentStep(5);
      useLoanStore.getState().goToNextStep();
    });
    // Should go to 7, not 6
    expect(useLoanStore.getState().currentStep).toBe(7);
  });
});

describe('Form data', () => {
  it('setStepData stores data correctly', () => {
    act(() => {
      useLoanStore.getState().setStepData(2, { fullName: 'Rajesh Kumar' });
    });
    expect(useLoanStore.getState().formData.step2.fullName).toBe('Rajesh Kumar');
  });

  it('setStepData adds to completedSteps', () => {
    act(() => {
      useLoanStore.getState().setStepData(3, { panNumber: 'ABCPE1234F' });
    });
    expect(useLoanStore.getState().completedSteps).toContain(3);
  });

  it('resetForm clears everything', () => {
    act(() => {
      useLoanStore.getState().setStepData(1, { loanType: 'home' });
      useLoanStore.getState().resetForm();
    });
    expect(useLoanStore.getState().formData.step1).toBeNull();
    expect(useLoanStore.getState().currentStep).toBe(1);
    expect(useLoanStore.getState().completedSteps).toEqual([]);
  });

  it('completedSteps is an array not a Set', () => {
    expect(Array.isArray(useLoanStore.getState().completedSteps)).toBe(true);
  });
});