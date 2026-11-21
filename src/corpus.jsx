import React, { useState } from "react";
import { BookOpen, Plus, ExternalLink } from "lucide-react";
import { categories } from "./data";
import { newId } from "./uuid";
const constitution = {
  cat: categories.indexOf("Constitución Española"),
  url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229",
  title: "Texto consolidado de la Constitución Española (BOE)",
};
export default function Corpus({ qs, db, docs, addDoc, openNotes, admin }) {
  const [adding, A] = useState(false),
    [msg, M] = useState(""),
    [busy, B] = useState(false);
  async function add(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    B(true);
    M("");
    try {
      let url = f.get("url"),
        file = f.get("file"),
        id = newId();
      let markdown;
      if (file.name && /\.(md|markdown)$/i.test(file.name)) {
        if (file.size > 1024 * 1024)
          throw Error("Elige un Markdown de hasta 1 MB.");
        markdown = await file.text();
        if (!markdown.trim()) throw Error("El fichero Markdown está vacío.");
        url = null;
      } else if (file.size) {
        if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024)
          throw Error("Elige un PDF de hasta 10 MB.");
        const key = id + ".pdf",
          b = db.storage.from("corpus");
        let r = await b.upload(key, file);
        if (r.error) throw r.error;
        url = b.getPublicUrl(key).data.publicUrl;
      }
      if (!markdown && !/^https?:\/\//i.test(url))
        throw Error(
          "Introduce una URL o selecciona un fichero Markdown o PDF.",
        );
      const d = {
        id,
        title: f.get("title").trim(),
        cat: Number(f.get("cat")),
        url,
        ...(markdown ? { markdown } : {}),
      };
      let r = await db.from("documents").insert(d);
      if (r.error) throw r.error;
      addDoc(d);
      A(false);
    } catch (e) {
      M(e.message);
    } finally {
      B(false);
    }
  }
  return (
    <>
      {admin && (
        <div className="toolbar">
          <button className="primary" onClick={() => A(!adding)}>
            <Plus size={16} />
            {adding ? "Cerrar formulario" : "Añadir documento"}
          </button>
        </div>
      )}
      {adding && (
        <form className="card settings" onSubmit={add}>
          <h3>Nuevo documento</h3>
          <label>
            Título
            <input name="title" required />
          </label>
          <label>
            Categoría
            <select name="cat">
              {categories.map((c, i) => (
                <option key={c} value={i}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            URL de la fuente
            <input type="url" name="url" placeholder="https://…" />
          </label>
          <label>
            O sube apuntes Markdown (1 MB) o un PDF público (10 MB)
            <input
              type="file"
              name="file"
              accept=".md,.markdown,application/pdf"
            />
          </label>
          <button disabled={busy} className="primary">
            {busy ? "Guardando…" : "Guardar documento"}
          </button>
        </form>
      )}
      {msg && <p role="alert">{msg}</p>}
      <div className="cards">
        {categories.map((c, i) => {
          const notes = docs.filter(d => d.cat === i && d.markdown);
          const links = new Map([
            ...qs.filter(q => q.cat === i && q.url && !q.citation).map(q => [q.url, q.source]),
            ...[constitution, ...docs].filter(d => d.cat === i && d.url).map(d => [d.url, d.title]),
          ]);
          if (!notes.length && !links.size) return null;
          return (
          <section className="card" key={c}>
            <span className={"tile c" + i}>
              <BookOpen />
            </span>
            <h3>{c}</h3>
            {notes.map((d) => (
                <button
                  key={d.id}
                  className="note-link"
                  onClick={() => openNotes(d.id)}
                >
                  <BookOpen size={14} />
                  {d.title}
                </button>
              ))}
            {[...links].map(([url, title]) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {title}
                <ExternalLink size={14} />
              </a>
            ))}
          </section>
        );})}
      </div>
    </>
  );
}
