<script>
	// Fuentes autoalojadas: Vite copia los woff2 al sitio; no se pide nada a terceros.
	import '@fontsource-variable/newsreader/opsz.css';
	import '@fontsource-variable/newsreader/opsz-italic.css';
	import '@fontsource-variable/public-sans/wght.css';
	import '$lib/estilos/base.css';
	import { base } from '$app/paths';
	import { NOMBRE } from '$lib/sitio.js';

	let { children } = $props();
</script>

<div class="sitio">
	<header class="cabecera">
		<a class="marca rotulo" href="{base}/">{NOMBRE}</a>
	</header>

	<main>
		{@render children()}
	</main>

	<footer class="pie">
		<div class="columna">
			<p>
				Los datos salen de <a href="https://gastiaso.github.io/barometros/">Barómetro a barómetro</a>,
				que reúne los microdatos de los barómetros mensuales del CIS.
			</p>
			<p>Guillermo Astiaso. Esta web no usa cookies ni analítica.</p>
		</div>
	</footer>
</div>

<style>
	.sitio {
		min-height: 100svh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
	}

	.cabecera {
		padding: 14px var(--margen);
		border-bottom: 1px solid var(--raya);
	}

	.marca {
		color: var(--tinta-2);
		text-decoration: none;
	}

	.marca:hover {
		color: var(--teja);
	}

	.pie {
		margin-top: 4rem;
		padding-block: 1.25rem 2.5rem;
		border-top: 1px solid var(--raya);
		font-family: var(--f-rotulo);
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--tinta-2);
	}

	.pie p {
		margin: 0 0 0.4rem;
	}
</style>
