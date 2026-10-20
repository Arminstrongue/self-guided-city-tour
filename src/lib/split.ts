/**
 * Dividir despesas com amigos: grupos de viagem com membros (com conta ou só nome), despesas
 * divididas em partes iguais ou à medida, saldos e "quem paga a quem" com o mínimo de transferências.
 * Valores guardados em cêntimos (×100) na moeda do grupo; despesas noutra moeda convertem-se à taxa do dia.
 */
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { db, schema } from "./db";
import { convert, isCurrency, type Currency } from "./currency";
import { getRates } from "./fx";
import { moderate } from "./moderation";
import { notify } from "./notify";

export type SplitMember = { id: string; name: string; handle: string | null; photo: string | null; me: boolean };
export type SplitItem = { id: string; kind: "expense" | "settle"; title: string; amount: number; origAmount: number; origCurrency: string; payer: string; shares: Record<string, number>; at: string; mine: boolean };
export type Transfer = { from: string; to: string; amount: number };
export type SplitView = { id: string; title: string; currency: string; owner: boolean; members: SplitMember[]; items: SplitItem[]; balances: Record<string, number>; transfers: Transfer[]; total: number };

export const MAX_MEMBERS = 20;
const cents = (v: number) => Math.round(v * 100);

/** Divide em partes iguais; os cêntimos que sobram vão para os primeiros. */
export function splitEqual(amount: number, ids: string[]): Record<string, number> {
  const n = ids.length; if (!n) return {};
  const base = Math.floor(amount / n); let rest = amount - base * n;
  return Object.fromEntries(ids.map((id) => [id, base + (rest-- > 0 ? 1 : 0)]));
}

/** Saldo de cada membro: positivo = tem a receber; negativo = deve. */
export function balancesOf(memberIds: string[], items: { payer: string; amount: number; shares: Record<string, number> }[]) {
  const b: Record<string, number> = Object.fromEntries(memberIds.map((id) => [id, 0]));
  for (const it of items) {
    b[it.payer] = (b[it.payer] ?? 0) + it.amount;
    for (const [id, v] of Object.entries(it.shares)) b[id] = (b[id] ?? 0) - v;
  }
  return b;
}

/** Quem paga a quem: emparelha o maior devedor com o maior credor (poucas transferências). */
export function settleUp(balances: Record<string, number>): Transfer[] {
  const debt = Object.entries(balances).filter(([, v]) => v < 0).map(([id, v]) => ({ id, v: -v })).sort((a, b) => b.v - a.v);
  const cred = Object.entries(balances).filter(([, v]) => v > 0).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  const out: Transfer[] = [];
  let i = 0, j = 0;
  while (i < debt.length && j < cred.length) {
    const x = Math.min(debt[i].v, cred[j].v);
    if (x > 0) out.push({ from: debt[i].id, to: cred[j].id, amount: x });
    debt[i].v -= x; cred[j].v -= x;
    if (debt[i].v === 0) i++;
    if (cred[j].v === 0) j++;
  }
  return out;
}

async function memberOf(me: string, groupId: string) {
  const d = await db();
  const [m] = await d.select().from(schema.splitMembers).where(and(eq(schema.splitMembers.groupId, groupId), eq(schema.splitMembers.email, me))).limit(1);
  return m ?? null;
}

async function profilesFor(emails: string[]) {
  if (!emails.length) return new Map<string, schema.TravellerProfile>();
  const d = await db();
  const rows = await d.select().from(schema.travellerProfiles).where(inArray(schema.travellerProfiles.email, emails));
  return new Map(rows.map((p) => [p.email, p]));
}

/** Os grupos do viajante com o seu saldo em cada um. */
export async function listGroups(me: string) {
  const d = await db();
  const mine = await d.select().from(schema.splitMembers).where(eq(schema.splitMembers.email, me));
  if (!mine.length) return [];
  const ids = mine.map((m) => m.groupId);
  const groups = await d.select().from(schema.splitGroups).where(inArray(schema.splitGroups.id, ids)).orderBy(desc(schema.splitGroups.createdAt));
  const members = await d.select().from(schema.splitMembers).where(inArray(schema.splitMembers.groupId, ids));
  const items = await d.select().from(schema.splitItems).where(inArray(schema.splitItems.groupId, ids));
  return groups.map((g) => {
    const ms = members.filter((m) => m.groupId === g.id);
    const b = balancesOf(ms.map((m) => m.id), items.filter((i) => i.groupId === g.id));
    const meId = mine.find((m) => m.groupId === g.id)!.id;
    return { id: g.id, title: g.title, currency: g.currency, people: ms.length, balance: b[meId] ?? 0,
      total: items.filter((i) => i.groupId === g.id && i.kind === "expense").reduce((a, i) => a + i.amount, 0) };
  });
}

