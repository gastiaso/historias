// Utilidades de los gráficos.

const MESES_CORTOS = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];

/** «2024-05» → número de mes desde enero del año base (para el eje del tiempo). */
export const numeroMes = (aaaamm, año0) => {
	const [a, m] = aaaamm.split('-').map(Number);
	return (a - año0) * 12 + (m - 1);
};

/** Etiqueta corta de un mes numerado desde enero del año base: «jul.», o «ene. 2026» en enero. */
export const mesCorto = (n, año0) => {
	const m = ((n % 12) + 12) % 12;
	return m === 0 ? `${MESES_CORTOS[0]} ${año0 + Math.floor(n / 12)}` : MESES_CORTOS[m];
};

/** Parte un texto en líneas de unos cuantos caracteres, para los rótulos en SVG. */
export function partir(texto, max) {
	const lineas = [];
	let actual = '';
	for (const palabra of texto.split(/\s+/)) {
		if (actual && (actual + ' ' + palabra).length > max) {
			lineas.push(actual);
			actual = palabra;
		} else actual = actual ? `${actual} ${palabra}` : palabra;
	}
	if (actual) lineas.push(actual);
	return lineas;
}

/** Valor aleatorio pero fijo para cada índice (posición vertical de los puntos de la nube). */
export const azarFijo = (i) => {
	const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return s - Math.floor(s);
};
