<!--
	Motor de las historias con scroll. Un gráfico fijo a pantalla completa (en escritorio, a la derecha) y los pasos
	del guion, que suben por encima. Al cruzar una línea de la pantalla, cada paso cambia el estado del gráfico.
	El gráfico recibe: estado (el «## nombre» del paso), progreso (0 a 1 dentro del paso), primero (si el paso
	anterior tenía otro estado), enPortada y movil (si las tarjetas van encima del gráfico).
-->
<script>
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { margenes } from './margenes.js';

	let { pasos, portada, grafico } = $props();

	const ancha = new MediaQuery('min-width: 900px', false);
	/** @type {HTMLElement[]} */
	const nodos = [];
	let activo = $state(-1);
	let progreso = $state(0);

	const estado = $derived(pasos[Math.max(activo, 0)].grafico);
	const primero = $derived(activo <= 0 || pasos[activo - 1].grafico !== pasos[activo].grafico);

	function medir() {
		const alto = window.innerHeight;
		// En el móvil, el paso manda en cuanto su tarjeta asoma por abajo; en escritorio, al llegar a media pantalla.
		const linea = alto * (ancha.current ? 0.6 : 0.82);
		let a = -1;
		let p = 0;
		for (let i = 0; i < nodos.length; i++) {
			const r = nodos[i].getBoundingClientRect();
			if (r.top > linea) break;
			a = i;
			p = Math.min(1, Math.max(0, (linea - r.top) / r.height));
		}
		activo = a;
		progreso = p;
	}

	onMount(() => {
		let pedido = false;
		const pedir = () => {
			if (pedido) return;
			pedido = true;
			requestAnimationFrame(() => {
				pedido = false;
				medir();
			});
		};
		medir();
		window.addEventListener('scroll', pedir, { passive: true });
		window.addEventListener('resize', pedir);
		return () => {
			window.removeEventListener('scroll', pedir);
			window.removeEventListener('resize', pedir);
		};
	});
</script>

<article class="historia">
	<!-- Cada capa decorativa del gráfico se oculta a los lectores de pantalla por su cuenta; las interactivas no. -->
	<div class="escenario">
		{@render grafico({ estado, progreso, primero, enPortada: activo < 0, movil: !ancha.current })}
	</div>

	<div class="texto" use:margenes>
		<header class="portada">
			<div class="portada-texto">
				{@render portada()}
			</div>
		</header>
		{#each pasos as paso, i}
			<section class="paso" bind:this={nodos[i]}>
				<div class="tarjeta">{@html paso.html}</div>
			</section>
		{/each}
	</div>
</article>

<style>
	.historia {
		position: relative;
	}

	.escenario {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100svh;
		overflow: hidden;
		z-index: 0;
	}

	.texto {
		position: relative;
		z-index: 1;
		margin-top: -100vh;
		margin-top: -100svh;
		pointer-events: none;
	}

	.portada-texto,
	.tarjeta {
		pointer-events: auto;
	}

	/* Móvil: la portada ocupa la pantalla, con el texto abajo sobre un degradado de papel. Después, un hueco
	   para ver la nube sola antes del primer paso. */
	.portada {
		min-height: 100vh;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		margin-bottom: 45vh;
		margin-bottom: 45svh;
	}

	.portada-texto {
		padding: 3.5rem var(--margen) 2.5rem;
		background: linear-gradient(to bottom, transparent, var(--papel) 3.5rem);
	}

	/* Cada paso: la tarjeta y, debajo, un hueco en el que el gráfico se ve solo. */
	.paso {
		padding: 0 12px 85vh;
		padding-bottom: 85svh;
	}

	.paso:last-child {
		padding-bottom: 55svh;
	}

	.tarjeta {
		max-width: 30rem;
		margin-inline: auto;
	}

	.tarjeta :global(p:last-child) {
		margin-bottom: 0;
	}

	@media (min-width: 900px) {
		.historia {
			display: grid;
			grid-template-columns: minmax(20rem, 28rem) minmax(0, 1fr);
			column-gap: 2.5rem;
			padding-inline: var(--margen);
		}

		.escenario {
			grid-column: 2;
			grid-row: 1;
			align-self: start;
		}

		.texto {
			grid-column: 1;
			grid-row: 1;
			margin-top: 0;
		}

		.portada {
			min-height: 88vh;
			justify-content: center;
			margin-bottom: 20vh;
		}

		.portada-texto {
			padding: 0;
			background: none;
		}

		.paso {
			padding: 0 0 75vh;
		}

		.tarjeta {
			margin-inline: 0;
		}
	}
</style>
