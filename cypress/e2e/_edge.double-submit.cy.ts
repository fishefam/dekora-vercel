// cypress/e2e/_edge.double-submit.cy.ts
describe('Edge: double-submit', () => {
  it('prevents double-creating a deck', () => {
    let calls = 0;
    cy.intercept('POST', '/api/decks', (req) => { calls++; req.reply({ id: 'dX', name: 'X', category: 'Lang', difficulty: 'Easy' }); }).as('create');
    cy.visit('/admin');
    cy.findAllByRole('button', { name: /new deck/i }).first().click({ force: true });
    cy.findAllByLabelText(/name/i).first().type('X');
    cy.findAllByRole('button', { name: /create|save/i }).first().click({ force: true }).click({ force: true });
    cy.wrap(null).then(() => expect(calls).to.eq(1)); // only one request should hit server
  });
});
