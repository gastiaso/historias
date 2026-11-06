// Lee un guion en Markdown (guiones/*.md) y lo convierte en la historia: cabecera, pasos con su texto en HTML y
// rótulos de los gráficos. Se ejecuta al construir el sitio; el navegador recibe el texto ya escrito.

import { Marked } from 'marked';
import { decimal, entero, porcentaje } from '$lib/formato.js';

const marked = new Marked({ async: false, gfm: true });

/** Nombre reservado: el apartado «## rotulos» no es un paso, sino los textos cortos de los gráficos. */
const ROTULOS = 'rotulos';

/** Distancia de edición entre dos nombres, para sugerir el que se quería escribir. */
function distancia(a, b) {
	let fila = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++) {
		const nueva = [i];
		for (let j = 1; j <= b.length; j++) {
			nueva[j] = Math.min(fila[j] + 1, nueva[j - 1] + 1, fila[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		}
		fila = nueva;
	}
	return fila[b.length];
}

function parecidos(nombre, lista) {
	return lista
		.map((n) => ({ n, d: distancia(nombre, n) }))
		.filter((x) => x.d <= 3)
		.sort((x, y) => x.d - y.d)
		.slice(0, 3)
		.map((x) => x.n);
}

/**
 * Una cifra lista para escribir: su texto, su margen (si lo tiene) y su clase de color.
 * @param {import('$lib/vivienda/cifras.js').Cifra} c @param {string | undefined} mod @param {string} marca
 */
function prepararCifra(c, mod, marca) {
	if (c.tipo === null) {
		if (mod) throw new Error(`${marca}: «:${mod}» solo vale para porcentajes.`);
		return { texto: c.texto, margen: '', clase: 'cifra' };
	}
	const margen = c.lo != null && c.hi != null ? `${decimal(c.lo)}–${porcentaje(c.hi)}` : '';
	let texto;
	if (!mod) texto = porcentaje(c.v);
	else if (mod === '0') texto = porcentaje(c.v, 0);
	else if (mod === 'margen') {
		if (!margen) throw new Error(`${marca}: esta cifra no trae margen en los datos.`);
		texto = margen;
	} else throw new Error(`${marca}: «:${mod}» no existe; se puede usar «:0» o «:margen».`);
	const clase = { esp: 'cifra espana', per: 'cifra personal', pct: 'cifra' }[c.tipo];
	const nota = margen ? `Margen de error al 95 %: ${margen}${c.n ? `. ${entero(c.n)} entrevistas` : ''}` : '';
	return { texto, margen: nota, clase };
}

/** Sustituye las marcas {nombre} y {nombre:modo}: en HTML (texto de los pasos) o en texto llano (rótulos). */
function rellenar(texto, cifras, donde, html = true) {
	return texto.replace(/\{([^{}\n]*)\}/g, (marca, dentro) => {
		const [nombre, mod, ...sobra] = dentro.split(':').map((s) => s.trim());
		const lugar = `${donde}, ${marca}`;
		if (sobra.length) throw new Error(`${lugar}: sobra un «:».`);
		const c = cifras[nombre];
		if (!c) {
			const p = parecidos(nombre, Object.keys(cifras)).map((n) => `{${n}}`);
			throw new Error(`${lugar}: no hay ninguna cifra llamada «${nombre}».${p.length ? ` ¿Querías decir ${p.join(', ')}?` : ''} La lista completa está en src/lib/vivienda/cifras.js y, cuando el guion no tiene errores, al pie de la historia.`);
		}
		const x = prepararCifra(c, mod, lugar);
		if (!html) return x.texto;
		return x.margen
			? `<span class="${x.clase}" data-margen="${x.margen}" tabindex="0">${x.texto}</span>`
			: `<span class="${x.clase}">${x.texto}</span>`;
	});
}

/** Porcentajes escritos a mano (fuera de las llaves): se avisa, no se impide. */
function aMano(texto, donde) {
	// «al 95 %» es el nivel de confianza del margen, no un dato; las direcciones de los enlaces tampoco cuentan.
	const limpio = texto
		.replace(/\{[^{}\n]*\}/g, '')
		.replace(/\]\([^)]*\)/g, ']')
		.replace(/https?:\/\/\S+/g, '')
		.replace(/al 95\s?%/g, '');
	return [...limpio.matchAll(/\d+(?:[.,]\d+)?\s?%/g)].map((m) => `${donde}: «${m[0]}» parece un porcentaje escrito a mano.`);
}

