// GradStudio PA#3 mock API.
// Run: node mock/server.mjs   (PORT=3001, MOCK_MODE=normal|slow|error|empty)
// Node built-in modules only: no package.json, no npm install.
//
// Every file in mock/routes/*.mjs exports default an array of routes:
//   { method: 'GET', path: '/api/bookings/:code', roles: null | 'signed-in' | ['admin', ...], handler }
// handler(ctx) returns { status, body } (it may be async).
// ctx = { params, query, body, rawBody, headers, user, db, fail }
// The rules for the answers are in docs/api/README.md (sections "Error shape" and "Mock behaviour").

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const MODE = process.env.MOCK_MODE || 'normal';
const MODES = ['normal', 'slow', 'error', 'empty'];

if (!MODES.includes(MODE)) {
  console.error(`MOCK_MODE "${MODE}" is not valid. Use one of: ${MODES.join(', ')}.`);
  process.exit(1);
}

// ---------- errors ----------

function fail(status, code, message, fields = {}, details = null) {
  return { status, body: { error: { code, message, fields, details } } };
}

const SERVER_ERROR = () => fail(500, 'SERVER_ERROR', 'Máy chủ đang gặp sự cố, vui lòng thử lại.');
const NOT_FOUND = () => fail(404, 'NOT_FOUND', 'Không tìm thấy');
const UNAUTHENTICATED = () => fail(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập để tiếp tục');
const FORBIDDEN = () => fail(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này');
const BAD_JSON = () => fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ');

// ---------- data: mock/data/*.json -> db.<file name> ----------

function loadDb() {
  const dir = path.join(here, 'data');
  const db = {};
  if (!fs.existsSync(dir)) return db;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    try {
      // Parsed fresh from disk, so changes stay in memory and a restart starts over.
      db[path.basename(file, '.json')] = JSON.parse(text);
    } catch (err) {
      console.error(`mock/data/${file} is not valid JSON: ${err.message}`);
      process.exit(1);
    }
  }
  return db;
}

// ---------- routes: mock/routes/*.mjs ----------

function splitPath(p) {
  return p.split('/').filter(Boolean);
}

async function loadRoutes() {
  const dir = path.join(here, 'routes');
  const routes = [];
  if (!fs.existsSync(dir)) return routes;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()) {
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    if (!Array.isArray(mod.default)) {
      console.error(`mock/routes/${file} must export default an array of routes.`);
      process.exit(1);
    }
    for (const r of mod.default) {
      const ok = typeof r.method === 'string' && typeof r.path === 'string' && typeof r.handler === 'function'
        && (r.roles === null || r.roles === 'signed-in' || Array.isArray(r.roles));
      if (!ok) {
        console.error(`mock/routes/${file}: route ${r.method} ${r.path} needs { method, path, roles: null | 'signed-in' | [roles], handler }.`);
        process.exit(1);
      }
      const method = r.method.toUpperCase();
      const dup = routes.find((x) => x.method === method && x.path === r.path);
      if (dup) console.warn(`Warning: ${method} ${r.path} is defined in both ${dup.file} and ${file}; the first one is used.`);
      routes.push({ ...r, method, segments: splitPath(r.path), file });
    }
  }
  return routes;
}

// Returns the params when the route matches the path segments, otherwise null.
function matchRoute(route, segments) {
  if (route.segments.length !== segments.length) return null;
  const params = {};
  for (let i = 0; i < segments.length; i++) {
    const want = route.segments[i];
    if (want.startsWith(':')) {
      try {
        params[want.slice(1)] = decodeURIComponent(segments[i]);
      } catch {
        return null;
      }
    } else if (want !== segments[i]) {
      return null;
    }
  }
  return params;
}

