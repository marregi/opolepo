import test from "node:test";
import assert from "node:assert/strict";
import { inspectNote, validatePack } from "../src/notes.js";
const md =
  "# Tema\n\n## Primero\n\nLa **regla** se aplica\nsiempre.\n\n## Segundo\n\nLa regla se aplica siempre.";
const cite = { section: "Tema › Primero", quote: "regla se aplica siempre." };
const marks = (node) =>
  (node.tagName === "mark" ? [node] : []).concat(
    (node.children || []).flatMap(marks),
  );
test("resalta una cita dentro del apartado incluso con énfasis y saltos de línea", () => {
  const { tree, issue } = inspectNote(md, cite);
  assert.equal(issue, undefined);
  assert.equal(
    marks(tree)
      .map((m) => m.children[0].value)
      .join("")
      .replace(/\s+/g, " "),
    cite.quote,
  );
  assert.equal(
    marks(tree).filter((m) => m.properties["data-note-target"]).length,
    1,
  );
});
test("no inventa un destino para una cita repetida, modificada o sin apartado", () => {
  for (const c of [
    { ...cite, section: "" },
    { ...cite, section: "Ya no existe" },
    { ...cite, quote: "Texto nuevo" },
  ]) {
    const r = inspectNote(md, c);
    assert.ok(r.issue);
    assert.equal(marks(r.tree).length, 0);
  }
  assert.ok(inspectNote(md + "\n## Primero\n\nOtra copia.", cite).issue);
});
test("rechaza citas incorrectas al validar el paquete", () => {
  const question = {
    id: "prueba-01",
    text: "¿Cuándo?",
    options: ["Siempre", "Nunca", "A veces", "Por la tarde"],
    correct: 0,
    ...cite,
  };
  const pack = {
    id: "prueba",
    title: "Prueba",
    category: "Tema",
    markdown: md,
    questions: [question],
  };
  validatePack(pack, new Set());
  assert.throws(
    () => validatePack({ ...pack, markdown: "# Tema" }, new Set()),
    /apartado/,
  );
});
