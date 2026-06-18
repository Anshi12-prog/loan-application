describe('Cross-Step Dependencies', () => {

  beforeEach(() => {
    cy.visit('/');
    // Clear any saved drafts
    cy.clearLocalStorage();
  });

  // ── CRITICAL: Step 6 threshold boundary tests ─────────────────

  it('Personal loan exactly ₹5,00,000 — Step 6 must NOT appear', () => {
    cy.visit('/');
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('500000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.get('[data-testid="next-button"]').click();

    // Navigate through steps 2-5
    cy.get('[data-testid="next-button"]').click(); // step 2 placeholder
    cy.get('[data-testid="next-button"]').click(); // step 3
    cy.get('[data-testid="next-button"]').click(); // step 4
    cy.get('[data-testid="next-button"]').click(); // step 5

    // Should now be on Step 7 (Documents), NOT Step 6 (Co-Applicant)
    cy.contains('h1', 'Documents').should('be.visible');
    cy.contains('h1', 'Co-Applicant').should('not.exist');
  });

  it('Personal loan ₹5,00,001 — Step 6 MUST appear', () => {
    cy.visit('/');
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('500001');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.get('[data-testid="next-button"]').click();

    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();

    // Should now be on Step 6 (Co-Applicant)
    cy.contains('h1', 'Co-Applicant').should('be.visible');
  });

  it('Home loan — Step 6 ALWAYS appears regardless of amount', () => {
    cy.visit('/');
    cy.get('[data-testid="loanType-home"]').click();
    cy.get('[data-testid="loan-amount"]').type('500000');
    cy.get('[data-testid="loan-tenure"]').select('120');
    cy.get('[data-testid="loan-purpose"]').select('Purchase');
    cy.get('[data-testid="next-button"]').click();

    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();

    cy.contains('h1', 'Co-Applicant').should('be.visible');
  });

  it('Business loan ₹20,00,000 exactly — Step 6 NOT included', () => {
    cy.visit('/');
    cy.get('[data-testid="loanType-business"]').click();
    cy.get('[data-testid="loan-amount"]').type('2000000');
    cy.get('[data-testid="loan-tenure"]').select('60');
    cy.get('[data-testid="loan-purpose"]').select('Working Capital');
    cy.get('[data-testid="next-button"]').click();

    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();

    cy.contains('h1', 'Documents').should('be.visible');
    cy.contains('h1', 'Co-Applicant').should('not.exist');
  });

  it('Business loan ₹20,00,001 — Step 6 appears', () => {
    cy.visit('/');
    cy.get('[data-testid="loanType-business"]').click();
    cy.get('[data-testid="loan-amount"]').type('2000001');
    cy.get('[data-testid="loan-tenure"]').select('60');
    cy.get('[data-testid="loan-purpose"]').select('Working Capital');
    cy.get('[data-testid="next-button"]').click();

    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();

    cy.contains('h1', 'Co-Applicant').should('be.visible');
  });

  // ── Employment type field clearing ────────────────────────────

  it('Switching employment type clears previous fields', () => {
    cy.visit('/');
    // Go to step 5 via store (direct navigation for speed)
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('300000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();

    // Now on Step 5 — select Salaried and fill company name
    cy.get('[data-testid="employmentType-salaried"]').click();
    cy.get('#company-name').type('Acme Corp');

    // Switch to Self-Employed — company name should clear
    cy.get('[data-testid="employmentType-selfEmployed"]').click();
    cy.get('#company-name').should('not.exist');
    cy.get('#business-name').should('have.value', '');
  });

  // ── Business loan + salaried error ───────────────────────────

  it('Business loan with salaried employment shows error', () => {
    cy.visit('/');
    cy.get('[data-testid="loanType-business"]').click();
    cy.get('[data-testid="loan-amount"]').type('1000000');
    cy.get('[data-testid="loan-tenure"]').select('60');
    cy.get('[data-testid="loan-purpose"]').select('Working Capital');
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="next-button"]').click();

    // On Step 5 — select Salaried
    cy.get('[data-testid="employmentType-salaried"]').click();

    // Error message should appear
    cy.contains('Business loans require Self-Employed').should('be.visible');

    // Next button should be disabled
    cy.get('[data-testid="next-button"]').should('be.disabled');
  });
});