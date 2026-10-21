import { pgTable, uuid, text, integer, timestamp, pgEnum, index, uniqueIndex, jsonb, boolean } from "drizzle-orm/pg-core";

export const accessScope = pgEnum("access_scope", ["city", "all"]);
export const merchantPlan = pgEnum("merchant_plan", ["basic", "featured", "partner"]);
export const merchantStatus = pgEnum("merchant_status", ["pending", "active", "past_due", "cancelled"]);
export const agentStatus = pgEnum("agent_status", ["pending", "active", "suspended"]);
export const leadStatus = pgEnum("lead_status", ["new", "contacted", "proposal", "won", "lost"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name"),
  provider: text("provider"),
  locale: text("locale"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  stopId: text("stop_id").notNull(),
  offer: text("offer").notNull(),
  email: text("email").notNull(),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  facebook: text("facebook"),
  plan: merchantPlan("plan").notNull().default("basic"),
  status: merchantStatus("status").notNull().default("pending"),
  refCode: text("ref_code").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  agentId: uuid("agent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [
  uniqueIndex("merchants_ref_idx").on(t.refCode),
  index("merchants_sub_idx").on(t.stripeSubscriptionId),
  index("merchants_agent_idx").on(t.agentId),
  index("merchants_city_stop_idx").on(t.city, t.stopId)
]);

export const accesses = pgTable("accesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  userId: uuid("user_id").references(() => users.id),
  scope: accessScope("scope").notNull(),
  city: text("city"),
  flightAt: timestamp("flight_at", { withTimezone: true }),
  flightNo: text("flight_no"),
  plan: text("plan"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("eur"),
  stripeSessionId: text("stripe_session_id").notNull(),
  refMerchantId: uuid("ref_merchant_id").references(() => merchants.id),
  locale: text("locale"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [
  uniqueIndex("accesses_session_idx").on(t.stripeSessionId),
  index("accesses_email_idx").on(t.email)
]);

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull().references(() => merchants.id),
  accessId: uuid("access_id").notNull().references(() => accesses.id),
  amountCents: integer("amount_cents").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("commissions_access_idx").on(t.accessId)]);

export type Merchant = typeof merchants.$inferSelect;
export type Access = typeof accesses.$inferSelect;

/** Conteúdo editável no painel: substitui (ou acrescenta) cidades de src/data/cities.ts. */
export const cityContent = pgTable("city_content", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  active: boolean("active").notNull().default(true),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

/** Comerciais independentes: angariam comerciantes, restaurantes, pousadas, hotéis e empresas. */
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country"),
  code: text("code").notNull(),
  status: agentStatus("status").notNull().default("pending"),
  iban: text("iban"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("agents_email_idx").on(t.email), uniqueIndex("agents_code_idx").on(t.code)]);

/** Carteira de negócios de cada comercial. */
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  name: text("name").notNull(),
  kind: text("kind").notNull(),          // shop, food, cafe, guesthouse, hotel, company, other
  city: text("city"),
  contact: text("contact"),
  email: text("email"),
  phone: text("phone"),
  status: leadStatus("status").notNull().default("new"),
  notes: text("notes"),
  merchantId: uuid("merchant_id").references(() => merchants.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("leads_agent_idx").on(t.agentId)]);

/** Comissões dos comerciais: uma por fatura de assinatura paga (primeiros 12 meses). */
export const agentCommissions = pgTable("agent_commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  merchantId: uuid("merchant_id").references(() => merchants.id),
  stripeInvoiceId: text("stripe_invoice_id"),
  description: text("description"),
  amountCents: integer("amount_cents").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("agent_comm_invoice_idx").on(t.stripeInvoiceId), index("agent_comm_agent_idx").on(t.agentId)]);

export type Agent = typeof agents.$inferSelect;
export type Lead = typeof leads.$inferSelect;

/** Métricas anónimas (sem cookies nem dados pessoais): só o nome do evento, cidade e contexto. */
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city"),
  stop: text("stop"),
  locale: text("locale"),
  ref: text("ref"),
  platform: text("platform"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("events_name_created_idx").on(t.name, t.createdAt), index("events_city_idx").on(t.city)]);

