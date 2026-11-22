/* bashlab v3 – App Store izgled, staklo, animacije, router, i18n, GitHub podaci, QR, ⌘K, PWA */
(() => {
'use strict';
const P = window.PROJECTS;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer:fine)').matches;
const SITE = 'https://basaofficial.github.io/';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------------- jezici ---------------- */
const UI = {
  bs: { search:'traži', projects:'Projekti', about:'O meni', contact:'Kontakt', all:'sve', web:'web', apk:'apk', game:'igre',
    lead:'Pravim aplikacije koje stvarno koristim — za telefon, za igru i za posao.', nproj:'aplikacija', napk:'APK-a', updated:'ažurirano',
    featured:'Istaknuto', newL:'Novo',
    apps:'Aplikacije', appsSub:'Alati za posao, zdravlje i komunikaciju.', games:'Igre', gamesSub:'Za ekipu, za raid i za zabavu.', soonH:'Uskoro', soonSub:'U izradi u labu.',
    open:'Otvori', play:'Igraj', get:'Preuzmi', details:'Detalji', code:'Kod', soon:'uskoro', live:'live', back:'Sve aplikacije', apkSoon:'APK uskoro', tellMe:'Javi mi',
    desc:'Opis', more:'više', features:'Šta zna', install:'Instaliraj', qrT:'Skeniraj telefonom', qrApk:'Sa PC-a na telefon: skeniraj i APK se odmah skida.', qrWeb:'Sa PC-a na telefon: skeniraj i otvori.',
    news:'Šta je novo', newsNone:'Changelog trenutno nije dostupan.', size:'Veličina', version:'Verzija', platform:'Radi na',
    infoH:'Informacije', dev:'Developer', cat:'Kategorija', compat:'Kompatibilnost', price:'Cijena', free:'Besplatno', source:'Izvorni kod', shots:'Pregled',
    cats:{ games:'Igre', health:'Zdravlje i fitness', social:'Komunikacija', prod:'Produktivnost', tools:'Alati' },
    fH:'Prijedlozi i greške', fP:'Imaš ideju šta da dodam, našao si grešku ili imaš pitanje o nekoj od mojih aplikacija? Napiši mi.',
    fName:'Ime', fContact:'Mail ili Instagram', fContactPh:'tvoj@mail.com ili @instagram', fType:'O čemu se radi?',
    fTypes:['Prijedlog','Greška','Pitanje','Nešto drugo'], fAbout:'Odnosi se na', fNew:'Nova ideja',
    fMsg:'Poruka', fMsgPh:'Npr. u aplikaciji … bi bilo super da … / Greška se desi kad …', fSend:'Pošalji', fSending:'Šaljem…',
    fOk:'✓ Poslano! Hvala.', fErr:'Nije uspjelo slanje. Pošalji mi direktno na mail:', fReq:'Upiši kontakt i poruku.', fAsk:'Prijedlog / greška',
    contactH:'Javi <span>se</span>', contactP:'Prijedlog, greška ili pitanje o nekoj aplikaciji? Piši mi na Instagram ili mail.',
    mailCopied:'✓ Mail kopiran: ', palhint:'↑↓ biraj · Enter otvori · Esc zatvori', palPh:'upiši projekat ili komandu…',
    cLang:'Jezik', cTop:'Na početak', cInst:'Instaliraj bashlab kao aplikaciju', cMail:'Kopiraj mail', cCoffee:'Buy me a coffee',
    installApp:'⤓ Instaliraj bashlab', installed:'✓ bashlab je instaliran', offline:'Offline si — prikazujem sačuvanu verziju.',
    activeP:'aktivnih projekata', firstLine:'prva linija koda', coffee:'kafa', inLab:'u labu', unknown:'nije poznato',
    typed:['whoami → anel aka basa','ls ./projekti → armory  igre  metar  zvucnik  electro  bashtalk  fit','./build --apk --web','echo "dobrodošli u bashlab"'] },
  de: { search:'suchen', projects:'Projekte', about:'Über mich', contact:'Kontakt', all:'alle', web:'web', apk:'apk', game:'spiele',
    lead:'Ich baue Apps, die ich selbst benutze — fürs Handy, fürs Gaming und für die Arbeit.', nproj:'Apps', napk:'APKs', updated:'aktualisiert',
    featured:'Empfohlen', newL:'Neu',
    apps:'Apps', appsSub:'Tools für Arbeit, Gesundheit und Kommunikation.', games:'Spiele', gamesSub:'Für Freunde, für den Raid und zum Spaß.', soonH:'Demnächst', soonSub:'Gerade im Lab in Arbeit.',
    open:'Öffnen', play:'Spielen', get:'Laden', details:'Details', code:'Code', soon:'bald', live:'live', back:'Alle Apps', apkSoon:'APK bald', tellMe:'Bescheid geben',
    desc:'Beschreibung', more:'mehr', features:'Funktionen', install:'Installieren', qrT:'Mit dem Handy scannen', qrApk:'Vom PC aufs Handy: scannen und die APK lädt sofort.', qrWeb:'Vom PC aufs Handy: scannen und öffnen.',
    news:'Neuigkeiten', newsNone:'Changelog gerade nicht verfügbar.', size:'Größe', version:'Version', platform:'Läuft auf',
    infoH:'Informationen', dev:'Entwickler', cat:'Kategorie', compat:'Kompatibilität', price:'Preis', free:'Gratis', source:'Quellcode', shots:'Vorschau',
    cats:{ games:'Spiele', health:'Gesundheit & Fitness', social:'Kommunikation', prod:'Produktivität', tools:'Dienstprogramme' },
    fH:'Vorschläge und Fehler', fP:'Du hast eine Idee, was ich hinzufügen soll, einen Fehler gefunden oder eine Frage zu einer meiner Apps? Schreib mir.',
    fName:'Name', fContact:'Mail oder Instagram', fContactPh:'deine@mail.de oder @instagram', fType:'Worum geht es?',
    fTypes:['Vorschlag','Fehler','Frage','Etwas anderes'], fAbout:'Bezieht sich auf', fNew:'Neue Idee',
    fMsg:'Nachricht', fMsgPh:'Z. B. in der App … wäre es super, wenn … / Der Fehler passiert, wenn …', fSend:'Senden', fSending:'Sende…',
    fOk:'✓ Gesendet! Danke.', fErr:'Senden fehlgeschlagen. Schreib mir direkt per Mail:', fReq:'Bitte Kontakt und Nachricht angeben.', fAsk:'Vorschlag / Fehler',
    contactH:'Schreib <span>mir</span>', contactP:'Vorschlag, Fehler oder Frage zu einer App? Schreib mir auf Instagram oder per Mail.',
    mailCopied:'✓ Mail kopiert: ', palhint:'↑↓ wählen · Enter öffnen · Esc schließen', palPh:'Projekt oder Befehl eingeben…',
    cLang:'Sprache', cTop:'Nach oben', cInst:'bashlab als App installieren', cMail:'Mail kopieren', cCoffee:'Buy me a coffee',
    installApp:'⤓ bashlab installieren', installed:'✓ bashlab ist installiert', offline:'Du bist offline — zeige gespeicherte Version.',
    activeP:'aktive Projekte', firstLine:'erste Codezeile', coffee:'Kaffee', inLab:'im Lab', unknown:'unbekannt',
    typed:['whoami → anel aka basa','ls ./projekte → armory  igre  metar  zvucnik  electro  bashtalk  fit','./build --apk --web','echo "willkommen im bashlab"'] },
  en: { search:'search', projects:'Projects', about:'About', contact:'Contact', all:'all', web:'web', apk:'apk', game:'games',
    lead:'I build apps I actually use — for my phone, for gaming and for work.', nproj:'apps', napk:'APKs', updated:'updated',
    featured:'Featured', newL:'New',
    apps:'Apps', appsSub:'Tools for work, health and staying in touch.', games:'Games', gamesSub:'For friends, for the raid and for fun.', soonH:'Coming soon', soonSub:'Being built in the lab.',
    open:'Open', play:'Play', get:'Get', details:'Details', code:'Code', soon:'soon', live:'live', back:'All apps', apkSoon:'APK soon', tellMe:'Tell me',
    desc:'Description', more:'more', features:'What it does', install:'Install', qrT:'Scan with your phone', qrApk:'From PC to phone: scan and the APK downloads right away.', qrWeb:'From PC to phone: scan and open.',
    news:"What's new", newsNone:'Changelog not available right now.', size:'Size', version:'Version', platform:'Runs on',
    infoH:'Information', dev:'Developer', cat:'Category', compat:'Compatibility', price:'Price', free:'Free', source:'Source code', shots:'Preview',
    cats:{ games:'Games', health:'Health & Fitness', social:'Communication', prod:'Productivity', tools:'Utilities' },
    fH:'Suggestions and bugs', fP:'Got an idea for something I should add, found a bug or have a question about one of my apps? Let me know.',
    fName:'Name', fContact:'Email or Instagram', fContactPh:'you@mail.com or @instagram', fType:'What is it about?',
    fTypes:['Suggestion','Bug','Question','Something else'], fAbout:'About', fNew:'New idea',
    fMsg:'Message', fMsgPh:'E.g. in the app … it would be great if … / The bug happens when …', fSend:'Send', fSending:'Sending…',
    fOk:'✓ Sent! Thanks.', fErr:'Sending failed. Email me directly:', fReq:'Please add your contact and a message.', fAsk:'Suggestion / bug',
    contactH:'Get in <span>touch</span>', contactP:'Suggestion, bug or question about an app? Message me on Instagram or by mail.',
    mailCopied:'✓ Mail copied: ', palhint:'↑↓ choose · Enter open · Esc close', palPh:'type a project or command…',
    cLang:'Language', cTop:'Back to top', cInst:'Install bashlab as an app', cMail:'Copy mail', cCoffee:'Buy me a coffee',
    installApp:'⤓ Install bashlab', installed:'✓ bashlab is installed', offline:"You're offline — showing the saved version.",
    activeP:'active projects', firstLine:'first line of code', coffee:'coffee', inLab:'in the lab', unknown:'unknown',
    typed:['whoami → anel aka basa','ls ./projects → armory  igre  metar  zvucnik  electro  bashtalk  fit','./build --apk --web','echo "welcome to bashlab"'] }
};
const qLang = new URLSearchParams(location.search).get('lang');
let L = (qLang && UI[qLang] && qLang) || localStorage.getItem('bl_lang') || ((navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'bs');
if (!UI[L]) L = 'bs';
const t = k => (UI[L] && UI[L][k]) ?? UI.bs[k] ?? k;
const pt = p => p.t[L] || p.t.bs;
const catName = p => t('cats')[p.cat] || '';
function setLang(l){
  L = l; try { localStorage.setItem('bl_lang', l); } catch(e){}
  document.documentElement.lang = l;
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.l === l));
  $$('[data-i]').forEach(n => n.textContent = t(n.dataset.i));
  $('#palq').placeholder = t('palPh');
  render(false);
}

