"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lead, LeadPage } from "../../lib/admin/types";
import { historicalAnswers, historicalVersions, levelLabels, resultTitles, skillIndexes, skillLabels } from "../../lib/admin/history";

const date = (value: string) => new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));
const booleanLabel = (value: boolean | null) => value === true ? "Sí" : value === false ? "No" : "No registrado";
const skateLabels: Record<string, string> = { blanda: "Bota blanda", "extensible-blanda": "Extensibles de bota blanda", rigida: "Bota rígida", "sin-patines": "Todavía no tengo patines", "no-se": "No sé qué tipo son" };
const interestLabels: Record<string, string> = { enseñar: "Me gustaría dar clases", comunidad: "Quiero crear comunidad en mi zona", ambas: "Me interesan ambas", explorar: "Me da curiosidad, quiero explorar", no: "Por ahora quiero aprender a patinar" };

export default function AdminPanel() {
  const [leads, setLeads] = useState<Lead[]>([]), [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [session, setSession] = useState(false), [busy, setBusy] = useState(true), [error, setError] = useState("");
  const [query, setQuery] = useState(""), [version, setVersion] = useState("all"), [level, setLevel] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState(""), [linkSent, setLinkSent] = useState(false), [accessNotice, setAccessNotice] = useState("");
  const request = useRef<AbortController | null>(null);

  const load = useCallback(async (offset = 0) => {
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/leads?offset=${offset}`, { cache: "no-store", signal: controller.signal });
      const body = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) {
        setLeads([]); setTotal(0); setNextOffset(null); setSession(false);
        if (response.status !== 401) setError(body.error || "No se pudo abrir el panel.");
        return;
      }
      const page = body as LeadPage;
      setLeads(previous => offset ? [...new Map([...previous, ...page.leads].map(row => [row.id, row])).values()] : page.leads);
      setTotal(page.total); setNextOffset(page.nextOffset); setSession(true);
    } catch {
      if (!controller.signal.aborted) { setLeads([]); setSession(false); setError("No se pudo conectar. Reintentá."); }
    } finally { if (!controller.signal.aborted) setBusy(false); }
  }, []);
  useEffect(() => {
    const access = new URLSearchParams(window.location.search).get("access");
    const notices: Record<string, string> = { "invalid-link": "El enlace venció o se abrió en otro navegador. Pedí uno nuevo desde este navegador.", denied: "Esta cuenta no tiene acceso al panel.", "setup-confirmed": "Tu correo quedó confirmado. Falta completar la habilitación privada; te avisamos cuando esté lista." };
    if (access && Object.hasOwn(notices, access)) setAccessNotice(notices[access]);
    if (access) window.history.replaceState(null, "", "/admin");
    void load();
    const restore = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    window.addEventListener("pageshow", restore);
    return () => { request.current?.abort(); window.removeEventListener("pageshow", restore); };
  }, [load]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    setAccessNotice("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail }) });
      const body = await response.json();
      if (!response.ok) { setError(body.error); setBusy(false); return; }
      setLinkSent(true); setBusy(false);
    } catch { setError("No se pudo conectar. Reintentá."); setBusy(false); }
  }
  async function logout() {
    request.current?.abort(); setLeads([]); setSelected(null); setSession(false); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) setError("No se pudo cerrar la sesión. Usá Cerrar sesión otra vez.");
      else { setQuery(""); setVersion("all"); setLevel("all"); setLinkSent(false); setLoginEmail(""); }
    } catch { setError("No se pudo cerrar la sesión. Usá Cerrar sesión otra vez."); }
    finally { setBusy(false); }
  }
  const filtered = leads.filter(row => (version === "all" || row.test_version === version) && (level === "all" || row.level === level) && `${row.name} ${row.email} ${row.phone} ${row.instagram ?? ""} ${row.zone ?? ""} ${row.id}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  const active = filtered.find(row => row.id === selected) ?? filtered[0];

  return <main className="private-app">
    <header className="private-header"><div><p className="private-kicker">NICO SAPPIA · HALLOWEEN</p><h1>Tu panel privado</h1><p>Respuestas completas. Una persona, un recorrido.</p></div><span className="private-badge">Acceso exclusivo</span></header>
    {error && <p className="private-error" role="alert">{error}</p>}
    {accessNotice && !session && <p className="private-warning" role="status">{accessNotice}</p>}
    {!session ? <section className="private-login"><p className="private-kicker">SÓLO NICO</p><h2>Entrá para revisar</h2><p>{linkSent ? "Revisá tu correo. Abrí el enlace en este mismo navegador." : "Te enviamos un enlace de acceso a tu correo habilitado."}</p><form onSubmit={login}><label>Email<input name="email" type="email" autoComplete="username" maxLength={254} required disabled={busy} value={loginEmail} onChange={e => setLoginEmail(e.target.value)}/></label><button className="private-primary" disabled={busy}>{busy ? "Comprobando acceso…" : linkSent ? "Enviar otro enlace" : "Enviar enlace de acceso"}</button></form><p className="private-muted">Las respuestas se cargan después de verificar tu cuenta.</p>{error.includes("cerrar") && <button onClick={logout} disabled={busy}>Cerrar sesión</button>}</section> : <>
      <div className="private-toolbar"><p><strong>{total}</strong> envíos registrados <span className="private-muted">· no equivale a personas únicas</span></p><div><button onClick={() => load()} disabled={busy}>{busy ? "Actualizando…" : "Actualizar"}</button><button onClick={logout} disabled={busy}>Cerrar sesión</button></div></div>
      <section className="private-filters" aria-label="Filtrar envíos"><label>Buscar<input type="search" placeholder="Nombre, contacto o zona" value={query} onChange={e => setQuery(e.target.value)}/></label><label>Versión<select value={version} onChange={e => setVersion(e.target.value)}><option value="all">Todas las versiones</option>{[...new Set(leads.map(row => row.test_version))].sort().map(v => <option key={v} value={v}>{historicalVersions[v]?.label ?? v}</option>)}</select></label><label>Resultado<select value={level} onChange={e => setLevel(e.target.value)}><option value="all">Todos los resultados</option>{Object.entries(levelLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label><button onClick={() => { setQuery(""); setVersion("all"); setLevel("all"); }}>Limpiar filtros</button></section>
      <p className="private-muted" role="status">{filtered.length} de {leads.length} envíos cargados. Origen sin clasificar: la base no distingue pruebas de participaciones.</p>
      {nextOffset !== null && <div className="private-warning">Todavía faltan envíos por cargar; los filtros abarcan los cargados. <button disabled={busy} onClick={() => load(nextOffset)}>Cargar más</button></div>}
      <div className="private-workspace"><nav className="private-list" aria-label="Envíos">{filtered.map(row => <button key={row.id} aria-current={active?.id === row.id ? "true" : undefined} onClick={() => setSelected(row.id)}><strong>{row.name}</strong><span>{date(row.created_at)} UTC</span><span className={`private-level ${row.level}`}>{levelLabels[row.level] ?? "Resultado no identificado"} · {row.score}/18</span><small>{historicalVersions[row.test_version]?.label ?? "Versión no verificada"}</small></button>)}{!filtered.length && <p>No hay envíos con estos filtros.</p>}</nav>
        {active ? <Attempt key={active.id} row={active}/> : <section className="private-detail"><h2>Sin resultados</h2><p>Probá con otros filtros.</p></section>}
      </div>
    </>}
  </main>;
}

function Attempt({ row }: { row: Lead }) {
  const [tab, setTab] = useState("Resultado"), [step, setStep] = useState(0), [all, setAll] = useState(false);
  const decoded = historicalAnswers(row.test_version, row.answers);
  const included = decoded?.filter(q => q.included) ?? [];
  const visible = all ? included : included.slice(step, step + 1);
  return <article className="private-detail"><div className="private-person"><p className="private-kicker">VISTA DEL ENVÍO</p><h2>{row.name}</h2><p>{date(row.created_at)} UTC</p><code>{row.test_version}</code><p className="private-muted">Identificador: {row.id}</p></div>
    <nav className="private-tabs" aria-label="Vista del intento">{["Resultado", "Respuestas", "Datos y permisos"].map(label => <button key={label} aria-pressed={tab === label} onClick={() => setTab(label)}>{label}</button>)}</nav>
    {tab === "Resultado" && <section className="private-result"><p className="private-kicker">TU MAPA SOBRE RUEDAS</p><h3>{resultTitles[row.level] ?? "Resultado guardado no identificado"}</h3><div className={`private-score ${row.level}`}><strong>{row.score}<small>/18</small></strong><span>{levelLabels[row.level] ?? row.level}<small>Resultado guardado · sin recalcular</small></span></div>
      {decoded ? <div className="private-skills">{skillIndexes.map((index, position) => { const value = decoded[index].selected; return <div key={index}><span>{skillLabels[position]}</span><div className="private-meter" role="meter" aria-label={skillLabels[position]} aria-valuemin={0} aria-valuemax={2} aria-valuenow={value ?? undefined} aria-valuetext={value === null ? "Sin dato reconstruible" : `${value} de 2`}><i className={`value-${value}`} style={{ width: value === null ? "0%" : `${Math.max(4, value / 2 * 100)}%` }}/></div><small className={`private-skill-label value-${value}`}>{value === null ? "Sin dato" : ["A practicar · 0", "En progreso · 1", "Con control · 2"][value]}</small></div>; })}</div> : <p className="private-warning">No se reconstruyen habilidades: falta una versión verificada o un formato de respuestas válido.</p>}
      <p className="private-warning">Es una autoevaluación. Un profe debe validar la técnica y las condiciones del recorrido.</p><p className="private-muted">Esta vista reconstruye el resultado con los datos guardados. No es una captura exacta de la pantalla que vio la persona.</p><button className="private-primary" onClick={() => setTab("Respuestas")}>Ver todas sus respuestas</button></section>}
    {tab === "Respuestas" && <section aria-label="Respuestas completas"><div className="private-toolbar"><h3>Lo que respondió</h3>{included.length > 0 && <button onClick={() => setAll(v => !v)}>{all ? "Una por vez" : "Ver todas juntas"}</button>}</div>
      {!decoded && <p className="private-warning">No hay una copia histórica verificada para esta versión o el formato no permite reconstruir las opciones. El resultado guardado se conserva; no se interpreta con el test actual.</p>}
      {visible.map(q => <section className="private-question" key={q.index}><p className="private-kicker">PREGUNTA {q.index + 1} DE {included.length}</p><h3>{q.title}</h3><p>{q.hint}</p>{q.index === 13 && <div className="private-images">{["a", "b", "c"].map(letter => <figure key={letter}><img src={`/roller-${letter}.png`} alt={`Roller ${letter.toUpperCase()} de la pregunta histórica`}/><figcaption>{letter.toUpperCase()}</figcaption></figure>)}</div>}{q.index >= 14 && <img className="private-brake" src={q.index === 14 ? "/pregunta-frenada.png" : "/pregunta-frenada-t.png"} alt={`Imagen histórica de la frenada de la pregunta ${q.index + 1}`}/>}<ul className="private-options" aria-label="Opciones de la pregunta">{q.options.map((option, i) => <li className={q.selected === i ? "chosen" : ""} key={option}><span aria-hidden="true">{q.selected === i ? "●" : "○"}</span><span>{option}{q.selected === i && <strong>Respuesta elegida</strong>}</span></li>)}</ul>{q.selected === null && <p className="private-warning">{q.answer}</p>}</section>)}
      {decoded && !all && <div className="private-toolbar"><button disabled={step === 0} onClick={() => setStep(v => v - 1)}>Anterior</button><span aria-live="polite">{step + 1} / {included.length}</span><button disabled={step === included.length - 1} onClick={() => setStep(v => v + 1)}>Siguiente</button></div>}
      {decoded && decoded.some(q => !q.included) && <p className="private-muted">Las preguntas 15 y 16 no estaban incluidas en v2. No se cuentan como errores ni respuestas faltantes.</p>}
      {decoded && row.answers.length > included.length && <p className="private-warning">Hay respuestas adicionales fuera de esta versión; no se interpretan.</p>}
    </section>}
    {tab === "Datos y permisos" && <section><h3>Datos que compartió</h3><dl className="private-data">{Object.entries({ Nombre: row.name, Email: row.email, WhatsApp: row.phone, Instagram: row.instagram, Patines: skateLabels[row.skate_type ?? ""] ?? row.skate_type, "Regalo elegido": row.gift === "clase" ? "Clase gratuita presencial" : row.gift === "tutorial" ? "Clase gratuita online" : row.gift, "Interés en formación": interestLabels[row.career_interest ?? ""] ?? row.career_interest, Zona: row.zone }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "No registrado"}</dd></div>)}</dl><h3>Permisos por separado</h3><dl className="private-data"><div><dt>Guardar datos para gestionar el regalo y orientar</dt><dd>{booleanLabel(row.consent)}</dd></div><div><dt>Propuestas de clases, cursos y salidas</dt><dd>{booleanLabel(row.marketing)}</dd></div><div><dt>Contacto por formación y mentorías</dt><dd>{booleanLabel(row.mentorship_opt_in)}</dd></div></dl><p className="private-muted">Un permiso operativo no autoriza marketing. No se envía ningún mensaje desde este panel.</p></section>}
  </article>;
}