/** Líneas «campo: texto» (cabecera y rótulos). */
function campos(bloque, donde) {
	/** @type {Record<string, string>} */
	const salida = {};
	for (const linea of bloque.split('\n')) {
		if (!linea.trim()) continue;
		const i = linea.indexOf(':');
		if (i < 0) throw new Error(`${donde}: la línea «${linea.trim()}» no tiene la forma «campo: texto».`);
		salida[linea.slice(0, i).trim()] = linea.slice(i + 1).trim();
	}
	return salida;
}

/**
 * @param {string} fuente texto del guion
 * @param {Record<string, import('$lib/vivienda/cifras.js').Cifra>} cifras
 * @param {Record<string, string>} estados estados válidos del gráfico
 * @param {Record<string, string>} rotulos rótulos que necesitan los gráficos, con lo que es cada uno
 */
export function leerGuion(fuente, cifras, estados, rotulos) {
	const texto = fuente.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '').trimStart();
	/** @type {string[]} */
	const avisos = [];

	// Cabecera
	const m = texto.match(/^---\n([\s\S]*?)\n---\n/);
	if (!m) throw new Error('El guion tiene que empezar con la cabecera entre dos líneas «---».');
	/** @type {Record<string, string>} */
	const cabecera = {};
	for (const [campo, valor] of Object.entries(campos(m[1], 'Cabecera'))) {
		avisos.push(...aMano(valor, `Cabecera (${campo})`));
		cabecera[campo] = /** @type {string} */ (marked.parseInline(rellenar(valor, cifras, `Cabecera (${campo})`)));
	}
	for (const campo of ['titulo', 'entradilla']) {
		if (!cabecera[campo]) throw new Error(`Cabecera: falta «${campo}».`);
	}

	// Pasos y rótulos
	const partes = texto.slice(m[0].length).split(/^## +/m);
	if (partes[0].trim()) throw new Error('Hay texto antes del primer paso («## nombre»).');
	const pasos = [];
	/** @type {Record<string, string> | null} */
	let rot = null;
	for (const parte of partes.slice(1)) {
		const salto = parte.indexOf('\n');
		const nombre = (salto < 0 ? parte : parte.slice(0, salto)).trim();
		const cuerpo = salto < 0 ? '' : parte.slice(salto + 1);

		if (nombre === ROTULOS) {
			if (rot) throw new Error('Hay dos apartados «## rotulos».');
			rot = {};
			for (const [clave, valor] of Object.entries(campos(cuerpo, 'Rótulos'))) {
				if (!(clave in rotulos)) {
					const p = parecidos(clave, Object.keys(rotulos));
					throw new Error(`Rótulos: «${clave}» no se usa en ningún gráfico.${p.length ? ` ¿Querías decir «${p[0]}»?` : ''}`);
				}
				avisos.push(...aMano(valor, `Rótulos (${clave})`));
				rot[clave] = rellenar(valor, cifras, `Rótulos (${clave})`, false);
			}
			continue;
		}

		const donde = `Paso ${pasos.length + 1} («${nombre}»)`;
		if (!(nombre in estados)) {
			const p = parecidos(nombre, Object.keys(estados));
			throw new Error(`${donde}: el gráfico «${nombre}» no existe.${p.length ? ` ¿Querías decir «${p[0]}»?` : ''} Los válidos son: ${Object.keys(estados).join(', ')}.`);
		}
		if (!cuerpo.trim()) throw new Error(`${donde}: no tiene texto.`);
		avisos.push(...aMano(cuerpo, donde));
		pasos.push({ grafico: nombre, html: /** @type {string} */ (marked.parse(rellenar(cuerpo, cifras, donde))) });
	}
	if (!pasos.length) throw new Error('El guion no tiene ningún paso («## nombre»).');
	if (!rot) throw new Error('Falta el apartado «## rotulos», con los textos cortos de los gráficos.');
	const faltan = Object.keys(rotulos).filter((k) => !rot[k]);
	if (faltan.length) throw new Error(`Rótulos: faltan ${faltan.map((k) => `«${k}»`).join(', ')}.`);

	return { cabecera, pasos, rotulos: rot, avisos };
}
