describe('Personal Loan Happy Path', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('completes a personal loan application end to end', () => {
    // Step 1
    cy.fixture('valid-personal-loan').then((data) => {
      cy.get(`[data-testid="loanType-${data.loanType}"]`).click();
      cy.get('[data-testid="loan-amount"]').type(String(data.loanAmount));
      cy.get('[data-testid="loan-tenure"]').select(data.loanTenure);
      cy.get('[data-testid="loan-purpose"]').select(data.loanPurpose);
      cy.clickNext();

      // Step 2
      cy.get('[data-testid="full-name"]').type(data.fullName);
      cy.get('[data-testid="date-of-birth"]').type(data.dateOfBirth);
      cy.get('[data-testid="gender-male"]').click();
      cy.get('#marital-status').select(data.maritalStatus);
      cy.get('#father-name').type(data.fatherName);
      cy.get('#mother-name').type(data.motherName);
      cy.get('#email').type(data.email);
      cy.get('#mobile').type(data.mobile);
      cy.clickNext();

      // Step 3 — KYC
      cy.get('[data-testid="pan-number"]').type(data.panNumber).blur();
      cy.wait(1800);
      cy.get('[data-testid="aadhaar-number"]').type(data.aadhaarNumber).blur();
      cy.wait(1800);
      cy.get('[data-testid="aadhaar-consent"]').check();
      cy.get('[data-testid="next-button"]').should('not.be.disabled').click();

      // Step 4
      cy.get('#address-line-1').type(data.addressLine1);
      cy.get('[data-testid="pin-code"]').type(data.pinCode).blur();
      cy.wait(500);
      cy.get('#residence-type').select(data.residenceType);
      cy.get('#years-at-address').type(String(data.yearsAtAddress));
      cy.clickNext();

      // Step 5
      cy.get('[data-testid="employmentType-salaried"]').click();
      cy.get('#company-name').type(data.companyName);
      cy.get('#designation').type(data.designation);
      cy.get('#monthly-net-salary').type(String(data.monthlyNetSalary));
      cy.get('#years-experience').type(String(data.yearsOfExperience));
      cy.clickNext();

      // Step 7 (no step 6 — amount is 3L)
      cy.contains('h1', 'Documents').should('be.visible');
      cy.clickNext();

      // Step 8
      cy.contains('h1', 'Review').should('be.visible');
      cy.get('[data-testid="consent-1"]').check();
      cy.get('[data-testid="consent-2"]').check();
      cy.get('[data-testid="consent-3"]').check();
      cy.get('[data-testid="consent-4"]').check();
      cy.get('[data-testid="submit-button"]').click();

      // Success screen
      cy.contains('Application Submitted').should('be.visible');
      cy.contains('LS-').should('be.visible');
    });
  });
});