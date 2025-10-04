import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: { runMode: 2, openMode: 0 },
    // ensure Cypress uses the cypress tsconfig when compiling specs
    setupNodeEvents(on, config) {
      process.env.TS_NODE_PROJECT = "cypress/tsconfig.json";
      return config;
    },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
    indexHtmlFile: "cypress/support/component-index.html",
  },
});
