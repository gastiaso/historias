// Arma la historia de la vivienda: guion + cifras de los JSON. Lo usan la propia historia y la portada del sitio.
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import fuente from '$guiones/vivienda.md?raw';
import serie from '$datos/vivienda/serie.json';
import grupos from '$datos/vivienda/grupos.json';
import puntos from '$datos/vivienda/puntos.json';
import mono from '$datos/vivienda/monografico.json';
import { leerGuion } from '$lib/guion.js';
import { cifrasVivienda } from './cifras.js';
import { ESTADOS, ROTULOS } from './estados.js';
import { mes } from '$lib/formato.js';

/** Los elementos de un rótulo que es una lista («a, b, c») tienen que existir en los datos. */
function lista(guion, clave, validos) {
	const ids = guion.rotulos[clave].split(',').map((s) => s.trim().replace(/^m_/, '')).filter(Boolean);
	const malos = ids.filter((id) => !validos.includes(id));
	if (malos.length) {
		throw new Error(`Rótulos (${clave}): no existen ${malos.map((x) => `«${x}»`).join(', ')}. Los válidos son: ${validos.join(', ')}.`);
	}
	if (!ids.length) throw new Error(`Rótulos (${clave}): la lista está vacía.`);
	guion.rotulos[clave] = ids;
}

export function cargarVivienda() {
	try {
		const cifras = cifrasVivienda(serie, grupos, puntos, mono);
		const guion = leerGuion(fuente, cifras, ESTADOS, ROTULOS);
		lista(guion, 'situaciones', mono.situaciones.map((s) => s.id));
		lista(guion, 'cruces', mono.cruces.map((c) => c.id));
		lista(guion, 'cohortes', [...mono.situaciones[0].edad.map((g) => g.g), '18-34', 'total']);
		const E = serie.edicion;
		return { cifras, guion, serie, grupos, mono, lineaEdicion: `Datos de ${mes(E.desde)} a ${mes(E.hasta)}` };
	} catch (e) {
		// Al escribir, el fallo se ve en la propia página; al construir, para la construcción con el mismo mensaje.
		if (dev) error(500, e.message);
		throw e;
	}
}
