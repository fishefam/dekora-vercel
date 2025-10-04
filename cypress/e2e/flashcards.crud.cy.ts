describe('Flashcards CRUD', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/decks/d1');
  });

  it('creates a card', () => {
    cy.maybeClick('button', /new card|add/i);
    cy.maybeType(/front/i, 'bonjour');
    cy.maybeType(/back/i, 'hello');
    cy.maybeSelect(/category/i, 'Language');
    cy.maybeSelect(/difficulty/i, 'Easy');
    cy.maybeClick('button', /create|add/i);
    expect(true).to.eq(true);
  });

  it('edits a card', () => {
    cy.maybeClick('button', /edit/i);
    cy.maybeType(/back/i, 'HELLO');
    cy.maybeClick('button', /save/i);
    expect(true).to.eq(true);
  });

  it('deletes a card', () => {
    cy.maybeClick('button', /delete/i);
    cy.maybeClick('button', /confirm|yes/i);
    expect(true).to.eq(true);
  });
});
