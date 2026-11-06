// Todas las cifras que el guion de la vivienda puede citar por su nombre, leídas de los JSON.
// Cada cifra lleva una nota que dice qué es; con «npm run dev» se ven todas al pie de la historia.
// Para añadir una, basta copiar una línea parecida.

import { decimal, entero, mes } from '$lib/formato.js';

const EDAD = { '18-24': '18_24', '25-34': '25_34', '35-44': '35_44', '45-54': '45_54', '55-64': '55_64', '65 y más': '65_mas' };
const IDEO = {
	'Izquierda (1-2)': 'izq',
	'Centro izquierda (3-4)': 'centro_izq',
	'Centro (5-6)': 'centro',
	'Centro derecha (7-8)': 'centro_der',
	'Derecha (9-10)': 'der'
};
const SEXO = { Hombre: 'hombres', Mujer: 'mujeres' };
const MEDIDA = { esp: 'problema de España', per: 'problema personal' };

const clave = (tabla, g) => {
	if (!(g in tabla)) throw new Error(`Grupo desconocido en los datos: «${g}»`);
	return tabla[g];
};

/**
 * tipo: 'esp' y 'per' son porcentajes de vivienda (problema de España y personal), que salen en su color;
 * 'pct' es otro porcentaje, sin color; null es una cifra que ya viene escrita (un número, un mes).
 * @typedef {{ tipo: 'esp' | 'per' | 'pct' | null, v?: number, lo?: number, hi?: number, n?: number, texto?: string, nota: string }} Cifra
 */

