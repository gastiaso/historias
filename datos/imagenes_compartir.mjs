// Imágenes para compartir (1200 × 630 px) en static/compartir/: sitio.png (portada) y vivienda.png (historia).
// Se dibujan con los datos de static/datos/, el título del guion y el nombre del sitio (src/lib/sitio.js), en una
// página HTML que un navegador sin ventana (Edge o Chrome) convierte en PNG. Las fuentes van incrustadas.
//
// Uso, desde la carpeta historias:
//   npm run compartir
// Si el navegador no está en su sitio habitual, se indica con la variable NAVEGADOR (ruta al ejecutable).
//
// Hay que volver a generarlas si cambia el título del guion, el nombre del sitio o los datos.

import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NOMBRE, DESCRIPCION, URL_SITIO } from '../src/lib/sitio.js';
import { azarFijo, numeroMes } from '../src/lib/graficos/comun.js';

const ANCHO = 1200;
const ALTO = 630;

// Los mismos colores que el modo claro de src/lib/estilos/base.css
const C = {
	papel: '#f3eee4', tinta: '#1d1a16', tinta2: '#5b544b', tinta3: '#6e665b', raya: '#d8cfbf',
	teja: '#b3401f', banda: 'rgba(179,64,31,.16)', nube: 'rgba(120,106,88,.38)'
};

const NAVEGADORES = [
	process.env.NAVEGADOR,
	'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
	'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
].filter(Boolean);
const navegador = NAVEGADORES.find((p) => existsSync(p));
if (!navegador) throw new Error('No encuentro Edge ni Chrome. Indica la ruta con la variable NAVEGADOR.');

const leer = (ruta) => readFileSync(resolve(ruta));
const json = (ruta) => JSON.parse(leer(ruta).toString('utf8'));
const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const woff2 = (ruta) => leer(join('node_modules', ruta)).toString('base64');

