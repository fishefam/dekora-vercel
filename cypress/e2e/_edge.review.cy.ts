// cypress/e2e/_edge.review.cy.ts
describe('Edge: review flow', () => {
  it('handles empty queue', () => {
    cy.intercept('GET', /\/api\/review\/session.*/, { cards: [] });
    cy.visit('/review?deckId=d1');
    cy.contains(/nothing to review|no cards/i).should('exist');
  });

  it('keeps card on submit failure', () => {
    cy.intercept('GET', /\/api\/review\/session.*/, { cards: [{ id: 'c1', front:'hi', back:'salut' }] });
    cy.intercept('POST', '/api/review/answer', { statusCode: 500 });
    cy.visit('/review?deckId=d1');
    cy.findByRole('button', { name: /flip/i }).click();
    cy.findByRole('button', { name: /correct|right/i }).click();
    cy.contains(/error|retry/i).should('exist');
    cy.findByTestId('card-front').should('exist'); // did not advance
  });

  it('ignores rapid multiple answers', () => {
    let hits = 0;
    cy.intercept('POST', '/api/review/answer', (req) => { hits++; req.reply({ ok: true }); });
    cy.intercept('GET', /\/api\/review\/session.*/, { cards: [{ id: 'c1', front:'a', back:'b' }, { id:'c2', front:'c', back:'d'}] });
    cy.visit('/review?deckId=d1');
    cy.findByRole('button', { name: /flip/i }).click();
    cy.findByRole('button', { name: /correct|right/i }).click().click().click();
    cy.wrap(null).then(() => expect(hits).to.eq(1));
  });
});