/** Avaliação no fim do roteiro: estrelas, NPS (0–10) e comentário. Uma por compra. */
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  accessId: uuid("access_id").notNull().references(() => accesses.id),
  city: text("city").notNull(),
  stars: integer("stars").notNull(),
  nps: integer("nps"),
  comment: text("comment"),
  locale: text("locale"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("ratings_access_city_idx").on(t.accessId, t.city), index("ratings_created_idx").on(t.createdAt)]);
export type Rating = typeof ratings.$inferSelect;

/* ---------- Carteira do viajante: memórias e preferências guardadas na conta (email) ---------- */
export const travellerMemories = pgTable("traveller_memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  cityName: text("city_name").notNull(),
  title: text("title").notNull(),
  note: text("note").notNull().default(""),
  photo: text("photo"), // data URL JPEG reduzida (≤ 300 KB)
  lat: text("lat"), lng: text("lng"),
  takenAt: timestamp("taken_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("memories_email_idx").on(t.email, t.takenAt)]);
export type TravellerMemory = typeof travellerMemories.$inferSelect;

export const travellerPrefs = pgTable("traveller_prefs", {
  email: text("email").primaryKey(),
  hobbies: jsonb("hobbies").$type<string[]>().notNull().default([]),
  saved: jsonb("saved").$type<{ city: string; cityName?: string; title: string; lat: number; lng: number; icon?: string; at: number }[]>().notNull().default([]),
  visited: jsonb("visited").$type<{ name: string; country: string; year?: number; want?: boolean; at: number }[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type PlanItem = { id: string; day: number; time?: string; title: string; kind: "moment" | "place" | "stop" | "custom"; lat?: number; lng?: number; note?: string; icon?: string };
export const travellerPlans = pgTable("traveller_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  title: text("title").notNull(),
  city: text("city"), // id de uma cidade da app, ou null para outra cidade
  cityName: text("city_name").notNull(),
  startDate: text("start_date"), // AAAA-MM-DD
  days: integer("days").notNull().default(1),
  items: jsonb("items").$type<PlanItem[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("plans_email_idx").on(t.email, t.updatedAt)]);
export type TravellerPlan = typeof travellerPlans.$inferSelect;

/* ---------- Marketplace de guias (modelo Uber: guias registam-se, turistas escolhem o melhor avaliado) ---------- */
export const guideStatus = pgEnum("guide_status", ["pending", "active", "suspended", "rejected"]);
export const bookingStatus = pgEnum("booking_status", ["pending", "requested", "confirmed", "declined", "cancelled", "expired", "completed", "refunded"]);

export const guides = pgTable("guides", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  city: text("city").notNull(),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  bio: text("bio").notNull().default(""),
  photo: text("photo"), // data URL JPEG pequena (≤ 60 KB)
  hourlyCents: integer("hourly_cents").notNull(),
  maxPeople: integer("max_people").notNull().default(6),
  meetingPoint: text("meeting_point"),
  licenseNo: text("license_no"),
  // Dados profissionais (não públicos): registo da atividade, seguro e dados fiscais para o DAC7.
  activityRegNo: text("activity_reg_no"), // RNAAT em Portugal, ou registo equivalente no país
  insurer: text("insurer"),
  policyNo: text("policy_no"),
  taxId: text("tax_id"),
  taxCountry: text("tax_country"),
  address: text("address"),
  birthDate: text("birth_date"), // AAAA-MM-DD (exigido no DAC7 para pessoas singulares)
  independentAt: timestamp("independent_at", { withTimezone: true }), // declaração de profissional independente + termos
  termsVersion: text("terms_version"),
  status: guideStatus("status").notNull().default("pending"),
  stripeAccountId: text("stripe_account_id"),
  payoutsReady: boolean("payouts_ready").notNull().default(false),
  ratingSum: integer("rating_sum").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("guides_email_idx").on(t.email), index("guides_city_status_idx").on(t.city, t.status)]);
export type Guide = typeof guides.$inferSelect;

export const guideBookings = pgTable("guide_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  guideId: uuid("guide_id").notNull().references(() => guides.id),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  city: text("city").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  hours: integer("hours").notNull(),
  people: integer("people").notNull(),
  amountCents: integer("amount_cents").notNull(),
  feeCents: integer("fee_cents").notNull(),
  note: text("note"),
  locale: text("locale"),
  status: bookingStatus("status").notNull().default("pending"),
  stripeSessionId: text("stripe_session_id"),
  paymentIntentId: text("payment_intent_id"),
  respondBy: timestamp("respond_by", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("bookings_guide_idx").on(t.guideId, t.startAt), uniqueIndex("bookings_session_idx").on(t.stripeSessionId)]);
export type GuideBooking = typeof guideBookings.$inferSelect;

export const guideReviews = pgTable("guide_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => guideBookings.id),
  guideId: uuid("guide_id").notNull().references(() => guides.id),
  stars: integer("stars").notNull(),
  comment: text("comment"),
  author: text("author"),
  locale: text("locale"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("guide_reviews_booking_idx").on(t.bookingId), index("guide_reviews_guide_idx").on(t.guideId)]);
export type GuideReview = typeof guideReviews.$inferSelect;

/* ---------- Rede social da carteira: perfis, seguidores, bloqueios e denúncias ---------- */
export const travellerProfiles = pgTable("traveller_profiles", {
  email: text("email").primaryKey(),
  handle: text("handle").notNull(),
  name: text("name").notNull(),
  bio: text("bio").notNull().default(""),
  photo: text("photo"), // data URL JPEG reduzida (≤ 100 KB)
  isPrivate: boolean("is_private").notNull().default(true),
  theme: text("theme").notNull().default("auto"),
  accent: text("accent").notNull().default("blue"),
  cities: jsonb("cities").$type<string[]>().notNull().default([]),   // cidades que segue
  lessOf: jsonb("less_of").$type<string[]>().notNull().default([]),  // interesses a ver menos
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("profiles_handle_idx").on(t.handle)]);
export type TravellerProfile = typeof travellerProfiles.$inferSelect;

export const follows = pgTable("follows", {
  follower: text("follower").notNull(),
  followee: text("followee").notNull(),
  status: text("status").$type<"pending" | "accepted">().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("follows_pair_idx").on(t.follower, t.followee), index("follows_followee_idx").on(t.followee, t.status)]);

export const blocks = pgTable("blocks", {
  blocker: text("blocker").notNull(),
  blocked: text("blocked").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("blocks_pair_idx").on(t.blocker, t.blocked)]);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporter: text("reporter").notNull(),
  target: text("target").notNull(),       // email do perfil denunciado
  reason: text("reason").notNull(),
  note: text("note").notNull().default(""),
  status: text("status").notNull().default("open"),
  postId: uuid("post_id"),                // publicação denunciada (opcional)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("reports_status_idx").on(t.status, t.createdAt)]);

/* ---------- Fase 2: publicações, histórias (24 h), gostos e comentários ---------- */
/** Música de uma publicação: faixa da biblioteca (lib) ou som próprio carregado pelo autor (own = ficheiro em MEDIA_DIR/m). */
export type PostMusic = { lib?: string; own?: string; title: string; artist: string };
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  author: text("author").notNull(),                       // email do autor (nunca mostrado)
  kind: text("kind").$type<"post" | "story">().notNull(),   // um vídeo é uma publicação com "video"
  text: text("text").notNull().default(""),
  photo: text("photo"),                                   // data URL JPEG reduzida (≤ ~350 KB)
  city: text("city"),                                     // id da cidade (feed da cidade)
  tag: text("tag"),                                       // interesse (algoritmo)
  bg: text("bg"),                                         // cor de fundo das histórias só com texto
  extra: jsonb("extra").$type<string[]>(),               // fotos 2..6 (carrossel), data URLs
  video: text("video"),                                   // id do ficheiro de vídeo (MEDIA_DIR/v/<id>.mp4)
  videoStatus: text("video_status").$type<"processing" | "ready" | "failed">(),
  duration: integer("duration"),                          // segundos
  music: jsonb("music").$type<PostMusic>(),               // música da biblioteca ou som próprio
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true })
}, (t) => [index("posts_author_idx").on(t.author, t.createdAt), index("posts_city_idx").on(t.city, t.createdAt), index("posts_kind_idx").on(t.kind, t.createdAt)]);
export type Post = typeof posts.$inferSelect;

