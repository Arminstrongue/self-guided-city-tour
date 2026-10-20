import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";
const media = mkdtempSync(path.join(tmpdir(), "sgct-media-"));
process.env.MEDIA_DIR = media;

let hasFfmpeg = true;
try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); } catch { hasFfmpeg = false; }

test("vídeos: envio, conversão (ffmpeg), visibilidade, feed e apagar", { skip: !hasFfmpeg && "sem ffmpeg" }, async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./posts");
  const v = await import("./video");
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  const src = path.join(media, "in.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc=size=1080x1920:rate=30:duration=2", "-f", "lavfi", "-i", "sine=frequency=440:duration=2", "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", src]);
  const r = await p.createVideoPost("a@x.com", { text: "Lisboa ao pôr do sol", city: "lis", tag: "photo" }) as { id: string };
  await v.saveUpload(r.id, new Blob([readFileSync(src)]).stream());
  // Enquanto converte, só a autora vê
  assert.equal((await p.feedFollowing("a@x.com")).posts[0]?.video, "processing");
  assert.equal(await p.getPost("b@x.com", r.id), null);
  v.enqueue(r.id);
  await globalThis.__sgctVideoQ;
  assert.ok(existsSync(v.videoPath(r.id)) && existsSync(v.posterPath(r.id)));
  assert.equal(await p.videoOf("b@x.com", r.id), r.id);
  const feed = await p.feedVideos("b@x.com", "foryou");
  assert.equal(feed.posts[0]?.id, r.id); assert.equal(feed.posts[0]?.duration, 2);
  assert.equal((await p.feedVideos("b@x.com", "following")).posts.length, 0);
  await p.removePost(r.id, "a@x.com");
  assert.ok(!existsSync(v.videoPath(r.id)));
});
