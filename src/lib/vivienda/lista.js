import { decimal, porcentaje } from '$lib/formato.js';

/** Lista de cifras para la ayuda al escribir: nombre, valor tal como sale en el texto y qué es. */
export function escribirLista(cifras) {
	return Object.entries(cifras).map(([nombre, c]) => ({
		nombre,
		tipo: c.tipo,
		valor: c.tipo === null ? c.texto : porcentaje(c.v),
		margen: c.tipo !== null && c.lo != null && c.hi != null ? `${decimal(c.lo)}–${porcentaje(c.hi)}` : '',
		nota: c.nota
	}));
}