export const postLikes = pgTable("post_likes", {
  postId: uuid("post_id").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("post_likes_pair_idx").on(t.postId, t.email)]);

/** Quem viu cada história (só o autor vê a lista; apaga-se com a história). */
export const storyViews = pgTable("story_views", {
  postId: uuid("post_id").notNull(),
  viewer: text("viewer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("story_views_pair_idx").on(t.postId, t.viewer)]);

export const postComments = pgTable("post_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull(),
  author: text("author").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("post_comments_post_idx").on(t.postId, t.createdAt)]);

/* ---------- Fase 3: conversas privadas entre seguidores / a seguir ---------- */
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  pair: text("pair").notNull(),            // os dois emails ordenados, "a|b"
  sender: text("sender").notNull(),
  recipient: text("recipient").notNull(),
  text: text("text").notNull(),
  ref: text("ref"),                        // "story:<id>:<excerto>" · "post:<id>:<excerto>" · "loc:<lat>,<lng>"
  photo: text("photo"),                    // foto enviada na conversa (data URL reduzida)
  audio: text("audio"),                    // nota de voz: "<id>.<ext>" em MEDIA_DIR/a
  replyTo: uuid("reply_to"),               // resposta a uma mensagem
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true })
}, (t) => [index("messages_pair_idx").on(t.pair, t.createdAt), index("messages_unread_idx").on(t.recipient, t.readAt)]);
export type Message = typeof messages.$inferSelect;

