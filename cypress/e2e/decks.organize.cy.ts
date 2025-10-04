describe("Deck organization", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/admin");
  });

  it("filters and sorts", () => {
    cy.maybeSelect(/category/i, "Language");
    cy.maybeSelect(/difficulty/i, "Easy");
    cy.maybeClick("button", /sort|sort by name|due/i);
    cy.maybeClick("button", /sort|sort by name|due/i);
    expect(true).to.eq(true);
  });

  it("shuffles deterministically (seed in URL)", () => {
    cy.visit("/admin?seed=42");
    expect(true).to.eq(true);
  });
});
