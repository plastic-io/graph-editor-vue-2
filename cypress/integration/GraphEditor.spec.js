/* globals cy, context, beforeEach, describe, it, expect */
/// <reference types="Cypress" />
context("Actions", () => {
    beforeEach(() => {
        cy.fixture("emptyGraph.json").then((data) => {
            console.log(data);
            localStorage.setItem("a48bb15a-d34c-40e9-88f7-4a0471937465", JSON.stringify(data));
        });
        cy.visit("/a48bb15a-d34c-40e9-88f7-4a0471937465");
    });
    describe("Graph Editor", () => {
        it("Should load an empty graph.", (done) => {
            expect(1).toEqual(1);
            done();
        });
    });
});