/** "Apagar conversa" só para mim: esconde as mensagens anteriores a esta data. */
export const chatCleared = pgTable("chat_cleared", {
  email: text("email").notNull(),
  peer: text("peer").notNull(),
  before: timestamp("before", { withTimezone: true }).notNull()
}, (t) => [uniqueIndex("chat_cleared_pair_idx").on(t.email, t.peer)]);

/* ---------- Conta: privacidade das mensagens, notificações e sessões ---------- */
export type NotifPrefs = Partial<Record<"like" | "comment" | "follow" | "message" | "story_reply" | "video", boolean>>;
export const accountSettings = pgTable("account_settings", {
  email: text("email").primaryKey(),
  dmPolicy: text("dm_policy").$type<"circle" | "following" | "none">().notNull().default("circle"),
  notif: jsonb("notif").$type<NotifPrefs>().notNull().default({}),
  lang: text("lang").notNull().default("en"),                           // língua do push
  sessionsAfter: timestamp("sessions_after", { withTimezone: true }),   // sessões anteriores deixam de valer
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type NotificationType = "like" | "comment" | "follow" | "request" | "accepted" | "story_reply" | "video_ready" | "invite_joined" | "mention" | "split" | "achievement";
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),            // quem recebe
  actor: text("actor").notNull(),            // quem fez
  type: text("type").$type<NotificationType>().notNull(),
  postId: uuid("post_id"),
  text: text("text").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true })
}, (t) => [index("notifications_email_idx").on(t.email, t.createdAt)]);

export const pushSubs = pgTable("push_subs", {
  endpoint: text("endpoint").primaryKey(),
  email: text("email").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("push_subs_email_idx").on(t.email)]);

/** Quem tem a app aberta agora (para não enviar push a quem já está a ver). */
export const livePresence = pgTable("live_presence", {
  email: text("email").primaryKey(),
  at: timestamp("at", { withTimezone: true }).notNull()
});

/* ---------- Convites (email, SMS, WhatsApp, link). O contacto convidado guarda-se só como hash. ---------- */
export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  inviter: text("inviter").notNull(),
  channel: text("channel").$type<"email" | "sms" | "whatsapp" | "link">().notNull(),
  targetHash: text("target_hash"),                 // sha256 do email/telefone normalizado
  joinedEmail: text("joined_email"),
  joinedAt: timestamp("joined_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("invites_inviter_idx").on(t.inviter, t.createdAt), index("invites_target_idx").on(t.targetHash)]);

/** Recompensas de convites: crédito ganho quando um amigo convidado compra, e crédito gasto numa compra. */
export const referralCredits = pgTable("referral_credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  amountCents: integer("amount_cents").notNull(),        // + ganho, − gasto
  kind: text("kind").$type<"earned" | "spent" | "reward">().notNull(),
  accessId: uuid("access_id").notNull(),
  friend: text("friend"),                                 // quem comprou (no caso de "earned")
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("referral_credits_access_kind_idx").on(t.accessId, t.kind), index("referral_credits_email_idx").on(t.email)]);

