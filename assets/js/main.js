/* Ess'Sens · animations de la page (GSAP + ScrollTrigger + Lenis) */
{
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const PHONE = '2290167156685';

/* liens WhatsApp pré-remplis */
$$('[data-msg]').forEach(a => { a.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(a.dataset.msg); a.target = '_blank'; a.rel = 'noopener'; });

/* contrôle d'âge */
const gate = $('#gate');
let ok = false; try { ok = sessionStorage.getItem('ess-age') === '1'; } catch (e) {}
if (ok) gate.hidden = true; else $('#yes').focus();
$('#yes').addEventListener('click', () => { gate.hidden = true; try { sessionStorage.setItem('ess-age', '1'); } catch (e) {} });
$('#no').addEventListener('click', () => { gate.querySelector('p').textContent = 'Revenez nous voir à votre majorité. En attendant, nos cocktails sans alcool vous attendent chez un adulte de confiance.'; });

/* nav opaque après le premier écran */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('solid', scrollY > innerHeight * .6);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => innerWidth <= 700;
const chaps = $$('.chap'), dots = $$('.dots i');
const showChap = i => { chaps.forEach((c, k) => { c.style.opacity = k === i ? 1 : 0; c.style.visibility = k === i ? 'visible' : 'hidden'; }); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };

if (!window.gsap || !window.ScrollTrigger) {
  /* secours sans bibliothèque : la scène reste lisible */
  showChap(0);
  addEventListener('scroll', () => { const r = $('#story').getBoundingClientRect(); const p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight))); showChap(Math.min(3, Math.floor(p * 4))); }, { passive: true });
} else {
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduce) {
    try { const lenis = new Lenis({ lerp: .085 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = a.getAttribute('href'); if (t.length > 1 && $(t)) { e.preventDefault(); lenis.scrollTo(t === '#top' ? 0 : t); } }));
    } catch (e) {}
  }
  const F = k => $(`.fl[data-k="${k}"]`);
  const fruits = ['f1', 'f2', 'f3', 'f4'].map(F), spices = ['s1', 's2'].map(F), back = ['b1', 'b2'].map(F);

  /* entrée du héros */
  gsap.from('#bottle', { y: 120, opacity: 0, duration: 1.4, ease: 'power3.out' });
  gsap.from('#cluster', { y: 160, opacity: 0, duration: 1.4, delay: .15, ease: 'power3.out' });
  gsap.from(chaps[0].children, { y: 40, opacity: 0, duration: 1, stagger: .1, delay: .3, ease: 'power3.out' });
  gsap.set(spices, { opacity: 0, scale: .4 });
  gsap.set(fruits, { opacity: 0, scale: .3 });
  showChap(0);

  const mm = gsap.matchMedia();
  mm.add({ d: '(min-width:701px)', m: '(max-width:700px)' }, ctx => {
    const d = ctx.conditions.d;
    gsap.set('#bottle', { x: d ? '14vw' : 0 });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: .8,
      onUpdate: s => { const p = s.progress; showChap(p < .2 ? 0 : p < .45 ? 1 : p < .72 ? 2 : 3); $('#cue').style.opacity = p < .04 ? 1 : 0; } } });
    /* 1 · fruits : la bouteille glisse, les fruits explosent autour */
    tl.to('#cluster', { y: '40vh', opacity: 0, duration: 1 }, 0)
      .to('#bottle', { x: d ? '-20vw' : 0, rotate: -8, scale: d ? 1 : .9, duration: 1 }, 0)
      .to('.giant', { x: '-18vw', duration: 3 }, 0)
      .fromTo(fruits, { opacity: 0, scale: .3, x: 0, y: 0, rotate: 0 }, { opacity: 1, scale: 1, x: i => [d ? -260 : -60, 140, -120, 200][i], y: i => [-40, -80, 40, 110][i], rotate: i => [-30, 40, -60, 25][i], duration: 1, stagger: .05 }, .15)
      .to(back, { y: -120, duration: 3 }, 0)
    /* 2 · épices : on bascule dans l'ambre */
      .to(fruits, { opacity: 0, scale: 1.6, x: i => [-700, 600, -600, 700][i], y: i => [-300, -200, 400, 300][i], rotate: '+=90', duration: 1 }, 1.2)
      .to('#bottle', { x: d ? '18vw' : 0, rotate: 7, duration: 1 }, 1.2)
      .to('.tint', { opacity: .9, duration: 1 }, 1.2)
      .to('.bokeh.b2', { opacity: .45, duration: 1 }, 1.2)
      .to('.bokeh:not(.b2)', { opacity: .1, duration: 1 }, 1.2)
      .fromTo(spices, { opacity: 0, scale: .4, rotate: -90 }, { opacity: 1, scale: 1, rotate: 30, x: i => [d ? 0 : -40, -60][i], y: i => [0, -40][i], duration: 1, stagger: .1 }, 1.4)
    /* 3 · recette : gros plan sur l'étiquette */
      .to(spices, { opacity: 0, scale: 2, rotate: '+=120', y: '-=300', duration: .8 }, 2.4)
      .to('.tint', { opacity: 0, duration: .8 }, 2.4)
      .to('.bokeh.b2', { opacity: 0, duration: .8 }, 2.4)
      .to('.bokeh:not(.b2)', { opacity: .38, duration: .8 }, 2.4)
      .to('#bottle', { x: d ? '20vw' : 0, y: d ? '-2vh' : '-4vh', rotate: 0, scale: d ? 1.55 : 1.25, duration: 1 }, 2.4)
      .to('.glow', { scale: 1.5, opacity: .6, duration: 1 }, 2.4)
      .to({}, { duration: .6 });
    return () => tl.kill();
  });

  /* parallaxe souris sur les fruits (desktop) */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    const layers = $$('.fl img').map((el, i) => ({ el, d: el.parentElement.classList.contains('blur-layer') ? 10 : 26 + (i % 3) * 8 }));
    const qx = layers.map(l => gsap.quickTo(l.el, 'x', { duration: .9, ease: 'power3' })), qy = layers.map(l => gsap.quickTo(l.el, 'y', { duration: .9, ease: 'power3' }));
    const bx = gsap.quickTo('#bottle img', 'rotateY', { duration: 1, ease: 'power3' });
    addEventListener('pointermove', e => { const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      layers.forEach((l, i) => { qx[i](nx * l.d); qy[i](ny * l.d); }); bx(nx * 14); });
  }
  /* bouteille qui flotte doucement */
  if (!reduce) gsap.to('#bottle img', { y: -12, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  /* cocktails : défilement horizontal sur grand écran */
  const hm = gsap.matchMedia();
  hm.add('(min-width:1024px)', () => {
    const wrap = $('#hwrap'), track = $('#track');
    wrap.classList.add('on');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true } });
    const par = $$('.ck .bg').map(bg => gsap.fromTo(bg, { xPercent: -3 }, { xPercent: 3, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true } }));
    ScrollTrigger.refresh();
    return () => { wrap.classList.remove('on'); tw.kill(); par.forEach(p => p.kill()); gsap.set(track, { x: 0 }); };
  });
  hm.add('(max-width:1023px)', () => {
    const a = $$('.ck').map(c => gsap.from(c, { y: 60, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 85%' } }));
    return () => a.forEach(x => x.kill());
  });

  /* apparitions douces */
  $$('.head, .tip, .offer, .rit .pic').forEach(el => gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  gsap.fromTo('.rit .pic img.b', { rotate: -10, y: 60 }, { rotate: 6, y: -30, ease: 'none', scrollTrigger: { trigger: '#rituel', start: 'top bottom', end: 'bottom top', scrub: true } });
  addEventListener('load', () => ScrollTrigger.refresh());
}
}
