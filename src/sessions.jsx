import React, { useState } from "react";
import { ArrowRight, Star, Trash2, ChevronDown } from "lucide-react";
import { categories } from "./data";
import CategoryPicker from "./categories";
import { sessionConfig } from "./study";

export function SetupForm({ qs, start, miss, initial }) {
  const available = [...new Set(qs.map((q) => q.cat))].sort((a, b) => a - b);
  const size = (c) => qs.filter((q) => q.cat === c).length;
  const [selected, S] = useState(
      () => initial?.selected.filter((c) => available.includes(c)) ?? [],
    ),
    [counts, K] = useState(() =>
      Object.fromEntries(
        available.map((c) => [c, Math.min(initial?.counts?.[c] || 1, size(c))]),
      ),
    ),
    [total, T] = useState(initial?.total ?? 10),
    [individual, I] = useState(initial?.individual ?? false),
    [failed, F] = useState(initial?.failed ?? false),
    [name, N] = useState(initial?.name ?? "");
  const pool = qs.filter((q) => selected.includes(q.cat)),
    max = pool.length;
  const number = individual
    ? selected.reduce((n, c) => n + Number(counts[c]), 0)
    : max && total !== ""
      ? Math.min(max, total)
      : total;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (max)
          start(
            {
              name,
              selected,
              counts,
              individual,
              total: Number(number),
              failed,
            },
            e.nativeEvent.submitter?.value === "save",
          );
      }}
    >
      <p>Elige los temas y la cantidad de preguntas.</p>
      <label>
        Nombre de la sesión
        <input
          placeholder="Ej. Repaso del viernes"
          value={name}
          maxLength={80}
          onChange={(e) => N(e.target.value)}
        />
      </label>
      <CategoryPicker selected={selected} change={S} available={available} />
      <label className="check">
        <input
          type="checkbox"
          checked={individual}
          onChange={(e) => I(e.target.checked)}
        />
        Elegir cantidad por categoría
      </label>
      {individual &&
        selected.map((c) => (
          <div className="catline" key={c}>
            <label htmlFor={"count" + c}>{categories[c]}</label>
            <input
              id={"count" + c}
              type="number"
              min={1}
              max={size(c)}
              required
              value={counts[c]}
              onChange={(e) => K({ ...counts, [c]: e.target.value })}
            />
          </div>
        ))}
      <label>
        Preguntas totales
        <input
          type="number"
          min={1}
          max={max || 1}
          required
          disabled={individual || !max}
          value={max ? number : 0}
          onChange={(e) => T(e.target.value)}
        />
      </label>
      <small>
        {max
          ? `${max} preguntas disponibles en la selección.`
          : "Selecciona al menos una categoría."}
      </small>
      <label className="check">
        <input
          type="checkbox"
          checked={failed}
          onChange={(e) => F(e.target.checked)}
        />
        Añadir falladas ({pool.filter((q) => q.id in miss).length})
      </label>
      <small>Las pendientes de repaso tienen prioridad dentro del total.</small>
      <div className="form-actions">
        <button className="primary" disabled={!max}>
          Empezar <ArrowRight size={16} />
        </button>
        <button className="secondary" value="save" disabled={!max}>
          <Star size={15} />
          Empezar y guardar
        </button>
      </div>
    </form>
  );
}
export function Favorites({ favorites, open, remove }) {
  return (
    <>
      <div className="sectiontitle">
        <h2>Configuraciones favoritas</h2>
        <Star size={17} />
      </div>
      <div className="list">
        {favorites.length ? (
          favorites.map((f) => (
            <div className="favrow" key={f.id}>
              <div className="rowtext">
                <b>{f.config.name}</b>
                <small>
                  {f.config.total} preguntas · {f.config.selected.length}{" "}
                  categorías
                </small>
              </div>
              <button className="textbtn" onClick={() => open(f.config)}>
                Usar <ArrowRight size={14} />
              </button>
              <button
                aria-label={"Eliminar favorito " + f.config.name}
                onClick={() => remove(f.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <p>
            Usa «Empezar y guardar» al crear una sesión para conservar su
            configuración aquí.
          </p>
        )}
      </div>
    </>
  );
}
export function SessionDetails({ s, open }) {
  const c = sessionConfig(s);
  return (
    <details className="session-details">
      <summary>
        Configuración de la sesión <ChevronDown size={16} />
      </summary>
      <div>
        <p>
          <b>Categorías seleccionadas:</b>{" "}
          {c.selected
            .map(
              (i) => categories[i] + (c.individual ? ` (${c.counts[i]})` : ""),
            )
            .join(" · ")}
        </p>
        <p>
          <b>Preguntas:</b> {s.items.length}
        </p>
        <p>
          <b>Añadir falladas:</b>{" "}
          {s.config ? (c.failed ? "Sí" : "No") : "No registrado"}
        </p>
        {s.reviewCount != null && (
          <p>
            <b>Pendientes de repaso al empezar:</b> {s.reviewCount} de{" "}
            {s.items.length}
          </p>
        )}
        {!s.config && (
          <small>
            Sesión anterior: se recuperan las categorías y el total disponibles.
          </small>
        )}
        <button className="secondary" onClick={() => open(c)}>
          Abrir configurador <ArrowRight size={15} />
        </button>
      </div>
    </details>
  );
}