export async function getGroup(me: string, id: string): Promise<SplitView | null> {
  const meM = await memberOf(me, id);
  if (!meM) return null;
  const d = await db();
  const [g] = await d.select().from(schema.splitGroups).where(eq(schema.splitGroups.id, id)).limit(1);
  if (!g) return null;
  const ms = await d.select().from(schema.splitMembers).where(eq(schema.splitMembers.groupId, id)).orderBy(schema.splitMembers.createdAt);
  const its = await d.select().from(schema.splitItems).where(eq(schema.splitItems.groupId, id)).orderBy(desc(schema.splitItems.createdAt));
  const profs = await profilesFor(ms.map((m) => m.email).filter((e): e is string => Boolean(e)));
  const balances = balancesOf(ms.map((m) => m.id), its);
  return {
    id: g.id, title: g.title, currency: g.currency, owner: g.owner === me,
    members: ms.map((m) => { const p = m.email ? profs.get(m.email) : undefined; return { id: m.id, name: p?.name ?? m.name, handle: p?.handle ?? null, photo: p?.photo ?? null, me: m.email === me }; }),
    items: its.map((i) => ({ id: i.id, kind: i.kind, title: i.title, amount: i.amount, origAmount: i.origAmount, origCurrency: i.origCurrency, payer: i.payer, shares: i.shares, at: i.createdAt.toISOString(), mine: i.createdBy === me })),
    balances, transfers: settleUp(balances),
    total: its.filter((i) => i.kind === "expense").reduce((a, i) => a + i.amount, 0)
  };
}

export type NewPerson = { handle: string } | { name: string };

/** Só se pode juntar quem segue ou é seguido (como nas mensagens); os outros entram só com o nome. */
async function resolvePerson(me: string, p: NewPerson): Promise<{ email: string | null; name: string } | "offensive" | "invalid"> {
  if ("handle" in p) {
    const { contacts } = await import("./chat");
    const c = (await contacts(me)).find((x) => x.handle === p.handle.toLowerCase());
    if (!c) return "invalid";
    const d = await db();
    const [row] = await d.select({ email: schema.travellerProfiles.email }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.handle, c.handle)).limit(1);
    return row ? { email: row.email, name: c.name } : "invalid";
  }
  const name = p.name.trim().slice(0, 40);
  if (!name) return "invalid";
  const m = moderate(name);
  if (!m.ok) return "offensive";
  return { email: null, name: m.text };
}

export async function createGroup(me: string, v: { title: string; currency: string; people: NewPerson[] }) {
  if (!isCurrency(v.currency)) return { error: "invalid" as const };
  const title = v.title.trim().slice(0, 60);
  if (!title) return { error: "invalid" as const };
  const mt = moderate(title);
  if (!mt.ok) return { error: "offensive" as const };
  const d = await db();
  const [prof] = await d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, me)).limit(1);
  const people: { email: string | null; name: string }[] = [];
  for (const p of v.people.slice(0, MAX_MEMBERS - 1)) {
    const r = await resolvePerson(me, p);
    if (r === "offensive") return { error: "offensive" as const };
    if (r !== "invalid" && !(r.email && people.some((x) => x.email === r.email)) && r.email !== me) people.push(r);
  }
  const [g] = await d.insert(schema.splitGroups).values({ title: mt.text, currency: v.currency, owner: me }).returning();
  await d.insert(schema.splitMembers).values([{ groupId: g.id, email: me, name: prof?.name ?? me.split("@")[0] }, ...people.map((p) => ({ groupId: g.id, ...p }))]);
  for (const p of people) if (p.email) await notify(p.email, me, "split", { postId: g.id, text: mt.text }).catch(() => null);
  return { id: g.id };
}

export async function addMember(me: string, id: string, p: NewPerson) {
  if (!(await memberOf(me, id))) return { error: "forbidden" as const };
  const d = await db();
  const ms = await d.select().from(schema.splitMembers).where(eq(schema.splitMembers.groupId, id));
  if (ms.length >= MAX_MEMBERS) return { error: "full" as const };
  const r = await resolvePerson(me, p);
  if (r === "offensive" || r === "invalid") return { error: r };
  if (r.email && ms.some((m) => m.email === r.email)) return { ok: true };
  await d.insert(schema.splitMembers).values({ groupId: id, ...r });
  const [g] = await d.select().from(schema.splitGroups).where(eq(schema.splitGroups.id, id)).limit(1);
  if (r.email && g) await notify(r.email, me, "split", { postId: id, text: g.title }).catch(() => null);
  return { ok: true };
}

