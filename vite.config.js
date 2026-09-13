import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// configure-pages supplies the correct path for project sites AND custom domains.
// Relative URLs keep local previews and any manually hosted subfolder portable.
const pagesBase = process.env.VITE_BASE_PATH;
export default defineConfig({
  plugins: [react()],
  base: pagesBase === undefined ? "./" : `${pagesBase.replace(/\/$/, "")}/`,
});
