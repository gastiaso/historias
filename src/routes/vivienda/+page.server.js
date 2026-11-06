// La historia se arma al construir el sitio: guion + cifras de los JSON. El navegador recibe el texto ya escrito
// y los datos de la serie y los grupos para dibujar; la nube de puntos la descarga aparte.
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import fuente from '$guiones/vivienda.md?raw';
import serie from '$datos/vivienda/serie.json';
import grupos from '$datos/vivienda/grupos.json';
import puntos from '$datos/vivienda/puntos.json';
import { leerGuion } from '$lib/guion.js';
import { cifrasVivienda } from '$lib/vivienda/cifras.js';
import { ESTADOS, ROTULOS } from '$lib/vivienda/estados.js';
import { escribirLista } from '$lib/vivienda/lista.js';
import { mes } from '$lib/formato.js';

export function load() {
	let cifras, guion;
	try {
		cifras = cifrasVivienda(serie, grupos, puntos);
		guion = leerGuion(fuente, cifras, ESTADOS, ROTULOS);
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
		lineaEdicion: `Datos de ${mes(E.desde)} a ${mes(E.hasta)}`,
		// Solo mientras se escribe (npm run dev): la lista de cifras y los avisos. No se publican.
		ayuda: dev ? { cifras: escribirLista(cifras), estados: ESTADOS, rotulos: ROTULOS, avisos: guion.avisos } : null
	};
}
