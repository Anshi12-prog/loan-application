describe('Business Loan Happy Path', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('business loan requires business owner employment', () => {
    cy.fixture('valid-business-loan').then((data) => {
      cy.get('[data-testid="loanType-business"]').click();
      cy.get('[data-testid="loan-amount"]').type(String(data.loanAmount));
      cy.get('[data-testid="loan-tenure"]').select(data.loanTenure);
      cy.get('[data-testid="loan-purpose"]').select(data.loanPurpose);
      cy.clickNext();
      cy.clickNext(); // step 2
      cy.clickNext(); // step 3
      cy.clickNext(); // step 4

      // Step 5 — select Business Owner
      cy.get('[data-testid="employmentType-businessOwner"]').click();
      cy.get('#business-name').type(data.businessName);
      cy.get('#business-type').select(data.businessType);
      cy.get('#annual-turnover').type(String(data.annualTurnover));
      cy.get('#years-in-business').type(String(data.yearsInBusiness));
      cy.get('#monthly-income').type(String(data.monthlyIncome));
      cy.get('[data-testid="gst-number"]').type(data.gstNumber);
      cy.get('#office-address-1').type(data.officeAddress.addressLine1);
      cy.get('#office-pin').type(data.officeAddress.pinCode);
      cy.get('#office-city').type(data.officeAddress.city);
      cy.get('#office-state').type(data.officeAddress.state);
      cy.clickNext();

      // Amount is 20L exactly — no step 6
      cy.contains('h1', 'Documents').should('be.visible');
    });
  });
});