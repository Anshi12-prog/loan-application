describe('Auto-Save and Resume', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('shows resume modal when returning with saved draft', () => {
    // Fill step 1
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('300000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');

    // Manually trigger save by clicking Save Draft
    cy.get('[data-testid="save-draft-button"]').first().click();
    cy.contains('Draft saved').should('be.visible');

    // Reload the page
    cy.reload();

    // Resume modal should appear
    cy.contains('Resume').should('be.visible');
    cy.contains('Start Fresh').should('be.visible');
  });

  it('Resume restores the saved step', () => {
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('300000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.get('[data-testid="save-draft-button"]').first().click();
    cy.reload();

    cy.contains('Resume').click();
    // Should be back on step 1 with data
    cy.get('[data-testid="loan-amount"]').should('have.value', '3,00,000');
  });

  it('Start Fresh clears the draft and goes to step 1', () => {
    cy.get('[data-testid="loanType-personal"]').click();
    cy.get('[data-testid="loan-amount"]').type('300000');
    cy.get('[data-testid="loan-tenure"]').select('36');
    cy.get('[data-testid="loan-purpose"]').select('Medical');
    cy.get('[data-testid="save-draft-button"]').first().click();
    cy.reload();

    cy.contains('Start Fresh').click();
    cy.contains('h1', 'Loan Details').should('be.visible');
    cy.get('[data-testid="loan-amount"]').should('have.value', '');
  });
});