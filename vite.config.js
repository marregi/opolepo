import { defineConfig } from "vite";
import { readdirSync, readFileSync } from "node:fs";
import { bank, categories } from "./src/data.js";
import { validatePack } from "./src/notes.js";
export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "validar-apuntes",
      buildStart() {
        const dir = new URL("./src/materiales/", import.meta.url),
          ids = new Set(bank.map((q) => q.id)),
          docs = new Set();
        for (const name of readdirSync(dir).filter((n) =>
          n.endsWith(".json"),
        )) {
          const pack = JSON.parse(readFileSync(new URL(name, dir), "utf8"));
          if (!categories.includes(pack.category) || docs.has(pack.id))
            throw Error(`Revisa la categoría y el identificador de ${name}`);
          docs.add(pack.id);
          validatePack(
            {
              ...pack,
              markdown: readFileSync(
                new URL(name.replace(/\.json$/, ".md"), dir),
                "utf8",
              ),
            },
            ids,
          );
        }
      },
    },
  ],
});
