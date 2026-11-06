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
	cierre: 'Las dos líneas completas, para cerrar',
	// Monográfico de junio de 2026
	junio: 'Los últimos meses ampliados, con junio de 2026 marcado: la lupa del monográfico',
	brecha: 'Por edad, dos encuestas: problema personal (barómetros) y «le perjudica» (monográfico)',
	situaciones: 'Situaciones vividas en los últimos cinco años: de 18 a 34 años frente a 65 y más (monográfico)',
	intervencion: 'Por ideología, dos encuestas: problema de España (barómetros) y «el Estado debe intervenir» (monográfico)',
	medidas: 'Apoyo a diez medidas: a favor, en contra y saldo (monográfico)'
};

// Estados que usan datos del monográfico (llevan su propia fuente al pie).
export const DEL_MONOGRAFICO = ['brecha', 'situaciones', 'intervencion', 'medidas'];

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
	fuente: 'Fuente y medida de los barómetros, al pie del gráfico',
	junio: 'Etiqueta de junio de 2026 en el paso «junio»',
	perjudica: 'Leyenda del paso «brecha»: «le perjudica», del monográfico',
	barometros: 'Leyenda del paso «brecha»: problema personal, de los barómetros',
	jovenes: 'Leyenda del paso «situaciones»: de 18 a 34 años',
	mayores: 'Leyenda del paso «situaciones»: 65 y más',
	situaciones: 'Qué situaciones salen en el paso «situaciones», separadas por comas (sus nombres están en la lista de cifras: m_<nombre>)',
	intervenir: 'Leyenda del paso «intervencion»: el Estado debe intervenir, del monográfico',
	favor: 'Leyenda del paso «medidas»: a favor',
	contra: 'Leyenda del paso «medidas»: en contra',
	saldo: 'Título de la columna de saldo en el paso «medidas»',
	fuente_monografico: 'Fuente y medida del monográfico, al pie del gráfico'
};
