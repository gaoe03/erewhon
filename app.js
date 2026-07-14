/* ============================================================
   Erewhon Smoothie Archive.
   Two views (smoothies, ingredients), two modals (smoothie
   sheet, ingredient profile), all driven by the URL hash:
     #/             archive
     #/ingredients  ingredient stats
     #/s/<id>       smoothie sheet
     #/i/<id>       ingredient profile
   ============================================================ */

(function () {
  const { matchIcon, iconSVG, cupSVG } = window.ArchiveIcons;
  const { CANON, CATS, BY_ID, matchCanon } = window.ArchiveIngredients;
  const DATA = window.SMOOTHIES;

  /* ---- the boil ---- */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let frame = 0;
    setInterval(() => {
      if (document.hidden) return;
      frame = (frame + 1) % 4;
      document.documentElement.dataset.frame = String(frame);
    }, 140);
  }

  /* ---- helpers ---- */
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const PILLS = {
    permanent: { text: 'On the menu', cls: 'green' },
    limited: { text: 'Limited run', cls: 'orange' },
    discontinued: { text: 'Discontinued', cls: 'gray' },
    unknown: { text: 'Status unknown', cls: 'gray' },
  };
  const TYPE_LABEL = {
    celebrity: 'Celebrity collab',
    brand: 'Brand collab',
    house: 'House menu',
    unknown: 'Unattributed',
  };

  /* specimen numbers, chronological */
  const numbered = [...DATA].sort((a, b) => (a.sortKey - b.sortKey) || a.name.localeCompare(b.name));
  const NO = new Map(numbered.map((s, i) => [s.id, i + 1]));
  const BY_SID = new Map(DATA.map((s) => [s.id, s]));

  /* ---- ingredient stats, computed once ---- */
  const ING = new Map(); // id -> { def, count, smoothieIds:[], variants:Set }
  for (const s of DATA) {
    const seen = new Set();
    for (const raw of s.ingredients) {
      const id = matchCanon(raw);
      if (!id) continue;
      if (!ING.has(id)) ING.set(id, { def: BY_ID.get(id), count: 0, smoothieIds: [], variants: new Set() });
      const e = ING.get(id);
      e.variants.add(raw);
      if (!seen.has(id)) { seen.add(id); e.count++; e.smoothieIds.push(s.id); }
    }
  }
  const ING_LIST = [...ING.values()].sort((a, b) => b.count - a.count || a.def.name.localeCompare(b.def.name));

  /* ---- co-occurrence: which ingredients share the most cups ---- */
  const CO = new Map(); // id -> [up to 3 ids it appears with most often]
  for (const [id, e] of ING) {
    const tally = new Map();
    for (const sid of e.smoothieIds) {
      const ids = new Set();
      for (const raw of BY_SID.get(sid).ingredients) {
        const cid = matchCanon(raw);
        if (cid && cid !== id && ING.has(cid)) ids.add(cid);
      }
      for (const cid of ids) tally.set(cid, (tally.get(cid) || 0) + 1);
    }
    const top = [...tally.entries()]
      .sort((a, b) => b[1] - a[1] || BY_ID.get(a[0]).name.localeCompare(BY_ID.get(b[0]).name))
      .slice(0, 3)
      .map(([cid]) => cid);
    CO.set(id, top);
  }

  /* ---- hero stats ---- */
  document.getElementById('hero-stats').textContent =
    `A catalog of every Erewhon smoothie since 2022 (that I could find).`;
  document.getElementById('ing-hero-stats').textContent =
    `${ING.size} ingredients across ${DATA.length} smoothies.`;

  /* ---- archive view ---- */
  let filter = 'all';
  let sort = 'newest';

  const FILTERS = [
    ['all', 'All'],
    ['celebrity', 'Celebrity'],
    ['brand', 'Brand'],
    ['house', 'House'],
  ];

  function renderChips() {
    document.getElementById('chips').innerHTML = FILTERS.map(([key, label]) => {
      const n = key === 'all' ? DATA.length : DATA.filter((s) => s.collabType === key).length;
      return `<button data-filter="${key}" aria-pressed="${filter === key}">${label}<span class="count">${n}</span></button>`;
    }).join('');
  }

  document.getElementById('chips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    filter = btn.dataset.filter;
    renderChips();
    renderCatalog();
  });

  document.getElementById('sort-select').addEventListener('change', (e) => {
    sort = e.target.value;
    renderCatalog();
  });

  function visible() {
    const list = filter === 'all' ? [...DATA] : DATA.filter((s) => s.collabType === filter);
    if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => {
      const d = (a.sortKey - b.sortKey) || a.name.localeCompare(b.name);
      return sort === 'newest' ? -d : d;
    });
    return list;
  }

  /* real menu photo when one survives, the drawn cup otherwise */
  function artHTML(s, cls) {
    if (s.image) return `<span class="${cls}-photo"><img src="${esc(s.image)}" alt="" loading="lazy"/></span>`;
    return cupSVG(s.color, s.colorDark, cls === 'sheet' ? s.name + ' cup' : '', 'cup');
  }

  function cardHTML(s) {
    const pill = PILLS[s.status] || PILLS.unknown;
    const collab = s.collaborator || (s.collabType === 'house' ? 'House recipe' : 'Collaborator unknown');
    const meta = [s.date, s.ingredients.length ? s.ingredients.length + ' ingredients' : null]
      .filter(Boolean).join(', ');
    return `<li>
      <button class="card" data-s="${esc(s.id)}" aria-haspopup="dialog">
        ${artHTML(s, 'card')}
        <h3 class="card-name">${esc(s.name)}</h3>
        <span class="card-collab">${esc(collab)}</span>
        <span class="card-meta">${esc(meta)}</span>
        <span class="pill ${pill.cls}">${pill.text}</span>
      </button>
    </li>`;
  }

  function renderCatalog() {
    const list = visible();
    if (!list.length) {
      document.getElementById('catalog').innerHTML = '<li class="catalog-empty">Nothing matches this filter.</li>';
      return;
    }
    let html = '';
    let era = null;
    for (const s of list) {
      if (sort !== 'az' && s.era !== era) {
        era = s.era;
        html += `<li class="year-head" aria-hidden="true">${esc(era)}</li>`;
      }
      html += cardHTML(s);
    }
    document.getElementById('catalog').innerHTML = html;
  }

  /* ---- ingredients view ---- */
  let ingSort = 'type';
  let ingQuery = '';
  const BANDS = [
    ['everyday', 'Everyday ingredients',
      'Whole foods and the close-enough staples: fruit, greens, milks, nut butters and the basic sweeteners.'],
    ['functional', 'Functional ingredients',
      'The adaptogens, algae, collagen and supplements, added for a wellness reason rather than for flavor.'],
    ['treats', 'Toppings & treats',
      'The dessert leaning layer: swirls, crumbles, whips and the sweet seasonal extras spooned on top.'],
  ];

  function renderIngredients() {
    const top = ING_LIST.slice(0, 15);
    const max = top[0].count;
    document.getElementById('most-list').innerHTML = top.map((e) => `
      <li><button class="most-row" data-i="${e.def.id}">
        ${iconSVG(e.def.icon, '', 'icon')}
        <span>${esc(e.def.name)}</span>
        <span class="bar-track"><span class="bar" style="width:${Math.round((e.count / max) * 100)}%"></span></span>
        <span class="n">${e.count}</span>
      </button></li>`).join('');

    const q = ingQuery.trim().toLowerCase();
    const matches = (e) => !q
      || e.def.name.toLowerCase().includes(q)
      || [...e.variants].some((v) => v.toLowerCase().includes(q));

    // 'type' groups by what the ingredient is (fruit, vegetable...); the
    // other sorts keep the everyday / functional / treats bands.
    const groups = ingSort === 'type'
      ? Object.keys(CATS).map((cat) => [ING_LIST.filter((e) => e.def.cat === cat && matches(e)), CATS[cat], ''])
      : BANDS.map(([band, title, intro]) => [ING_LIST.filter((e) => e.def.band === band && matches(e)), title, intro]);
    if (groups.every(([items]) => !items.length)) {
      document.getElementById('ing-categories').innerHTML =
        `<p class="ing-empty">No ingredient matches "${esc(ingQuery.trim())}".</p>`;
      return;
    }
    document.getElementById('ing-categories').innerHTML = groups.map(([items, title, intro]) => {
      if (!items.length) return '';
      if (ingSort === 'az') items = [...items].sort((a, b) => a.def.name.localeCompare(b.def.name));
      return `<section class="ing-band">
        <h2>${esc(title)}</h2>
        ${intro ? `<p class="band-intro">${esc(intro)}</p>` : ''}
        <div class="ing-grid">
          ${items.map((e) => `
            <button class="ing-tile" data-i="${e.def.id}">
              ${iconSVG(e.def.icon, '', 'icon')}
              <span class="t-name">${esc(e.def.name)}</span>
              <span class="t-count">${e.count === 1 ? '1 smoothie' : e.count + ' smoothies'}</span>
            </button>`).join('')}
        </div>
      </section>`;
    }).join('');
  }

  document.getElementById('ing-sort').addEventListener('change', (e) => {
    ingSort = e.target.value;
    renderIngredients();
  });

  document.getElementById('ing-search').addEventListener('input', (e) => {
    ingQuery = e.target.value;
    renderIngredients();
  });

  /* ---- modals ---- */
  const sheet = document.getElementById('sheet');
  const sheetInner = document.getElementById('sheet-inner');

  // show the menu wording under the canonical name only when it adds information
  function rawAddsInfo(raw, canonName) {
    const clean = (t) => t.toLowerCase()
      .replace(/organic|grass-fed|raw|fresh|grow|pure|®|™/g, '')
      .replace(/[^a-z]/g, '').replace(/s$/, '');
    return clean(raw) !== clean(canonName);
  }

  function smoothieSheetHTML(s) {
    const pill = PILLS[s.status] || PILLS.unknown;
    const sub = s.collaborator
      ? `${s.collaborator} × Erewhon`
      : (s.collabType === 'house' ? 'Erewhon house recipe' : 'Collaborator unknown');
    const meta = [s.date, TYPE_LABEL[s.collabType]].filter(Boolean).join(', ');
    const rows = s.ingredients.map((raw) => {
      const id = matchCanon(raw);
      const def = id ? BY_ID.get(id) : null;
      const name = def ? def.name : raw;
      const showRaw = def && rawAddsInfo(raw, def.name);
      return `<li><button class="ing-row" data-i="${def ? def.id : ''}">
        ${iconSVG(def ? def.icon : matchIcon(raw), '', 'icon')}
        <span><span class="r-name">${esc(name)}</span>
        ${showRaw ? `<br/><span class="r-raw">${esc(raw)}</span>` : ''}</span>
      </button></li>`;
    }).join('');
    const sources = (s.sources || []).slice(0, 4).map((u) => {
      let d; try { d = new URL(u).hostname.replace(/^www\./, ''); } catch { d = u; }
      return `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(d)}</a>`;
    }).join('');
    return `
      <button class="sheet-close" aria-label="Close">✕</button>
      <div class="sheet-eyebrow">No. ${NO.get(s.id)} of ${DATA.length}</div>
      <div class="sheet-head">
        ${artHTML(s, 'sheet')}
        <div style="flex:1; min-width:0;">
          <h2 class="sheet-title">${esc(s.name)}</h2>
          <p class="sheet-sub">${esc(sub)}</p>
          <p class="sheet-metaline">${esc(meta)}</p>
          <span class="pill ${pill.cls}">${pill.text}</span>
        </div>
      </div>
      ${s.notes ? `<p class="sheet-notes">${esc(s.notes)}</p>` : ''}
      <h3>Ingredients</h3>
      ${s.ingredients.length
        ? `<ul class="ing-rows">${rows}</ul>`
        : '<p class="partial-note">No complete recipe survives in public sources.</p>'}
      ${s.ingredientsComplete === false && s.ingredients.length
        ? '<p class="partial-note">Partial record. The full official list was never published.</p>' : ''}
      ${sources ? `<h3>Sources</h3><div class="sheet-sources">${sources}</div>` : ''}`;
  }

  function ingredientSheetHTML(e) {
    const def = e.def;
    const list = e.smoothieIds
      .map((id) => BY_SID.get(id))
      .sort((a, b) => b.sortKey - a.sortKey);
    const seenVar = new Set();
    const variants = [...e.variants]
      .filter((v) => rawAddsInfo(v, def.name))
      .filter((v) => {
        const k = v.toLowerCase().replace(/[®™]/g, '').trim();
        if (seenVar.has(k)) return false;
        seenVar.add(k);
        return true;
      })
      .slice(0, 3);
    const co = CO.get(def.id) || [];
    const coLink = (cid) => `<button class="prof-colink" data-i="${cid}">${esc(BY_ID.get(cid).name.toLowerCase())}</button>`;
    const coText = co.length === 1
      ? coLink(co[0])
      : co.slice(0, -1).map(coLink).join(', ') + ' and ' + coLink(co[co.length - 1]);
    return `
      <button class="sheet-close" aria-label="Close">✕</button>
      <div class="sheet-eyebrow">${esc(CATS[def.cat])}</div>
      <div class="sheet-head">
        ${iconSVG(def.icon, def.name, 'icon-lg wob')}
        <div style="flex:1; min-width:0;">
          <h2 class="sheet-title">${esc(def.name)}</h2>
          <p class="sheet-notes" style="margin-top:6px">${esc(def.blurb)}</p>
          <p class="prof-stat">In ${e.count} of ${DATA.length} smoothies.</p>
          ${co.length ? `<p class="prof-co">Usually blended with ${coText}.</p>` : ''}
          ${variants.length ? `<p class="prof-variants">On menus as: ${esc(variants.join(', '))}</p>` : ''}
        </div>
      </div>
      <h3>Appears in</h3>
      <ul class="smoothie-rows compact">
        ${list.map((s) => `<li><button class="smoothie-row" data-s="${esc(s.id)}">
          <span class="dot" style="background:${esc(s.color)}"></span>
          <span class="s-name">${esc(s.name)}</span>
          <span class="s-year">${esc(String(s.era).startsWith('Undated') ? 'pre-2022' : s.date)}</span>
        </button></li>`).join('')}
      </ul>`;
  }

  /* ---- routing ---- */
  let view = 'archive';

  function setView(v) {
    view = v;
    document.getElementById('view-archive').hidden = v !== 'archive';
    document.getElementById('view-ingredients').hidden = v !== 'ingredients';
    document.querySelectorAll('[data-nav]').forEach((a) => {
      a.setAttribute('aria-current', a.dataset.nav === v ? 'true' : 'false');
    });
  }

  function openSheet(html) {
    sheetInner.innerHTML = html;
    if (!sheet.open) sheet.showModal();
    sheetInner.scrollTop = 0;
    sheetInner.querySelector('.sheet-close').addEventListener('click', () => closeToView());
  }

  function closeToView() {
    location.hash = view === 'ingredients' ? '#/ingredients' : '#/';
  }

  function route() {
    const h = location.hash;
    let m;
    if ((m = h.match(/^#\/s\/(.+)$/))) {
      const s = BY_SID.get(decodeURIComponent(m[1]));
      if (s) { setView('archive'); openSheet(smoothieSheetHTML(s)); return; }
    }
    if ((m = h.match(/^#\/i\/(.+)$/))) {
      const e = ING.get(decodeURIComponent(m[1]));
      if (e) { openSheet(ingredientSheetHTML(e)); return; }
    }
    if (sheet.open) sheet.close();
    setView(h === '#/ingredients' ? 'ingredients' : 'archive');
    if (h !== '#/ingredients' && h !== '#/' && h !== '') history.replaceState(null, '', '#/');
  }

  window.addEventListener('hashchange', route);

  /* clicks anywhere that target a smoothie or ingredient */
  document.addEventListener('click', (e) => {
    const sBtn = e.target.closest('[data-s]');
    if (sBtn) { location.hash = '#/s/' + sBtn.dataset.s; return; }
    const iBtn = e.target.closest('[data-i]');
    if (iBtn && iBtn.dataset.i) { location.hash = '#/i/' + iBtn.dataset.i; return; }
  });

  /* native dialog close (esc key, backdrop) keeps the hash in sync */
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
  sheet.addEventListener('close', () => {
    if (/^#\/(s|i)\//.test(location.hash)) closeToView();
  });

  /* ---- go ---- */
  renderChips();
  renderCatalog();
  renderIngredients();
  route();
})();
