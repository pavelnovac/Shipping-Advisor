import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "Shipping-Advisor";

export default defineConfig({
  plugins: [react()],
  // Relative base keeps GitHub project Pages and local preview working.
  // GitHub Actions still prefixes with the repository name for Pages URLs.
  base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : "./",
  test: {
    globals: true,
    environment: "node",
  },
});
