import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    providers: "src/providers/index.ts",
    services: "src/services/index.ts",
    components: "src/components/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom", "@supabase/supabase-js", "@andrea/crm-ui", "@tanstack/react-query"]
});
