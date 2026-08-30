#!/usr/bin/env node
/**
 * Old-versus-new parity for Chameleon.
 *
 *   node scripts/parity.js --old http://localhost:13000 --new https://folia-chameleon.fly.dev
 *
 * Chameleon's output depends on who owns each token, so the two sides are only
 * comparable while they read the same chain and the same migrated files. Both
 * the mp4 and the png are compared as bytes — the png is not a separate render
 * but frame 00040 lifted out of go/, so a mismatch there means the frames
 * themselves differ, not just the encode.
 *
 * Range requests get their own check: routes/get.js implements 206 by hand, and
 * that is how a browser actually fetches the video.
 */

const crypto = require('crypto');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };

const OLD = arg('--old', 'http://localhost:13000');
const NEW = arg('--new', 'https://folia-chameleon.fly.dev');
const SAMPLE = Number(arg('--tokens', 12));
const SERIES = 12;
const PRINTED = 272;

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
let pass = 0, fail = 0, drift = 0;
const failures = [], drifts = [];
const ok = (n) => { pass++; console.log(`  PASS  ${n}`); };
const bad = (n, d) => { fail++; failures.push(`${n}: ${d}`); console.log(`  FAIL  ${n} — ${d}`); };
const note = (n, d) => { drift++; drifts.push(`${n}: ${d}`); console.log(`  DRIFT ${n} — ${d}`); };

async function get(url, headers = {}) {
  const res = await fetch(url, { headers, redirect: 'follow' });
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, headers: res.headers, buf, bytes: buf.length, text: buf.toString('utf8') };
}

(async () => {
  console.log(`old: ${OLD}\nnew: ${NEW}\n`);

  const step = Math.max(1, Math.floor(PRINTED / SAMPLE));
  const tokens = [];
  for (let i = 1; i <= PRINTED && tokens.length < SAMPLE; i += step) tokens.push(SERIES * 1_000_000 + i);

  console.log(`[mp4] ${tokens.length} tokens`);
  for (const t of tokens) {
    const [a, b] = await Promise.all([get(`${OLD}/get/${t}.mp4`), get(`${NEW}/get/${t}.mp4`)]);
    if (a.status !== b.status) { bad(`${t}.mp4`, `status ${a.status} vs ${b.status}`); continue; }
    if (a.status !== 200) { note(`${t}.mp4`, `both ${a.status}`); continue; }
    if (sha(a.buf) !== sha(b.buf)) { bad(`${t}.mp4`, `${a.bytes} vs ${b.bytes} bytes`); continue; }
    const ct = [a, b].map((r) => r.headers.get('content-type'));
    ct[0] === ct[1] ? ok(`${t}.mp4 byte-identical (${a.bytes} bytes)`) : bad(`${t}.mp4`, `content-type ${ct[0]} vs ${ct[1]}`);
  }

  console.log(`\n[png] ${tokens.length} tokens (frame 00040 out of go/)`);
  for (const t of tokens) {
    const [a, b] = await Promise.all([get(`${OLD}/get/${t}.png`), get(`${NEW}/get/${t}.png`)]);
    if (a.status !== b.status) { bad(`${t}.png`, `status ${a.status} vs ${b.status}`); continue; }
    if (a.status !== 200) { note(`${t}.png`, `both ${a.status}`); continue; }
    sha(a.buf) === sha(b.buf) ? ok(`${t}.png byte-identical (${a.bytes} bytes)`)
                              : bad(`${t}.png`, `${a.bytes} vs ${b.bytes} bytes`);
  }

  console.log('\n[range requests]');
  const rt = tokens[0];
  for (const range of ['bytes=0-1023', 'bytes=1024-4095']) {
    const [a, b] = await Promise.all([
      get(`${OLD}/get/${rt}.mp4`, { Range: range }),
      get(`${NEW}/get/${rt}.mp4`, { Range: range }),
    ]);
    if (a.status !== b.status) { bad(`range ${range}`, `status ${a.status} vs ${b.status}`); continue; }
    const cr = [a, b].map((r) => r.headers.get('content-range'));
    if (cr[0] !== cr[1]) { bad(`range ${range}`, `content-range ${cr[0]} vs ${cr[1]}`); continue; }
    sha(a.buf) === sha(b.buf) ? ok(`range ${range} → ${a.status}, identical (${a.bytes} bytes)`)
                              : bad(`range ${range}`, 'bytes differ');
  }

  console.log('\n[routes]');
  for (const p of ['/get/list', '/']) {
    const [a, b] = await Promise.all([get(`${OLD}${p}`), get(`${NEW}${p}`)]);
    if (a.status !== b.status) bad(p, `status ${a.status} vs ${b.status}`);
    else if (a.text === b.text) ok(`${p} identical (${a.status}, ${a.bytes} bytes)`);
    else note(p, `same status ${a.status}, differs by ${Math.abs(a.bytes - b.bytes)} bytes`);
  }

  console.log('\n[errors]');
  const bads = ['0.mp4', '12000001.gif', 'abc.mp4', '11000001.mp4', '12999999.mp4', 'nosuffix'];
  for (const x of bads) {
    const [a, b] = await Promise.all([get(`${OLD}/get/${x}`), get(`${NEW}/get/${x}`)]);
    if (a.status !== b.status) bad(`"${x}"`, `status ${a.status} vs ${b.status}`);
    else if (a.text !== b.text) bad(`"${x}"`, `same status ${a.status}, body "${a.text.slice(0,30)}" vs "${b.text.slice(0,30)}"`);
    else ok(`"${x}" → both ${a.status}, identical body`);
  }

  console.log(`\n  ${pass} pass · ${fail} fail · ${drift} drift`);
  if (drift) { console.log('\n  drift:'); drifts.forEach((d) => console.log(`    ${d}`)); }
  if (fail) { console.log('\n  regressions:'); failures.forEach((f) => console.log(`    ${f}`)); }
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
