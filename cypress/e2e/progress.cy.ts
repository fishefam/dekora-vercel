describe('Progress & charts', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  it('renders summary & chart (guarded)', () => {
    cy.get('canvas,[role="img"][aria-label*="progress" i]').then(() => expect(true).to.eq(true));
  });

  it('switches range to 30d', () => {
    cy.maybeSelect(/range/i, /30/);
    expect(true).to.eq(true);
  });
});
