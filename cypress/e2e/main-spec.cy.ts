const creds = {
  email: "admin@gmail.com",
  password: "123"
};

function logon() {
  cy.visit('/');

  cy.get('#login-form').within(() => {
    cy.get('#email').type(creds.email);
    cy.get('#password').type(creds.password);
    cy.get('.btn').click();
  })
}

let groupName = `TESTGROUP-${Date.now()}`;

/*    BEGIN TESTS   */
describe('Register Flow E2E Test', () => {
  it('Should display account registration form', () => {
    cy.visit('/');
    cy.get('#pills-register-tab').click();
    cy.wait(100);

    cy.contains("Create a new Account!").should('exist');
    cy.contains("Create a new Account!").should('be.visible');

    cy.get('#register-form').within(() => {
      cy.get('#username').should('exist');
      cy.get('#email').should('exist');
      cy.get('#password').should('exist');
    });
  });

  it('Should reject duplicate emails on account registration', () => {
    cy.visit('/');
    cy.get('#pills-register-tab').click();
    cy.wait(100);

    cy.get('#register-form').within(() => {
      cy.get('#username').type("Test Account");
      cy.get('#email').type("admin@gmail.com");
      cy.get('#password').type("123");

      cy.get('.btn').click();
    });

    cy.get('.invalid-feedback').should('be.visible');
  })
});

describe('Login Flow E2E Test', () => {
  it('Should redirect to the initial login page', () => {
    cy.visit('/');
    cy.contains('3813ICT Chat Application').should('exist');
    cy.contains('Welcome back!').should('exist');
  });

  it('Should show an error on incorrect credentials', () => {
    cy.visit('/');

    cy.get('#login-form').within(() => {
      cy.get('#email').type(creds.email);
      cy.get('#password').type("False Password");
      cy.get('.btn').click();
    })
    cy.wait(100);

    cy.get('.invalid-feedback').should('be.visible');
  });

  it('Should redirect to the home page on login', () => {
    logon();

    cy.contains("Superadmin").should('exist');
    cy.contains("Groups").should('exist');
  });

  it('Should populate manage account popover', () => {
    logon();

    cy.get('.header > .btn').contains("Superadmin").should('exist');
    cy.get('.header > .btn').contains("Superadmin").click();
    cy.wait(250);

    cy.get('.popover-body').contains("Superadmin").should('exist');
    cy.get('.popover-body').contains("Superadmin").should('be.visible');
  })
});

describe('Group Creation E2E Test', () => {
  it('Should show full Group dropdown', () => {
    logon();

    cy.get('.dropdown-toggle > .bi').click();
    cy.get('.add-group-options').contains("Create a Group");
    cy.get('.add-group-options').contains("Join Group");
  });

  it('Should show create group modal', () => {
    logon();

    cy.get('.dropdown-toggle > .bi').click();
    cy.get('.add-group-options > :nth-child(3)').click();

    cy.contains("Create Group").should('exist');
  });

  it('Should successfully create a group', () => {
    logon();

    cy.get('.dropdown-toggle > .bi').click();
    cy.get('.add-group-options > :nth-child(3)').click();

    cy.get('.channel-name-input').type(groupName);
    cy.get('.group-modal-btn').click();

    cy.contains(groupName).should('exist');
  });

  it('Should start new group with correct channel', () => {
    logon();

    cy.wait(100);
    cy.get('.accordion-button').contains(groupName).click();
    cy.wait(500);

    cy.contains(/^general$/).should('exist');
  });
});

