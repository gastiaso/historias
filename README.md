# historias

Historias contadas con los barómetros mensuales del CIS, a partir de [*Barómetro a barómetro*](https://gastiaso.github.io/barometros/). Se publica en <https://gastiaso.github.io/historias/>.

## Escribir una historia

Todo el texto de una historia está en un solo archivo: `guiones/vivienda.md`. Las instrucciones van al principio del propio archivo. En resumen:

- cada `## nombre` es un paso, y el nombre dice qué muestra el gráfico (`nube`, `linea`, `edad`…);
- el texto es Markdown;
- las cifras no se escriben a mano: `{esp_media}` se sustituye por el dato («43,6 %»), con su margen de error al pasar por encima o al tocarla;
- el apartado final `## rotulos` lleva los textos cortos de los gráficos (leyendas, notas, fuente).

Para verlo mientras se escribe:

```
npm install
npm run dev
```

y abrir <http://localhost:5173/historias/vivienda/>. La página se recarga al guardar el guion. Al pie aparece la lista de todas las cifras disponibles, y arriba, los porcentajes escritos a mano. Si un nombre no existe, la página dice cuál y sugiere el más parecido.

## Cómo está hecho

- `src/lib/motor/Historia.svelte`: el motor. Gráfico fijo a pantalla completa (en escritorio, a la derecha) y los pasos del guion, que suben por encima y cambian el estado del gráfico al cruzar una línea de la pantalla.
- `src/lib/vivienda/`: los gráficos de la vivienda (nube, serie y grupos), sus estados y sus cifras.
- `src/lib/guion.js`: lee el guion y rellena las cifras.
- Con `prefers-reduced-motion`, los estados cambian sin animación y la línea aparece entera.

## Datos

Las cifras se calculan de antemano con `datos/preparar_vivienda.py` (pandas y pyarrow), a partir del parquet publicado por *Barómetro a barómetro*, y se guardan en `static/datos/vivienda/`. En el navegador no se calcula nada.

```
python datos/preparar_vivienda.py RUTA/barometros_armonizados.parquet
```

## Construir

`npm run build` genera el sitio estático en `build/`. Si el guion cita una cifra que no existe, la construcción se detiene con el mismo mensaje.

## Licencias

Código con licencia MIT. Las fuentes Newsreader y Public Sans tienen licencia SIL Open Font License 1.1 y se sirven desde el propio sitio.
