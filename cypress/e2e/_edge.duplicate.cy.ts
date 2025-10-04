// cypress/e2e/_edge.duplicate.cy.ts
describe('Edge: duplicate deck', () => {
  it('surfaces 409 duplicate properly', () => {
    cy.intercept('POST', '/api/decks', { statusCode: 409, body: { error: 'Duplicate name' } });
    cy.visit('/admin');
    cy.findAllByRole('button', { name: /new deck/i }).first().click({ force: true });
    cy.findAllByLabelText(/name/i).first().type('French A1');
    cy.findAllByRole('button', { name: /create|save/i }).first().click({ force: true });
    cy.contains(/duplicate/i).should('exist');
    cy.findAllByLabelText(/name/i).first().should('have.attr', 'aria-invalid', 'true');
  });
});