// A static segment beats a :param in the same place, reading from the left,
// so /api/bookings/export wins over /api/bookings/:code whatever the file order.
function moreSpecific(a, b) {
  for (let i = 0; i < a.segments.length; i++) {
    const aParam = a.segments[i].startsWith(':');
    const bParam = b.segments[i].startsWith(':');
    if (aParam !== bParam) return aParam ? 1 : -1;
  }
  return 0;
}

function findRoute(routes, method, segments) {
  const found = [];
  for (const route of routes) {
    if (route.method !== method) continue;
    const params = matchRoute(route, segments);
    if (params) found.push({ route, params });
  }
  // Array.prototype.sort is stable, so equal routes keep their load order.
  found.sort((x, y) => moreSpecific(x.route, y.route));
  return found[0] || null;
}

// ---------- request helpers ----------

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Returns { body } or { error } for a body that is not a JSON object.
function parseBody(headers, rawBody) {
  const type = String(headers['content-type'] || '').toLowerCase();
  if (type.startsWith('multipart/form-data')) return { body: {} }; // the handler reads ctx.rawBody
  const text = rawBody.toString('utf8').trim();
  if (text === '') return { body: {} };
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return { error: BAD_JSON() };
  }
  // Every request body in the contract is an object.
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return { error: BAD_JSON() };
  return { body };
}

function userFromToken(db, headers) {
  const m = /^Bearer\s+(\S+)$/i.exec(String(headers.authorization || '').trim());
  if (!m || !m[1].startsWith('token-')) return null;
  const id = m[1].slice('token-'.length);
  return (db.users || []).find((u) => u.id === id) || null;
}

// MOCK_MODE=empty: every array becomes [], also inside objects. Builds a new value, db is not touched.
function emptyLists(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = emptyLists(v);
    return out;
  }
  return value;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const delay = () => (MODE === 'slow' ? 2000 : 120 + Math.floor(Math.random() * 61)); // normal: about 150 ms

// ---------- handling one request ----------

async function handle(req, db, routes) {
  const url = new URL(req.url, 'http://localhost');
  const method = req.method.toUpperCase();
  const segments = splitPath(url.pathname);

  if (MODE === 'error' && !(method === 'POST' && url.pathname.replace(/\/+$/, '') === '/api/auth/login')) {
    return SERVER_ERROR();
  }

  const found = findRoute(routes, method, segments);
  if (!found) return NOT_FOUND();
  const { route, params } = found;

  const headers = req.headers;
  const user = userFromToken(db, headers);
  if (route.roles !== null) {
    if (!user) return UNAUTHENTICATED();
    if (Array.isArray(route.roles) && !route.roles.includes(user.role)) return FORBIDDEN();
  }

  const rawBody = await readBody(req);
  const parsed = parseBody(headers, rawBody);
  if (parsed.error) return parsed.error;

  const ctx = {
    params,
    query: Object.fromEntries(url.searchParams),
    body: parsed.body,
    rawBody,
    headers,
    user,
    db,
    fail,
  };

  const result = await route.handler(ctx);
  if (!result || typeof result.status !== 'number') {
    throw new Error(`${route.method} ${route.path} (${route.file}) returned no { status, body }`);
  }
  return result;
}

function send(res, { status, body }) {
  if (status === 204) {
    res.writeHead(204);
    res.end();
    return;
  }
  const text = JSON.stringify(body ?? null);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
  });
  res.end(text);
}

// ---------- start ----------

const db = loadDb();
const routes = await loadRoutes();

const server = http.createServer(async (req, res) => {
  let result;
  try {
    result = await handle(req, db, routes);
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    result = SERVER_ERROR();
  }
  if (MODE === 'empty' && result.status < 400) result = { ...result, body: emptyLists(result.body) };
  await sleep(delay());
  send(res, result);
  console.log(`${req.method} ${req.url} → ${result.status}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other mock, or run with PORT=<another port>.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Mock server listening on port ${PORT} (mode: ${MODE})`);
  console.log(`Loaded ${Object.keys(db).length} data file(s) and ${routes.length} route(s).`);
});
