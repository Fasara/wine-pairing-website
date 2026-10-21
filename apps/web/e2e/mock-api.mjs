// Tiny stand-in for apps/api that follows API_CONTRACT.md. The Next.js server
// fetches data during SSR, so the browser-level page.route cannot intercept it.
import { createServer } from 'node:http';

const cats = [
  { id: 1, slug: 'red-meat', name: 'Red meat' },
  { id: 2, slug: 'cheese', name: 'Cheese' },
];
const foods = [
  { id: 1, slug: 'ribeye-steak', name: 'Ribeye steak', category: cats[0] },
  { id: 2, slug: 'aged-cheddar', name: 'Aged cheddar', category: cats[1] },
];
const types = ['red', 'white', 'sparkling', 'rose'];
const countries = ['Italy', 'France', 'Spain'];
const wines = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  externalId: `ext-${i + 1}`,
  name: `Wine ${String(i + 1).padStart(2, '0')}`,
  winery: `Winery ${i % 5}`,
  type: types[i % 4],
  grape: i % 4 === 0 ? 'Nebbiolo' : 'Chardonnay',
  region: 'Region',
  country: countries[i % 3],
  ratingAverage: 3 + (i % 20) / 10,
  ratingReviews: 100 + i,
  imageUrl: null,
}));

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};
const notFound = (res) => send(res, 404, { statusCode: 404, message: 'Not found', error: 'Not Found' });

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  const qs = url.searchParams;
  let m;

  if (p === '/health') return send(res, 200, { status: 'ok' });
  if (p === '/wines') {
    const q = (qs.get('q') || '').toLowerCase();
    let list = wines.filter(
      (w) =>
        (!qs.get('type') || w.type === qs.get('type')) &&
        (!qs.get('country') || w.country === qs.get('country')) &&
        (!q || [w.name, w.winery, w.grape].some((s) => s.toLowerCase().includes(q))),
    );
    const page = Number(qs.get('page') || 1);
    const pageSize = Number(qs.get('pageSize') || 12);
    return send(res, 200, { items: list.slice((page - 1) * pageSize, page * pageSize), total: list.length, page, pageSize });
  }
  if (p === '/wines/countries') return send(res, 200, countries);
  if ((m = p.match(/^\/wines\/(\d+)$/))) {
    const w = wines.find((x) => x.id === Number(m[1]));
    return w ? send(res, 200, w) : notFound(res);
  }
  if ((m = p.match(/^\/wines\/(\d+)\/pairings$/))) {
    if (!wines.some((x) => x.id === Number(m[1]))) return notFound(res);
    return send(res, 200, foods.map((food, i) => ({ food, strength: 5 - i, reason: `Reason for ${food.name}` })));
  }
  if (p === '/food-categories') return send(res, 200, cats);
  if (p === '/foods') return send(res, 200, foods.filter((f) => !qs.get('category') || f.category.slug === qs.get('category')));
  if ((m = p.match(/^\/foods\/([^/]+)$/))) {
    const f = foods.find((x) => x.slug === m[1]);
    return f ? send(res, 200, f) : notFound(res);
  }
  if ((m = p.match(/^\/foods\/([^/]+)\/wines$/))) {
    if (!foods.some((x) => x.slug === m[1])) return notFound(res);
    return send(res, 200, wines.slice(0, 3).map((wine, i) => ({ wine, strength: 5 - i, reason: `Reason for ${wine.name}` })));
  }
  notFound(res);
}).listen(Number(process.env.MOCK_API_PORT || 4010), () => console.log('mock api ready'));
