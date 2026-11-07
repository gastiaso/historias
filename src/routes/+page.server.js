// La portada lee el título y la entradilla de cada historia de su guion: no hay que copiarlos a mano.
import { cargarVivienda } from '$lib/vivienda/cargar.js';
import { aTexto } from '$lib/guion.js';

export function load() {
	const { guion, lineaEdicion } = cargarVivienda();
	return {
		historias: [
			{
				ruta: 'vivienda/',
				titulo: aTexto(guion.cabecera.titulo),
				entradilla: aTexto(guion.cabecera.entradilla),
				edicion: lineaEdicion
			}
		]
	};
}
