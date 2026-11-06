<script>
	import { page } from '$app/state';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Error · Historias con los barómetros del CIS</title>
</svelte:head>

<div class="columna error">
	{#if page.status === 404}
		<h1>Esta página no existe</h1>
		<p><a href="{base}/">Volver a las historias</a></p>
	{:else}
		<h1>No se ha podido montar la página</h1>
		<p class="mensaje">{page.error?.message}</p>
	{/if}
</div>

<style>
	.error {
		padding-top: 2.75rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.mensaje {
		font-family: var(--f-rotulo);
		font-size: 1rem;
		color: var(--teja);
	}
</style>
