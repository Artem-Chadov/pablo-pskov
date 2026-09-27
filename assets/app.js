/* ══════════ Пабло · Псков ══════════ */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ───── данные ───── */
const MENU = window.MENU || [];
const VENUE = window.VENUE || {};
const ALL = MENU.flatMap(c => c.items.map(i => ({ ...i, cat: c.cat })));
const find = name => ALL.find(d => d.t === name);

const PHONE = '+79211155113';
const LINKS = {
  vk: 'https://vk.com/pablopskov',
  tg: 'https://t.me/79211155113',
  wa: 'https://wa.me/79211155113',
  map: 'https://yandex.ru/maps/org/pablo/30460137314/',
  route: 'https://yandex.ru/maps/org/pablo/30460137314/?mode=routes&rtext=~57.813522%2C28.287367',
};

/* ───── режим работы ───── */
// 0=вс … 6=сб. Открытие 12:00, закрытие в часах от полуночи текущего дня (25 = 01:00 следующего).
const CLOSE = { 0: 24, 1: 24, 2: 24, 3: 24, 4: 24, 5: 25, 6: 25 };
const OPEN_H = 12;

function status(now = new Date()) {
  const h = now.getHours() + now.getMinutes() / 60;
  const d = now.getDay();
  const prev = (d + 6) % 7;
  if (CLOSE[prev] > 24 && h < CLOSE[prev] - 24)
    return { open: true, until: fmt(CLOSE[prev] - 24) };            // доигрываем вчерашнюю смену
  if (h >= OPEN_H && h < CLOSE[d])
    return { open: true, until: fmt(CLOSE[d] % 24) };
  return { open: false, at: h < OPEN_H ? 'сегодня в 12:00' : 'завтра в 12:00' };
}
const fmt = h => String(Math.floor(h)).padStart(2, '0') + ':00';

function paintStatus() {
  const s = status();
  const txt = s.open ? `Открыто до ${s.until}` : `Закрыто · откроем ${s.at}`;
  const hero = $('#heroStatus'), sub = $('#heroStatusSub');
  if (hero) { hero.textContent = s.open ? 'Открыто' : 'Закрыто'; sub.textContent = s.open ? `до ${s.until}` : `откроем ${s.at}`; }
  const a = $('#astStatus');
  if (a) { a.textContent = txt; a.className = s.open ? 'is-open' : 'is-shut'; }
  const row = $(`#hours tr[data-d="${new Date().getDay()}"]`);
  if (row) row.classList.add('is-today');
  return txt;
}

/* ───── возрастная заглушка ───── */
const age = $('#age');
// пока окно открыто, остальная страница недоступна и с клавиатуры, не только визуально
const siblings = () => [...document.body.children].filter(el => el !== age && el.tagName !== 'SCRIPT');
function lockPage(on) {
  siblings().forEach(el => on ? el.setAttribute('inert', '') : el.removeAttribute('inert'));
  document.body.style.overflow = on ? 'hidden' : '';
}
let seen = false;
try { seen = !!sessionStorage.getItem('pablo18'); } catch (e) { /* приватный режим — покажем окно */ }
if (seen) {
  age.remove();
} else {
  // дублируем ключевые свойства инлайном: если чужой стиль перекроет наш CSS,
  // заглушка всё равно останется на месте
  age.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:rgb(11,10,9)';
  lockPage(true);
  $('#ageYes').focus();
  $('#ageYes').addEventListener('click', () => {
    try { sessionStorage.setItem('pablo18', '1'); } catch (e) { /* приватный режим — просто не запомним */ }
    lockPage(false); age.remove();
  });
  $('#ageNo').addEventListener('click', () => {
    // «Нет» не просто закрывает окно — сайт остаётся заблокированным
    age.classList.add('age--bye');
    $('#ageQ').textContent = 'Тогда — до встречи';
    $('.age__d', age).innerHTML = 'Сайт доступен только совершеннолетним. ' +
      '<a href="https://yandex.ru" style="color:var(--red-hi)">Выйти</a>';
  });
}

