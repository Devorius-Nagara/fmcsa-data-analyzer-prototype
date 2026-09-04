/* Shared render helpers for the FMCSA Data Analyzer clickable prototype. */

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function icon(path, opts = {}) {
  const { size = 16, stroke = '#52514e', sw = 2, class: cls = '' } = opts;
  return `<svg${cls ? ` class="${cls}"` : ''} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
const ICONS = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  sort: '<path d="M7 10l5-5 5 5M7 14l5 5 5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  warn: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  truck: '<rect x="1" y="7" width="15" height="10" rx="1"/><path d="M16 10h3l3 3v4h-6z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>',
  provider: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  logo: '<path d="M3 12l4-7h10l4 7-4 7H7z"/><path d="M9 12h6M12 9v6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  layers: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.5"/><circle cx="3.5" cy="12" r="1.5"/><circle cx="3.5" cy="18" r="1.5"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
};

/* Copies a data-copy attribute's value to the clipboard and briefly swaps the button icon for a check mark. */
function copyToClipboard(btn) {
  const text = btn.dataset.copy;
  const done = () => {
    const original = btn.innerHTML;
    btn.innerHTML = icon(ICONS.check, { size: 12.5, stroke: '#0a6b0a', sw: 2.5 });
    setTimeout(() => { btn.innerHTML = original; }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(done);
  } else {
    done();
  }
}

function topbar() {
  return `
  <div class="topbar">
    <div class="brand">${icon(ICONS.logo, { size: 22, stroke: '#2a78d6', sw: 2 })} FMCSA Data Analyzer</div>
    <div class="right">
      <span style="font-size:13px; color:#52514e;">Compliance Dashboard</span>
      <div class="avatar">BK</div>
    </div>
  </div>`;
}

function backLink(href, label) {
  return `<a class="back-link" href="${href}">${icon(ICONS.back, { size: 16, stroke: '#2a78d6' })} ${label}</a>`;
}

/* Breadcrumb trail: parts = [{label, href}, ...]. The last part is rendered
   as plain text (current page) even if it carries an href. */
function breadcrumb(parts) {
  return `<div class="crumbs">` +
    parts.map((p, i) => {
      const isLast = i === parts.length - 1;
      const sep = i > 0 ? `<span class="crumb-sep">/</span>` : '';
      const content = (isLast || !p.href)
        ? `<span class="crumb-current">${p.label}</span>`
        : `<a href="${p.href}">${p.label}</a>`;
      return sep + content;
    }).join('') +
  `</div>`;
}

function tamperingPill(insp) {
  const has = insp.violations.some(v => v.type === 'ELD tampering');
  return has
    ? `<span class="pill pill-critical">Yes</span>`
    : `<span class="pill pill-minimal">No</span>`;
}

function clientBadge(isClient) {
  return isClient
    ? `<span class="client-badge client-yes">${icon(ICONS.check, { size: 10, stroke: '#184f95', sw: 3 })} Client</span>`
    : `<span class="client-badge client-no">Not a client</span>`;
}

function scorePill(score) {
  const t = scoreTier(score);
  return `<span class="pill ${t.cls}">${score} · ${t.label}</span>`;
}

function mountTopbar(el) { el.innerHTML = topbar(); }

/* Persistent left navigation: dashboard/providers shortcuts, a live company
   search, and a top-states quick list — so no page is more than one click away. */
function sidebarHTML() {
  const page = (window.location.pathname.split('/').pop() || 'index.html');
  const active = (file) => page === file ? 'active' : '';
  const activeStroke = (file) => page === file ? '#184f95' : '#52514e';
  const topStates = [...STATES].sort((a, b) => b.count - a.count).slice(0, 5);

  return `
    <div class="sidebar-section">
      <a class="sidebar-link ${active('index.html')}" href="index.html">${icon(ICONS.grid, { size: 16, stroke: activeStroke('index.html') })} Dashboard</a>
      <a class="sidebar-link ${active('providers.html')}" href="providers.html">${icon(ICONS.layers, { size: 16, stroke: activeStroke('providers.html') })} Providers</a>
      <a class="sidebar-link ${active('companies.html')}" href="companies.html">${icon(ICONS.list, { size: 16, stroke: activeStroke('companies.html') })} Company</a>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Top states</div>
      ${topStates.map(s => `
        <a class="sidebar-state-row" href="state.html?state=${s.code}">
          <span>${s.name}</span>
          <span class="n mono">${s.count}</span>
        </a>`).join('')}
    </div>`;
}

function mountSidebar(el) {
  el.className = 'sidebar';
  el.innerHTML = sidebarHTML();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-topbar]').forEach(mountTopbar);
  document.querySelectorAll('[data-sidebar]').forEach(mountSidebar);
});
