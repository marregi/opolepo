import { categories } from "./data.js";

export const categoryIds = categories.map((_, i) => i);
export const normalize = (s) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
export function sessionConfig(s) {
  return (
    s.config ?? {
      name: s.name,
      selected: s.cats,
      individual: false,
      total: s.items.length,
      counts: {},
      failed: false,
    }
  );
}

// Los intervalos personalizados incluyen ambos días, en la zona local.
export function dateRange(period, from, to, now = new Date()) {
  if (period === "all") return [-Infinity, Infinity];
  if (period === "custom") {
    if (!from || !to || from > to) return null;
    const end = new Date(to + "T00:00:00");
    end.setDate(end.getDate() + 1);
    return [+new Date(from + "T00:00:00"), +end];
  }
  const start = new Date(now);
  if (period.endsWith("m")) {
    const day = start.getDate();
    start.setDate(1);
    start.setMonth(start.getMonth() - parseInt(period));
    const last = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0,
    ).getDate();
    start.setDate(Math.min(day, last));
  } else start.setDate(start.getDate() - parseInt(period));
  return [+start, +now + 1];
}

export function summarize(sessions, selected, range, group, metric, direction) {
  if (!range) return [];
  const allowed = new Set(selected),
    rows = new Map();
  for (const s of sessions)
    s.answers.forEach((answer, i) => {
      const q = s.items[i],
        at = Date.parse(s.answeredAt?.[i] ?? s.date);
      if (!allowed.has(q.cat) || at < range[0] || at >= range[1]) return;
      const key = group === "category" ? q.cat : q.id;
      if (!rows.has(key))
        rows.set(key, {
          key,
          cat: q.cat,
          title: group === "category" ? categories[q.cat] : q.text,
          total: 0,
          wrong: 0,
        });
      const row = rows.get(key);
      row.total++;
      if (answer !== q.correct) row.wrong++;
    });
  const result = [...rows.values()].map((r) => ({
    ...r,
    correct: r.total - r.wrong,
    rate: r.wrong / r.total,
  }));
  return result.sort(
    (a, b) =>
      (direction === "desc" ? -1 : 1) * (a[metric] - b[metric]) ||
      b.total - a.total ||
      a.title.localeCompare(b.title, "es"),
  );
}