/* ───── шапка / навигация ───── */
const hdr = $('#hdr'), nav = $('.nav'), burger = $('#burger');
addEventListener('scroll', () => hdr.classList.toggle('is-stuck', scrollY > 40), { passive: true });
// Закрытое меню на телефоне остаётся в порядке обхода с клавиатуры: фокус уезжает
// под первый экран. Скрываем его для Tab через inert, а не visibility — с visibility
// фокус на первый пункт после открытия не встаёт.
const navMq = matchMedia('(max-width:860px)');
function syncNavInert() { nav.inert = navMq.matches && !nav.classList.contains('is-open'); }
syncNavInert();
navMq.addEventListener('change', syncNavInert);

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
  syncNavInert();
  // с клавиатуры после открытия фокус уходил на кнопку брони мимо меню
  if (open) { const first = nav.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
  else burger.focus({ preventScroll: true });
});
$$('.nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
}));

/* ───── появление секций ───── */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  io.unobserve(e.target);
}), { rootMargin: '0px 0px -12% 0px' });
$$('.reveal').forEach(el => io.observe(el));

/* ───── хиты ───── */
const HITS = ['Компаньонская тарелка', 'Томленые свиные ребра', 'Тако с говядиной',
  'Пепперони', 'Томагавк XXL', 'Цезарь с курицей', 'Том ям', 'Картофель фри с кукурузой и беконом',
  'Сырные палочки', 'Бургер «ПО»'];
$('#hitsRail').innerHTML = HITS.map(find).filter(Boolean).map(d => `
  <button class="hit" data-dish="${esc(d.t)}">
    ${d.img ? `<img loading="lazy" src="${d.img}" alt="${esc(d.t)}">` : ''}
    <span class="hit__b">
      <span class="hit__t">${esc(d.t)}</span>
      <span class="hit__m"><span class="hit__p">${d.p} ₽</span><span class="hit__w">${esc(d.v)}</span></span>
    </span>
  </button>`).join('');

/* ───── меню ───── */
const grid = $('#menuGrid'), tabs = $('#menuTabs'), search = $('#menuSearch'), clearBtn = $('#menuClear');
let activeCat = 'Всё';
const CATS = ['Всё', ...MENU.map(c => c.cat)];