describe('Channel Interaction E2E Test', () => {
  it('Should show correct chat view', () => {
    logon();

    cy.wait(500);
    cy.get('.accordion-button').contains(groupName).click();
    cy.wait(500);
    
    cy.contains(/^general$/).click({ force: true });
    cy.wait(500);

    cy.contains(`${groupName} :: general`).should('exist');
    cy.get('.input-view').should('exist');
  });

  it('Should show current channel viewers', () => {
    logon();

    cy.wait(500);
    cy.get('.accordion-button').contains(groupName).click();
    cy.wait(500);
    
    cy.contains(/^general$/).click({ force: true });
    cy.wait(500);

    cy.get('.viewer-list-button').click();
    cy.wait(250);

    cy.get('.popover-body').contains("Superadmin").should('exist');
  })

  let message = `TESTMSG-${Date.now()}`;
  it('Should display newly sent message', () => {
    logon();

    cy.wait(500);
    cy.get('.accordion-button').contains(groupName).click();
    cy.wait(500);
    
    cy.contains(/^general$/).click({ force: true });
    cy.wait(500);

    cy.get('.input-box').type(`${message}{enter}`);
    cy.wait(250);

    cy.get('.chat-view').contains(message).should('exist');
  });

  it('Should load previously sent message', () => {
    logon();

    cy.wait(500);
    cy.get('.accordion-button').contains(groupName).click();
    cy.wait(500);
    
    cy.contains(/^general$/).click({ force: true });
    cy.wait(500);

    cy.get('.chat-view').contains(message).should('exist');
  });

  it('Should navigate to call screen', () => {
    logon();

    cy.wait(500);
    cy.get('.accordion-button').contains(groupName).click();
    cy.wait(500);
    
    cy.contains(/^general$/).click({ force: true });
    cy.wait(500);

    cy.get('.call-button').click();
    cy.wait(500);

    cy.contains(`${groupName} :: general`).should('exist');
    cy.get('#local-video').should('exist');
  });

  it('Should leave call to home', () => {
    logon();

    cy.wait(500);
    cy.get('.accordion-button').contains(groupName).click();
    cy.wait(500);
    
    cy.contains(/^general$/).click({ force: true });
    cy.wait(500);

    cy.get('.call-button').click();
    cy.wait(500);

    cy.get('.btn-danger').click();
    cy.wait(500);

    cy.contains("Groups").should('exist');
  });
});

describe('Group Management E2E Test', () => {
  it('Should successfully rename a group', () => {
    logon();

    cy.get('.accordion-button').contains(groupName).within(() => {
      cy.get('[id^=ngb-accordion-item]').click();
    });
    cy.wait(750);

    groupName = `TESTGROUP-${Date.now()}`;
    cy.get('#group-name').clear();
    cy.get('#group-name').type(groupName);
    cy.get('button.group-name-input').click();
    cy.wait(250);

    cy.get('.btn-close').click();
    cy.wait(500);

    cy.contains(groupName).should('exist');
  });

  let channelName = `testch-${Date.now()}`
  it('Should successfully create a channel', () => {
    logon();

    cy.get('.accordion-button').contains(groupName).within(() => {
      cy.get('[id^=ngb-accordion-item]').click();
    });
    cy.wait(750);

    cy.get('.channel-name-input').type(`${channelName}{enter}`);
    cy.wait(500);

    cy.get('.user-name-display').contains(channelName).should('exist');
  });

  it('Should successfully delete a channel', () => {
    logon();

    cy.get('.accordion-button').contains(groupName).within(() => {
      cy.get('[id^=ngb-accordion-item]').click();
    });
    cy.wait(750);

    cy.get('.user-list-item').contains(channelName).parent().within(() => {
      cy.get('.toolbar > .btn').click();
    });
    cy.wait(500);

    cy.get('.user-name-display').contains(channelName).should('not.exist');
  });

  it('Should successfully delete a group', () => {
    logon();

    cy.get('.accordion-button').contains(groupName).within(() => {
      cy.get('[id^=ngb-accordion-item]').click();
    });

    cy.get('.btn').contains("Delete Group").click();

    cy.contains(groupName).should('not.exist');
  });
});

describe("Logout Flow E2E Test", () => {
  it("Should display the logout button when logged in", () => {
    logon();

    cy.get('.header > .btn').contains("Superadmin").should('exist');
    cy.get('.header > .btn').contains("Superadmin").click();
    cy.wait(250);

    cy.get('.popover-body').within(() => {
      cy.get('.logout-button').should('exist');
      cy.get('.logout-button').should('be.visible');
    })
  });

  it("Should redirect to login page on logout", () => {
    logon();

    cy.get('.header > .btn').contains("Superadmin").should('exist');
    cy.get('.header > .btn').contains("Superadmin").click();
    cy.wait(250);

    cy.get('.popover-body').within(() => {
      cy.get('.logout-button').click();
    })
    cy.wait(500);

    cy.contains('Welcome back!').should('exist');
  });
})
