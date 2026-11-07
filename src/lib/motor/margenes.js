// Globos de información: al pasar el ratón, al tocar o al llegar con el teclado a un elemento, aparece un globo
// con el texto de uno de sus atributos data-.
//   - En el texto: el margen de error de cada cifra (.cifra[data-margen], ver src/lib/guion.js). Es lo de serie.
//   - En los gráficos: el % y el n de cada dato ([data-globo]); se usa con { selector: '[data-globo]', dato: 'globo' }.
// Los elementos que ya hacen algo al pulsarlos (role="button") solo muestran el globo con el ratón.

/** @param {HTMLElement} nodo @param {{ selector?: string, dato?: string }} [opciones] */
export function margenes(nodo, opciones = {}) {
	const selector = opciones.selector ?? '.cifra[data-margen]';
	const dato = opciones.dato ?? 'margen';
	/** @type {HTMLDivElement | null} */
	let globo = null;
	/** @type {Element | null} */
	let actual = null;

	function mostrar(el) {
		if (!globo) {
			globo = document.createElement('div');
			globo.className = 'globo-margen';
			globo.setAttribute('role', 'tooltip');
			// Dentro de un <dialog> modal, el globo tiene que ir en el propio diálogo para verse por encima.
			(nodo.closest('dialog') ?? document.body).appendChild(globo);
		}
		actual = el;
		globo.textContent = el.getAttribute(`data-${dato}`);
		globo.hidden = false;
		const r = el.getBoundingClientRect();
		const g = globo.getBoundingClientRect();
		const x = Math.min(Math.max(8, r.left + r.width / 2 - g.width / 2), window.innerWidth - g.width - 8);
		const y = r.top - g.height - 6 < 8 ? r.bottom + 6 : r.top - g.height - 6;
		globo.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
	}

	function ocultar() {
		if (globo) globo.hidden = true;
		actual = null;
	}

	const objetivo = (e) => (e.target instanceof Element ? e.target.closest(selector) : null);

	const sobre = (e) => {
		if (e.pointerType === 'touch') return;
		const el = objetivo(e);
		if (el) mostrar(el);
	};
	const fuera = (e) => {
		if (e.pointerType !== 'touch' && objetivo(e)) ocultar();
	};
	// Con el dedo, tocar abre y volver a tocar cierra; con el ratón, el clic no cierra lo que abrió el paso por encima.
	const toque = (e) => {
		const el = objetivo(e);
		if (el?.closest('[role="button"]')) return;
		if (!el || (e.pointerType === 'touch' && el === actual)) ocultar();
		else mostrar(el);
	};
	const foco = (e) => {
		const el = objetivo(e);
		if (el) mostrar(el);
	};
	const fueraDelNodo = (e) => {
		if (actual && !(e.target instanceof Node && nodo.contains(e.target))) ocultar();
	};

	nodo.addEventListener('pointerover', sobre);
	nodo.addEventListener('pointerout', fuera);
	nodo.addEventListener('click', toque);
	nodo.addEventListener('focusin', foco);
	nodo.addEventListener('focusout', ocultar);
	document.addEventListener('pointerdown', fueraDelNodo);
	window.addEventListener('scroll', ocultar, { passive: true });
	nodo.addEventListener('scroll', ocultar, { passive: true });

	return {
		destroy() {
			nodo.removeEventListener('pointerover', sobre);
			nodo.removeEventListener('pointerout', fuera);
			nodo.removeEventListener('click', toque);
			nodo.removeEventListener('focusin', foco);
			nodo.removeEventListener('focusout', ocultar);
			nodo.removeEventListener('scroll', ocultar);
			document.removeEventListener('pointerdown', fueraDelNodo);
			window.removeEventListener('scroll', ocultar);
			globo?.remove();
		}
	};
}