tabs.innerHTML = CATS.map(c =>
  `<button class="tab" role="tab" aria-selected="${c === activeCat}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

function card(d) {
  return `<article class="dish" data-name="${esc(d.t)}">
    <div class="dish__ph${d.img ? '' : ' dish__ph--none'}">
      ${d.img ? `<img loading="lazy" src="${d.img}" alt="${esc(d.t)}">` : '<b>Пабло</b><i>пенное и кухня</i>'}
      <span class="dish__cat">${esc(d.cat)}</span>
    </div>
    <div class="dish__b">
      <h3 class="dish__t">${esc(d.t)}</h3>
      ${d.d ? `<p class="dish__d">${esc(d.d)}</p>` : '<div class="dish__d"></div>'}
      <div class="dish__m"><span class="dish__p">${d.p} ₽</span><span class="dish__w">${esc(d.v)}</span></div>
    </div>
  </article>`;
}

function render() {
  const q = search.value.trim().toLowerCase();
  clearBtn.hidden = !q;
  const list = ALL.filter(d =>
    (activeCat === 'Всё' || d.cat === activeCat) &&
    (!q || (d.t + ' ' + d.d + ' ' + d.cat).toLowerCase().includes(q)));
  grid.innerHTML = list.map(card).join('');
  $('#menuEmpty').hidden = list.length > 0;
  closeRow();
}

// Последний ряд меню оставался с пустой клеткой: 67 блюд на четыре колонки.
// Закрываем остаток приглашением — ряд полный, а у гостя появляется шаг дальше.
function closeRow() {
  const old = grid.querySelector('.dish--more');
  if (old) old.remove();
  const cards = grid.querySelectorAll('.dish').length;
  if (!cards) return;
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  const rest = cards % cols;
  if (!rest) return;
  const a = document.createElement('a');
  a.className = 'dish dish--more';
  a.href = 'https://vk.com/pablopskov';
  a.target = '_blank';
  a.rel = 'noopener';
  a.style.gridColumn = 'span ' + (cols - rest);
  a.innerHTML = '<b>Состав меняется</b><span>Новинки и блюда дня кухня выкладывает во ВКонтакте →</span>';
  grid.appendChild(a);
}
addEventListener('resize', closeRow);

tabs.addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return;
  activeCat = b.dataset.cat;
  $$('.tab', tabs).forEach(t => t.setAttribute('aria-selected', t === b));
  render();
});
search.addEventListener('input', () => { activeCat = 'Всё'; $$('.tab', tabs).forEach(t => t.setAttribute('aria-selected', t.dataset.cat === 'Всё')); render(); });
clearBtn.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
render();
$('#menuCount').textContent = ALL.length;

/* переход к конкретному блюду */
function gotoDish(name) {
  search.value = name;
  activeCat = 'Всё';
  $$('.tab', tabs).forEach(t => t.setAttribute('aria-selected', t.dataset.cat === 'Всё'));
  render();
  $('#menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
  const el = grid.querySelector(`[data-name="${CSS.escape(name)}"]`);
  if (el) { el.classList.add('is-hi'); setTimeout(() => el.classList.remove('is-hi'), 2600); }
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-dish],[data-goto-dish]');
  if (!t) return;
  e.preventDefault();
  gotoDish(t.dataset.dish || t.dataset.gotoDish);
});

/* ───── барная карта ───── */
const BAR = window.BAR || [];
const BAR_ALL = BAR.flatMap(g => g.items.map(([t, d, p]) => ({ t, d, p, g: g.g, v: g.vol })));
const rub = p => (typeof p === 'number' ? p + ' ₽' : p + ' ₽');

$('#barHi').innerHTML = (window.BAR_HI || []).map(c => `
  <article class="barhi__c reveal">
    <span class="barhi__sub">${esc(c.sub)}</span>
    <h3 class="barhi__t">${esc(c.t)}</h3>
    <p>${esc(c.d)}</p>
    <div class="barhi__p">${esc(c.p)}</div>
  </article>`).join('');

$('#barList').innerHTML = BAR.map(g => `
  <section class="bargrp reveal">
    <header class="bargrp__h">
      <h3 class="bargrp__n">${esc(g.g)}</h3>
      ${g.vol ? `<span class="bargrp__v">${esc(g.vol)}</span>` : ''}
    </header>
    ${g.items.map(([t, d, p]) => `<div class="baritem">
      <div class="baritem__r">
        <span class="baritem__n">${esc(t)}</span>
        <span class="baritem__dots"></span>
        <span class="baritem__p">${esc(rub(p))}</span>
      </div>
      ${d ? `<span class="baritem__d">${esc(d)}</span>` : ''}
    </div>`).join('')}
  </section>`).join('');

$$('#bar .reveal').forEach(el => io.observe(el));

/* ───── галерея ───── */
const GAL = VENUE.gallery || [];
$('#gal').innerHTML = GAL.map((src, i) =>
  `<figure data-i="${i}"><img loading="lazy" src="${src}" alt="Пабло, Псков — фото ${i + 1}"></figure>`).join('');

// неполный последний ряд оставлял бы дыру внизу — прячем остаток до кратности колонкам
const galEl = $('#gal');
function trimGal() {
  const cols = getComputedStyle(galEl).gridTemplateColumns.split(' ').length;
  const keep = GAL.length - (GAL.length % cols);
  $$('figure', galEl).forEach((f, i) => f.hidden = i >= keep);
}
trimGal();
addEventListener('resize', trimGal);

const lb = $('#lb'), lbImg = $('#lbImg');
let li = 0;
const showLb = i => { li = (i + GAL.length) % GAL.length; lbImg.src = GAL[li]; lb.hidden = false; };
$('#gal').addEventListener('click', e => { const f = e.target.closest('figure'); if (f) showLb(+f.dataset.i); });
$('#lbX').addEventListener('click', () => lb.hidden = true);
$('#lbP').addEventListener('click', () => showLb(li - 1));
$('#lbN').addEventListener('click', () => showLb(li + 1));
lb.addEventListener('click', e => { if (e.target === lb) lb.hidden = true; });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') lb.hidden = true;
  if (e.key === 'ArrowLeft') showLb(li - 1);
  if (e.key === 'ArrowRight') showLb(li + 1);
});

/* ───── шкалы отзывов ───── */
// оценки Яндекс Карт. Алкогольные категории («Настойки», «Пиво») намеренно не выводим:
// проценты одобрения по алкоголю читаются как его реклама, а она в интернете запрещена.
const ASPECTS = [['Атмосфера', 99, 119], ['Закуски', 96, 28], ['Время ожидания', 95, 19],
  ['Еда', 94, 232], ['Персонал', 94, 184], ['Напитки', 92, 181], ['Музыка', 91, 38], ['Интерьер', 90, 31]];
$('#scoreBars').innerHTML = ASPECTS.map(([n, p, c]) =>
  `<div class="sbar"><div class="sbar__t"><span>${n} · ${c}</span><b>${p}%</b></div>
   <div class="sbar__l"><i class="sbar__f" data-p="${p}"></i></div></div>`).join('');
new IntersectionObserver((es, o) => es.forEach(e => {
  if (!e.isIntersecting) return;
  $$('.sbar__f').forEach((f, i) => setTimeout(() => f.style.width = f.dataset.p + '%', i * 90));
  o.disconnect();
}), { threshold: .3 }).observe($('#scoreBars'));

/* ══════════ ПОМОЩНИК ══════════ */
const fab = $('#astFab'), ast = $('#ast'), log = $('#astLog'), chipsBox = $('#astChips');

const CHIPS_MAIN = ['Что попробовать?', 'Забронировать стол', 'Часы работы', 'Как добраться',
  'Настойки', 'Коктейли', 'Деловые обеды', 'Трансляции', 'Доставка', 'Можно с собакой?'];

function bubble(html, who = 'bot') {
  const el = document.createElement('div');
  el.className = 'msg msg--' + who;
  el.innerHTML = html;
  log.append(el);
  log.scrollTop = log.scrollHeight;
  return el;
}
function chips(list) {
  chipsBox.innerHTML = list.map(c => `<button type="button">${esc(c)}</button>`).join('');
}
function typing(ms, then) {
  const t = document.createElement('div');
  t.className = 'typing'; t.innerHTML = '<span></span><span></span><span></span>';
  log.append(t); log.scrollTop = log.scrollHeight;
  setTimeout(() => { t.remove(); then(); }, ms);
}
function say(html, nextChips) {
  typing(380, () => { bubble(html); if (nextChips) chips(nextChips); });
}
const dishRow = d => `<button class="msg__dish" data-dish="${esc(d.t)}">
  ${d.img ? `<img src="${d.img}" alt="">` : ''}
  <div><b>${esc(d.t)}</b><span>${esc(d.cat)} · ${esc(d.v)}</span></div><i>${d.p} ₽</i></button>`;

/* ── подбор блюда ── */
const TAG = {
  spicy: /том ям|чили|халапень|жгуч|ким-чи|сальс|корейск|остр|шрирач|фахитос|тако/i,
  meat: /стейк|ребра|говядин|свинин|бургер|ростбиф|курин|цыплен|курице|курицей|фахитос|карбонара|оленя|крылышк|томагавк|фланк/i,
  light: /салат|огурчик|риет|брускетт|темпура|креветк|орзо|миндаль|арахис/i,
  beer: /чипс|палочк|крылышк|арахис|миндаль|вялен|гренк|халапень|ким-чи|начос|фри|кесадиль|тако/i,
  share: /компаньонск|пицц|ребра|крылышк|тако|кесадиль|чипс|палочк|томагавк|фахитос/i,
};
let pick = null;
const PICK_STEPS = [
  { q: 'С кем сегодня заходите?', opts: ['Компанией', 'Вдвоём', 'Один'] },
  { q: 'Чего хочется?', opts: ['Мясного и сытного', 'Поострее', 'Полегче', 'Закусить пенное'] },
  { q: 'Бюджет на блюдо?', opts: ['До 500 ₽', '500–900 ₽', 'Не важно'] },
];

function pickResult() {
  const [who, want, budget] = pick.a;
  const cap = budget === 'До 500 ₽' ? 500 : budget === '500–900 ₽' ? 900 : 1e9;
  const min = budget === '500–900 ₽' ? 500 : 0;
  const key = { 'Мясного и сытного': 'meat', 'Поострее': 'spicy', 'Полегче': 'light', 'Закусить пенное': 'beer' }[want];
  const scored = ALL
    .filter(d => d.cat !== 'Соусы' && d.p <= cap && d.p >= min)
    .map(d => {
      const s = (d.t + ' ' + d.d + ' ' + d.cat);
      let n = 0;
      if (TAG[key].test(s)) n += 3;
      if (who === 'Компанией' && TAG.share.test(s)) n += 2;
      if (who === 'Один' && parseInt(d.v) < 260) n += 1;
      if (want === 'Полегче' && /Салаты|Закуски|Снеки/.test(d.cat)) n += 1;
      return { d, n };
    })
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n || b.d.p - a.d.p)
    .slice(0, 3).map(x => x.d);

  pick = null;
  if (!scored.length) return say(`Под такой запрос ничего точно не подобралось — но у нас ${ALL.length} позиций, гляньте меню целиком или спросите иначе.`, CHIPS_MAIN);
  const total = scored.reduce((a, d) => a + d.p, 0);
  say(`Вот что бы я принёс:<br>${scored.map(dishRow).join('')}
    <br>Итого <em>${total} ₽</em>. Нажмите на блюдо — покажу его в меню.`, ['Ещё вариант', 'Забронировать стол', ...CHIPS_MAIN.slice(2, 6)]);
}

function pickStep() {
  const s = PICK_STEPS[pick.i];
  say(s.q, s.opts);
}

/* ── барные группы: «сколько стоит текила», «вино по бокалам», «есть раф» ── */
const BAR_ALIAS = [
  ['Текила', /текил/i],
  ['Мескаль', /мескал/i],
  ['Виски', /виски|jameson|дж[еэ]й?м[еи]?сон|бушмил+с|jack daniel|джек д[эе]н|johnnie|джонни/i],
  ['Ром, бренди, ликёр', /\bром\b|бренди|коньяк|кальвадос|лик[ёе]р|егермейстер|j[aä]ger/i],
  ['Водка', /водк/i],
  ['Вино', /вино|игрист|шампан|бокал/i],
  ['Кофе', /кофе|эспрессо|американо|капучино|латте|\bраф\b|фл[эе]т/i],
  ['Чай в чайнике', /\bчай/i],
  ['Безалкогольное', /безалкогол|морс|лимонад|\bсок\b|кола|cola/i],
];
const BAR_RE = new RegExp(BAR_ALIAS.map(([, re]) => re.source).join('|'), 'i');

/* ── правила ── */
const RULES = [
  [/брон|стол|заказ.*стол|резерв|прийти|прид[её]м/i, () => say(
    `Стол держим по звонку или сообщению — <b>${'+7 921 115-51-13'}</b>.
     <br><a href="tel:${PHONE}">Позвонить</a> · <a href="${LINKS.tg}" target="_blank" rel="noopener">Telegram</a> · <a href="${LINKS.wa}" target="_blank" rel="noopener">WhatsApp</a>
     <br><br>Скажите дату, время, число гостей — и если нужен матч на экране, какой именно.`,
    ['Часы работы', 'Как добраться', 'Что попробовать?'])],

  [/час|график|работа|работае|открыт|закрыт|до скольк|во сколь/i, () => say(
    `${paintStatus()}.<br><br>Пн–Чт — 12:00–00:00<br>Пт–Сб — 12:00–01:00<br>Вс — 12:00–00:00`,
    ['Забронировать стол', 'Как добраться', 'Деловые обеды'])],

  [/где|адрес|добра|доеха|маршрут|карт|найти|парков/i, () => say(
    `Псков, <b>Западная улица, 1</b> — 1 этаж, Завеличье. Парковка рядом, до остановки «Западная улица» ~280 м.
     <br><a href="${LINKS.route}" target="_blank" rel="noopener">Построить маршрут</a> · <a href="${LINKS.map}" target="_blank" rel="noopener">Открыть на картах</a>`,
    ['Часы работы', 'Забронировать стол'])],

  [/достав|навынос|с собой|привез|курьер/i, () => say(
    `Да: доставка и еда навынос, кофе с собой тоже. Заказ и уточнения — по телефону <a href="tel:${PHONE}">+7 921 115-51-13</a>.
     <br>Цены в меню на сайте — как раз по меню доставки.`,
    ['Что попробовать?', 'Деловые обеды'])],

  [/ланч|обед|бизнес|делов/i, () => say(
    `<b>Деловые обеды</b> — каждый будний день с 13:00 до 17:00. Комплекс из трёх блюд: салат, суп и горячее с гарниром, плюс напиток на выбор — чай, вода с лимоном или пиво 0,25. <em>550 ₽</em>, около 640 г.
     <br><br>Состав меняется каждый день, поэтому меню на сегодня — <a href="${LINKS.vk}" target="_blank" rel="noopener">во ВКонтакте</a> или по телефону <a href="tel:${PHONE}">+7 921 115-51-13</a>.`,
    ['Заказать обед', 'Часы работы', 'Что попробовать?'])],

  [/заказать обед/i, () => say(`Обед соберём и привезём — звоните <a href="tel:${PHONE}">+7 921 115-51-13</a> или пишите в <a href="${LINKS.tg}" target="_blank" rel="noopener">Telegram</a>.`, CHIPS_MAIN)],

  [/трансл|матч|футбол|хокке|спорт|экран|бокс|смотре/i, () => say(
    `Большие экраны, трансляции <b>ежедневно</b> — включаем любой матч. Скажите заранее, какой нужен, и займём вам стол с лучшим обзором.
     <br><a href="tel:${PHONE}">Позвонить</a> · <a href="${LINKS.tg}" target="_blank" rel="noopener">Написать</a>`,
    ['Забронировать стол', 'Что попробовать?'])],

  [/собак|пито|животн|пёс|пес /i, () => say('Да, с собакой можно. Есть пандус, вход и зал доступны для гостей на коляске.', ['Забронировать стол', 'Летняя веранда'])],

  [/веранд|улиц|свеж.*воздух|лет/i, () => say(
    'Летняя веранда работает в сезон — то же меню и та же атмосфера, только на свежем воздухе.',
    ['Забронировать стол', 'Что попробовать?'])],

  [/закусить пенное/i, () => { pick = { i: 2, a: ['Компанией', 'Закусить пенное'] }; typing(300, () => { bubble('Закуска к пенному — святое. Бюджет?'); chips(PICK_STEPS[2].opts); }); }],

  [/настойк|наста(и|е)|огненн/i, () => say(
    `<b>Пабло настаивает</b> — настойки, 40 мл за <em>220 / 240 ₽</em>.
     Ассортимент меняется, актуальный спросите у официанта.
     <br><br>Рядом по карте: сангрита 60 ₽, чипсы «Пабло» с томатной сальсой ${find('Чипсы «Пабло» с томатной сальсой')?.p ?? 190} ₽.`,
    ['Коктейли', 'Закусить пенное', 'Забронировать стол'])],

  [/коктейл|маргарит|негрони|спритс|палома|мескалит/i, () => say(
    `Шесть авторских:<br>${BAR.find(g => g.g === 'Коктейли').items.map(([t, d, p]) =>
      `<br>• <b>${esc(t)}</b> — ${p} ₽`).join('')}
     <br><br>Мескаль и текила — из Мексики, полный список в разделе «Бар» на сайте.`,
    ['Настойки', 'Забронировать стол', 'Что попробовать?'])],

  [BAR_RE, q => {
    const [name] = BAR_ALIAS.find(([, re]) => re.test(q));
    const g = BAR.find(x => x.g === name);
    say(`<b>${esc(g.g)}</b>${g.vol ? ` · ${esc(g.vol)}` : ''}:${g.items.map(([t, , p]) =>
      `<br>• ${esc(t)} — <em>${esc(rub(p))}</em>`).join('')}`,
      ['Настойки', 'Коктейли', 'Забронировать стол']);
  }],

  [/пив|пенн|нефильтр|разлив|алког|барн|бар\b|карт[аыу]/i, () => say(
    `Пенное — разливное, баночное и бутылочное. Сорта меняются, поэтому пивная карта живёт на месте: спросите за стойкой или по телефону <a href="tel:${PHONE}">+7 921 115-51-13</a>.
     <br><br>Всё остальное — с ценами в разделе <a href="#bar">«Бар»</a>: текила от 410 ₽, мескаль от 540 ₽, виски от 390 ₽, вино 410 ₽ бокал, коктейли 490–580 ₽, кофе от 150 ₽.
     <br><br>И наша традиция: <em>пиво для поваров — 150 ₽</em>. Понравилась кухня — можете угостить.`,
    ['Настойки', 'Коктейли', 'Закусить пенное'])],


  [/банкет|корпоратив|день рожд|праздн|меропри|событ|компан.*человек|дегуст/i, () => say(
    `Собираем зал под событие: корпоратив, день рождения, банкет, деловая встреча, дегустация. Подберём меню и трансляцию под вашу компанию.
     <br><a href="tel:${PHONE}">Обсудить: +7 921 115-51-13</a>`,
    ['Часы работы', 'Как добраться'])],

  [/чек|дорого|цен|сколько стоит|бюджет|деньг/i, () => say(
    `Средний чек — <em>1000–1500 ₽</em> на человека. Цены выше среднего по городу: за пенное, кухню и атмосферу. В меню на сайте — все ${ALL.length} позиций с ценами и весом.`,
    ['Что попробовать?', 'Деловые обеды'])],

  [/wi-?fi|вайфай|интернет|карт[аоу].*оплат|оплат|наличн|чаев/i, () => say(
    'Wi-Fi есть, оплата картой — тоже. Безналичные чаевые: «Нетмонет».',
    CHIPS_MAIN.slice(0, 4))],

  [/вегет|веган|постн|без мяса/i, () => say(
    `Полностью вегетарианского раздела нет, но есть что взять:<br>
     ${['Салат с баклажанами и томатами', 'Картофель фри с розмарином и соусом на выбор', 'Халапеньо в кляре со сметанным соусом', 'Чипсы Пабло с сальсой'].map(find).filter(Boolean).map(dishRow).join('')}`,
    ['Что попробовать?', 'Забронировать стол'])],

  [/детс|ребен|ребён|дет[иьями]/i, () => say(
    'С детьми приходят и хвалят — чаще всего берут пиццу «Пеперони» (тесто отдельно отмечают в отзывах) и картофель фри. Тише всего до 18:00.',
    ['Что попробовать?', 'Забронировать стол'])],

  [/соцсет|вконтакт|вк|телеграм|инстаг|подпис|группа|новост/i, () => say(
    `Мы тут:<br><a href="${LINKS.vk}" target="_blank" rel="noopener">ВКонтакте — vk.com/pablopskov</a>
     <br><a href="${LINKS.tg}" target="_blank" rel="noopener">Telegram</a> · <a href="${LINKS.wa}" target="_blank" rel="noopener">WhatsApp</a>
     <br><a href="${LINKS.map}" target="_blank" rel="noopener">Яндекс Карты</a><br><br>Хештег — <em>#паблопсков</em>`,
    CHIPS_MAIN.slice(0, 4))],

  [/что попроб|посовет|подбер|подбор|рекоменд|не знаю|выбра|ещё вариант|еще вариант|голод/i, () => {
    pick = { i: 0, a: [] };
    typing(340, () => { bubble('Подберу за три вопроса.'); pickStep(); });
  }],

  [/спасиб|благодар|круто|класс|отлич/i, () => say('Рад помочь. Ждём в Пабло 🍺', CHIPS_MAIN.slice(0, 5))],
  [/привет|здрав|хай|добрый/i, () => say('Привет! Спрашивайте — про меню, бронь, трансляции или дорогу.', CHIPS_MAIN)],
];

