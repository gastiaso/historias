// Grupos de edad del paso «situaciones»: su marca en el gráfico y sus nombres.
// Las seis edades son círculos en una gama de azules (de claro a oscuro: --edad-1 … --edad-6 en base.css),
// 18-34 es un cuadrado y el total, un rombo negro.

export const CLASE_COHORTE = {
	'18-24': 'e1',
	'25-34': 'e2',
	'35-44': 'e3',
	'45-54': 'e4',
	'55-64': 'e5',
	'65 y más': 'e6',
	'18-34': 'e12',
	total: 'tot'
};

/** Nombre largo, para el globo: «De 18 a 24 años». */
export const nombreCohorte = (id, total) =>
	id === 'total' ? total : id === '65 y más' ? '65 años y más' : `De ${id.replace('-', ' a ')} años`;

/** Nombre corto, para las casillas: «18–24». */
export const cortoCohorte = (id, total) => (id === 'total' ? total : id.replace('-', '–'));
