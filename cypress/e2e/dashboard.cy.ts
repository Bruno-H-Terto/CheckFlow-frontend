describe("Checkflow dashboard", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/plans", {
      body: [
        {
          id: 1,
          name: "Checkout distribuído",
          description: "Fluxo principal",
          active: true,
        },
      ],
    }).as("plans");
    cy.intercept("GET", "/api/plans/1/steps", {
      body: [
        { id: 10, plan_id: 1, sequence: 1, name: "Autenticar", active: true },
        { id: 11, plan_id: 1, sequence: 2, name: "Criar pedido", active: true },
      ],
    }).as("steps");
    cy.intercept("GET", "/api/plans/1/executions", {
      body: [
        {
          id: "execution-1",
          plan_id: 1,
          status: "failed",
          variables: {},
          retry_of: null,
          error: "HTTP 500",
          created_at: "2026-06-28T12:00:00Z",
          started_at: "2026-06-28T12:00:01Z",
          finished_at: "2026-06-28T12:00:02Z",
        },
      ],
    }).as("executions");
    cy.intercept("POST", "/api/plans/1/executions", {
      statusCode: 202,
      body: { execution_id: "execution-2" },
    }).as("executePlan");
  });

  it("carrega o plano, seus steps e dispara uma execução", () => {
    cy.visit("/");
    cy.wait(["@plans", "@steps", "@executions"]);

    cy.contains("Checkout distribuído").should("be.visible");
    cy.contains("Autenticar").should("be.visible");
    cy.contains("Criar pedido").should("be.visible");
    cy.get('[data-cy="execution-execution-1"]').should("contain.text", "failed");

    cy.get('[data-cy="execute-plan"]').click();
    cy.wait("@executePlan").its("request.body").should("deep.equal", {});
  });
});