function handle(text) {
  const q = text.trim();
  if (!q) return;
  bubble(esc(q), 'me');

  // шаг мастера подбора
  if (pick) {
    const s = PICK_STEPS[pick.i];
    const hit = s.opts.find(o => o.toLowerCase() === q.toLowerCase());
    if (hit) {
      pick.a[pick.i] = hit;
      pick.i++;
      return pick.i < PICK_STEPS.length ? pickStep() : pickResult();
    }
    pick = null;   // ушли из мастера — отвечаем обычным правилом
  }

  for (const [re, fn] of RULES) if (re.test(q)) return fn(q);

  // поиск по кухне
  const ql = q.toLowerCase();
  const words = ql.split(/\s+/).filter(w => w.length > 2);
  const match = t => t.toLowerCase().includes(ql) || words.some(w => t.toLowerCase().includes(w));
  const hits = ALL.filter(d => match(d.t)).slice(0, 4);
  if (hits.length) return say(`Нашёл в меню:<br>${hits.map(dishRow).join('')}`, ['Что попробовать?', 'Забронировать стол']);

  // поиск по бару
  const bars = BAR_ALL.filter(b => match(b.t)).slice(0, 5);
  if (bars.length) return say(`Есть в баре:<br>${bars.map(b =>
    `<br>• <b>${esc(b.t)}</b> — ${esc(rub(b.p))}<span style="color:var(--mut-2)"> · ${esc(b.g)}</span>`).join('')}`,
    ['Коктейли', 'Настойки', 'Забронировать стол']);

  say(`Не понял вопрос — но точно помогу голосом: <a href="tel:${PHONE}">+7 921 115-51-13</a>.
    <br>А пока попробуйте одну из кнопок ниже.`, CHIPS_MAIN);
}

