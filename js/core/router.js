// Hash tabanli yonlendirici. Her gorunum mount/unmount verir; unmount
// nesne URL'lerini geri vermekle yukumludur (yoksa bellek sisiyor).

const routes = new Map();
let current = null;
let host = null;
let onNavigate = null;

export function defineRoute(name, view) { routes.set(name, view); }
export function setHost(node) { host = node; }
export function setNavigateHook(fn) { onNavigate = fn; }

export function parseHash() {
  const raw = (location.hash || '#/gunluk').replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(query || ''));
  return { name: parts[0] || 'gunluk', rest: parts.slice(1), params };
}

export function navigate(to, replace = false) {
  const url = `#/${String(to).replace(/^#?\/?/, '')}`;
  if (replace) location.replace(url); else location.hash = url;
}

export async function render() {
  if (!host) return;
  const { name, rest, params } = parseHash();
  const view = routes.get(name) || routes.get('gunluk');
  if (current && current.unmount) { try { await current.unmount(); } catch {} }
  host.replaceChildren();
  host.scrollTop = 0;
  window.scrollTo(0, 0);
  current = view;
  onNavigate && onNavigate(name, rest, params);
  try {
    await view.mount(host, { rest, params });
  } catch (e) {
    console.error('Görünüm açılamadı:', e);
    host.replaceChildren(Object.assign(document.createElement('div'), {
      className: 'card',
      textContent: 'Bu bölüm açılamadı: ' + (e && e.message || e),
    }));
  }
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  render();
}

export async function unmountCurrent() {
  if (current && current.unmount) { try { await current.unmount(); } catch {} }
  current = null;
}
