import './commands';

Cypress.on('uncaught:exception', (err) => {
  // Don't fail on ResizeObserver errors (common in Cypress with canvas)
  if (err.message.includes('ResizeObserver loop')) return false;
  return true;
});