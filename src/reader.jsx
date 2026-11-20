import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { inspectNote } from "./notes";

export function Reader({ doc, citation }) {
  const article = useRef();
  const result = useMemo(
    () => doc && inspectNote(doc.markdown, citation),
    [doc, citation],
  );
  useEffect(() => {
    article.current
      ?.querySelector("[data-note-target]")
      ?.scrollIntoView({ block: "center" });
  }, [result]);
  if (!doc)
    return (
      <p role="alert">No se ha podido encontrar este documento en el corpus.</p>
    );
  return (
    <>
      <h3>{doc.title}</h3>
      {citation && (
        <p className={result.issue ? "notice" : ""} role="status">
          {result.issue || "Pasaje que justifica la respuesta"}
          {citation.section && " · " + citation.section}
        </p>
      )}
      <article className="note-body" ref={article}>
        {toJsxRuntime(result.tree, {
          Fragment,
          jsx,
          jsxs,
          components: {
            a: ({ children, ...p }) => (
              <a {...p} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
          },
        })}
      </article>
    </>
  );
}
