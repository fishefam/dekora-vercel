import React from 'react';

function Button({ onClick, children }: React.PropsWithChildren<{onClick?: () => void}>) {
  return <button data-cy="btn" onClick={onClick}>{children}</button>;
}

describe('<Button /> (React 19)', () => {
  it('fires onClick', () => {
    const onClick = cy.stub().as('clicked');
    cy.mount(<Button onClick={onClick}>Press</Button>);
    cy.get('[data-cy="btn"]').click();
    cy.get('@clicked').should('have.been.calledOnce');
  });
});
