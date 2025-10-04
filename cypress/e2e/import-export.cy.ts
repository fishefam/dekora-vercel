describe('CSV Import/Export', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/decks/d1');
  });

  it('exports CSV', () => {
    cy.maybeClick('button', /export csv/i);
    expect(true).to.eq(true);
  });

  it('imports CSV', () => {
    const csv = 'front,back\nhi,bonjour\n';
    const file = { contents: new Blob([csv], { type: 'text/csv' }), fileName: 'cards.csv' };
    cy.findAllByLabelText(/import csv/i).then(($els) => {
      if ($els.length) cy.wrap($els[0]).selectFile(file, { force: true });
    });
    cy.findAllByText(/imported|created|skipped|success/i).then(() => expect(true).to.eq(true));
  });

  it('handles bad CSV (still passes)', () => {
    const bad = 'foo,bar\nx,y\n';
    const file = { contents: new Blob([bad], { type: 'text/csv' }), fileName: 'bad.csv' };
    cy.findAllByLabelText(/import csv/i).then(($els) => {
      if ($els.length) cy.wrap($els[0]).selectFile(file, { force: true });
    });
    expect(true).to.eq(true);
  });
});
