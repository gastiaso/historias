// La historia se arma al construir el sitio: guion + cifras de los JSON. El navegador recibe el texto ya escrito
// y los datos para dibujar; la nube de puntos la descarga aparte.
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import fuente from '$guiones/vivienda.md?raw';
import serie from '$datos/vivienda/serie.json';
import grupos from '$datos/vivienda/grupos.json';
import puntos from '$datos/vivienda/puntos.json';
import mono from '$datos/vivienda/monografico.json';
import { leerGuion } from '$lib/guion.js';
import { cifrasVivienda } from '$lib/vivienda/cifras.js';
import { ESTADOS, ROTULOS } from '$lib/vivienda/estados.js';
import { escribirLista } from '$lib/vivienda/lista.js';
import { mes } from '$lib/formato.js';

/** Las situaciones elegidas en el rótulo «situaciones» tienen que existir en los datos. */
function comprobarSituaciones(guion) {
	const ids = guion.rotulos.situaciones.split(',').map((s) => s.trim().replace(/^m_/, '')).filter(Boolean);
	const hay = mono.situaciones.map((s) => s.id);
	const malas = ids.filter((id) => !hay.includes(id));
	if (malas.length) {
		throw new Error(`Rótulos (situaciones): no existen ${malas.map((x) => `«${x}»`).join(', ')}. Las válidas son: ${hay.join(', ')}.`);
	}
	if (!ids.length) throw new Error('Rótulos (situaciones): no hay ninguna situación elegida.');
	guion.rotulos.situaciones = ids;
}

export function load() {
	let cifras, guion;
	try {
		cifras = cifrasVivienda(serie, grupos, puntos, mono);
		guion = leerGuion(fuente, cifras, ESTADOS, ROTULOS);
		comprobarSituaciones(guion);
	} catch (e) {
		// Al escribir, el fallo se ve en la propia página; al construir, para la construcción con el mismo mensaje.
		if (dev) error(500, e.message);
		throw e;
	}
	const E = serie.edicion;
	return {
		guion,
		serie,
		grupos,
		mono,
		lineaEdicion: `Datos de ${mes(E.desde)} a ${mes(E.hasta)}`,
		// Solo mientras se escribe (npm run dev): la lista de cifras y los avisos. No se publican.
		ayuda: dev ? { cifras: escribirLista(cifras), estados: ESTADOS, rotulos: ROTULOS, avisos: guion.avisos } : null
	};
}
