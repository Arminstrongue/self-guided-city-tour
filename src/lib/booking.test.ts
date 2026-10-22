import { test } from "node:test";
import assert from "node:assert/strict";
import { BookingBody, MerchantExtras, bookKind, checkBooking, cleanPhone, cleanUrl, isPhotoDataUrl, nights } from "./booking";
import { businessMail, travellerMail } from "./booking-emails";

const base = { merchantId: "6f1c2a7e-0d7b-4b1a-9c55-2f6d1f0a9b11", name: "Ana Silva", email: "ana@example.com", dateFrom: "2026-11-02", locale: "pt" };

test("cada categoria tem o tipo de reserva certo", () => {
  assert.equal(bookKind("food"), "table");
  assert.equal(bookKind("cafe"), "table");
  assert.equal(bookKind("hotel"), "room");
  assert.equal(bookKind("guesthouse"), "room");
  assert.equal(bookKind("car"), "car");
  assert.equal(bookKind("exp"), "slot");
  assert.equal(bookKind("bag"), "bag");
  assert.equal(bookKind("shop"), null);
});

test("quartos: a saída tem de ser depois da entrada", () => {
  const ok = BookingBody.parse({ ...base, dateTo: "2026-11-04", people: 2, units: 1 });
  assert.equal(checkBooking("room", ok, "2026-10-22"), null);
  assert.equal(nights(ok.dateFrom, ok.dateTo), 2);
  assert.equal(checkBooking("room", BookingBody.parse({ ...base, dateTo: "2026-11-02" }), "2026-10-22"), "dateTo");
  assert.equal(checkBooking("room", BookingBody.parse({ ...base }), "2026-10-22"), "dateTo");
});

test("mesas precisam de hora; datas no passado ou a mais de um ano são recusadas", () => {
  assert.equal(checkBooking("table", BookingBody.parse({ ...base }), "2026-10-22"), "time");
  assert.equal(checkBooking("table", BookingBody.parse({ ...base, time: "20:00" }), "2026-10-22"), null);
  assert.equal(checkBooking("table", BookingBody.parse({ ...base, time: "20:00", dateFrom: "2026-10-01" }), "2026-10-22"), "date");
  assert.equal(checkBooking("table", BookingBody.parse({ ...base, time: "20:00", dateFrom: "2028-01-01" }), "2026-10-22"), "date");
  assert.equal(BookingBody.safeParse({ ...base, time: "25:00" }).success, false);
});

test("carros: levantamento com hora e devolução no mesmo dia ou depois", () => {
  assert.equal(checkBooking("car", BookingBody.parse({ ...base, time: "10:00", dateTo: "2026-11-02" }), "2026-10-22"), null);
  assert.equal(checkBooking("car", BookingBody.parse({ ...base, time: "10:00", dateTo: "2026-11-01" }), "2026-10-22"), "dateTo");
});

test("registo do negócio exige foto válida e limpa links e telefones", () => {
  const jpg = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
  assert.ok(isPhotoDataUrl(jpg));
  assert.ok(!isPhotoDataUrl("data:text/html;base64,PHNjcmlwdD4="));
  assert.equal(MerchantExtras.safeParse({ photos: [] }).success, false);
  assert.equal(MerchantExtras.safeParse({ photos: [jpg, jpg, jpg, jpg, jpg] }).success, false);
  assert.ok(MerchantExtras.safeParse({ photos: [jpg], bookMode: "request", bookOptions: [{ name: "Quarto duplo", price: "80 €" }] }).success);
  assert.equal(cleanUrl("javascript:alert(1)"), null);
  assert.equal(cleanUrl("hotel-avenida.pt/reservas"), "https://hotel-avenida.pt/reservas");
  assert.equal(cleanPhone("+244 923 456 789"), "+244923456789");
  assert.equal(cleanPhone("123"), null);
});

test("emails: o negócio recebe os detalhes e o texto do viajante é escapado", () => {
  const d = { business: "Casa <Azul>", kind: "room" as const, option: "Quarto duplo", dateFrom: "2026-11-02", dateTo: "2026-11-04", time: "", people: 2, units: 1, name: "Ana <b>", email: "ana@example.com", phone: "", note: "Chegamos tarde", locale: "pt" };
  const biz = businessMail(d, "pt");
  assert.match(biz.subject, /quarto/);
  assert.match(biz.html, /2 noites/);
  assert.ok(!biz.html.includes("<b>Ana <b>"));
  assert.match(biz.html, /Ana &lt;b&gt;/);
  const trav = travellerMail({ ...d, locale: "ja" });
  assert.match(trav.subject, /Casa <Azul>/);
  assert.ok(trav.html.includes("Casa &lt;Azul&gt;"));
});
