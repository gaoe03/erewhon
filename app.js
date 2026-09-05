/* ============================================================
   Erewhon Smoothie Archive.
   Two views (smoothies, ingredients), two modals (smoothie
   sheet, ingredient profile), all driven by the URL hash:
     #/             full archive (#/archive is a supported alias)
     #/menu         current menu
     #/ingredients  ingredient stats
     #/s/<id>       smoothie sheet
     #/i/<id>       ingredient profile
   ============================================================ */

(function () {
  const { iconSVG, cupSVG } = window.ArchiveIcons;
  const { CATS, BY_ID, ALIASES, matchCanon, groupIngredients } = window.ArchiveIngredients;
  const DATA = window.SMOOTHIES;
  const MENU = window.MENU;
  const MENU_IDS = new Set(MENU?.smoothieIds || []);
  const menuDate = MENU?.checkedAt && new Date(MENU.checkedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles',
  });
  const GROUPS = new Map(DATA.map((s) => [s.id, groupIngredients(s.ingredients)]));

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
    permanent: { text: 'House staple', cls: 'green' },
    limited: { text: 'Limited run', cls: 'orange' },
    discontinued: { text: 'Archived', cls: 'gray' },
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
  document.getElementById('ing-hero-stats').textContent =
    `Explore what goes into ${DATA.length} smoothies. Each drink counts once per ingredient.`;
  document.getElementById('archive-count').textContent = DATA.length;
  document.getElementById('menu-count').textContent = MENU_IDS.size;
  document.getElementById('ingredient-count').textContent = ING.size;

  /* ---- archive view ---- */
  let filter = 'all';
  let sort = 'newest';
  let query = '';
  let view = 'archive';
  let catalogView = 'archive';
  let routed = false;

  const catalogData = () => catalogView === 'menu' ? DATA.filter((s) => MENU_IDS.has(s.id)) : DATA;
  const dateLabel = (s) => s.dateKind === 'first-seen' ? `First seen ${s.date}` : s.date;

  const FILTERS = [
    ['all', 'All'],
    ['celebrity', 'Celebrity'],
    ['brand', 'Brand'],
    ['house', 'House'],
  ];

  function renderChips() {
    document.getElementById('chips').innerHTML = FILTERS.map(([key, label]) => {
      const data = catalogData();
      const n = key === 'all' ? data.length : data.filter((s) => s.collabType === key).length;
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

  document.getElementById('catalog-search').addEventListener('input', (e) => {
    query = e.target.value;
    renderCatalog();
  });

  function visible() {
    const data = catalogData();
    const q = query.trim().toLocaleLowerCase();
    const list = data.filter((s) => (filter === 'all' || s.collabType === filter)
      && (!q || `${s.name} ${s.collaborator}`.toLocaleLowerCase().includes(q)));
    if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => {
      const d = a.sortKey - b.sortKey;
      return (sort === 'newest' ? -d : d) || a.name.localeCompare(b.name);
    });
    return list;
  }

  /* real menu photo when one survives, the drawn cup otherwise */
  function artHTML(s, cls) {
    if (s.image) return `<span class="${cls}-photo"><img src="${esc(s.image)}" alt="" loading="lazy"/></span>`;
    return cupSVG(s.color, s.colorDark, cls === 'sheet' ? s.name + ' cup' : '', 'cup');
  }

  function cardHTML(s) {
    const pill = MENU_IDS.has(s.id) ? { text: 'On the menu', cls: 'green' } : PILLS[s.status] || PILLS.unknown;
    const collab = s.collaborator || (s.collabType === 'house' ? 'House recipe' : 'Collaborator unknown');
    const count = GROUPS.get(s.id).length;
    const meta = [dateLabel(s), count ? count + ' ingredients' : null]
      .filter(Boolean).join(', ');
    const price = s.price ? s.price.replace(/\.00$/, '') : '';
    return `<li>
      <button class="card" data-s="${esc(s.id)}" aria-haspopup="dialog">
        ${artHTML(s, 'card')}
        <h3 class="card-name">${esc(s.name)}</h3>
        <span class="card-collab">${esc(collab)}</span>
        <span class="card-meta">${esc(catalogView === 'menu' ? `${count} ingredients` : meta)}</span>
        ${catalogView === 'menu' ? `<span class="card-price">${esc(price)}</span>`
          : `<span class="pill ${pill.cls}">${pill.text}</span>`}
      </button>
    </li>`;
  }

  function renderCatalog() {
    const list = visible();
    document.getElementById('catalog-results').textContent = `${list.length} of ${catalogData().length} smoothies`;
    if (!list.length) {
      document.getElementById('catalog').innerHTML = `<li class="catalog-empty">${catalogView === 'menu' && !MENU
        ? 'The current menu has not been checked yet. Browse the archive above.' : 'Nothing matches this filter.'}</li>`;
      return;
    }
    let html = '';
    let era = null;
    for (const s of list) {
      if (catalogView === 'archive' && sort !== 'az' && s.era !== era) {
        era = s.era;
        html += `<li class="year-head"><h2>${esc(era)}</h2></li>`;
      }
      html += cardHTML(s);
    }
    document.getElementById('catalog').innerHTML = html;
  }

  /* ---- ingredients view ---- */
  let ingSort = 'type';
  let ingQuery = '';
  let ingCategory = 'all';
  const categorySelect = document.getElementById('ing-category');
  categorySelect.innerHTML += Object.entries(CATS).map(([id, label]) =>
    `<option value="${id}">${esc(label)}</option>`).join('');
  function renderIngredients() {
    const q = ingQuery.trim().toLowerCase();
    const matches = (e) => !q
      || e.def.name.toLowerCase().includes(q)
      || [...e.variants].some((v) => v.toLowerCase().includes(q));

    const byName = (a, b) => a.def.name.localeCompare(b.def.name);
    const filtered = ING_LIST.filter((e) => matches(e) && (ingCategory === 'all' || e.def.cat === ingCategory));
    const groups = ingSort === 'type'
      ? Object.keys(CATS).map((cat) => [filtered.filter((e) => e.def.cat === cat), CATS[cat]])
      : [[ingSort === 'az' ? [...filtered].sort(byName) : filtered, ingSort === 'az' ? 'All ingredients' : 'Most used']];
    if (groups.every(([items]) => !items.length)) {
      document.getElementById('ing-categories').innerHTML =
        `<p class="ing-empty">No ingredients match these filters. Try another search or category.</p>`;
      return;
    }
    document.getElementById('ing-categories').innerHTML = groups.map(([items, title]) => {
      if (!items.length) return '';
      return `<section class="ing-band">
        <h2>${esc(title)} <span class="category-count">${items.length}</span></h2>
        ${title === CATS.specialty ? '<p class="ing-category-note">Distinct formulas kept under their product names. Everyday ingredients and familiar mixes are grouped by type.</p>' : ''}
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

  categorySelect.addEventListener('change', (e) => {
    ingCategory = e.target.value;
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
    const pill = MENU_IDS.has(s.id) ? { text: 'On the menu', cls: 'green' } : PILLS[s.status] || PILLS.unknown;
    const sub = s.collaborator && s.collaborator.toLowerCase() !== 'erewhon'
      ? `${s.collaborator} × Erewhon`
      : (s.collabType === 'house' ? 'Erewhon house recipe' : 'Collaborator unknown');
    const meta = [dateLabel(s), TYPE_LABEL[s.collabType]].filter(Boolean).join(', ');
    const groups = GROUPS.get(s.id);
    const rows = groups.map(({ id, variants }) => {
      const def = id ? BY_ID.get(id) : null;
      const name = def ? def.name : variants[0];
      const detail = def ? variants.filter((raw) => variants.length > 1 || rawAddsInfo(raw, def.name)) : [];
      const tag = def ? 'button' : 'div';
      return `<li><${tag} class="ing-row"${def ? ` data-i="${def.id}"` : ''}>
        ${iconSVG(def ? def.icon : 'jar', '', 'icon')}
        <span><span class="r-name">${esc(name)}</span>
        ${detail.map((raw) => `<span class="r-raw">${esc(raw)}</span>`).join('')}</span>
      </${tag}></li>`;
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
          <h2 class="sheet-title" id="sheet-title">${esc(s.name)}</h2>
          <p class="sheet-sub">${esc(sub)}</p>
          <p class="sheet-metaline">${esc(meta)}</p>
          <span class="pill ${pill.cls}">${pill.text}</span>
          ${MENU_IDS.has(s.id) ? `<p class="sheet-metaline">Listed on the ${esc(MENU.scope)}. Checked ${esc(menuDate)}.${s.price ? ` Listed price ${esc(s.price)}.` : ''}</p>` : ''}
        </div>
      </div>
      ${s.notes ? `<p class="sheet-notes">${esc(s.notes)}</p>` : ''}
      <h3>Ingredients</h3>
      ${groups.some((g) => g.variants.length > 1) ? '<p class="partial-note">Versions of the same ingredient are grouped together. The listed flavors and brands appear underneath.</p>' : ''}
      ${s.ingredients.length
        ? `<ul class="ing-rows">${rows}</ul>`
        : '<p class="partial-note">An ingredient list has not been verified for this record.</p>'}
      ${s.ingredientsComplete === false && s.ingredients.length
        ? '<p class="partial-note">Partial record. Some listed ingredients may be missing.</p>' : ''}
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
      });
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
          <h2 class="sheet-title" id="sheet-title">${esc(def.name)}</h2>
          <p class="sheet-notes" style="margin-top:6px">${esc(def.blurb)}</p>
          <p class="prof-stat">In ${e.count} of ${DATA.length} smoothies.</p>
          ${co.length ? `<p class="prof-co">Usually blended with ${coText}.</p>` : ''}
          ${variants.length ? `<p class="prof-variants">On menus as: ${esc(variants.slice(0, 3).join(', '))}</p>` : ''}
          ${variants.length > 3 ? `<details class="prof-variants"><summary>More menu names (${variants.length - 3})</summary><ul>${variants.slice(3).map((v) => `<li>${esc(v)}</li>`).join('')}</ul></details>` : ''}
        </div>
      </div>
      <h3>Appears in</h3>
      <ul class="smoothie-rows compact">
        ${list.map((s) => `<li><button class="smoothie-row" data-s="${esc(s.id)}">
          <span class="dot" style="background:${esc(s.color)}"></span>
          <span class="s-name">${esc(s.name)}</span>
          <span class="s-year">${esc(String(s.era).startsWith('Undated') ? 'pre-2022' : dateLabel(s))}</span>
        </button></li>`).join('')}
      </ul>`;
  }

  /* ---- routing ---- */
  function setView(v) {
    view = v;
    document.getElementById('view-archive').hidden = v === 'ingredients';
    document.getElementById('view-ingredients').hidden = v !== 'ingredients';
    if (v !== 'ingredients') {
      catalogView = v;
      document.getElementById('menu-note').textContent = v === 'menu' && MENU
        ? `${MENU.scope}. Checked ${menuDate}. Listed prices and availability may vary by store.` : '';
      renderChips();
      renderCatalog();
    }
    document.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.dataset.nav === v) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function openSheet(html) {
    sheetInner.innerHTML = html;
    if (!sheet.open) sheet.showModal();
    sheetInner.scrollTop = 0;
    sheetInner.querySelector('.sheet-close').addEventListener('click', () => closeToView());
  }

  function closeToView() {
    location.hash = view === 'ingredients' ? '#/ingredients' : catalogView === 'menu' ? '#/menu' : '#/';
  }

  function route() {
    const h = location.hash;
    let m;
    if ((m = h.match(/^#\/s\/(.+)$/))) {
      const s = BY_SID.get(decodeURIComponent(m[1]));
      if (s) {
        if (!routed) setView('archive');
        routed = true;
        openSheet(smoothieSheetHTML(s)); return;
      }
    }
    if ((m = h.match(/^#\/i\/(.+)$/))) {
      const requestedId = decodeURIComponent(m[1]);
      const id = ALIASES[requestedId] || requestedId;
      const e = ING.get(id);
      if (e) {
        if (id !== requestedId) history.replaceState(null, '', '#/i/' + id);
        if (!routed) setView('ingredients');
        routed = true;
        openSheet(ingredientSheetHTML(e)); return;
      }
    }
    if (sheet.open) sheet.close();
    setView(h === '#/ingredients' ? 'ingredients' : h === '#/menu' ? 'menu' : 'archive');
    routed = true;
    if (!['#/ingredients', '#/menu', '#/', ''].includes(h)) history.replaceState(null, '', '#/');
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

/* Fit each sort dropdown to its selected label, so the chevron sits right after the
   text instead of at the far right of the widest option. */
(function () {
  const fit = (sel) => {
    if (!sel || !sel.options.length) return;
    const cs = getComputedStyle(sel);
    const probe = document.createElement('span');
    probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-size:${cs.fontSize};font-family:${cs.fontFamily};font-weight:${cs.fontWeight}`;
    probe.textContent = sel.options[sel.selectedIndex].text;
    document.body.appendChild(probe);
    sel.style.width = (Math.ceil(probe.getBoundingClientRect().width) + 42) + 'px';
    probe.remove();
  };
  ['sort-select', 'ing-sort'].forEach((id) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    fit(sel);
    sel.addEventListener('change', () => fit(sel));
  });
})();