/** @returns {Record<string, Cifra>} */
export function cifrasVivienda(serie, grupos, puntos) {
	/** @type {Record<string, Cifra>} */
	const c = {};
	const poner = (nombre, cifra) => {
		if (nombre in c) throw new Error(`Cifra repetida: ${nombre}`);
		c[nombre] = cifra;
	};
	/** Porcentaje de una medida (esp o per), con su margen cuando los datos lo traen. */
	const pct = (nombre, tipo, d, nota) =>
		poner(nombre, typeof d === 'number'
			? { tipo, v: d, lo: null, hi: null, n: null, nota }
			: { tipo, v: d.v, lo: d.lo, hi: d.hi, n: d.n, nota });
	const otra = (nombre, texto, nota) => poner(nombre, { tipo: null, texto, nota });
	const neutro = (nombre, v, nota) => poner(nombre, { tipo: 'pct', v, lo: null, hi: null, n: null, nota });

	const T = serie.texto;
	const E = serie.edicion;
	const ultima = T.medias[T.medias.length - 1];
	const ventana = `de ${mes(grupos.ventana.desde)} a ${mes(grupos.ventana.hasta)}`;

	// La serie
	otra('entrevistas', entero(E.entrevistas), 'Entrevistas en todos los barómetros de la serie');
	otra('barometros', entero(E.estudios), 'Barómetros de la serie');
	otra('primer_mes', mes(E.desde), 'Primer barómetro de la serie');
	otra('ultimo_mes', mes(E.hasta), 'Último barómetro de la serie');
	const ns = [...serie.n].sort((a, b) => a - b);
	otra('n_habitual', entero(Math.round(ns[Math.floor(ns.length / 2)] / 100) * 100),
		'Entrevistas de un barómetro corriente (mediana, redondeada a centenas)');
	otra('puntos_por_barometro', entero(puntos.por_mes), 'Puntos de la nube por barómetro, sin ponderar');
	otra('r10_mes', mes(serie.rupturas[0].mes), 'Desde este mes el CIS pondera también por estudios (R10)');
	otra('inicio_mes', mes(T.inicio_tramo.mes), 'Primer mes del tramo comparable actual (desde R10)');
	otra('anterior_mes', mes(T.anterior.mes), 'Penúltimo barómetro');
	otra('media_desde', mes(ultima.desde), 'Primer mes del último año');
	otra('media_hasta', mes(ultima.hasta), 'Último mes del último año');
	otra('salto_final', `${decimal(T.final.esp.v - T.anterior.esp.v)} puntos`,
		'Subida del problema de España del penúltimo al último barómetro');
	otra('primero_seguidos', entero(T.primero_esp.seguidos), 'Barómetros seguidos como primer problema de España');
	otra('primero_desde', mes(T.primero_esp.desde), 'Primer problema de España desde este mes');
	otra('cruce', mes(T.cruce), 'Desde este mes se cita más como problema de España que como problema personal');

	for (const k of /** @type {const} */ (['esp', 'per'])) {
		pct(`${k}_2021`, k, T.anyo2021[k], `Enero a julio de 2021 (barómetros anteriores a R30), ${MEDIDA[k]}`);
		pct(`${k}_inicio`, k, T.inicio_tramo[k], `${mes(T.inicio_tramo.mes)}, ${MEDIDA[k]}`);
		pct(`${k}_anterior`, k, T.anterior[k], `${mes(T.anterior.mes)}, ${MEDIDA[k]}`);
		pct(`${k}_final`, k, T.final[k], `${mes(T.final.mes)}, ${MEDIDA[k]}`);
		pct(`${k}_media`, k, ultima[k], `Media del último año (${mes(ultima.desde)} a ${mes(ultima.hasta)}), ${MEDIDA[k]}`);
		for (const m of T.medias) {
			pct(`${k}_media_${m.hasta.slice(0, 4)}`, k, m[k], `Media de ${mes(m.desde)} a ${mes(m.hasta)}, ${MEDIDA[k]}`);
		}
	}

	// Edad (último año)
	for (const r of grupos.edad) {
		const e = clave(EDAD, r.g);
		for (const k of /** @type {const} */ (['esp', 'per'])) pct(`${k}_${e}`, k, r[k], `${r.g} años, ${MEDIDA[k]}, ${ventana}`);
		if (r.per_anual.length !== T.medias.length) throw new Error('per_anual no tiene un dato por año');
		r.per_anual.forEach((v, i) => {
			const m = T.medias[i];
			pct(`per_${e}_${m.hasta.slice(0, 4)}`, 'per', v, `${r.g} años, ${MEDIDA.per}, de ${mes(m.desde)} a ${mes(m.hasta)} (sin margen)`);
		});
	}
	const porEsp = [...grupos.edad].sort((a, b) => a.esp.v - b.esp.v);
	pct('esp_edad_min', 'esp', porEsp[0].esp, `Grupo de edad que menos la cita como ${MEDIDA.esp} (${porEsp[0].g})`);
	pct('esp_edad_max', 'esp', porEsp[porEsp.length - 1].esp, `Grupo de edad que más la cita como ${MEDIDA.esp} (${porEsp[porEsp.length - 1].g})`);

	// Ideología (último año)
	grupos.ideologia.forEach((r, i) => {
		const g = clave(IDEO, r.g);
		for (const k of /** @type {const} */ (['esp', 'per'])) pct(`${k}_${g}`, k, r[k], `${r.g}, ${MEDIDA[k]}, ${ventana}`);
		for (const [ed, v] of Object.entries(r.esp_edad)) {
			pct(`esp_${g}_${clave(EDAD, ed)}`, 'esp', v, `${r.g} y ${ed} años, ${MEDIDA.esp} (sin margen)`);
		}
		otra(`edad_media_${g}`, `${entero(grupos.edad_media_ideo[i])} años`, `Edad media de ${r.g}`);
	});
	neutro('sin_ubicar', grupos.sin_ubicar, 'Entrevistados que no se sitúan en la escala ideológica (ponderado)');

	// Sexo (último año)
	for (const [s, d] of Object.entries(grupos.sexo)) {
		for (const k of /** @type {const} */ (['esp', 'per'])) pct(`${k}_${clave(SEXO, s)}`, k, d[k], `${s}, ${MEDIDA[k]}, ${ventana}`);
	}
	for (const r of grupos.sexo_edad) {
		for (const s of Object.keys(SEXO)) {
			pct(`per_${SEXO[s]}_${clave(EDAD, r.g)}`, 'per', r[s], `${s}, ${r.g} años, ${MEDIDA.per}, ${ventana}`);
		}
	}
	for (const [s, v] of Object.entries(grupos.jovenes_izq)) {
		neutro(`izq_jovenes_${clave(SEXO, s)}`, v, `${s}, 18 a 34 años: se sitúan entre 1 y 4 en la escala ideológica`);
	}

	return c;
}
