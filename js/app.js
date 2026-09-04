/* Shared render helpers for the FMCSA Data Analyzer clickable prototype. */

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function icon(path, opts = {}) {
  const { size = 16, stroke = '#52514e', sw = 2 } = opts;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
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
};

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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-topbar]').forEach(mountTopbar);
});
