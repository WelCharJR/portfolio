import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base — makes the built asset paths work no matter which subpath
  // GitHub Pages serves this from (e.g. username.github.io/nome-do-repo/).
  base: "./",
});
