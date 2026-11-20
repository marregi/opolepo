import React, { useMemo, useState } from "react";
import { categories } from "./data";
import CategoryPicker from "./categories";
import { categoryIds, dateRange, summarize } from "./study";
export default function Statistics({ sessions }) {
  const [selected, S] = useState(categoryIds),
    [period, P] = useState("all"),
    [from, F] = useState(""),
    [to, T] = useState(""),
    [group, G] = useState("category"),
    [metric, M] = useState("total"),
    [direction, D] = useState("desc");
  const rows = useMemo(
    () =>
      summarize(
        sessions,
        selected,
        dateRange(period, from, to),
        group,
        metric,
        direction,
      ),
    [sessions, selected, period, from, to, group, metric, direction],
  );
  const max = rows.reduce((m, r) => Math.max(m, r.total), 1),
    total = rows.reduce((s, r) => s + r.total, 0);
  return (
    <>
      <section className="card filters">
        <CategoryPicker selected={selected} change={S} />
        <div className="filter-grid">
          <label>
            Periodo
            <select value={period} onChange={(e) => P(e.target.value)}>
              {[
                ["all", "Todo el historial"],
                ["12m", "Último año"],
                ["3m", "Últimos 3 meses"],
                ["1m", "Último mes"],
                ["7d", "Última semana"],
                ["3d", "Últimos 3 días"],
                ["1d", "Último día"],
                ["custom", "Entre fechas"],
              ].map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Agrupar por
            <select value={group} onChange={(e) => G(e.target.value)}>
              <option value="category">Categoría</option>
              <option value="question">Pregunta individual</option>
            </select>
          </label>
          <label>
            Ordenar por
            <select value={metric} onChange={(e) => M(e.target.value)}>
              <option value="total">Veces respondida</option>
              <option value="wrong">Veces fallada</option>
              <option value="rate">Porcentaje de fallo</option>
            </select>
          </label>
          <label>
            Orden
            <select value={direction} onChange={(e) => D(e.target.value)}>
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </label>
        </div>
        {period === "custom" && (
          <div className="date-fields">
            <label>
              Desde
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => F(e.target.value)}
              />
            </label>
            <label>
              Hasta
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => T(e.target.value)}
              />
            </label>
          </div>
        )}
      </section>
      <div className="sectiontitle">
        <h2>
          {group === "category"
            ? "Resultados por categoría"
            : "Resultados por pregunta"}
        </h2>
        <small>{total} respuestas</small>
      </div>
      {!rows.length ? (
        <div className="list">
          <p>
            {!selected.length
              ? "Selecciona alguna categoría para ver los resultados."
              : !dateRange(period, from, to)
                ? "Elige un intervalo válido con fecha inicial y final."
                : "No hay respuestas en este periodo para la selección."}
          </p>
        </div>
      ) : (
        <div className="cards">
          {rows.map((r) => (
            <section className="card chart" key={r.key}>
              {group === "question" && <small>{categories[r.cat]}</small>}
              <h3>{r.title}</h3>
              <p>
                {(r.rate * 100).toLocaleString("es-ES", {
                  maximumFractionDigits: 1,
                })}{" "}
                % de fallo · {r.wrong} de {r.total}
              </p>
              {[
                [r.total, "Total", "total"],
                [r.correct, "Acertadas", "correct"],
                [r.wrong, "Falladas", "wrong"],
              ].map(([n, label, cls]) => (
                <div className="bar-row" key={cls}>
                  <span>{label}</span>
                  <div className="track">
                    <i
                      className={cls}
                      style={{ width: `${(100 * n) / max}%` }}
                    />
                  </div>
                  <b>{n}</b>
                </div>
              ))}
              <div className="axis">
                <span>0</span>
                <span>{max} respuestas</span>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
