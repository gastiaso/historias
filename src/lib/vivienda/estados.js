// Qué puede mostrar el gráfico en cada paso de la historia de la vivienda.
// En el guion, cada «## nombre» elige uno de estos estados.
export const ESTADOS = {
	nube: 'Nube gris de entrevistas, sin ponderar',
	'nube-vivienda': 'La nube se colorea: quien cita la vivienda como problema de España',
	linea: 'La línea del problema de España, con R10 y los avisos marcados. La primera vez se dibuja con el scroll',
	'espana-personal': 'Dos líneas, problema de España y problema personal, que se cruzan',
	edad: 'Por edad: problema personal y problema de España',
	ideologia: 'Por ideología, de la izquierda a la derecha',
	sexo: 'Problema personal de mujeres y hombres dentro de cada grupo de edad',
	octubre: 'Los últimos meses ampliados: el salto de octubre de 2026',
	cierre: 'Las dos líneas completas, para cerrar'
};

// Textos cortos que usan los gráficos. Van en el apartado «## rotulos» del guion.
export const ROTULOS = {
	nube: 'Rótulo de la nube (tiene que decir que es una muestra sin ponderar)',
	espana: 'Leyenda: problema de España',
	personal: 'Leyenda: problema personal',
	r10: 'Marca de la ruptura de noviembre de 2023',
	avisos: 'Nota de los cuestionarios con preguntas de vivienda antes de la de problemas',
	media: 'Etiqueta de la media del último año, sobre la línea',
	cruce: 'Etiqueta del mes en que se cruzan las dos líneas',
	octubre: 'Nota junto al último dato, en el paso «octubre»',
	mujeres: 'Leyenda del gráfico por sexo',
	hombres: 'Leyenda del gráfico por sexo',
	sin_ubicar: 'Nota del gráfico de ideología sobre quien no se sitúa en la escala',
	fuente: 'Fuente y medida, al pie del gráfico'
};