/* ---------- Guardados, reações a mensagens ---------- */
export const postSaves = pgTable("post_saves", {
  postId: uuid("post_id").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("post_saves_pair_idx").on(t.email, t.postId)]);

export const messageReactions = pgTable("message_reactions", {
  messageId: uuid("message_id").notNull(),
  email: text("email").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("message_reactions_pair_idx").on(t.messageId, t.email)]);

/* ---------- Dividir despesas com amigos (grupos de viagem) ---------- */
export const splitGroups = pgTable("split_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  currency: text("currency").notNull(),
  owner: text("owner").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
export const splitMembers = pgTable("split_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull(),
  email: text("email"),                       // viajante com conta; null = só nome
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("split_members_group_idx").on(t.groupId), index("split_members_email_idx").on(t.email)]);
export type SplitShares = Record<string, number>; // membro → cêntimos na moeda do grupo
export const splitItems = pgTable("split_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull(),
  kind: text("kind").$type<"expense" | "settle">().notNull(),
  title: text("title").notNull().default(""),
  amount: integer("amount").notNull(),        // cêntimos na moeda do grupo
  origAmount: integer("orig_amount").notNull(),
  origCurrency: text("orig_currency").notNull(),
  payer: uuid("payer").notNull(),
  shares: jsonb("shares").$type<SplitShares>().notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("split_items_group_idx").on(t.groupId, t.createdAt)]);

/* ---------- Pontos: paragens e cidades visitadas (check-in) ---------- */
/** Uma linha por cidade (stop = "") ou paragem visitada. verified = o GPS confirmou que estava lá. */
export const checkins = pgTable("checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  stop: text("stop").notNull().default(""),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("checkins_uniq_idx").on(t.email, t.city, t.stop), index("checkins_city_idx").on(t.city, t.stop)]);

/* ---------- Comentários sobre cidades e lugares ---------- */
export const placeComments = pgTable("place_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  city: text("city").notNull(),
  stop: text("stop").notNull().default(""),
  author: text("author").notNull(),
  text: text("text").notNull(),
  hidden: boolean("hidden").notNull().default(false),
  reports: integer("reports").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("place_comments_place_idx").on(t.city, t.stop, t.createdAt), index("place_comments_author_idx").on(t.author)]);

/* ---------- Conteúdo das cidades atualizado sozinho ---------- */
/** Textos de referência por cidade e língua (resumo e história da Wikipédia, CC BY-SA), renovados todas as semanas. */
export const cityKnowledge = pgTable("city_knowledge", {
  city: text("city").notNull(),
  lang: text("lang").notNull(),
  kind: text("kind").$type<"summary" | "history">().notNull(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  url: text("url").notNull(),
  srcLang: text("src_lang").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("city_knowledge_key_idx").on(t.city, t.lang, t.kind)]);

export type PulseData = {
  events?: { name: string; when: string; venue: string; url: string; kind: string }[];
  weather?: { min: number; max: number; rain: number; code: number } | null;
  trending?: { stops: { id: string; n: number }[]; tags: { tag: string; n: number }[]; comments: number; posts: number; visitors: number };
  news?: Record<string, { title: string; url: string; source: string; at: number }[]>;
};
/** Resumo diário de cada cidade ("O que há de novo hoje"), recolhido por um processo automático. */
export const cityPulse = pgTable("city_pulse", {
  city: text("city").notNull(),
  day: text("day").notNull(), // AAAA-MM-DD
  data: jsonb("data").$type<PulseData>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("city_pulse_key_idx").on(t.city, t.day)]);

/** Conquistas já anunciadas (nível, medalha, prémio): cada uma notifica uma só vez. key = "level:3" | "badge:cities-5" | "reward:1000" | "seed". */
export const achievements = pgTable("achievements", {
  email: text("email").notNull(),
  key: text("key").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("achievements_key_idx").on(t.email, t.key)]);