/** Despesa: valor na moeda indicada, convertido para a do grupo; partes iguais entre `among` ou valores à medida em `shares`. */
export async function addExpense(me: string, id: string, v: { title: string; amount: number; currency: string; payer: string; among: string[]; shares?: Record<string, number> }) {
  if (!(await memberOf(me, id))) return { error: "forbidden" as const };
  const d = await db();
  const [g] = await d.select().from(schema.splitGroups).where(eq(schema.splitGroups.id, id)).limit(1);
  if (!g || !isCurrency(v.currency) || !(v.amount > 0) || v.amount > 10_000_000) return { error: "invalid" as const };
  const ids = new Set((await d.select({ id: schema.splitMembers.id }).from(schema.splitMembers).where(eq(schema.splitMembers.groupId, id))).map((m) => m.id));
  if (!ids.has(v.payer)) return { error: "invalid" as const };
  const mt = moderate(v.title.trim().slice(0, 60));
  if (!mt.ok) return { error: "offensive" as const };
  let amount = cents(v.amount);
  if (v.currency !== g.currency) {
    const { rates } = await getRates();
    const c = convert(v.amount, v.currency, g.currency, rates);
    if (c === null) return { error: "invalid" as const };
    amount = cents(c);
  }
  let shares: Record<string, number>;
  if (v.shares && Object.keys(v.shares).length) {
    // Valores à medida (na moeda da despesa): escalam-se para somar exatamente o total.
    const entries = Object.entries(v.shares).filter(([k, x]) => ids.has(k) && x > 0);
    const sum = entries.reduce((a, [, x]) => a + x, 0);
    if (!entries.length || Math.abs(sum - v.amount) > 0.011) return { error: "shares" as const };
    shares = {}; let used = 0;
    entries.forEach(([k, x], i) => { const s = i === entries.length - 1 ? amount - used : Math.round((x / sum) * amount); shares[k] = s; used += s; });
  } else {
    const among = [...new Set(v.among)].filter((x) => ids.has(x));
    if (!among.length) return { error: "invalid" as const };
    shares = splitEqual(amount, among);
  }
  const [it] = await d.insert(schema.splitItems).values({ groupId: id, kind: "expense", title: mt.text, amount, origAmount: cents(v.amount), origCurrency: v.currency, payer: v.payer, shares, createdBy: me }).returning();
  return { id: it.id };
}

/** Pagamento entre dois membros (acerto de contas). */
export async function settle(me: string, id: string, v: { from: string; to: string; amount: number }) {
  if (!(await memberOf(me, id))) return { error: "forbidden" as const };
  const d = await db();
  const [g] = await d.select().from(schema.splitGroups).where(eq(schema.splitGroups.id, id)).limit(1);
  const ids = new Set((await d.select({ id: schema.splitMembers.id }).from(schema.splitMembers).where(eq(schema.splitMembers.groupId, id))).map((m) => m.id));
  if (!g || !ids.has(v.from) || !ids.has(v.to) || v.from === v.to || !(v.amount > 0)) return { error: "invalid" as const };
  const amount = Math.round(v.amount); // já em cêntimos
  const [it] = await d.insert(schema.splitItems).values({ groupId: id, kind: "settle", title: "", amount, origAmount: amount, origCurrency: g.currency, payer: v.from, shares: { [v.to]: amount }, createdBy: me }).returning();
  return { id: it.id };
}

export async function removeItem(me: string, id: string, itemId: string) {
  if (!(await memberOf(me, id))) return { error: "forbidden" as const };
  const d = await db();
  const [g] = await d.select().from(schema.splitGroups).where(eq(schema.splitGroups.id, id)).limit(1);
  const [it] = await d.select().from(schema.splitItems).where(and(eq(schema.splitItems.id, itemId), eq(schema.splitItems.groupId, id))).limit(1);
  if (!it) return { ok: true };
  if (it.createdBy !== me && g?.owner !== me) return { error: "forbidden" as const };
  await d.delete(schema.splitItems).where(eq(schema.splitItems.id, itemId));
  return { ok: true };
}

/** O dono apaga o grupo; os outros saem (ficam no grupo só com o nome, para as contas baterem certo). */
export async function leaveGroup(me: string, id: string) {
  const m = await memberOf(me, id);
  if (!m) return { ok: true };
  const d = await db();
  const [g] = await d.select().from(schema.splitGroups).where(eq(schema.splitGroups.id, id)).limit(1);
  if (g?.owner === me) {
    await d.delete(schema.splitItems).where(eq(schema.splitItems.groupId, id));
    await d.delete(schema.splitMembers).where(eq(schema.splitMembers.groupId, id));
    await d.delete(schema.splitGroups).where(eq(schema.splitGroups.id, id));
  } else await d.update(schema.splitMembers).set({ email: null }).where(eq(schema.splitMembers.id, m.id));
  return { ok: true };
}

/** Ao apagar a conta: sai de todos os grupos; os que eram seus passam para outro membro com conta (ou apagam-se). */
export async function purgeSplit(email: string) {
  const d = await db();
  for (const g of await d.select().from(schema.splitGroups).where(eq(schema.splitGroups.owner, email))) {
    const [heir] = await d.select().from(schema.splitMembers).where(and(eq(schema.splitMembers.groupId, g.id), isNotNull(schema.splitMembers.email))).orderBy(schema.splitMembers.createdAt).then((r) => r.filter((m) => m.email !== email));
    if (heir?.email) await d.update(schema.splitGroups).set({ owner: heir.email }).where(eq(schema.splitGroups.id, g.id));
    else await leaveGroup(email, g.id);
  }
  await d.update(schema.splitMembers).set({ email: null }).where(eq(schema.splitMembers.email, email));
}

export const isGroupCurrency = (c: string): c is Currency => isCurrency(c);
