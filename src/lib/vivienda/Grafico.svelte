<!--
	El gráfico de la historia de la vivienda: decide qué capa se ve en cada estado y dónde se dibuja.
	En el móvil, las tarjetas suben por encima, así que el dibujo va en la parte de arriba de la pantalla.
	Cada dato enseña su % y su n en un globo (atributo data-globo; ver $lib/motor/margenes.js).
-->
<script>
	import { prefersReducedMotion } from 'svelte/motion';
	import Nube from './Nube.svelte';
	import Serie from './Serie.svelte';
	import Grupos from './Grupos.svelte';
	import Medidas from './Medidas.svelte';
	import { DEL_MONOGRAFICO } from './estados.js';
	import { margenes } from '$lib/motor/margenes.js';
	import { CLASE_COHORTE, cortoCohorte, nombreCohorte } from './cohortes.js';

	let { estado, progreso, primero, enPortada, movil, serie, grupos, mono, rotulos, onelegir } = $props();

	let w = $state(375);
	let h = $state(740);

	const fs = $derived(w < 640 ? 10 : 12);
	const zona = $derived(
		movil
			? { top: 58, bottom: Math.round(h * 0.56), left: 16, right: w - 16 }
			: { top: 72, bottom: h - 96, left: 8, right: w - 8 }
	);

	const CAPA = {
		nube: 'nube',
		'nube-vivienda': 'nube',
		linea: 'serie',
		'espana-personal': 'serie',
		octubre: 'serie',
		cierre: 'serie',
		junio: 'serie',
		edad: 'grupos',
		ideologia: 'grupos',
		sexo: 'grupos',
		brecha: 'grupos',
		situaciones: 'grupos',
		intervencion: 'grupos',
		medidas: 'medidas'
	};
	const capa = $derived(CAPA[estado]);
	const fuente = $derived(DEL_MONOGRAFICO.includes(estado) ? rotulos.fuente_monografico : rotulos.fuente);

	// La línea se dibuja con el scroll solo la primera vez que aparece, y sin animación si así se ha pedido.
	const revelado = $derived(
		prefersReducedMotion.current || !primero ? 1 : Math.min(1, progreso / 0.35)
	);

	// Grupos de edad que se pueden mostrar en «situaciones»: las seis edades, 18-34 y el total.
	const opciones = $derived([...mono.situaciones[0].edad.map((g) => g.g), '18-34', 'total']);
	const nombresCohortes = $derived(Object.fromEntries(opciones.map((id) => [id, nombreCohorte(id, rotulos.desglose_total)])));
	// Al principio, los del rótulo «cohortes» del guion; quien lee marca o desmarca. Siempre en el orden de las casillas.
	let elegidas = $state(null);
	const cohortes = $derived(opciones.filter((id) => (elegidas ?? rotulos.cohortes).includes(id)));
	const alternar = (id, si) => {
		elegidas = si ? [...cohortes, id] : cohortes.filter((x) => x !== id);
	};
	let altoControles = $state(0);
</script>

<div class="grafico" bind:clientWidth={w} bind:clientHeight={h} use:margenes={{ selector: '[data-globo]', dato: 'globo' }}>
	<Nube {w} {h} {zona} {fs} meses={serie.meses} rotulo={rotulos.nube}
		visible={capa === 'nube'} color={estado === 'nube-vivienda'} etiquetas={!enPortada} />
	<Serie {w} {h} {zona} {fs} {estado} {revelado} {serie} {rotulos} mesLupa={mono.meta.mes} visible={capa === 'serie'} />
	<Grupos {w} {h} {zona} {fs} {estado} {grupos} {mono} {rotulos} {cohortes} {nombresCohortes} {altoControles} visible={capa === 'grupos'} />
	<Medidas {w} {h} {zona} {fs} medidas={mono.medidas} {rotulos} {onelegir} visible={capa === 'medidas'} />

	<fieldset class="selector" class:oculta={estado !== 'situaciones'} inert={estado !== 'situaciones'} bind:clientHeight={altoControles}
		style="top: {zona.top - fs * 1.1}px; left: {zona.left}px; right: {w - zona.right}px; font-size: {fs * 1.1}px">
		<legend class="solo-lector">{rotulos.cohortes_titulo}</legend>
		{#each opciones as id (id)}
			<label class="opcion">
				<input type="checkbox" checked={cohortes.includes(id)} onchange={(ev) => alternar(id, ev.currentTarget.checked)} />
				<span class="muestra {CLASE_COHORTE[id]}" aria-hidden="true"></span>
				<span>{cortoCohorte(id, rotulos.desglose_total)}</span>
			</label>
		{/each}
	</fieldset>

	{#key fuente}
		<p class="fuente" class:oculta={enPortada} style="top: {zona.bottom + fs * 5 + 24}px" aria-hidden="true">{fuente}</p>
	{/key}
</div>

<style>
	.grafico {
		position: absolute;
		inset: 0;
	}

	.fuente {
		position: absolute;
		left: 16px;
		right: 16px;
		margin: 0;
		max-width: 34rem;
		font: 400 0.6875rem/1.35 var(--f-rotulo);
		color: var(--tinta-3);
		transition: opacity 0.5s;
	}

	.oculta {
		opacity: 0;
		pointer-events: none;
	}

	.selector {
		position: absolute;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 5px;
		margin: 0;
		padding: 0;
		border: 0;
		min-inline-size: 0;
		font-family: var(--f-rotulo);
		transition: opacity 0.5s;
	}

	.solo-lector {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.opcion {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 7px 3px 4px;
		border: 1px solid var(--raya);
		background: var(--papel-claro);
		color: var(--tinta-3);
		font-weight: 600;
		cursor: pointer;
		user-select: none;
	}

	.opcion:has(input:checked) {
		color: var(--tinta);
		border-color: var(--tinta-3);
	}

	.opcion input {
		margin: 0;
		accent-color: var(--tinta);
	}

	.opcion:has(input:focus-visible) {
		outline: 2px solid var(--teja);
		outline-offset: 1px;
	}

	/* Muestra de la marca de cada edad: círculos azules de claro a oscuro, 18-34 cuadrado, total rombo. */
	.muestra {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex: none;
	}

	.muestra.e1 { background: var(--edad-1); }
	.muestra.e2 { background: var(--edad-2); }
	.muestra.e3 { background: var(--edad-3); }
	.muestra.e4 { background: var(--edad-4); }
	.muestra.e5 { background: var(--edad-5); }
	.muestra.e6 { background: var(--edad-6); }

	.muestra.e12 {
		border-radius: 0;
		background: var(--edad-12);
	}

	.muestra.tot {
		border-radius: 0;
		background: var(--tinta);
		transform: rotate(45deg) scale(0.8);
	}

	@media (min-width: 900px) {
		.fuente {
			top: auto !important;
			bottom: 24px;
			left: 8px;
			font-size: 0.75rem;
		}
	}
</style>
