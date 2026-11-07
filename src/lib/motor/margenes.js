// Margen de error de cada cifra del texto: al pasar el ratón, al tocarla en el móvil o al llegar con el teclado,
// aparece un globo con su margen. Las cifras lo llevan en data-margen (ver src/lib/guion.js).

/** @param {HTMLElement} nodo */
export function margenes(nodo) {
	/** @type {HTMLDivElement | null} */
	let globo = null;
	/** @type {HTMLElement | null} */
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
		globo.textContent = el.dataset.margen;
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

	const cifra = (e) => /** @type {HTMLElement | null} */ (e.target instanceof Element ? e.target.closest('.cifra[data-margen]') : null);

	const sobre = (e) => {
		if (e.pointerType === 'touch') return;
		const el = cifra(e);
		if (el) mostrar(el);
	};
	const fuera = (e) => {
		if (e.pointerType !== 'touch' && cifra(e)) ocultar();
	};
	// Con el dedo, tocar abre y volver a tocar cierra; con el ratón, el clic no cierra lo que abrió el paso por encima.
	const toque = (e) => {
		const el = cifra(e);
		if (!el || (e.pointerType === 'touch' && el === actual)) ocultar();
		else mostrar(el);
	};
	const foco = (e) => {
		const el = cifra(e);
		if (el) mostrar(el);
	};
	const fueraDelTexto = (e) => {
		if (actual && !(e.target instanceof Node && nodo.contains(e.target))) ocultar();
	};

	nodo.addEventListener('pointerover', sobre);
	nodo.addEventListener('pointerout', fuera);
	nodo.addEventListener('click', toque);
	nodo.addEventListener('focusin', foco);
	nodo.addEventListener('focusout', ocultar);
	document.addEventListener('pointerdown', fueraDelTexto);
	window.addEventListener('scroll', ocultar, { passive: true });
	nodo.addEventListener('scroll', ocultar, { passive: true });

	return {
		destroy() {
			nodo.removeEventListener('scroll', ocultar);
			nodo.removeEventListener('pointerover', sobre);
			nodo.removeEventListener('pointerout', fuera);
			nodo.removeEventListener('click', toque);
			nodo.removeEventListener('focusin', foco);
			nodo.removeEventListener('focusout', ocultar);
			document.removeEventListener('pointerdown', fueraDelTexto);
			window.removeEventListener('scroll', ocultar);
			globo?.remove();
		}
	};
}
