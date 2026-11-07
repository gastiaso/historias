// Formato de cifras en castellano: coma decimal, punto de millares (desde 10.000) y espacio fino antes de «%».

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** 43.6 → «43,6» */
export const decimal = (v, dec = 1) =>
	v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** 43.6 → «43,6 %» (con espacio que no se parte) */
export const porcentaje = (v, dec = 1) => decimal(v, dec) + ' %';

/** 264081 → «264.081» */
export const entero = (v) => Math.round(v).toLocaleString('es-ES');

/** «2024-05» → «mayo de 2024» */
export const mes = (aaaamm) => {
	const [a, m] = aaaamm.split('-').map(Number);
	return `${MESES[m - 1]} de ${a}`;
};