const NEWSREADER = woff2('@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2');
const PUBLIC_SANS = woff2('@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2');
const direccion = URL_SITIO.replace(/^https?:\/\//, '');

const pagina = (contenido) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:Newsreader;src:url(data:font/woff2;base64,${NEWSREADER}) format('woff2');font-weight:200 800;font-display:block}
@font-face{font-family:PublicSans;src:url(data:font/woff2;base64,${PUBLIC_SANS}) format('woff2');font-weight:100 900;font-display:block}
*{box-sizing:border-box}
html,body{margin:0;width:${ANCHO}px;height:${ALTO}px;overflow:hidden;background:${C.papel};color:${C.tinta}}
.texto{position:absolute;left:64px;top:62px;width:560px}
.k{font:600 17px/1.3 PublicSans;letter-spacing:.08em;text-transform:uppercase;color:${C.tinta3};margin:0}
h1{font:500 58px/1.07 Newsreader;letter-spacing:-.01em;margin:18px 0 0;font-optical-sizing:auto}
.d{font:400 25px/1.36 Newsreader;color:${C.tinta2};margin:22px 0 0}
.url{position:absolute;left:64px;bottom:52px;font:500 19px/1 PublicSans;color:${C.tinta2}}
svg{position:absolute;left:0;top:0}
text{font-family:PublicSans}
</style></head><body>${contenido}</body></html>`;

// --- La vivienda: título del guion y la línea del problema de España ----------------------------------------

function tarjetaVivienda() {
	const guion = leer('guiones/vivienda.md').toString('utf8').replace(/\r\n?/g, '\n');
	const titulo = guion.match(/^titulo:\s*(.+)$/m)?.[1].trim();
	if (!titulo) throw new Error('El guion no tiene «titulo:» en la cabecera.');
	if (titulo.includes('{')) throw new Error('El título del guion lleva cifras entre llaves: la imagen solo admite texto.');

	const s = json('static/datos/vivienda/serie.json');
	const año0 = Number(s.meses[0].slice(0, 4));
	const xs = s.meses.map((m) => numeroMes(m, año0));
	const [x0, x1, y0, y1, ymax] = [712, 1136, 168, 512, 60];
	const d0 = xs[0] - 0.5;
	const d1 = xs[xs.length - 1] + 0.5;
	const X = (m) => x0 + ((m - d0) / (d1 - d0)) * (x1 - x0);
	const Y = (v) => y1 - (v / ymax) * (y1 - y0);
	const punto = (m, v) => `${X(m).toFixed(1)},${Y(v).toFixed(1)}`;

	const linea = xs.map((m, i) => `${i ? 'L' : 'M'}${punto(m, s.esp.v[i])}`).join('');
	const banda = `M${xs.map((m, i) => punto(m, s.esp.hi[i])).join('L')}L${xs.map((m, i) => punto(m, s.esp.lo[i])).reverse().join('L')}Z`;
	const xr = X(numeroMes(s.rupturas[0].mes, año0));
	const rejilla = [0, 20, 40, 60].map((g) =>
		`<line x1="${x0}" x2="${x1}" y1="${Y(g)}" y2="${Y(g)}" stroke="${C.raya}"/>` +
		`<text x="${x0 - 10}" y="${Y(g) + 5}" text-anchor="end" font-size="15" fill="${C.tinta3}">${g}${g === 60 ? ' %' : ''}</text>`).join('');
	const años = [año0, año0 + Math.floor(xs[xs.length - 1] / 12)].map((a, k) =>
		`<text x="${k ? x1 : x0}" y="${y1 + 26}" text-anchor="${k ? 'end' : 'start'}" font-size="15" fill="${C.tinta3}">${a}</text>`).join('');

	const svg = `<svg width="${ANCHO}" height="${ALTO}">
		<line x1="${x0}" x2="${x0 + 26}" y1="${y0 - 44}" y2="${y0 - 44}" stroke="${C.teja}" stroke-width="3"/>
		<text x="${x0 + 36}" y="${y0 - 39}" font-size="16" font-weight="600" fill="${C.tinta}">La vivienda como problema de España</text>
		${rejilla}${años}
		<line x1="${xr}" x2="${xr}" y1="${y0 - 6}" y2="${y1}" stroke="${C.tinta2}" stroke-dasharray="3 4"/>
		<path d="${banda}" fill="${C.banda}"/>
		<path d="${linea}" fill="none" stroke="${C.teja}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
	</svg>`;

	return pagina(`${svg}
		<div class="texto"><p class="k">${escapar(NOMBRE)}</p><h1>${escapar(titulo)}</h1></div>
		<div class="url">${escapar(direccion)}/vivienda</div>`);
}

// --- El sitio: nombre, descripción y la nube gris de entrevistas ------------------------------------------

function tarjetaSitio() {
	const p = json('static/datos/vivienda/puntos.json');
	const nb = Math.max(...p.mes) + 1;
	const [x0, x1, y0, y1] = [680, 1140, 56, 574];
	let puntos = '';
	// Uno de cada dos puntos: con todos, a este tamaño, la nube se vuelve una mancha.
	for (let i = 0; i < p.mes.length; i += 2) {
		const x = x0 + ((p.mes[i] + 0.04 + (0.92 * p.dia[i]) / 100) / nb) * (x1 - x0);
		const y = y0 + azarFijo(i) * (y1 - y0);
		puntos += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7"/>`;
	}
	return pagina(`<svg width="${ANCHO}" height="${ALTO}"><g fill="${C.nube}">${puntos}</g></svg>
		<div class="texto"><h1>${escapar(NOMBRE)}</h1><p class="d">${escapar(DESCRIPCION)}</p></div>
		<div class="url">${escapar(direccion)}</div>`);
}

// --- Fotografiar ---------------------------------------------------------------------------------------------

const temporal = mkdtempSync(join(tmpdir(), 'compartir-'));
mkdirSync(resolve('static', 'compartir'), { recursive: true });

function fotografiar(nombre, html) {
	const archivo = join(temporal, `${nombre}.html`);
	writeFileSync(archivo, html);
	const salida = resolve('static', 'compartir', `${nombre}.png`);
	execFileSync(navegador, [
		'--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
		'--force-device-scale-factor=1', `--user-data-dir=${join(temporal, 'perfil')}`,
		`--window-size=${ANCHO},${ALTO}`, '--virtual-time-budget=5000', `--screenshot=${salida}`,
		pathToFileURL(archivo).href
	], { stdio: 'pipe' });
	const png = readFileSync(salida);
	const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
	if (w !== ANCHO || h !== ALTO) throw new Error(`${nombre}.png mide ${w} × ${h} y debería medir ${ANCHO} × ${ALTO}.`);
	console.log(`static/compartir/${nombre}.png · ${w} × ${h} · ${Math.round(png.length / 1024)} KB`);
}

try {
	fotografiar('sitio', tarjetaSitio());
	fotografiar('vivienda', tarjetaVivienda());
} finally {
	rmSync(temporal, { recursive: true, force: true });
}
