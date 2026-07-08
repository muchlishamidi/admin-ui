describe("Dashboard and expense flow E2E", () => {
  const validEmail = "hello@example.com";
  const validPassword = "123456";

  beforeEach(() => {
    cy.intercept("GET", "**/goals", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          data: [
            {
              target_amount: 5000,
              present_amount: 3200,
            },
          ],
        },
      });
    }).as("getGoals");

    cy.intercept("GET", "**/bills", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          data: [
            {
              id: 1,
              month: "May",
              date: "19",
              logo: "figma.png",
              name: "Figma Pro",
              lastCharge: "Apr 20, 2023",
              amount: 120,
            },
          ],
        },
      });
    }).as("getBills");

    cy.intercept("GET", "**/expenses", (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            category: "Housing",
            amount: 1200,
            percentage: 35,
            trend: "up",
            detail: [
              { item: "Rent", amount: 950, date: "May 1" },
              { item: "Utilities", amount: 250, date: "May 5" },
            ],
          },
        ],
      });
    }).as("getExpenses");

    cy.intercept("POST", "**/logout", (req) => {
      req.reply({ statusCode: 200, body: {} });
    }).as("logoutRequest");
  });

  it("melakukan login, melihat loading, menampilkan data dashboard, membuka expenses, lalu logout", () => {
    cy.visit("/login");
    cy.url().should("include", "/login");

    cy.get("input#email")
      .should("be.visible")
      .should("have.attr", "placeholder", "hello@example.com");

    cy.get("input#password")
      .should("be.visible")
      .should("have.attr", "placeholder", "●●●●●●●●●●●●●●");

    cy.contains("button", "Login").click();
    cy.contains("Email wajib diisi").should("be.visible");
    cy.contains("Password wajib diisi").should("be.visible");

    cy.get("input#email").clear().type(validEmail).should("have.value", validEmail);
    cy.get("input#password").clear().type(validPassword).should("have.value", validPassword);

    cy.contains("button", "Login").click();
    cy.contains("button", "Loading...").should("be.visible");

    cy.location("pathname", { timeout: 20000 }).should("eq", "/");

    cy.wait("@getGoals");
    cy.wait("@getBills");

    cy.contains("Target Achieved").should("be.visible");
    cy.contains("Figma Pro").should("be.visible");

    cy.contains("a", "Expenses").click();
    cy.url().should("include", "/expense");
    cy.wait("@getExpenses");
    cy.contains("Housing").should("be.visible");
    cy.contains("Rent").should("be.visible");

    cy.contains("Logout").click();
    cy.contains("Logging Out").should("be.visible");
    cy.wait("@logoutRequest");
    cy.url().should("include", "/login");
  });

  it("mengaktifkan dark mode di login dan di dashboard sidebar", () => {
    cy.visit("/login");

    cy.get("html").should("not.have.class", "theme-dark");
    cy.get("div[title='Switch to Dark Mode']")
      .first()
      .click();

    cy.get("html").should("have.class", "theme-dark");
    cy.get("html").should("have.class", "dark");

    cy.window().then((win) => {
      const rootStyles = win.getComputedStyle(win.document.documentElement);
      expect(rootStyles.getPropertyValue("--color-special-mainBg").trim()).to.equal("#323232");
      expect(rootStyles.getPropertyValue("--color-defaultBlack").trim()).to.equal("#ffffff");
    });

    cy.get("div[title='Switch to Light Mode']")
      .first()
      .click();

    cy.get("html").should("not.have.class", "theme-dark");
    cy.get("html").should("not.have.class", "dark");

    cy.get("input#email").type(validEmail);
    cy.get("input#password").type(validPassword);
    cy.contains("button", "Login").click();

    cy.location("pathname", { timeout: 20000 }).should("eq", "/");
    cy.wait("@getGoals");
    cy.wait("@getBills");

    cy.get("div[title='Switch to Dark Mode']").click();
    cy.get("html").should("have.class", "theme-dark");
    cy.get("html").should("have.class", "dark");

    cy.window().then((win) => {
      const rootStyles = win.getComputedStyle(win.document.documentElement);
      expect(rootStyles.getPropertyValue("--color-special-mainBg").trim()).to.equal("#323232");
      expect(rootStyles.getPropertyValue("--color-defaultBlack").trim()).to.equal("#ffffff");
    });

    cy.get("div[title='Switch to Light Mode']").click();
    cy.get("html").should("not.have.class", "theme-dark");
    cy.get("html").should("not.have.class", "dark");
  });

  it("menangani skenario login gagal", () => {
    cy.visit("/login");

    cy.contains("button", "Login").click();
    cy.contains("Email wajib diisi").should("be.visible");
    cy.contains("Password wajib diisi").should("be.visible");

    cy.get("input#email").clear().type("not-an-email");
    cy.contains("button", "Login").click();
    cy.contains("Email tidak valid").should("be.visible");

    cy.get("input#email").clear().type(validEmail);
    cy.get("input#password").clear();
    cy.contains("button", "Login").click();
    cy.contains("Password wajib diisi").should("be.visible");

    cy.intercept("POST", "**/login", (req) => {
      req.reply({
        statusCode: 401,
        body: { message: "Email or Password is incorrect" },
      });
    }).as("failedLogin");

    cy.get("input#email").clear().type(validEmail);
    cy.get("input#password").clear().type("wrong-password");
    cy.contains("button", "Login").click();

    cy.wait("@failedLogin");
    
    cy.get("div").find("svg").should("be.visible"); 
  });
});