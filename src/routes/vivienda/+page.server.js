// La historia se arma al construir el sitio (ver $lib/vivienda/cargar.js). El navegador recibe el texto ya escrito
// y los datos para dibujar; la nube de puntos y el desglose de las medidas los descarga aparte.
import { dev } from '$app/environment';
import { cargarVivienda } from '$lib/vivienda/cargar.js';
import { ESTADOS, ROTULOS } from '$lib/vivienda/estados.js';
import { escribirLista } from '$lib/vivienda/lista.js';
import { aTexto } from '$lib/guion.js';

export function load() {
	const { cifras, guion, serie, grupos, mono, lineaEdicion } = cargarVivienda();
	return {
		guion,
		serie,
		grupos,
		// El desglose de las medidas (unos 120 KB) no va en la página: el panel lo descarga al abrirse.
		mono: { ...mono, medidas: mono.medidas.map(({ desglose, ...m }) => m) },
		lineaEdicion,
		compartir: { titulo: aTexto(guion.cabecera.titulo), descripcion: aTexto(guion.cabecera.entradilla) },
		// Solo mientras se escribe (npm run dev): la lista de cifras y los avisos. No se publican.
		ayuda: dev ? { cifras: escribirLista(cifras), estados: ESTADOS, rotulos: ROTULOS, avisos: guion.avisos } : null
	};
}
