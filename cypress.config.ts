import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      // Cypress auto-loads webpack.config.js from the project root.
      // If you named it differently, add: webpackConfig: require('./webpack.config.js')
    },
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
    indexHtmlFile: "cypress/support/component-index.html", // explicit, matches your error
  },
});
