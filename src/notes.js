import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize);
const blocks = new Set(
  "p ul ol li blockquote pre table tr td th h1 h2 h3 h4 h5 h6 hr".split(" "),
);
const plain = (node) => node.value ?? (node.children || []).map(plain).join("");

// La cita se compara con texto visible, no con los delimitadores Markdown.
export function inspectNote(markdown, citation) {
  const tree = parser.runSync(parser.parse(markdown)),
    headings = [],
    stack = [],
    runs = [];
  let sectionCount = 0,
    fallback = null,
    inScope = !citation?.section,
    run = [];
  function flush() {
    if (run.length) runs.push(run);
    run = [];
  }
  function visit(node, parent) {
    if (node.type === "text") {
      if (inScope) run.push({ node, parent, text: node.value });
      return;
    }
    if (node.tagName === "br" && inScope) {
      run.push({ text: "\n" });
      return;
    }
    if (blocks.has(node.tagName)) flush();
    if (parent === tree && /^h[1-6]$/.test(node.tagName)) {
      const level = Number(node.tagName[1]);
      while (stack.length && stack.at(-1).level >= level) stack.pop();
      const path = [...stack.map((h) => h.name), plain(node)].join(" › ");
      stack.push({ level, name: plain(node), path });
      headings.push(path);
      if (path === citation?.section) {
        sectionCount++;
        fallback = node;
      }
      inScope =
        !citation?.section || stack.some((h) => h.path === citation.section);
    }
    for (const child of node.children || []) visit(child, node);
    if (blocks.has(node.tagName)) flush();
  }
  visit(tree, null);
  flush();
  if (!citation) return { tree, headings };
  const issue = (message) => {
    if (sectionCount === 1) fallback.properties["data-note-target"] = "section";
    return { tree, headings, issue: message };
  };
  if (citation.section && sectionCount !== 1)
    return issue(
      "El apartado ha cambiado o no es único. Revisa la referencia.",
    );
  const words = citation.quote?.trim().split(/\s+/);
  if (!words?.[0]) return issue("La referencia no contiene una cita.");
  const escaped = words
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  const exp = new RegExp(`(?=(${escaped}))`, "gu");
  let hit;
  for (const r of runs) {
    for (const m of r
      .map((x) => x.text)
      .join("")
      .matchAll(exp)) {
      if (hit)
        return issue("La cita aparece más de una vez. Revisa la referencia.");
      hit = { run: r, start: m.index, end: m.index + m[1].length };
    }
  }
  if (!hit)
    return issue("La cita ya no coincide con el texto. Revisa la referencia.");
  let pos = 0,
    first = true;
  for (const { node, parent, text } of hit.run) {
    const lo = Math.max(0, hit.start - pos),
      hi = Math.min(text.length, hit.end - pos);
    if (node && lo < hi) {
      const parts = [],
        add = (t) => {
          if (t) parts.push({ type: "text", value: t });
        };
      add(text.slice(0, lo));
      parts.push({
        type: "element",
        tagName: "mark",
        properties: first ? { "data-note-target": "quote" } : {},
        children: [{ type: "text", value: text.slice(lo, hi) }],
      });
      first = false;
      add(text.slice(hi));
      parent.children.splice(parent.children.indexOf(node), 1, ...parts);
    }
    pos += text.length;
  }
  return { tree, headings };
}

export function validatePack(
  { id, title, category, markdown, questions },
  knownIds,
) {
  if (
    !id ||
    !title?.trim() ||
    !category?.trim() ||
    !markdown?.trim() ||
    !Array.isArray(questions)
  )
    throw Error("Falta contenido o metadatos del documento: " + id);
  for (const q of questions) {
    if (
      !q.id ||
      knownIds.has(q.id) ||
      !q.text?.trim() ||
      q.options?.length !== 4 ||
      !q.options.every((o) => typeof o === "string" && o.trim()) ||
      !Number.isInteger(q.correct) ||
      q.correct < 0 ||
      q.correct > 3
    )
      throw Error("Pregunta incompleta o identificador duplicado: " + q.id);
    const result = inspectNote(markdown, {
      section: q.section,
      quote: q.quote,
    });
    if (result.issue) throw Error(`${id} / ${q.id}: ${result.issue}`);
    knownIds.add(q.id);
  }
}
