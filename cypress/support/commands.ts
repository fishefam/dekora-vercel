/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-namespace */
// cypress/support/commands.ts

// Put custom Cypress commands here.
// Example Testing Library helpers are added in e2e/component support files.
declare global {
  namespace Cypress {
    interface Chainable {
      // add typings for any custom commands you define, e.g.:
      // dataCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Example of a handy selector command (optional):
// Cypress.Commands.add('dataCy', (value: string) => cy.get(`[data-cy="${value}"]`));

export {};
