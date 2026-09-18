# Trasfega — plantilla de enoteca

> **Sitio de demostración.** «Trasfega, enoteca» es un **negocio ficticio**. El nombre,
> la dirección (Rúa da Barrica, 4 · Ferrol), el teléfono (981 00 00 46), el horario, los
> precios, las catas y la caja mensual son **datos de muestra inventados**. No
> corresponden a ningún negocio real. La página lleva `noindex, nofollow` a propósito.
>
> **Los ocho vinos tampoco existen**: bodegas y añadas inventadas, botellas dibujadas en
> SVG y «viño inventado» impreso en la propia etiqueta. Venta solo a mayores de 18 años.

**Demo:** https://alvarotaiagu.github.io/plantilla-enoteca-web/

---

## El concepto: «Cata a ciegas»

En una cata a ciegas la botella lleva una funda: pruebas el vino y solo al final ves qué
era y cuánto costaba. Es la mejor manera de quitarse los prejuicios de encima, y es el
argumento de venta de una enoteca pequeña que no compite en catálogo. Así que **toda la
web está tapada**:

- Las botellas salen **con la funda puesta** y un «¿?». La funda se levanta al pasar el
  dedo por encima, al enfocar con el teclado o al tocarla en el móvil.
- Las tres del hero **se destapan solas** al llegar a pantalla, una detrás de otra: es la
  demostración del gesto.
- La última de las cuatro fases de «Cómo se cata» es, literalmente, «La etiqueta», y
  dice que a veces el vino de nueve euros gana al de veinticinco.

Registro visual: papel crudo, granate de vino y oro viejo, con la display redonda de
Gabarito. Ni el verde tinta de la librería ni el marfil de la escuela de música.

## Mapa de secciones

| # | Sección | Qué hace |
|---|---|---|
| — | Hero | Tres botellas que se destapan solas y el aviso de mayoría de edad |
| 01 | La selección | Ocho vinos con funda, ficha y precio |
| 02 | Cómo se cata | Vista, nariz, boca y — al final — la etiqueta |
| 03 | Catas | Los **jueves reales** que vienen, calculados en vivo, con cuenta atrás |
| 04 | La caja | Tres planes de caja mensual, uno de ellos «a ciegas» |
| 05 | Visítanos | Formulario con casilla de 18 años, horario **en vivo** y mapa bajo clic |

## Recursos de movimiento

**0. Cortina de entrada.** **«Cata a ciegas»** — la botella se llena de vino de abajo arriba y después la funda se levanta entera. El borde de abajo es el hombro de la botella, así que lo que destapa no es una línea recta.

Es obligatoria en todas las plantillas (§5 del pliego) y está hecha para no dejar la
página tapada nunca: se retira al terminar la animación, se retira igual si el CDN de
GSAP no carga, se retira con `prefers-reduced-motion` y hay además un `setTimeout` de
5 s de red de seguridad. El `display` va en `.cortina:not([hidden])`, nunca en
`.cortina` a secas —si fuera a secas ganaría al atributo `hidden` y no se iría jamás.
El hero no entra hasta que la cortina va por la mitad (la constante `ESPERA` de
`main.js`), para que el relevo se vea como una sola cosa y no como dos animaciones
pegadas.

1. **Lenis** como único motor de scroll.
2. **La funda que se levanta** — el recurso protagonista, en CSS puro para que funcione
   sin GSAP, con teclado y en táctil.
3. **Destapado automático** de las tres del hero, en cadena.
4. **Titulares letra a letra**.
5. **Botones magnéticos** y **cursor** en forma de gota de vino.
6. **Calendario de catas** y **horario** en vivo.

## Rendimiento medido

`PerformanceObserver` de `longtask` en la pasada de verificación (Chromium, 1440×900,
recorrido completo con la rueda): **1 tarea larga, de 69 ms, al arrancar** (GSAP +
webfont) y **0 mientras se recorre la página**.

- **La cortina no añade tarea larga propia**: en la medición con cortina la tarea de
  arranque es de **67 ms**, del mismo orden que antes de ponerla, porque el gesto son
  transformaciones y opacidades, sin `blur` ni sombras por fotograma.

## Cómo reskinearlo a una enoteca real

1. **Las botellas se generan.** El script `genbotellas.js` que acompaña a la plantilla
   monta cada SVG a partir de un perfil (`bordelesa`, `borgona`, `alsacia`, `espumosa`),
   los colores del vidrio, la cápsula y la etiqueta, y un motivo. Para una tienda real lo
   normal es sustituirlos por fotos de producto: basta cambiar el `<img>` de dentro de
   `.botella__caja` y **dejar el `<span class="botella__funda">`**, que es lo que da el
   concepto.
2. **La funda se ajusta al cuerpo de la botella**, no a la caja: está en porcentajes
   (`left/right: 25%`, `top: 34%`) calculados sobre el viewBox de los dibujos. Con fotos
   de producto habrá que reajustar esos cuatro números una vez.
3. **Catas** — la sección 5 de `js/main.js` busca los próximos jueves; si las catas son
   otro día, se cambia el `getDay() === 4`. Los temas están en el array `TEMAS`.
4. **Datos del negocio** — el `application/ld+json` del `<head>`, la sección
   «Visítanos», el `<footer>` y la consulta del mapa (sección 11 de `js/main.js`).
   Quitar `noindex, nofollow` y el sello de demostración.
5. **Horario** — sección 8 de `js/main.js`, en minutos desde medianoche, `0 = domingo`.
6. **Paleta y tipografía** — las variables de `:root` en `css/estilo.css`.

## Decisiones tomadas

- **Ningún vino real.** Ni marcas, ni bodegas, ni consejos reguladores: las comarcas que
  se citan son lugares y nada más. Las etiquetas dicen «viño inventado» dentro del propio
  dibujo.
- **Mayoría de edad en cinco sitios**: portada, catas, caja, formulario (con casilla que
  bloquea el envío) y pie. Y se dice que una web real de venta de alcohol debería
  comprobar la edad de verdad, no solo pedir una casilla.
- **No se anima a beber**: se habla de escupidera, de agua y de no conducir.
- **Sin `aggregateRating` ni `review`** en los datos estructurados.
- **La funda funciona sin JavaScript de animación**: es CSS, con `:hover`,
  `:focus-within` y una clase que pone el JS al tocar.
- **Con `prefers-reduced-motion`** la funda sigue destapando, pero sin recorrido.
- **Sin GSAP la página se lee entera**: los estados «vacíos» viven bajo `.has-motion`.

## Créditos

Ver [`CREDITOS.md`](CREDITOS.md). No hay fotografías: todo es dibujo propio.

## Técnico

HTML + CSS + un `main.js`. Sin framework, sin build, sin backend, sin npm. GSAP,
ScrollTrigger y Lenis por CDN. Se abre con doble clic en `index.html` y se publica tal
cual en GitHub Pages.
