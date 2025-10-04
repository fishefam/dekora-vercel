// cypress/e2e/_edge.progress.cy.ts
describe('Edge: progress', () => {
  it('survives partial API payload', () => {
    cy.intercept('GET', /\/api\/progress\/summary.*/, { labels: ['Mon'], points: [1] }); // missing fields
    cy.visit('/dashboard');
    cy.get('canvas,[role="img"][aria-label*="progress" i]').should('exist');
  });

  it('shows no-data state', () => {
    cy.intercept('GET', /\/api\/progress\/summary.*/, { points: [], labels: [] });
    cy.visit('/dashboard');
    cy.contains(/no activity yet|no data/i).should('exist');
  });
});
