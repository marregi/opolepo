import React, { useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { categories } from "./data";
import { normalize, categoryIds } from "./study";

export default function CategoryPicker({
  selected,
  change,
  available = categoryIds,
}) {
  const [query, Q] = useState(""),
    [open, O] = useState(false),
    [active, A] = useState(0);
  const input = useRef(),
    id = useId();
  const options = available.filter(
    (i) =>
      !selected.includes(i) &&
      normalize(categories[i]).includes(normalize(query)),
  );
  function add(i) {
    change([...selected, i]);
    Q("");
    A(0);
    input.current.focus();
    O(false);
  }
  function move(n) {
    A(n);
    document.getElementById(id + "-" + n)?.scrollIntoView({ block: "nearest" });
  }
  return (
    <div className="category-picker">
      <div className="picker-head">
        <label htmlFor={id}>
          Categorías <small>({selected.length})</small>
        </label>
        <div>
          <button type="button" onClick={() => change([...available])}>
            Todas
          </button>{" "}
          ·{" "}
          <button type="button" onClick={() => change([])}>
            Borrar todas
          </button>
        </div>
      </div>
      <div
        className="picker-input"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) O(false);
        }}
      >
        <Search size={16} />
        <input
          id={id}
          ref={input}
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={id + "-list"}
          aria-autocomplete="list"
          aria-activedescendant={
            open && options[active] != null ? id + "-" + active : undefined
          }
          placeholder="Buscar categoría…"
          value={query}
          onFocus={() => O(true)}
          onClick={() => O(true)}
          onChange={(e) => {
            Q(e.target.value);
            O(true);
            A(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) {
              e.preventDefault();
              e.stopPropagation();
              O(false);
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              O(true);
              move(
                Math.max(
                  0,
                  Math.min(
                    options.length - 1,
                    active + (e.key === "ArrowDown" ? 1 : -1),
                  ),
                ),
              );
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (options[active] != null) add(options[active]);
              else O(false);
            }
          }}
        />
        {open && (
          <div
            className="picker-options"
            role="listbox"
            aria-label="Categorías disponibles"
            id={id + "-list"}
          >
            {options.length ? (
              options.map((i, k) => (
                <button
                  type="button"
                  tabIndex={-1}
                  role="option"
                  aria-selected={active === k}
                  key={i}
                  id={id + "-" + k}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(i)}
                >
                  {categories[i]}
                </button>
              ))
            ) : (
              <small>
                {query
                  ? "Sin coincidencias"
                  : "Todas las categorías están seleccionadas"}
              </small>
            )}
          </div>
        )}
      </div>
      {!!selected.length && (
        <div className="chips">
          {selected.map((i) => (
            <button
              type="button"
              key={i}
              aria-label={"Quitar " + categories[i]}
              onClick={() => change(selected.filter((k) => k !== i))}
            >
              {categories[i]}
              <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