/* ---------------- ikone ---------------- */
const IC = {
  shield:'<path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z"/><path d="M9.5 15l2.5-7 2.5 7M10.4 12.6h3.2"/>',
  dice:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor"/>',
  apple:'<path d="M12 7c-2-3-7-2-7 3 0 6 4 11 7 11s7-5 7-11c0-5-5-6-7-3z"/><path d="M12 7c0-2 1-4 3-4"/>',
  radio:'<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M12 6v3M10 13h4M10 16h4"/><path d="M3 9a6 6 0 0 0 0 6M21 9a6 6 0 0 1 0 6"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  hand:'<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  ruler:'<path d="M3 16.5L16.5 3 21 7.5 7.5 21z"/><path d="M7 12.5l2 2M9.8 9.7l1.4 1.4M12.5 7l2 2M15.3 4.2l1.4 1.4"/>',
  speaker:'<path d="M4 9h3l5-4v14l-5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18.5 6a8 8 0 0 1 0 12"/>'
};
const svg = (k, sw = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${IC[k] || ''}</svg>`;
const appIc = (p, cls = '') => `<div class="appic ${cls}" style="--c1:${p.c[0]};--c2:${p.c[1]}">${svg(p.icon, 1.9)}</div>`;
const I_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
const I_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const I_ARR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>';
const I_IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>';
const I_GH = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>';
const I_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 7l9 6 9-6"/></svg>';

/* ---------------- GitHub (verzije, changelog, "ažurirano") ---------------- */
const TTL = 30 * 60 * 1000, mem = {};
async function gh(path){
  const k = 'bl_gh:' + path;
  if (mem[k]) return mem[k];
  try { const c = JSON.parse(localStorage.getItem(k) || 'null'); if (c && Date.now() - c.t < TTL) return (mem[k] = c.d); } catch(e){}
  mem[k] = (async () => {
    try {
      const r = await fetch('https://api.github.com/' + path, { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      try { localStorage.setItem(k, JSON.stringify({ t: Date.now(), d })); } catch(e){}
      return d;
    } catch(e) {   // offline / limit: stari keš je bolji nego ništa
      try { const c = JSON.parse(localStorage.getItem(k) || 'null'); if (c) return c.d; } catch(_){}
      return null;
    }
  })();
  return mem[k];
}
async function info(p){
  if (!p.gh) return null;
  const { repo, path, release } = p.gh;
  const [commits, rels] = await Promise.all([
    gh(`repos/${repo}/commits?per_page=6${path ? '&path=' + encodeURIComponent(path) : ''}`),
    release ? gh(`repos/${repo}/releases?per_page=1`) : null
  ]);
  const out = { log: [], updated: null, version: null, size: null };
  if (Array.isArray(commits)) {
    out.log = commits.map(c => ({ m: (c.commit.message || '').split('\n')[0], d: c.commit.author && c.commit.author.date, sha: c.sha.slice(0, 7) }))
      .filter(c => !/^merge /i.test(c.m));
    out.updated = out.log[0] && out.log[0].d;
  }
  if (Array.isArray(rels) && rels[0]) {
    const r = rels[0], a = (r.assets || []).find(x => /\.apk$/i.test(x.name));
    out.version = r.name && /\d/.test(r.name) ? r.name : r.tag_name;
    if (a) { out.size = a.size; out.apkUrl = a.browser_download_url; }
    if (!out.updated || new Date(r.published_at) > new Date(out.updated)) out.updated = r.published_at;
  }
  // verzija iz poruke commita (npr. "v1.5.4: …") je ljudskija od build broja
  const vm = out.log.map(c => (c.m.match(/^v?(\d+\.\d+(?:\.\d+)?)\b/) || [])[1]).find(Boolean);
  if (vm) out.version = 'v' + vm;
  return out;
}
function ago(iso){
  if (!iso) return t('unknown');
  const s = (new Date(iso) - Date.now()) / 1000, rtf = new Intl.RelativeTimeFormat(L === 'bs' ? 'hr' : L, { numeric: 'auto' });
  const U = [['year', 31536e3], ['month', 2592e3], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [u, n] of U) if (Math.abs(s) >= n || u === 'minute') return rtf.format(Math.round(s / n), u);
}
const mb = b => b ? (b / 1048576 >= 1 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB') : '';
const abs = u => /^https?:/.test(u) ? u : SITE + u.replace(/^\.?\//, '');
const isFile = u => /\.apk$/i.test(u);

/* ---------------- statistika (GoatCounter, bez kolačića) ---------------- */
function count(path, title, event){
  try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path, title: title || path, event: !!event }); } catch(e){}
}

/* ---------------- render: početna ---------------- */
function webLabel(p){ return p.id === 'igre' ? t('play') : t('open'); }
function mainAct(p){
  if (p.status === 'soon' && !p.web && !p.apk) return `<span class="btn sm dis">${t('soon')}</span>`;
  if (p.web) return `<a class="btn sm pri" href="${esc(p.web)}" ${/^https?:/.test(p.web) ? 'target="_blank" rel="noopener"' : ''}>${webLabel(p)}</a>`;
  return `<a class="btn sm pri" href="${esc(p.apk)}" ${isFile(p.apk) ? 'download type="application/vnd.android.package-archive"' : 'target="_blank" rel="noopener"'} data-apk="${p.id}">${t('get')}</a>`;
}
function actions(p, small){
  const a = [];
  if (p.apk) a.push(`<a class="btn pri" href="${esc(p.apk)}" ${isFile(p.apk) ? `download type="application/vnd.android.package-archive"` : 'target="_blank" rel="noopener"'} data-apk="${p.id}">${I_DL}${t('get')} APK</a>`);
  if (p.web) a.push(`<a class="btn ${p.apk ? '' : 'pri'}" href="${esc(p.web)}" ${/^https?:/.test(p.web) ? 'target="_blank" rel="noopener"' : ''}>${p.apk ? I_ARR : I_PLAY}${webLabel(p)}${p.apk && p.id === 'armory' ? ' (demo)' : ''}</a>`);
  if (!p.apk && !p.web) a.push(`<span class="btn dis">${t('apkSoon')}</span>`, `<a class="btn" href="#/kontakt">${t('tellMe')}</a>`);
  if (small) a.push(`<a class="btn" href="#/p/${p.id}">${t('details')}</a>`);
  else {
    if (p.alt) a.push(`<a class="btn" href="${esc(p.alt.href)}">${esc(p.alt.label[L] || p.alt.label.bs)}</a>`);
    if (p.code) a.push(`<a class="btn" href="${esc(p.code)}" target="_blank" rel="noopener">${I_GH}${t('code')}</a>`);
    a.push(`<button class="btn" type="button" data-ask="${esc(p.name)}">${I_MAIL}${t('fAsk')}</button>`);
  }
  return a.join('');
}
function tileHtml(p, i){
  const x = pt(p), soon = p.status === 'soon';
  return `<article class="tile rv" data-id="${p.id}" tabindex="0" role="link" aria-label="${esc(p.name)}" style="--i:${i};--c1:${p.c[0]};--c2:${p.c[1]}">
    <div class="tile-top">${appIc(p)}${soon ? `<span class="badge soon">beta</span>` : p.isNew ? `<span class="badge new">${t('newL')}</span>` : ''}</div>
    <h3 style="view-transition-name:title-${p.id}">${esc(p.name)}</h3>
    <div class="tsub">${esc(x.sub)}</div>
    <p>${esc(x.short)}</p>
    <div class="tile-bot"><span class="tcat">${esc(catName(p))}</span>${mainAct(p)}</div>
  </article>`;
}
function groupHtml(key, list, sub){
  if (!list.length) return '';
  return `<div class="grp">
    <div class="gh rv"><div><h3>${t(key)}</h3><p>${esc(sub)}</p></div><span class="cnt">${list.length}</span></div>
    <div class="tiles">${list.map(tileHtml).join('')}</div></div>`;
}
function homeHtml(){
  const f = P.find(p => p.featured), fx = pt(f);
  const napk = P.filter(p => p.apk).length, live = P.filter(p => p.status === 'live');
  const mq = P.map(p => `<a class="mq-i" href="#/p/${p.id}">${appIc(p, 'sm')}<span>${esc(p.name)}</span></a>`).join('');
  return `
  <div class="hero">
    <div class="tag">BASHLAB · ONLINE</div>
    <div class="hand-wrap">
      <h1 class="hand${firstPaint ? ' reveal-hand' : ''}">basaofficial <span class="dev">dev</span></h1>
      <svg viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true"><path d="M5 16 C 120 4, 260 22, 380 10 S 560 6, 595 14" style="${firstPaint ? '' : 'animation:none;stroke-dashoffset:0'}"/></svg>
    </div>
    <p class="lead hl">${esc(t('lead'))}</p>
    <div class="live hl"><span><b>${live.length}</b> ${t('nproj')}</span><span class="sep">·</span><span><b>${napk}</b> ${t('napk')}</span><span class="sep">·</span><span>${t('updated')} <b id="lastUpd">…</b></span></div>
    <div class="term hl" aria-live="polite"><span class="p">root@bashlab:~$</span> <span id="typed"></span><span class="c"></span></div>
    <div class="cta hl">
      <a class="btn pri" href="#projekti" data-scroll="projekti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l6-6-6-6M12 19h8"/></svg>./${t('projects').toLowerCase()}</a>
      <a class="btn" href="https://instagram.com/basa.gtm" target="_blank" rel="noopener">${I_IG}@basa.gtm</a>
    </div>
    <div class="mq hl" aria-hidden="true"><div class="mq-t">${mq}${mq}</div></div>
  </div>

  <section id="projekti">
    <div class="sh rv"><span class="n">01.</span><h2>${t('projects')}</h2><span class="ln"></span></div>
    <article class="feat rv" data-id="${f.id}" tabindex="0" role="link" aria-label="${esc(f.name)}" style="--c1:${f.c[0]};--c2:${f.c[1]}">
      <div class="feat-txt">
        <span class="eyebrow">${t('featured')} · <span data-ver="${f.id}">live</span></span>
        <h3 style="view-transition-name:title-${f.id}">${esc(f.name)}</h3>
        <div class="fsub">${esc(fx.sub)}</div>
        <p>${esc(fx.long)}</p>
        <div class="feat-app">${appIc(f)}<div><b>${esc(f.name)}</b><small>${esc(catName(f))} · ${esc(f.platform)}</small></div></div>
        <div class="cta">${actions(f, true)}</div>
      </div>
      <div class="feat-shots">${f.shots.slice(0, 2).map((s, i) => `<img src="assets/shots/${s}.webp" alt="${esc(f.name)}" width="600" height="1298" ${i === 0 ? `style="view-transition-name:shot-${f.id}" fetchpriority="high"` : 'loading="lazy"'}>`).join('')}</div>
    </article>
    ${groupHtml('games', live.filter(p => p.group === 'games'), t('gamesSub'))}
    ${groupHtml('apps', live.filter(p => p.group === 'apps'), t('appsSub'))}
    ${groupHtml('soonH', P.filter(p => p.status === 'soon'), t('soonSub'))}
  </section>

  <section id="o-meni">
    <div class="sh rv"><span class="n">02.</span><h2>${t('about')}</h2><span class="ln"></span></div>
    <div class="about">
      <div class="panel rv"><div class="bar"><i></i><i></i><i></i><span>whoami.sh</span></div>
<pre><span class="m"># bashlab — ${L === 'bs' ? 'bivši' : L === 'de' ? 'ehemals' : 'formerly'} DiqLAB</span>
<span class="k">name</span>  = <span class="s">"Anel"</span>
<span class="k">alias</span> = [<span class="s">"Basa"</span>, <span class="s">"basaofficial"</span>]
<span class="k">base</span>  = <span class="s">"${L === 'en' ? 'Germany' : L === 'de' ? 'Deutschland' : 'Njemačka'} 🇩🇪"</span>

<span class="m"># ${L === 'en' ? 'story' : L === 'de' ? 'Geschichte' : 'priča'}</span>
${L === 'de' ? 'Alles begann 2016 mit WoW auf dem Warmane-Server. Die Truppe brauchte eine Addon-Datenbank, also habe ich eine gebaut. Heute baue ich Web-Apps, Spiele und Android-Tools.'
 : L === 'en' ? 'It all started in 2016 with WoW on the Warmane server. The crew needed an addon database, so I built one. Today I build web apps, games and Android tools.'
 : 'Sve je počelo 2016. s WoW-om na Warmane serveru. Ekipi je trebala baza za addone, pa sam je napravio. Danas pravim web aplikacije, igre i Android alate.'}

<span class="k">stack</span> = [<span class="s">"HTML/CSS/JS"</span>, <span class="s">"Android"</span>, <span class="s">"Firebase"</span>, <span class="s">"3D/WebGL"</span>]</pre></div>
      <div class="panel rv"><div class="bar"><i></i><i></i><i></i><span>stats</span></div>
        <div class="stats">
          <div class="stat"><b data-c="${live.length}">0</b><span>${t('activeP')}</span></div>
          <div class="stat"><b data-c="2016">0</b><span>${t('firstLine')}</span></div>
          <div class="stat"><b>∞</b><span>${t('coffee')}</span></div>
          <div class="stat"><b>24/7</b><span>${t('inLab')}</span></div>
        </div></div>
    </div>
  </section>
  ${contactHtml()}`;
}
function contactHtml(){
  return `<section id="kontakt"><div class="contact rv">
    <div class="hand">${t('contactH')}</div>
    <p>${esc(t('contactP'))}</p>
    <div class="cta" style="margin-top:0">
      <a class="btn pri" href="https://instagram.com/basa.gtm" target="_blank" rel="noopener">${I_IG}Instagram · @basa.gtm</a>
      <button class="btn" data-mail type="button">${I_MAIL}basagtm@gmail.com</button>
      <a class="btn" href="https://github.com/Basaofficial" target="_blank" rel="noopener">${I_GH}GitHub</a>
    </div>
    <form class="req" id="req" novalidate>
      <div class="req-h">${esc(t('fH'))}</div>
      <p class="req-p">${esc(t('fP'))}</p>
      <div class="req-row">
        <label><span>${esc(t('fName'))}</span><input name="ime" autocomplete="name" maxlength="80"></label>
        <label><span>${esc(t('fContact'))} *</span><input name="kontakt" required maxlength="120" placeholder="${esc(t('fContactPh'))}"></label>
      </div>
      <div class="req-l">${esc(t('fType'))}</div>
      <div class="req-chips">${t('fTypes').map((x, i) => `<label class="chip"><input type="radio" name="vrsta" value="${esc(x)}" ${i === 0 ? 'checked' : ''}><span>${esc(x)}</span></label>`).join('')}</div>
      <label><span>${esc(t('fAbout'))}</span><select name="app"><option value="">${esc(t('fNew'))}</option>${P.map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('')}</select></label>
      <label><span>${esc(t('fMsg'))} *</span><textarea name="poruka" required rows="5" maxlength="3000" placeholder="${esc(t('fMsgPh'))}"></textarea></label>
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn pri req-send" type="submit">${I_MAIL}<span>${esc(t('fSend'))}</span></button>
      <div class="req-st" role="status" aria-live="polite"></div>
    </form></div></section>`;
}
async function sendReq(e){
  e.preventDefault();
  const f = e.currentTarget, st = f.querySelector('.req-st'), btn = f.querySelector('.req-send');
  const d = Object.fromEntries(new FormData(f));
  if (d._honey) return;
  if (!d.kontakt.trim() || !d.poruka.trim()) { st.className = 'req-st err'; st.textContent = t('fReq'); return; }
  btn.disabled = true; btn.querySelector('span').textContent = t('fSending'); st.className = 'req-st'; st.textContent = '';
  const body = { 'Ime': d.ime || '-', 'Kontakt': d.kontakt, 'Vrsta': d.vrsta, 'Aplikacija': d.app || 'Nova ideja', 'Poruka': d.poruka, 'Jezik': L,
    _subject: `bashlab upit: ${d.vrsta}${d.app ? ' – ' + d.app : ''}`, _template: 'table', _captcha: 'false' };
  if (/^\S+@\S+\.\S+$/.test(d.kontakt.trim())) body._replyto = d.kontakt.trim();
  try {
    const r = await fetch('https://formsubmit.co/ajax/basagtm@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || r.status);
    f.reset(); st.className = 'req-st ok'; st.textContent = t('fOk'); count('upit', 'Upit poslan', true);
  } catch (err) {
    st.className = 'req-st err';
    st.innerHTML = `${esc(t('fErr'))} <a href="mailto:basagtm@gmail.com?subject=${encodeURIComponent('bashlab upit')}&body=${encodeURIComponent(d.poruka)}">basagtm@gmail.com</a>`;
  } finally { btn.disabled = false; btn.querySelector('span').textContent = t('fSend'); }
}
function askFor(name){
  const f = $('#req'); if (!f) return;
  const sel = f.querySelector('select[name=app]'); if (sel) sel.value = name;
  f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => f.querySelector('textarea').focus({ preventScroll: true }), 600);
}

/* ---------------- render: stranica projekta (App Store) ---------------- */
function projectHtml(p){
  const x = pt(p), target = p.apk || p.web;
  const gal = p.shots.length ? `<div class="gal" role="list">${p.shots.map((s, i) =>
      `<button type="button" role="listitem" data-lb="${i}" aria-label="${esc(p.name)} ${i + 1}"><img src="assets/shots/${s}.webp" alt="${esc(p.name)} ${i + 1}" ${i === 0 ? `style="view-transition-name:shot-${p.id}" fetchpriority="high"` : 'loading="lazy"'} width="600" height="1298" decoding="async"></button>`).join('')}</div>`
    : `<div class="gal"><div class="ghost" style="--c1:${p.c[0]};--c2:${p.c[1]};view-transition-name:shot-${p.id}">${svg(p.icon, 1.2)}</div></div>`;
  const cell = (lbl, val, sub, attr = '') => `<div class="cell"><small>${lbl}</small><b ${attr}>${val}</b><span>${sub}</span></div>`;
  const row = (lbl, val, attr = '') => `<div class="irow"><dt>${lbl}</dt><dd ${attr}>${val}</dd></div>`;
  return `<section class="pp">
    <a class="back" href="#/">← ${t('back')}</a>
    <div class="apphead">${appIc(p, 'xl')}
      <div class="ah"><h1 style="view-transition-name:title-${p.id}">${esc(p.name)}</h1>
        <div class="asub">${esc(x.sub)}</div>
        <div class="adev">basaofficial dev</div>
        <div class="acts2">${actions(p, false)}</div></div></div>
    <div class="istrip">
      ${cell(t('cat'), `<span class="mini">${svg(p.icon, 2)}</span>`, esc(catName(p)))}
      ${p.gh ? cell(t('version'), '…', p.status === 'soon' ? 'beta' : 'live', `data-ver="${p.id}"`) : cell(t('version'), '—', t('soon'))}
      ${p.gh && p.gh.release ? cell(t('size'), '…', 'APK', `data-size="${p.id}"`) : ''}
      ${cell(t('platform'), esc(p.platform.split(' · ')[0]), (esc(p.platform.split(' · ').slice(1).join(' · ')) || '&nbsp;'))}
      ${cell(t('price'), t('free'), p.code ? 'open source' : 'bashlab')}
      ${p.gh ? cell(t('updated'), '…', 'GitHub', `data-upd2="${p.id}"`) : ''}
    </div>
    <h2 class="h2 rv">${t('shots')}</h2>
    ${gal}
    <div class="pgrid">
      <div class="col">
        <div class="box rv"><h2>${t('desc')}</h2><p>${esc(x.long)}</p>${x.more ? `<p>${esc(x.more)}</p>` : ''}</div>
        <div class="box rv"><h2>${t('features')}</h2><ul class="feats">${x.feats.map((f, i) => `<li style="--i:${i}">${esc(f)}</li>`).join('')}</ul></div>
        ${p.gh ? `<div class="box rv"><h2>${t('news')}</h2><ul class="log" id="log">${'<li><span class="skel" style="width:46px"></span><span class="skel"></span></li>'.repeat(3)}</ul></div>` : ''}
      </div>
      <div class="col">
        ${target ? `<div class="box qr rv"><div class="code" id="qr" aria-label="QR"></div><p><b>${t('qrT')}</b>${p.apk ? t('qrApk') : t('qrWeb')}</p></div>` : ''}
        <div class="box rv"><h2>${t('infoH')}</h2><dl class="info">
          ${row(t('dev'), 'basaofficial dev')}
          ${row(t('cat'), esc(catName(p)))}
          ${row(t('compat'), esc(p.platform))}
          ${p.gh ? row(t('version'), '…', `data-ver="${p.id}"`) : ''}
          ${p.gh && p.gh.release ? row(t('size'), '…', `data-size="${p.id}"`) : ''}
          ${row(t('price'), t('free'))}
          ${p.code ? row(t('source'), `<a href="${esc(p.code)}" target="_blank" rel="noopener">GitHub ↗</a>`) : ''}
        </dl></div>
      </div>
    </div>
  </section>
  ${contactHtml()}`;
}

/* ---------------- router + View Transitions ---------------- */
let firstPaint = true, lastHomeScroll = 0;
const route = () => { const m = location.hash.match(/^#\/p\/([\w-]+)/); return m ? { v: 'p', id: m[1] } : { v: 'home', anchor: (location.hash.match(/^#\/?(projekti|o-meni|kontakt)$/) || [])[1] }; };
function render(animate = true){
  const r = route();
  const go = () => {
    const app = $('#app');
    if (r.v === 'p') {
      const p = P.find(x => x.id === r.id);
      if (!p) { location.hash = '#/'; return; }
      app.innerHTML = projectHtml(p);
      document.title = `${p.name} — bashlab · basaofficial`;
      setMeta(pt(p).short);
      scrollTo(0, 0);
      fillProject(p);
      count('/p/' + p.id, p.name);
    } else {
      app.innerHTML = homeHtml();
      document.title = 'basaofficial · bashlab — web aplikacije, igre i Android APK';
      setMeta(t('lead'));
      fillHome();
      if (r.anchor) setTimeout(() => { const n = document.getElementById(r.anchor); n && n.scrollIntoView(); }, 0);
      else if (!firstPaint) scrollTo(0, lastHomeScroll);
      count('/', 'bashlab');
    }
    bind();
    firstPaint = false;
  };
  if (animate && document.startViewTransition && !reduce) document.startViewTransition(go);
  else go();
}
function setMeta(d){ const m = document.querySelector('meta[name=description]'); if (m) m.content = d; }
addEventListener('hashchange', () => {
  if (/^#(projekti|o-meni|kontakt)$/.test(location.hash)) return; // obična sidra
  render(true);
});
function openProject(id){ lastHomeScroll = scrollY; location.hash = '#/p/' + id; }

/* ---------------- punjenje podacima ---------------- */
async function fillHome(){
  P.forEach(async p => {
    const d = await info(p);
    $$(`[data-ver="${p.id}"]`).forEach(v => { if (d && d.version) v.textContent = d.version; });
  });
  const all = (await Promise.all(P.map(info))).filter(Boolean).map(d => d.updated).filter(Boolean).sort().reverse();
  const n = $('#lastUpd'); if (n) { if (all[0]) n.textContent = ago(all[0]); else { n.parentElement.previousElementSibling.remove(); n.parentElement.remove(); } }
  typeStart();
}
async function fillProject(p){
  const target = p.apk || p.web;
  if (target) qr(abs(target));
  if (!p.gh) return;
  const d = await info(p);
  if (route().id !== p.id) return;
  const put = (attr, v) => $$(`[${attr}="${p.id}"]`).forEach(n => { if (v) n.textContent = v; else (n.closest('.cell,.irow') || n).remove(); });
  put('data-ver', d && d.version);
  put('data-upd2', d && d.updated && ago(d.updated));
  put('data-size', d && d.size && mb(d.size));
  const log = $('#log');
  if (log) log.innerHTML = d && d.log.length ? d.log.slice(0, 5).map(c => {
      const vm = c.m.match(/^(v?\d+\.\d+(?:\.\d+)?)[:\s–-]+(.*)$/);
      return `<li><span class="v">${esc(vm ? (vm[1][0] === 'v' ? vm[1] : 'v' + vm[1]) : c.sha)}</span><span class="m">${esc(vm ? vm[2] : c.m)}</span><span class="d">${esc(ago(c.d))}</span></li>`;
    }).join('') : `<li><span></span><span class="m" style="color:var(--t2)">${t('newsNone')}</span></li>`;
}

/* ---------------- QR kod (učita se tek kad treba) ---------------- */
let qrLib;
function qr(url){
  qrLib = qrLib || new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  qrLib.then(() => {
    const box = $('#qr'); if (!box) return;
    const q = window.qrcode(0, 'M'); q.addData(url); q.make();
    box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    box.title = url;
  }).catch(() => { const b = $('#qr'); if (b) b.closest('.box').remove(); });
}

/* ---------------- događaji + animacije ---------------- */
let revIO;
function bind(){
  $$('[data-id]').forEach(c => {
    c.addEventListener('click', e => { if (e.target.closest('a,button')) return; openProject(c.dataset.id); });
    c.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target === c) openProject(c.dataset.id); });
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (!reduce && e.pointerType === 'mouse' && c.classList.contains('tile')) c.style.transform = `perspective(800px) rotateX(${(.5 - y / r.height) * 8}deg) rotateY(${(x / r.width - .5) * 8}deg) translateY(-4px)`; });
    c.addEventListener('pointerleave', () => c.style.transform = '');
  });
  $$('a[href^="#/p/"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openProject(a.getAttribute('href').split('/').pop()); }));
  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); document.getElementById(a.dataset.scroll).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }));
  $$('a[href="#/kontakt"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); $('#kontakt').scrollIntoView({ behavior: 'smooth' }); }));
  $$('[data-apk]').forEach(a => a.addEventListener('click', () => count('apk/' + a.dataset.apk, 'APK ' + a.dataset.apk, true)));
  $$('[data-mail]').forEach(b => b.addEventListener('click', copyMail));
  $$('[data-ask]').forEach(b => b.addEventListener('click', () => askFor(b.dataset.ask)));
  const rq = $('#req'); if (rq) rq.addEventListener('submit', sendReq);
  $$('[data-lb]').forEach(b => b.addEventListener('click', () => lightbox(+b.dataset.lb)));
  // magnetni dugmići (samo miš)
  if (fine && !reduce) $$('.btn:not(.dis)').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect();
      b.style.setProperty('--tx', ((e.clientX - r.left) / r.width - .5) * 8 + 'px'); b.style.setProperty('--ty', ((e.clientY - r.top) / r.height - .5) * 6 + 'px');
      b.style.setProperty('--bx', (e.clientX - r.left) + 'px'); b.style.setProperty('--by', (e.clientY - r.top) + 'px'); });
    b.addEventListener('pointerleave', () => { b.style.setProperty('--tx', '0px'); b.style.setProperty('--ty', '0px'); });
  });
  // reveal sa stepenastim kašnjenjem
  revIO && revIO.disconnect();
  revIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revIO.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(n => revIO.observe(n));
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('[data-c]').forEach(countUp); cio.unobserve(e.target); } }), { threshold: .3 });
  $$('.stats').forEach(n => cio.observe(n));
  $$('.sh h2, .gh h3').forEach(h => h.addEventListener('mouseenter', () => scramble(h)));
}
function countUp(b){ const tg = +b.dataset.c, st = tg > 100 ? tg - 30 : 0, t0 = performance.now();
  const step = now => { const k = Math.min(1, (now - t0) / 1200); b.textContent = Math.round(st + (tg - st) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step); }
const CH = '!<>-_\\/[]{}—=+*^?#01';
function scramble(node){ if (reduce) return; const final = node.dataset.txt || (node.dataset.txt = node.textContent); let f = 0;
  const run = () => { node.textContent = final.split('').map((c, i) => i < f / 2 || c === ' ' ? c : CH[(Math.random() * CH.length) | 0]).join('');
    if (f++ < final.length * 2) requestAnimationFrame(run); else node.textContent = final; };
  run(); }
const toast = m => { const tt = $('#toast'); tt.textContent = m; tt.classList.add('on'); clearTimeout(tt._h); tt._h = setTimeout(() => tt.classList.remove('on'), 2400); };
async function copyMail(){ const m = 'basagtm@gmail.com'; try { await navigator.clipboard.writeText(m); toast(t('mailCopied') + m); } catch(e){ location.href = 'mailto:' + m; } }

/* traka napretka skrola + header kad se skrola */
const prog = $('#prog');
function onScroll(){ const h = document.documentElement.scrollHeight - innerHeight; if (prog) prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; document.body.classList.toggle('scrolled', scrollY > 24); }
addEventListener('scroll', onScroll, { passive: true });

/* lightbox */
function lightbox(i){
  const p = P.find(x => x.id === route().id); if (!p) return;
  const lb = $('#lb'), inn = $('#lbin');
  inn.innerHTML = p.shots.map(s => `<div><img src="assets/shots/${s}.webp" alt="${esc(p.name)}"></div>`).join('');
  lb.showModal(); requestAnimationFrame(() => inn.scrollTo({ left: i * innerWidth }));
}
$('#lb').addEventListener('click', e => { if (e.target.tagName === 'DIV') $('#lb').close(); });

/* terminal kucanje */
let typeT;
function typeStart(){
  clearTimeout(typeT);
  const el = $('#typed'); if (!el) return;
  const lines = t('typed'); let li = 0, ci = 0, del = false;
  if (reduce) { el.textContent = lines[lines.length - 1]; return; }
  const step = () => {
    if (!document.body.contains(el)) return;
    const s = lines[li];
    if (!del) { el.textContent = s.slice(0, ++ci); if (ci === s.length) { del = true; typeT = setTimeout(step, 1900); return; } }
    else { el.textContent = s.slice(0, --ci); if (ci === 0) { del = false; li = (li + 1) % lines.length; } }
    typeT = setTimeout(step, del ? 22 : 45 + Math.random() * 60);
  };
  typeT = setTimeout(step, firstPaint ? 1500 : 300);
}

/* ---------------- ⌘K komandna paleta ---------------- */
let palSel = 0, palItems = [];
function palAll(){
  const A = P.map(p => ({ i: '▸', l: p.name, s: pt(p).short, k: p.id + ' ' + p.tags.join(' '), run: () => openProject(p.id) }));
  A.push(
    { i: '⌂', l: t('cTop'), k: 'home top pocetna', run: () => { location.hash = '#/'; scrollTo({ top: 0 }); } },
    ...['bs', 'de', 'en'].map(l => ({ i: '◐', l: `${t('cLang')}: ${l.toUpperCase()}`, k: 'lang jezik sprache language ' + l, run: () => setLang(l) })),
    { i: '@', l: 'Instagram · @basa.gtm', k: 'instagram ig kontakt', run: () => open('https://instagram.com/basa.gtm', '_blank') },
    { i: '✉', l: t('cMail'), k: 'mail email kontakt', run: copyMail },
    { i: '⌥', l: 'GitHub', k: 'github code kod', run: () => open('https://github.com/Basaofficial', '_blank') });
  if (deferredInstall) A.push({ i: '⤓', l: t('cInst'), k: 'install pwa app instaliraj', run: doInstall });
  P.filter(p => p.apk).forEach(p => A.push({ i: '⤓', l: `${p.name} APK`, k: 'apk download ' + p.id, run: () => { count('apk/' + p.id, 'APK ' + p.id, true); location.href = p.apk; } }));
  return A;
}
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
function palRender(){
  const q = norm($('#palq').value.trim());
  palItems = palAll().filter(a => !q || q.split(' ').every(w => norm(a.l + ' ' + (a.k || '') + ' ' + (a.s || '')).includes(w)));
  palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
  $('#pall').innerHTML = palItems.map((a, i) => `<li role="option" class="${i === palSel ? 'on' : ''}" data-i="${i}"><i>${a.i}</i>${esc(a.l)}${a.s ? `<small>${esc(a.s.slice(0, 38))}${a.s.length > 38 ? '…' : ''}</small>` : ''}</li>`).join('')
    || `<li>∅</li>`;
  $$('#pall li[data-i]').forEach(li => { li.addEventListener('click', () => palRun(+li.dataset.i)); li.addEventListener('pointermove', () => { if (palSel !== +li.dataset.i) { palSel = +li.dataset.i; palRender(); } }); });
}
function palRun(i){ const a = palItems[i]; if (!a) return; $('#pal').close(); a.run(); }
function palOpen(){ const d = $('#pal'); if (d.open) return; $('#palq').value = ''; palSel = 0; palRender(); d.showModal(); $('#palq').focus(); }
$('#kbtn').addEventListener('click', palOpen);
$('#palq').addEventListener('input', () => { palSel = 0; palRender(); });
$('#palq').addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { palSel = (palSel + 1) % Math.max(1, palItems.length); palRender(); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { palSel = (palSel - 1 + palItems.length) % Math.max(1, palItems.length); palRender(); e.preventDefault(); }
  else if (e.key === 'Enter') { palRun(palSel); e.preventDefault(); }
});
$('#pal').addEventListener('click', e => { if (e.target === $('#pal')) $('#pal').close(); });
addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palOpen(); }
  else if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); palOpen(); }
});
if (!/Mac|iPhone|iPad/.test(navigator.platform)) $('#kbtn kbd').textContent = 'Ctrl K';

/* ---------------- PWA ---------------- */
let deferredInstall = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; const b = $('#inst'); b.textContent = t('installApp'); b.classList.add('on'); });
async function doInstall(){ if (!deferredInstall) return; deferredInstall.prompt(); const r = await deferredInstall.userChoice; if (r.outcome === 'accepted') { $('#inst').classList.remove('on'); count('pwa-install', 'PWA install', true); } deferredInstall = null; }
$('#inst').addEventListener('click', doInstall);
addEventListener('appinstalled', () => toast(t('installed')));
if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
addEventListener('offline', () => toast(t('offline')));

/* ---------------- pametne čestice: prilagode se telefonu i bateriji ---------------- */
const cv = $('#fx'), ctx = cv.getContext('2d');
let W, H, DPR, pts = [], drops = [], mouse = { x: -9999, y: -9999 }, Q = 2; // Q: 2 puno, 1 lagano, 0 isključeno
const G = '124,255,1', glyphs = '01アイウエオカキクケコｱｲｳｴｵ<>/{}#$_=+*;:[]';
(function quality(){
  const c = navigator.connection, mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
  if (reduce || (c && c.saveData)) Q = 0;
  else if (mem <= 4 || cores <= 4 || matchMedia('(pointer:coarse)').matches && innerWidth < 500) Q = 1;
  if (navigator.getBattery) navigator.getBattery().then(b => {
    const chk = () => { if (!b.charging && b.level <= .2) setQ(0); };
    chk(); b.addEventListener('levelchange', chk); b.addEventListener('chargingchange', chk);
  }).catch(() => {});
})();
function setQ(q){ if (q >= Q) return; Q = q; size(); if (Q === 0) ctx.clearRect(0, 0, W, H); }
function size(){
  DPR = Math.min(devicePixelRatio || 1, Q === 2 ? 2 : 1);
  W = innerWidth; H = innerHeight;
  cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const n = Q === 0 ? 0 : Math.round(Math.min(Q === 2 ? 110 : 45, W * H / (Q === 2 ? 14000 : 22000)));
  pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .5 }));
  drops = Q === 2 ? Array.from({ length: Math.floor(W / 18) }, () => ({ y: Math.random() * -H, s: Math.random() * 1.2 + .6, on: Math.random() < .18 })) : [];
}
size(); addEventListener('resize', size);
addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; const g = $('#glow'); g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; }, { passive: true });
addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
addEventListener('click', e => { if (Q) for (let i = 0; i < 6; i++) pts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 3, vy: (Math.random() - .5) * 3, r: Math.random() * 1.8 + .6, life: 220 }); });
let lastT = 0, slow = 0, frames = 0, running = false;
function frame(now){
  running = false;
  if (Q === 0 || document.hidden) return;
  // FPS čuvar: ako telefon ne stiže, smanji efekte
  if (lastT) { const dt = now - lastT; frames++; if (dt > 24) slow++; if (frames === 120) { if (slow > 50) setQ(Q - 1); frames = slow = 0; } }
  lastT = now;
  ctx.clearRect(0, 0, W, H);
  if (drops.length) {
    ctx.font = '14px JetBrains Mono, monospace';
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i]; if (!d.on) { if (Math.random() < .0008) d.on = true; continue; }
      const x = i * 18 + 4;
      for (let k = 0; k < 8; k++) { const yy = d.y - k * 18; if (yy < 0 || yy > H) continue;
        ctx.fillStyle = k === 0 ? 'rgba(200,255,170,.55)' : `rgba(${G},${.22 - k * .026})`; ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], x, yy); }
      d.y += d.s * 3.2;
      if (d.y - 160 > H) { d.y = Math.random() * -200; d.on = Math.random() < .35; d.s = Math.random() * 1.2 + .6; }
    }
  }
  const par = scrollY * .08, LD = Q === 2 ? 130 : 110;
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i], dx = p.x - mouse.x, dy = p.y - mouse.y, dm = Math.hypot(dx, dy);
    if (dm < 140 && dm > 0) { p.vx += dx / dm * .06; p.vy += dy / dm * .06; }
    p.vx *= .985; p.vy *= .985;
    if (Math.abs(p.vx) < .08) p.vx += (Math.random() - .5) * .05;
    if (Math.abs(p.vy) < .08) p.vy += (Math.random() - .5) * .05;
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1, p.x = Math.max(0, Math.min(W, p.x));
    if (p.y < 0 || p.y > H) p.vy *= -1, p.y = Math.max(0, Math.min(H, p.y));
    if (p.life !== undefined && --p.life <= 0) pts.splice(i, 1);
  }
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], ay = (a.y - par + H * 10) % H;
    for (let j = i + 1; j < pts.length; j++) { const b = pts[j], by = (b.y - par + H * 10) % H, d = Math.hypot(a.x - b.x, ay - by);
      if (d < LD) { ctx.strokeStyle = `rgba(${G},${(1 - d / LD) * .28})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a.x, ay); ctx.lineTo(b.x, by); ctx.stroke(); } }
    const md = Math.hypot(a.x - mouse.x, ay - mouse.y);
    if (md < 180) { ctx.strokeStyle = `rgba(${G},${(1 - md / 180) * .55})`; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(a.x, ay); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    ctx.fillStyle = `rgba(${G},.85)`;
    if (Q === 2) { ctx.shadowColor = `rgb(${G})`; ctx.shadowBlur = 8; }
    ctx.beginPath(); ctx.arc(a.x, ay, a.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
  }
  loop();
}
function loop(){ if (!running && Q > 0 && !document.hidden) { running = true; requestAnimationFrame(frame); } }
document.addEventListener('visibilitychange', () => { lastT = 0; loop(); });

/* ---------------- start ---------------- */
$('#yr').textContent = new Date().getFullYear();
$$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.l)));
document.documentElement.lang = L;
$$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.l === L));
$$('[data-i]').forEach(n => n.textContent = t(n.dataset.i));
$('#palq').placeholder = t('palPh');
render(false);
onScroll();
loop();
})();
