describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:5173/");

    cy.url().should("include", "/login");

    cy.wait(1000);

    cy.contains("Create an account").click();

    cy.url().should("include", "/register");

    cy.get("input#name")
      .should("be.visible")
      .should("have.attr", "placeholder", "Budi Setiawan")
      .type("Budi Setiawan")
      .should("have.value", "Budi Setiawan");

    cy.get("input#email")
      .should("be.visible")
      .should("have.attr", "placeholder", "hello@example.com")
      .type("hello@example.com")
      .should("have.value", "hello@example.com");

    cy.get("input#password")
      .should("be.visible")
      .should("have.attr", "placeholder", "••••••••")
      .type("123456")
      .should("have.value", "123456");

    // test show & hide password 
    cy.get("input#password")
      .parent().find("button").click();

    cy.get("input#password")
    .should("have.attr", "type", "text")
    .should("have.value", "123456");

    cy.wait(1000);

    cy.get("input#password")
      .parent()
      .find("button")
      .click();

    cy.get("input#password")
      .should("have.attr", "type", "password");

  });
});