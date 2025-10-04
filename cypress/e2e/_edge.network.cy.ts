// cypress/e2e/_edge.network.cy.ts
describe('Edge: network failures', () => {
  it('shows retry on decks fetch error', () => {
    cy.intercept('GET', /\/api\/decks(\?.*)?$/, { statusCode: 500 }).as('fail');
    cy.visit('/admin');
    cy.contains(/error|retry/i).should('exist');
    // click retry if present
    cy.findAllByRole('button', { name: /retry/i }).first().click({ force: true }).then(() => {});
  });

  it('times out gracefully on slow review queue', () => {
    cy.intercept('GET', /\/api\/review\/session.*/, { delayMs: 15000, body: { cards: [] } }).as('slow');
    cy.visit('/review?deckId=d1');
    cy.contains(/loading|spinner/i).should('exist');
    cy.contains(/took too long|timeout/i, { timeout: 20000 }).then(() => {});
  });
});
