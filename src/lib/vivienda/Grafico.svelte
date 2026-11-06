<!--
	El gráfico de la historia de la vivienda: decide qué capa se ve en cada estado y dónde se dibuja.
	En el móvil, las tarjetas suben por encima, así que el dibujo va en la parte de arriba de la pantalla.
-->
<script>
	import { prefersReducedMotion } from 'svelte/motion';
	import Nube from './Nube.svelte';
	import Serie from './Serie.svelte';
	import Grupos from './Grupos.svelte';
	import Medidas from './Medidas.svelte';
	import { DEL_MONOGRAFICO } from './estados.js';

	let { estado, progreso, primero, enPortada, movil, serie, grupos, mono, rotulos } = $props();

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
</script>

<div class="grafico" bind:clientWidth={w} bind:clientHeight={h}>
	<Nube {w} {h} {zona} {fs} meses={serie.meses} rotulo={rotulos.nube}
		visible={capa === 'nube'} color={estado === 'nube-vivienda'} etiquetas={!enPortada} />
	<Serie {w} {h} {zona} {fs} {estado} {revelado} {serie} {rotulos} mesLupa={mono.meta.mes} visible={capa === 'serie'} />
	<Grupos {w} {h} {zona} {fs} {estado} {grupos} {mono} {rotulos} visible={capa === 'grupos'} />
	<Medidas {w} {h} {zona} {fs} medidas={mono.medidas} {rotulos} visible={capa === 'medidas'} />
	{#key fuente}
		<p class="fuente" class:oculta={enPortada} style="top: {zona.bottom + fs * 5 + 24}px">{fuente}</p>
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
