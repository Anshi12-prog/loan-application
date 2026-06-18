describe('Validation Errors', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('Step 1 — shows error when Next clicked without loan type', () => {
    cy.get('[data-testid="next-button"]').click();
    cy.shouldShowError('Please select a loan type');
  });

  it('Step 3 — rejects invalid PAN format', () => {
    // Navigate to step 3
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('300000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.clickNext();
    cy.clickNext(); // skip step 2 for this test

    cy.get('[data-testid="pan-number"]').type('INVALID').blur();
    cy.shouldShowError('PAN format invalid');
  });

  it('Step 3 — shows specific entity type error for ABCDE1234F', () => {
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('300000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.clickNext();
    cy.clickNext();

    cy.get('[data-testid="pan-number"]').type('ABCDE1234F').blur();
    cy.contains("D").should('be.visible');
    cy.contains('not a valid entity type').should('be.visible');
  });

  it('Step 3 — Aadhaar consent required to proceed', () => {
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('300000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.clickNext();
    cy.clickNext();

    // Try to proceed without consent
    cy.get('[data-testid="next-button"]').should('be.disabled');
  });

  it('Step 4 — PIN code lookup shows warning for unknown PIN', () => {
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('300000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.clickNext();
    cy.clickNext();
    cy.clickNext();
    cy.clickNext();

    cy.get('[data-testid="pin-code"]').type('999999').blur();
    cy.wait(500);
    cy.contains('PIN code not found').should('be.visible');
  });
});