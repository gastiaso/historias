<script>
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Historias con los barómetros del CIS</title>
	<meta
		name="description"
		content="Historias contadas con los barómetros mensuales del CIS, a partir de Barómetro a barómetro."
	/>
</svelte:head>

<div class="columna portada">
	<h1>Historias con los barómetros del CIS</h1>
	<p class="entradilla">
		Cada mes, el CIS pregunta a miles de personas por los problemas del país y por los suyos. Estas
		historias cuentan qué ha cambiado, con sus cifras y sus márgenes de error.
	</p>

	<ul class="historias">
		<li class="tarjeta">
			<span class="rotulo">Primera historia · En preparación</span>
			<h2><a href="{base}/vivienda/">La vivienda</a></h2>
			<p>Cómo se convirtió en el primer problema de España, y para quién.</p>
		</li>
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

	.historias h2 {
		font-size: 1.875rem;
		margin: 0.4rem 0 0.35rem;
	}
</style>
