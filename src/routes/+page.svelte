<script>
	import { base } from '$app/paths';
	import Compartir from '$lib/Compartir.svelte';
	import { NOMBRE, DESCRIPCION } from '$lib/sitio.js';

	let { data } = $props();
</script>

<Compartir titulo={NOMBRE} descripcion={DESCRIPCION} imagen="sitio.png"
	alt="Nube de puntos gris: cada punto, una persona entrevistada en los barómetros del CIS desde 2021" />

<div class="columna portada">
	<h1>{NOMBRE}</h1>
	<p class="entradilla">{DESCRIPCION}</p>

	<ul class="historias">
		{#each data.historias as h (h.ruta)}
			<li class="tarjeta">
				<a class="enlace" href="{base}/{h.ruta}">
					<span class="rotulo">{h.edicion}</span>
					<h2>{h.titulo}</h2>
					<p>{h.entradilla}</p>
					<span class="leer rotulo">Leer la historia →</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.portada {
		padding-top: 2.75rem;
	}

	h1 {
		font-size: clamp(2.25rem, 1.4rem + 4vw, 3.5rem);
		margin-bottom: 1rem;
	}

	.entradilla {
		font-size: 1.25rem;
		line-height: 1.4;
		color: var(--tinta-2);
	}

	.historias {
		list-style: none;
		margin: 2.5rem 0 0;
		padding: 0;
	}

	.historias .tarjeta {
		padding: 0;
		transition: box-shadow 0.2s;
	}

	.enlace {
		display: block;
		padding: 16px 18px 18px;
		color: inherit;
		text-decoration: none;
	}

	.historias h2 {
		font-size: 1.75rem;
		margin: 0.5rem 0 0.5rem;
	}

	.enlace p {
		margin: 0 0 0.75rem;
		color: var(--tinta-2);
	}

	.leer {
		color: var(--teja);
	}

	.enlace:hover h2 {
		color: var(--teja);
	}

	.enlace:focus-visible {
		outline-offset: -2px;
	}
</style>
