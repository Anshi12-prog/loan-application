describe('Home Loan Happy Path', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('home loan always includes co-applicant step', () => {
    cy.fixture('valid-home-loan').then((data) => {
      cy.get('[data-testid="loanType-home"]').click();
      cy.get('[data-testid="loan-amount"]').type(String(data.loanAmount));
      cy.get('[data-testid="loan-tenure"]').select(data.loanTenure);
      cy.get('[data-testid="loan-purpose"]').select(data.loanPurpose);
      cy.clickNext();
      cy.clickNext(); // step 2
      cy.clickNext(); // step 3
      cy.clickNext(); // step 4
      cy.clickNext(); // step 5

      // Step 6 must appear for home loan
      cy.contains('h1', 'Co-Applicant').should('be.visible');
      cy.get('#co-applicant-name').type(data.coApplicantName);
      cy.get('#relationship').select(data.relationship);
      cy.get('#co-applicant-income').type(String(data.coApplicantIncome));
      cy.get('#co-applicant-consent').check();
      cy.clickNext();

      cy.contains('h1', 'Documents').should('be.visible');
    });
  });
});