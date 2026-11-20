const metadata = import.meta.glob("./*.json", {
  eager: true,
  import: "default",
});
const texts = import.meta.glob("./*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});
export const materials = Object.entries(metadata).map(([file, meta]) => ({
  ...meta,
  markdown: texts[file.replace(/\.json$/, ".md")],
}));
