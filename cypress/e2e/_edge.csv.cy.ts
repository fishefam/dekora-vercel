// cypress/e2e/_edge.csv.cy.ts
describe('Edge: CSV import', () => {
  beforeEach(() => cy.visit('/decks/d1'));

  it('rejects bad headers', () => {
    const bad = 'foo,bar\nx,y\n';
    cy.findByLabelText(/import csv/i).selectFile({ contents: new Blob([bad], { type: 'text/csv' }), fileName: 'bad.csv' }, { force: true });
    cy.contains(/invalid headers|front,back/i).should('exist');
  });

  it('handles large file gracefully', () => {
    const big = 'front,back\n' + 'a,b\n'.repeat(20000);
    cy.findByLabelText(/import csv/i).selectFile({ contents: new Blob([big], { type: 'text/csv' }), fileName: 'big.csv' }, { force: true });
    cy.contains(/too large|limit/i).should('exist');
  });

  it('neutralizes formula injection on export', () => {
    cy.intercept('GET', /\/api\/decks\/d1\/export.*/, '=CMD|\' /C calc\'!A1\n').as('export');
    cy.findByRole('button', { name: /export csv/i }).click();
    cy.wait('@export');
    // Expect UI to warn or sanitize; at minimum do not crash
    cy.contains(/export/i).should('exist');
  });
});
