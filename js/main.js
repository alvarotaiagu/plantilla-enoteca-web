/* ==========================================================================
   Trasfega — enoteca (SITIO DE DEMOSTRACIÓN, negocio ficticio)
   Concepto «Cata a ciegas»: el recurso protagonista es la funda que tapa la
   etiqueta. Se levanta al pasar el dedo, al enfocar con el teclado y —las del
   hero— sola al llegar a pantalla, una detrás de otra.

   - `has-motion` solo se enciende si GSAP y ScrollTrigger existen de verdad.
   - La funda es CSS puro: funciona sin GSAP y con movimiento reducido.
   - Lo de «una sola vez» va con IntersectionObserver: un ScrollTrigger con
     once:true no dispara si el elemento ya está en pantalla al crearse.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = gsapReady && !reduce.matches;

  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    if (motion) raiz.classList.add('has-motion');
  }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function alEntrar(el, hacer, margen) {
    if (!('IntersectionObserver' in window)) { hacer(); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        hacer();
      });
    }, { rootMargin: margen || '0px 0px -8% 0px' });
    io.observe(el);
  }

  /* ── 1. Scroll suave ─────────────────────────────────────────────────── */
  var lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var destino = document.getElementById(id.slice(1));
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      if (lenis) lenis.scrollTo(destino, { offset: -70 });
      else destino.scrollIntoView();
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });

  /* ── 2. Las fundas (recurso protagonista) ────────────────────────────── */
  (function fundas() {
    // En táctil no hay hover: se destapan al tocar, y se vuelven a tapar al
    // tocar otra vez, que es justo el gesto de una cata a ciegas.
    $$('.botella, .vino').forEach(function (el) {
      el.addEventListener('click', function () { el.classList.toggle('esta-destapada'); });
    });

    // Las tres del hero se destapan solas al llegar, una detrás de otra.
    var hero = $('[data-hero-botellas]');
    if (!hero) return;
    var botellas = $$('.botella', hero);
    alEntrar(hero, function () {
      botellas.forEach(function (b, i) {
        setTimeout(function () { b.classList.add('esta-destapada'); }, 900 + i * 420);
      });
    }, '0px');
  })();

  /* ── 3. Titulares letra a letra ──────────────────────────────────────── */
  function partir(el) {
    var original = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', original);
    el.textContent = '';
    var letras = [];
    original.split(' ').forEach(function (palabra, i, todas) {
      var cont = document.createElement('span');
      cont.className = 'palabra';
      cont.setAttribute('aria-hidden', 'true');
      palabra.split('').forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'palabra__letra';
        s.textContent = c;
        cont.appendChild(s);
        letras.push(s);
      });
      el.appendChild(cont);
      if (i < todas.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return letras;
  }

  if (motion) {
    $$('[data-char]').forEach(function (el) {
      var letras = partir(el);
      // `y: 0` explícito: GSAP leería un translate heredado del CSS como px
      gsap.set(letras, { y: 0, yPercent: 70, opacity: 0 });
      var anim = { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.016 };
      if (el.closest('.hero')) gsap.to(letras, Object.assign({ delay: 0.15 }, anim));
      else alEntrar(el, function () { gsap.to(letras, anim); });
    });
  }

  /* ── 4. Entradas ─────────────────────────────────────────────────────── */
  if (motion) {
    [['.kicker', 12], ['.indice', 12], ['.parrafo', 14], ['.hero__entrada', 14],
     ['.hero__acciones', 14], ['.hero__aviso', 12], ['.hero__botellas .botella', 26],
     ['.vino', 22], ['.pasos li', 16], ['.cuenta', 14], ['.sesiones li', 10],
     ['.catas__nota', 18], ['.plan', 20], ['.formulario', 18], ['.donde', 16]
    ].forEach(function (par) {
      $$(par[0]).forEach(function (el, i) {
        var enHero = !!el.closest('.hero');
        var ajustes = {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          startAt: { y: par[1] },
          delay: enHero ? 0.35 + i * 0.09 : (i % 4) * 0.05
        };
        if (enHero) gsap.to(el, ajustes);
        else alEntrar(el, function () { gsap.to(el, ajustes); });
      });
    });
  }

  /* ── 5. Catas de los jueves (contenido vivo) ─────────────────────────── */
  (function catas() {
    var lista = $('[data-sesiones]');
    var dias = $('[data-dias]');
    var proxima = $('[data-proxima]');
    if (!lista) return;

    var TEMAS = [
      ['Seis tintos de la casa', 'Todos tapados, dos de ellos de la misma bodega'],
      ['Blancos con y sin madera', 'La misma uva, dos maneras de tratarla'],
      ['Rosados de verdad', 'Cuatro rosados y una discusión asegurada'],
      ['Caro contra barato', 'Tres parejas de vinos con diez euros de diferencia'],
      ['Burbujas', 'Método tradicional y método granvás, a ciegas'],
      ['Añadas', 'El mismo vino en tres años distintos']
    ];
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    function pintar() {
      var ahora = new Date();
      var fechas = [];
      var d = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      while (fechas.length < TEMAS.length) {
        if (d.getDay() === 4) {
          var fin = new Date(d.getTime()); fin.setHours(22, 0, 0, 0);
          if (fin > ahora) fechas.push(new Date(d.getTime()));
        }
        d.setDate(d.getDate() + 1);
      }

      lista.innerHTML = fechas.map(function (f, i) {
        var texto = 'Jueves ' + f.getDate() + ' de ' + MESES[f.getMonth()] + ' · 20:00';
        return '<li><span class="sesiones__fecha">' + texto + '</span>' +
          '<span class="sesiones__tema">' + TEMAS[i][0] + '<em style="display:block;font-style:normal;font-family:var(--mono);font-size:0.72rem;opacity:0.6">' +
          TEMAS[i][1] + '</em></span></li>';
      }).join('');

      if (dias && proxima) {
        var hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        var falta = Math.round((fechas[0] - hoy) / 86400000);
        dias.textContent = falta;
        proxima.textContent = (falta === 0 ? 'hoy mismo: ' : (falta === 1 ? 'día para ' : 'días para ')) +
          TEMAS[0][0].toLowerCase() + ' (' + fechas[0].getDate() + ' de ' + MESES[fechas[0].getMonth()] + ')';
      }
    }
    pintar();
    setInterval(pintar, 60 * 60 * 1000);
  })();

  /* ── 6. Botones magnéticos ───────────────────────────────────────────── */
  if (motion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-iman]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var c = el.getBoundingClientRect();
        qx((e.clientX - (c.left + c.width / 2)) * 0.3);
        qy((e.clientY - (c.top + c.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
      el.addEventListener('blur', function () { qx(0); qy(0); });
    });
  }

  /* ── 7. Cursor: una gota ─────────────────────────────────────────────── */
  (function cursor() {
    var el = $('[data-cursor]');
    if (!el || !motion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var texto = $('.cursor__texto', el);
    var qx = gsap.quickTo(el, 'x', { duration: 0.2, ease: 'power3.out' });
    var qy = gsap.quickTo(el, 'y', { duration: 0.2, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) { qx(e.clientX); qy(e.clientY); });

    var zonas = [
      ['.vino, .hero__botellas .botella', 'destapar'],
      ['.plan', 'la caja'],
      ['[data-mapa-boton]', 'cargar'],
      ['a, button, input, select', 'venga']
    ];
    document.addEventListener('pointerover', function (e) {
      for (var i = 0; i < zonas.length; i++) {
        if (e.target.closest(zonas[i][0])) {
          el.classList.add('es-grande');
          texto.textContent = zonas[i][1];
          return;
        }
      }
      el.classList.remove('es-grande');
      texto.textContent = '';
    });
  })();

  /* ── 8. Horario en vivo ──────────────────────────────────────────────── */
  (function horario() {
    var estado = $('[data-estado]');
    if (!estado) return;
    var filas = $$('[data-horario] > div');
    // Horario ficticio. 0 = domingo. Minutos desde medianoche.
    var HORARIO = {
      0: [], 1: [],
      2: [[660, 840], [1050, 1260]],
      3: [[660, 840], [1050, 1260]],
      4: [[660, 840], [1050, 1260]],
      5: [[660, 840], [1050, 1260]],
      6: [[660, 900], [1080, 1320]]
    };
    var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    function dd(n) { return String(n).padStart(2, '0'); }
    function txt(m) { return dd(Math.floor(m / 60)) + ':' + dd(m % 60); }

    function refrescar() {
      var ahora = new Date();
      var d = ahora.getDay();
      var min = ahora.getHours() * 60 + ahora.getMinutes();
      var cierra = null, abreHoy = null;
      HORARIO[d].forEach(function (t) {
        if (min >= t[0] && min < t[1]) cierra = t[1];
        else if (min < t[0] && abreHoy === null) abreHoy = t[0];
      });

      if (cierra !== null) {
        estado.textContent = 'Abierta ahora · hasta las ' + txt(cierra);
        estado.classList.add('esta-abierto');
      } else if (abreHoy !== null) {
        estado.textContent = 'Cerrada · abre hoy a las ' + txt(abreHoy);
        estado.classList.remove('esta-abierto');
      } else {
        var salto = 1;
        while (salto < 8 && HORARIO[(d + salto) % 7].length === 0) salto++;
        var dia = (d + salto) % 7;
        estado.textContent = 'Cerrada · abre el ' + DIAS[dia] + ' a las ' + txt(HORARIO[dia][0][0]);
        estado.classList.remove('esta-abierto');
      }
      filas.forEach(function (f) {
        var dias = (f.getAttribute('data-dias') || '').split(',');
        f.classList.toggle('es-hoy', dias.indexOf(String(d)) !== -1);
      });
    }
    refrescar();
    setInterval(refrescar, 30000);
  })();

  /* ── 9. Cabecera ─────────────────────────────────────────────────────── */
  (function cabecera() {
    var el = $('[data-cabecera]');
    if (!el) return;
    function mirar() { el.classList.toggle('esta-pegada', window.scrollY > 20); }
    mirar();
    window.addEventListener('scroll', mirar, { passive: true });
  })();

  /* ── 10. Menú móvil ──────────────────────────────────────────────────── */
  var boton = $('[data-menu-boton]');
  var menu = $('[data-menu]');
  function cerrarMenu() {
    if (!boton || !menu) return;
    boton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('esta-abierto');
  }
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('esta-abierto', !abierto);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  }

  /* ── 11. Mapa solo bajo clic ─────────────────────────────────────────── */
  (function mapa() {
    var caja = $('[data-mapa]');
    var btn = $('[data-mapa-boton]');
    if (!caja || !btn) return;
    btn.addEventListener('click', function () {
      var marco = document.createElement('iframe');
      marco.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Rúa da Barrica 4, Ferrol') + '&output=embed';
      marco.title = 'Mapa de la dirección de muestra: Rúa da Barrica, 4, Ferrol';
      marco.loading = 'lazy';
      marco.referrerPolicy = 'no-referrer-when-downgrade';
      btn.remove();
      caja.insertBefore(marco, caja.firstChild);
      if (gsapReady) ScrollTrigger.refresh();
    });
  })();

  /* ── 12. Formulario de cata (de muestra) ─────────────────────────────── */
  (function cata() {
    var form = $('[data-cata]');
    if (!form) return;
    var salida = $('[data-cata-estado]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.querySelector('#nombre');
      var tel = form.querySelector('#tel');
      var mayor = form.querySelector('#mayor');
      if (!nombre.value.trim()) { salida.textContent = 'Escribe un nombre para guardarte la plaza.'; nombre.focus(); return; }
      if (!tel.value.trim()) { salida.textContent = 'Hace falta un teléfono para confirmarte.'; tel.focus(); return; }
      if (!mayor.checked) { salida.textContent = 'Las catas son solo para mayores de 18 años: marca la casilla.'; mayor.focus(); return; }
      salida.textContent = 'Formulario de demostración: la plaza de ' + nombre.value.trim() + ' no se ha reservado en ningún sitio.';
    });
  })();

  /* ── 13. Aviso de cookies ────────────────────────────────────────────── */
  (function cookies() {
    var banner = $('[data-cookies]');
    if (!banner) return;
    var CLAVE = 'trasfega-cookies';
    var visto = null;
    try { visto = localStorage.getItem(CLAVE); } catch (err) { visto = null; }
    if (!visto) banner.hidden = false;
    var ok = $('[data-cookies-ok]', banner);
    if (ok) {
      ok.addEventListener('click', function () {
        banner.hidden = true;
        try { localStorage.setItem(CLAVE, '1'); } catch (err) { /* modo privado */ }
      });
    }
  })();

  /* ── 14. Refrescos ───────────────────────────────────────────────────── */
  if (gsapReady) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