/* открытие / закрытие */
let greeted = false;
function openAst() {
  ast.hidden = false; fab.classList.add('is-open'); fab.setAttribute('aria-expanded', 'true');
  $('#astDot').hidden = true;
  paintStatus();
  if (!greeted) {
    greeted = true;
    const s = status();
    bubble(`Привет! Я помощник Пабло.<br>Сейчас <em>${s.open ? 'открыто до ' + s.until : 'закрыто, откроем ' + s.at}</em>.
      <br><br>Подберу блюдо, расскажу про бронь, трансляции и дорогу.`);
    chips(CHIPS_MAIN);
  }
  setTimeout(() => $('#astInput').focus(), 200);
}
function closeAst() {
  ast.hidden = true; fab.classList.remove('is-open'); fab.setAttribute('aria-expanded', 'false');
}
fab.addEventListener('click', openAst);
$('#astClose').addEventListener('click', closeAst);
chipsBox.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') handle(e.target.textContent); });
$('#astForm').addEventListener('submit', e => {
  e.preventDefault();
  const i = $('#astInput');
  handle(i.value); i.value = '';
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !ast.hidden) closeAst(); });
// клик по блюду внутри чата — увести в меню и закрыть панель на мобильном
log.addEventListener('click', e => { if (e.target.closest('.msg__dish') && innerWidth < 860) closeAst(); });

paintStatus();
setInterval(paintStatus, 60000);
})();
