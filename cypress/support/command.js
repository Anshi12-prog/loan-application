// ── Custom Cypress commands for LendSwift loan application ────────

Cypress.Commands.add('fillStep1', (data) => {
  cy.get(`[data-testid="loanType-${data.loanType}"]`).click();
  cy.get('[data-testid="loan-amount"]').clear().type(String(data.loanAmount));
  cy.get('[data-testid="loan-tenure"]').select(String(data.loanTenure));
  cy.get('[data-testid="loan-purpose"]').select(data.loanPurpose);
});

Cypress.Commands.add('fillStep2', (data) => {
  cy.get('[data-testid="full-name"]').clear().type(data.fullName);
  cy.get('[data-testid="date-of-birth"]').type(data.dateOfBirth);
  cy.get(`[data-testid="gender-${data.gender}"]`).click();
  cy.get('#marital-status').select(data.maritalStatus);
  cy.get('#father-name').type(data.fatherName);
  cy.get('#mother-name').type(data.motherName);
  cy.get('#email').type(data.email);
  cy.get('#mobile').type(data.mobile);
});

Cypress.Commands.add('fillStep3', (data) => {
  cy.get('[data-testid="pan-number"]').type(data.panNumber).blur();
  cy.wait(1800); // Wait for PAN verification simulation
  cy.get('[data-testid="aadhaar-number"]').type(data.aadhaarNumber).blur();
  cy.wait(1800); // Wait for Aadhaar verification simulation
  cy.get('[data-testid="aadhaar-consent"]').check();
});

Cypress.Commands.add('fillStep4', (data) => {
  cy.get('#address-line-1').type(data.addressLine1);
  if (data.addressLine2) cy.get('#address-line-2').type(data.addressLine2);
  cy.get('[data-testid="pin-code"]').type(data.pinCode).blur();
  cy.wait(400); // PIN lookup simulation
  cy.get('#residence-type').select(data.residenceType);
  if (data.residenceType === 'rented') {
    cy.get('#monthly-rent').type(String(data.monthlyRent));
  }
  cy.get('#years-at-address').type(String(data.yearsAtAddress));
});

Cypress.Commands.add('fillStep5Salaried', (data) => {
  cy.get('[data-testid="employmentType-salaried"]').click();
  cy.get('#company-name').type(data.companyName);
  cy.get('#designation').type(data.designation);
  cy.get('#monthly-net-salary').type(String(data.monthlyNetSalary));
  cy.get('#years-experience').type(String(data.yearsOfExperience));
});

Cypress.Commands.add('goToStep', (targetStep) => {
  // Click Next until we reach the target step
  cy.get('[data-testid="next-button"]').click();
});

Cypress.Commands.add('shouldShowError', (message) => {
  cy.contains('[role="alert"]', message).should('be.visible');
});

Cypress.Commands.add('waitForDraftSave', () => {
  cy.contains('Draft saved', { timeout: 35000 }).should('be.visible');
});

Cypress.Commands.add('clickNext', () => {
  cy.get('[data-testid="next-button"]').click();
});

Cypress.Commands.add('clickPrev', () => {
  cy.get('[data-testid="prev-button"]').click();
});