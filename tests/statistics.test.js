import test from "node:test";
import assert from "node:assert/strict";
import { dateRange, summarize } from "../src/study.js";

const a = { id: "a", cat: 0, text: "Pregunta A", correct: 1 },
  b = { id: "b", cat: 1, text: "Pregunta B", correct: 0 };
// La segunda sesión empezó antes del periodo pero continuó dentro de él.
const sessions = [
  { date: "2026-04-01T00:00:00", items: [a, b], answers: [1, 1] },
  {
    date: "2026-03-31T12:00:00",
    items: [b, a, a],
    answers: [0, 0],
    answeredAt: ["2026-04-02T00:00:00", "2026-04-01T23:59:59"],
  },
];
test("intervalo local inclusivo, fechas antiguas y preguntas sin responder", () => {
  const day = dateRange("custom", "2026-04-01", "2026-04-01");
  const rows = summarize(sessions, [0, 1], day, "question", "rate", "desc");
  assert.deepEqual(
    rows.map((r) => [r.key, r.total, r.wrong, r.correct, r.rate]),
    [
      ["b", 1, 1, 0, 1],
      ["a", 2, 1, 1, 0.5],
    ],
  );
  assert.equal(
    summarize(sessions, [1], day, "category", "total", "desc")[0].total,
    1,
  );
  assert.deepEqual(
    summarize(sessions, [], day, "category", "wrong", "asc"),
    [],
  );
  assert.equal(dateRange("custom", "2026-04-02", "2026-04-01"), null);
});
test("orden ascendente y meses de distinta duración", () => {
  assert.deepEqual(
    summarize(
      sessions,
      [0, 1],
      dateRange("custom", "2026-04-01", "2026-04-01"),
      "category",
      "rate",
      "asc",
    ).map((r) => r.cat),
    [0, 1],
  );
  const at = new Date(2026, 2, 31, 14);
  assert.equal(dateRange("1m", "", "", at)[0], +new Date(2026, 1, 28, 14));
});
