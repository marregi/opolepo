import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Layers3,
  LayoutDashboard,
  History,
  BookOpen,
  Library,
  Settings,
  PanelLeftClose,
  ChevronRight,
  Plus,
  ArrowRight,
  ListChecks,
  Target,
  RotateCcw,
  CalendarDays,
  NotebookText,
  Scale,
  Landmark,
  Globe2,
  Menu,
  X,
  Check,
  LogIn,
  ExternalLink,
  Search,
  Pencil,
  FolderOpen,
  GraduationCap,
  ClipboardList,
  LayoutGrid,
  ChevronDown,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { categories, bank as seedBank, empty, demo } from "./data";
import { materials } from "./materiales";
import { Reader } from "./reader";
import { inspectNote } from "./notes";
import Books from "./art";
import Corpus from "./corpus";
import { newId } from "./uuid";
import { SetupForm, Favorites, SessionDetails } from "./sessions";
import Statistics from "./statistics";
import "./style.css";
const db =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
      )
    : null;
const icons = [Scale, Landmark, Library, Globe2],
  date = (v) =>
    new Date(v).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
  shuffle = (a) => {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
function local(k, def) {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? def();
  } catch {
    return def();
  }
}
const localDemo = import.meta.env.DEV && !db;
const catalog = materials.filter(m => localDemo || !m.demo);
const bundledDocs = catalog.map((m) => ({
  id: m.id,
  title: m.title,
  cat: categories.indexOf(m.category),
  markdown: m.markdown,
}));
const bank = [
  ...(localDemo ? seedBank : []),
  ...catalog.flatMap((m) =>
    m.questions.map((q) => ({
      ...q,
      cat: categories.indexOf(m.category),
      source: m.title,
      citation: { documentId: m.id, section: q.section, quote: q.quote },
    })),
  ),
];
function App() {
  const [data, D] = useState(() => localDemo ? local("of-demo", demo) : empty()),
    [qs, Q] = useState(bank),
    [docs, setDocs] = useState(bundledDocs),
    [reading, setReading] = useState(null),
    [user, U] = useState(null),
    [page, P] = useState("Panel de estudio"),
    [modal, M] = useState(""),
    [initialConfig, setInitialConfig] = useState(null),
    [side, S] = useState(false),
    [current, C] = useState(null),
    [feedback, F] = useState(false),
    [theme, T] = useState(() => local("of-theme", () => "system")),
    [err, E] = useState(""),
    [search, G] = useState(""),
    [edit, H] = useState(null),
    [ready, R] = useState(!db),
    queue = useRef(Promise.resolve());
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("of-theme", JSON.stringify(theme));
  }, [theme]);
  useEffect(() => {
    if (!db) return;
    let active = true,
      seq = 0;
    const { data: sub } = db.auth.onAuthStateChange((_, s) => {
      let n = ++seq;
      R(false);
      setTimeout(async () => {
        if (!active || n !== seq) return;
        let u = s?.user,
          d = empty(),
          q = bank,
          documents = bundledDocs;
        if (u) {
          let [a, b, files] = await Promise.all([
            db
              .from("study_state")
              .select("value")
              .eq("owner", u.id)
              .maybeSingle(),
            db.from("questions").select("id,value"),
            db.from("documents").select("*"),
          ]);
          if (a.error || b.error || files.error) {
            E(
              "No se pudo cargar Supabase. Comprueba la conexión y el esquema.",
            );
            return;
          }
          d = a.data?.value ?? empty();
          documents = [...bundledDocs, ...files.data];
          q = [
            ...new Map(
              [...bank, ...b.data.map((r) => ({ ...r.value, id: r.id }))].map(
                (x) => [x.id, x],
              ),
            ).values(),
          ];
        }
        if (active && n === seq) {
          U(u);
          D(d);
          Q(q);
          setDocs(documents);
          R(true);
          P("Panel de estudio");
          M("");
        }
      }, 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  function save(d) {
    D(d);
    if (user) {
      let owner = user.id;
      queue.current = queue.current.then(async () => {
        let r = await db.from("study_state").upsert({ owner, value: d });
        if (r.error)
          E("No se pudo sincronizar el progreso. Comprueba tu conexión.");
      });
    } else if (localDemo) localStorage.setItem("of-demo", JSON.stringify(d));
  }
  function openNotes(documentId, citation = null) {
    setReading({ documentId, citation });
    M("Lector de apuntes");
  }
  function reference(q) {
    return q.citation ? (
      <button
        type="button"
        className="note-link"
        onClick={() => openNotes(q.citation.documentId, q.citation)}
      >
        <BookOpen size={15} />
        Ver en los apuntes
      </button>
    ) : (
      <a href={q.url} target="_blank" rel="noreferrer">
        {q.source} ↗
      </a>
    );
  }
  function nav(p) {
    P(p);
    S(false);
    G("");
    F(false);
    M("");
  }
  function openSession(id) {
    C(id);
    nav("Cuestionario");
  }
  const { sessions, miss, threshold } = data,
    s = sessions.find((x) => x.id === current),
    answers = sessions.flatMap((s) =>
      s.answers.map((a, i) => a === s.items[i].correct),
    ),
    rate = answers.length
      ? Math.round((100 * answers.filter(Boolean).length) / answers.length)
      : 0,
    admin = user?.app_metadata?.role === "admin";
  function configure(config = null) {
    if (!qs.length) {
      nav("Banco de preguntas");
      return;
    }
    setInitialConfig(config);
    S(false);
    M("Nueva sesión");
  }
  function start(config, favorite) {
    let { selected, counts, total, individual, failed, name } = config;
    const pick = (arr, n) =>
      failed
        ? [
            ...shuffle(arr.filter((q) => q.id in miss)),
            ...shuffle(arr.filter((q) => !(q.id in miss))),
          ].slice(0, n)
        : shuffle(arr).slice(0, n);
    let items = individual
      ? shuffle(
          selected.flatMap((c) =>
            pick(
              qs.filter((q) => q.cat === c),
              counts[c],
            ),
          ),
        )
      : pick(
          qs.filter((q) => selected.includes(q.cat)),
          total,
        );
    items = items.map((q) => {
      let opts = shuffle(q.options.map((t, i) => ({ t, i })));
      return {
        ...q,
        options: opts.map((o) => o.t),
        correct: opts.findIndex((o) => o.i === q.correct),
      };
    });
    let session = {
      id: newId(),
      name: name.trim() || "Sesión de " + date(Date.now()),
      items,
      cats: selected,
      date: new Date().toISOString(),
      answers: [],
      config: {
        ...config,
        name: name.trim() || "Sesión de " + date(Date.now()),
      },
      reviewCount: items.filter((q) => q.id in miss).length,
      answeredAt: [],
    };
    const favorites = data.favorites ?? [];
    save({
      ...data,
      favorites: favorite
        ? [{ id: newId(), config: session.config }, ...favorites]
        : favorites,
      sessions: [session, ...sessions],
    });
    openSession(session.id);
  }
  function answer(a) {
    if (feedback) return;
    let q = s.items[s.answers.length],
      m = { ...miss };
    if (a !== q.correct) m[q.id] = 0;
    else if (q.id in m && ++m[q.id] >= threshold) delete m[q.id];
    save({
      ...data,
      miss: m,
      sessions: sessions.map((x) =>
        x.id === s.id
          ? {
              ...x,
              answers: [...x.answers, a],
              answeredAt: [
                ...(x.answeredAt ?? x.answers.map(() => x.date)),
                new Date().toISOString(),
              ],
            }
          : x,
      ),
    });
    F(true);
  }
  function row(x) {
    let Icon = icons[x.cats[0]] || BookOpen,
      done = x.answers.length === x.items.length;
    return (
      <button
        className="sessionrow"
        key={x.id}
        onClick={() => openSession(x.id)}
      >
        <span className={"tile c" + x.cats[0]}>
          <Icon size={21} />
        </span>
        <span className="rowtext">
          <b>{x.name}</b>
          <small>
            {x.items.length} preguntas <i>·</i>{" "}
            {x.cats.length === 1 ? categories[x.cats[0]] : "Varias categorías"}
          </small>
        </span>
        <span className={"badge " + (!done ? "amber" : "")}>
          {done ? "Completada" : "En curso"}
        </span>
        <span className="rowdate">{date(x.date)}</span>
        <ChevronRight size={15} />
      </button>
    );
  }
  function navitem(label, I) {
    return (
      <button
        className={"navitem " + (page === label ? "active" : "")}
        onClick={() => nav(label)}
      >
        <I size={18} />
        {label}
      </button>
    );
  }
  let initials = user?.email?.slice(0, 2).toUpperCase() || "OE";
  if (!localDemo && (!db || !ready || !user)) return (
    <div className="card settings auth-entry">
      <div className="brand"><span><Layers3 /></span>opolepo<b>.</b></div>
      {!db ? <p role="alert">Falta configurar la conexión a Supabase para publicar la aplicación.</p>
        : !ready ? <p role="status">{err || "Cargando tu espacio…"}</p>
        : <><h1>Accede a tu espacio de estudio</h1><p>Te enviaremos un enlace de acceso a tu correo.</p><Auth /></>}
    </div>
  );
  return (
    <div className="app">
      {side && <div className="shade" onClick={() => S(false)} />}
      <aside className={side ? "open" : ""}>
        <div className="brand">
          <span>
            <Layers3 />
          </span>
          opolepo<b>.</b>
        </div>
        <div className="navgroup">
          <label>ESPACIO DE ESTUDIO</label>
          {navitem("Panel de estudio", LayoutDashboard)}
          {navitem("Mis sesiones", History)}
          {navitem("Preguntas falladas", RotateCcw)}
          {navitem("Estadísticas", ChartNoAxesColumnIncreasing)}
          {navitem("Corpus documental", BookOpen)}
        </div>
        <div className="navgroup recentnav">
          <label>
            SESIONES RECIENTES{" "}
            <button
              title="Nueva sesión"
              onClick={() => {
                configure();
                S(false);
              }}
            >
              <Plus size={15} />
            </button>
          </label>
          {sessions.slice(0, 3).map((x) => (
            <button key={x.id} onClick={() => openSession(x.id)}>
              <span className={"dot c" + x.cats[0]} />
              {x.name}
            </button>
          ))}
        </div>
        <div className="navbottom">
          {navitem("Banco de preguntas", Library)}
          {navitem("Ajustes", Settings)}
          <div className="profile">
            <span className="avatar">{initials}</span>
            <div>
              <b>{user?.email?.split("@")[0] || "Opositor"}</b>
              <small>
                {admin
                  ? "Administrador"
                  : user
                    ? "Estudiante"
                    : "Cuenta de demostración"}
              </small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button
            className="mobile"
            onClick={() => S(true)}
            aria-label="Abrir menú"
          >
            <Menu />
          </button>
          <span className="breadcrumb">
            <LayoutGrid size={15} /> Mi espacio <ChevronRight size={13} />{" "}
            <b>{page}</b>
          </span>
          <button className="headuser" onClick={() => nav("Ajustes")}>
            <span className="online" /> Espacio personal{" "}
            <span className="avatar">{initials}</span>
          </button>
        </header>
        <div className="content">
          {err && (
            <div className="notice" role="alert">
              {err}
              <button onClick={() => E("")}>
                <X size={15} />
              </button>
            </div>
          )}
          <div className="pagehead">
            <div>
              <div className="eyebrow">
                <span />{" "}
                {page === "Panel de estudio" ? "VISTA GENERAL" : "MI ESPACIO"}
              </div>
              <h1>{page}</h1>
              <p>
                {
                  {
                    "Panel de estudio": "Tu preparación, de un vistazo.",
                    "Mis sesiones":
                      "Retoma tus cuestionarios y revisa los resultados.",
                    "Preguntas falladas":
                      "Consulta las preguntas pendientes y los aciertos que llevas seguidos.",
                    Estadísticas:
                      "Explora tus respuestas y descubre qué temas necesitan más práctica.",
                    "Corpus documental":
                      "Consulta las fuentes oficiales de tus preguntas.",
                    "Banco de preguntas":
                      "Explora las preguntas y sus referencias.",
                    Ajustes: "Personaliza tu experiencia de estudio.",
                    Cuestionario: s?.name,
                  }[page]
                }
              </p>
            </div>
            {page === "Panel de estudio" ? (
              <div className="today">
                <CalendarDays size={15} />
                {new Date().toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                })}
              </div>
            ) : page === "Mis sesiones" ? (
              <button className="primary" onClick={() => configure()}>
                <Plus size={17} />
                Nueva sesión
              </button>
            ) : null}
          </div>
          {ready && page === "Panel de estudio" && (
            <>
              <section className="hero">
                <div>
                  <div className="herotag">
                    <span /> ZONA DE PRÁCTICA
                  </div>
                  <h2>Entrena a tu ritmo.</h2>
                  <p>
                    Elige tus categorías y pon a prueba tus conocimientos
                    <br className="wide" /> con una sesión personalizada.
                  </p>
                  <button className="peach" onClick={() => configure()}>
                    <Plus size={17} />
                    Nueva sesión
                  </button>
                </div>
                <Books />
              </section>
              <div className="sectiontitle">
                <h2>Tu progreso</h2>
                <span className="micro">RESUMEN GLOBAL</span>
              </div>
              <div className="stats">
                {[
                  [
                    ClipboardList,
                    "Sesiones realizadas",
                    sessions.filter((x) => x.answers.length === x.items.length)
                      .length,
                    "Cuestionarios completados",
                  ],
                  [
                    Target,
                    "Tasa de acierto",
                    rate + "%",
                    "Sobre preguntas respondidas",
                  ],
                  [
                    RotateCcw,
                    "Pendientes de repaso",
                    Object.keys(miss).length,
                    "Preguntas para reforzar",
                  ],
                ].map(([I, t, v, f], i) => (
                  <div className="stat" key={t}>
                    <div className="statlabel">
                      <span className={"smallicon c" + i}>
                        <I size={18} />
                      </span>
                      {t}
                    </div>
                    <strong>{v}</strong>
                    <small>{f}</small>
                  </div>
                ))}
              </div>
              <div className="sectiontitle">
                <h2>Sesiones recientes</h2>
                <button className="textbtn" onClick={() => nav("Mis sesiones")}>
                  Ver todas <ArrowRight size={15} />
                </button>
              </div>
              <div className="list">
                {sessions.length ? (
                  sessions.slice(0, 3).map(row)
                ) : (
                  <p>Tu primera sesión aparecerá aquí.</p>
                )}
              </div>
            </>
          )}
          {page === "Mis sesiones" && (
            <>
              <Favorites
                favorites={data.favorites ?? []}
                open={configure}
                remove={(id) =>
                  save({
                    ...data,
                    favorites: data.favorites.filter((f) => f.id !== id),
                  })
                }
              />
              <div className="sectiontitle">
                <h2>Historial de sesiones</h2>
              </div>
              <div className="list">
                {sessions.length ? (
                  sessions.map((x) => (
                    <div className="history-entry" key={x.id}>
                      {row(x)}
                      {x.answers.length === x.items.length && (
                        <SessionDetails s={x} open={configure} />
                      )}
                    </div>
                  ))
                ) : (
                  <p>Todavía no has creado sesiones.</p>
                )}
              </div>
            </>
          )}
          {page === "Estadísticas" && <Statistics sessions={sessions} />}
          {page === "Preguntas falladas" && (
            <>
              <div className="sectiontitle">
                <h2>Pendientes de repaso</h2>
                <small>{Object.keys(miss).length} preguntas</small>
              </div>
              <div className="list">
                {Object.keys(miss).length ? (
                  qs
                    .filter((q) => q.id in miss)
                    .map((q) => (
                      <div key={q.id} className="bankrow">
                        <small>{categories[q.cat]}</small>
                        <b>{q.text}</b>
                        <span className="streak">
                          {miss[q.id]} de {threshold} aciertos consecutivos
                        </span>
                        {reference(q)}
                      </div>
                    ))
                ) : (
                  <p>No tienes preguntas pendientes de repaso.</p>
                )}
              </div>
            </>
          )}
          {page === "Corpus documental" && (
            <Corpus
              qs={qs}
              db={db}
              docs={docs}
              addDoc={(d) => setDocs((prev) => [...prev, d])}
              openNotes={openNotes}
              admin={admin}
            />
          )}
          {page === "Banco de preguntas" && (
            <>
              <div className="toolbar">
                <label className="search">
                  <Search size={16} />
                  <input
                    placeholder="Buscar pregunta o categoría"
                    value={search}
                    onChange={(e) => G(e.target.value)}
                  />
                </label>
                {admin && (
                  <button
                    className="primary"
                    onClick={() => {
                      H(null);
                      M("Editar pregunta");
                    }}
                  >
                    <Plus size={16} />
                    Añadir pregunta
                  </button>
                )}
              </div>
              <div className="list">
                {qs
                  .filter((q) =>
                    (q.text + categories[q.cat])
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((q) => (
                    <div className="bankrow" key={q.id}>
                      <small>{categories[q.cat]}</small>
                      <b>{q.text}</b>
                      {reference(q)}
                      {admin && (
                        <button
                          onClick={() => {
                            H(q);
                            M("Editar pregunta");
                          }}
                        >
                          <Pencil size={15} /> Editar
                        </button>
                      )}
                    </div>
                  ))}
                {!qs.some((q) =>
                  (q.text + categories[q.cat])
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                 ) && <p>{qs.length ? "No hay coincidencias." : admin ? "El banco está vacío. Añade la primera pregunta para crear sesiones." : "El banco está vacío. Podrás crear sesiones cuando el administrador añada preguntas."}</p>}
              </div>
            </>
          )}
          {page === "Cuestionario" &&
            s &&
            (() => {
              let k = s.answers.length - (feedback ? 1 : 0),
                q = s.items[k];
              return q ? (
                <section className="card quiz">
                  <div className="quizmeta">
                    {categories[q.cat]}{" "}
                    <span>
                      {k + 1} / {s.items.length}
                    </span>
                  </div>
                  <progress value={k + 1} max={s.items.length} />
                  <h2>{q.text}</h2>
                  {q.options.map((a, i) => (
                    <button
                      key={i}
                      disabled={feedback}
                      className={
                        "option " +
                        (feedback
                          ? i === q.correct
                            ? "right"
                            : i === s.answers[k]
                              ? "wrong"
                              : ""
                          : "")
                      }
                      onClick={() => answer(i)}
                    >
                      <b>{"ABCD"[i]}</b>
                      {a}
                    </button>
                  ))}
                  {feedback && (
                    <div className="response">
                      <b>
                        {s.answers[k] === q.correct
                          ? "¡Correcto!"
                          : "Respuesta incorrecta"}
                      </b>
                      {reference(q)}
                      <button className="primary" onClick={() => F(false)}>
                        {k + 1 === s.items.length
                          ? "Ver resultado"
                          : "Siguiente pregunta"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </section>
              ) : (
                <section className="card">
                  <GraduationCap size={34} />
                  <h2>Sesión completada</h2>
                  <p>
                    {
                      s.answers.filter((a, i) => a === s.items[i].correct)
                        .length
                    }{" "}
                    aciertos de {s.items.length} preguntas.
                  </p>
                  <SessionDetails s={s} open={configure} />
                  {s.items.map((q, i) => (
                    <div className="bankrow" key={i}>
                      <small>
                        {s.answers[i] === q.correct ? "Correcta" : "Fallada"}
                      </small>
                      <b>{q.text}</b>
                      <span>Respuesta correcta: {q.options[q.correct]}</span>
                      {reference(q)}
                    </div>
                  ))}
                </section>
              );
            })()}
          {page === "Ajustes" && (
            <section className="card settings">
              <h3>Apariencia</h3>
              <label>
                Tema
                <select
                  aria-label="Tema"
                  value={theme}
                  onChange={(e) => T(e.target.value)}
                >
                  <option value="system">Seguir al sistema</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </label>
              <h3>Repaso de falladas</h3>
              <label>
                Aciertos consecutivos para aprender una pregunta
                <select
                  value={threshold}
                  onChange={(e) => {
                    let t = +e.target.value;
                    save({
                      ...data,
                      threshold: t,
                      miss: Object.fromEntries(
                        Object.entries(miss).filter(([, n]) => n < t),
                      ),
                    });
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <h3>Cuenta</h3>
              {user ? (
                <>
                  <p>{user.email}</p>
                  <button
                    className="secondary"
                    onClick={() => db.auth.signOut()}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : db ? (
                <Auth />
              ) : (
                <p>
                  Modo demostración. El progreso se guarda en este navegador.
                </p>
              )}
            </section>
          )}
          {!ready && !err && <p>Cargando tu espacio…</p>}
        </div>
      </main>
      {modal && (
        <Dialog title={modal} close={() => M("")}>
          {modal === "Lector de apuntes" ? (
            <Reader
              doc={docs.find((d) => d.id === reading.documentId)}
              citation={reading.citation}
            />
          ) : modal === "Nueva sesión" ? (
            <SetupForm
              qs={qs}
              start={start}
              miss={miss}
              initial={initialConfig}
            />
          ) : (
            <Editor
              docs={docs}
              q={edit}
              save={async (q) => {
                let r = await db
                  .from("questions")
                  .upsert({ id: q.id, value: q });
                if (r.error) throw Error(r.error.message);
                Q([...qs.filter((x) => x.id !== q.id), q]);
                M("");
              }}
            />
          )}
        </Dialog>
      )}
    </div>
  );
}
function Dialog({ title, close, children }) {
  const ref = useRef();
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      className={title === "Lector de apuntes" ? "reader" : undefined}
      aria-label={title}
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="dialog">
        <div className="dialogtop">
          <h2>{title}</h2>
          <button onClick={close} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
function Auth() {
  let [msg, V] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        let { error } = await db.auth.signInWithOtp({
          email: e.target.email.value,
          options: { emailRedirectTo: location.href.split("#")[0] },
        });
        V(error ? error.message : "Revisa tu correo para acceder.");
      }}
    >
      <label>
        Correo electrónico
        <input type="email" name="email" required />
      </label>
      <button className="primary">Recibir enlace de acceso</button>
      <p role="status">{msg}</p>
    </form>
  );
}
function Editor({ q, save, docs }) {
  let [v, V] = useState(
      q || {
        id: newId(),
        text: "",
        cat: 0,
        options: ["", "", "", ""],
        correct: 0,
        url: "",
        source: "",
      },
    ),
    [err, E] = useState("");
  const set = (k, val) => V({ ...v, [k]: val });
  const doc = docs.find((d) => d.id === v.citation?.documentId);
  const headings = React.useMemo(
    () => (doc ? inspectNote(doc.markdown).headings : []),
    [doc],
  );
  const setCite = (k, val) => set("citation", { ...v.citation, [k]: val });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          if (v.citation) {
            if (!doc || doc.cat !== v.cat)
              throw Error("Selecciona un documento de esta categoría.");
            const { issue } = inspectNote(doc.markdown, v.citation);
            if (issue) throw Error(issue);
          } else if (!/^https?:\/\//i.test(v.url))
            throw Error("Introduce una referencia HTTP o HTTPS.");
          await save(v);
        } catch (x) {
          E(x.message);
        }
      }}
    >
      <label>
        Pregunta
        <input
          required
          value={v.text}
          onChange={(e) => set("text", e.target.value)}
        />
      </label>
      <label>
        Categoría
        <select
          value={v.cat}
          onChange={(e) =>
            V({ ...v, cat: +e.target.value, citation: undefined })
          }
        >
          {categories.map((c, i) => (
            <option value={i} key={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>Opciones · marca la correcta</label>
      {v.options.map((o, i) => (
        <div className="catline" key={i}>
          <input
            aria-label={"Correcta " + (i + 1)}
            type="radio"
            checked={v.correct === i}
            onChange={() => set("correct", i)}
          />
          <input
            aria-label={"Opción " + (i + 1)}
            required
            value={o}
            onChange={(e) =>
              set(
                "options",
                v.options.map((x, j) => (i === j ? e.target.value : x)),
              )
            }
          />
        </div>
      ))}
      <label>
        Fuente de la respuesta
        <select
          value={v.citation?.documentId ?? ""}
          onChange={(e) => {
            const d = docs.find((x) => x.id === e.target.value);
            V({
              ...v,
              citation: d
                ? { documentId: d.id, section: "", quote: "" }
                : undefined,
              source: d?.title ?? "",
              url: "",
            });
          }}
        >
          <option value="">Enlace externo</option>
          {docs
            .filter((d) => d.markdown && d.cat === v.cat)
            .map((d) => (
              <option value={d.id} key={d.id}>
                {d.title}
              </option>
            ))}
        </select>
      </label>
      {v.citation ? (
        <>
          <label>
            Apartado
            <select
              value={v.citation.section}
              onChange={(e) => setCite("section", e.target.value)}
            >
              <option value="">Documento completo</option>
              {headings.map((h, i) => (
                <option key={i}>{h}</option>
              ))}
            </select>
          </label>
          <label>
            Cita exacta
            <textarea
              required
              rows={4}
              value={v.citation.quote}
              onChange={(e) => setCite("quote", e.target.value)}
              placeholder="Copia el pasaje que justifica la respuesta"
            />
          </label>
        </>
      ) : (
        <>
          <label>
            Documento y artículo
            <input
              required
              value={v.source}
              onChange={(e) => set("source", e.target.value)}
            />
          </label>
          <label>
            Enlace directo al documento
            <input
              type="url"
              required
              value={v.url}
              onChange={(e) => set("url", e.target.value)}
            />
          </label>
        </>
      )}
      <p>{err}</p>
      <button className="primary">Guardar pregunta</button>
    </form>
  );
}
createRoot(document.getElementById("root")).render(<App />);
