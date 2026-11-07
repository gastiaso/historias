<script>
	import Historia from '$lib/motor/Historia.svelte';
	import Grafico from '$lib/vivienda/Grafico.svelte';
	import Desglose from '$lib/vivienda/Desglose.svelte';

	let { data } = $props();
	const guion = $derived(data.guion);
	const ayuda = $derived(data.ayuda);

	/** Medida cuyo desglose está abierto (o null). */
	let abierta = $state(null);
</script>

<svelte:head>
	<title>{guion.cabecera.titulo.replace(/<[^>]+>/g, '')}</title>
	<meta name="description" content={guion.cabecera.entradilla.replace(/<[^>]+>/g, '')} />
</svelte:head>

{#if ayuda?.avisos.length}
	<aside class="columna avisos">
		<p class="rotulo">Avisos del guion (solo se ven al escribir)</p>
		<ul>
			{#each ayuda.avisos as aviso}<li>{aviso}</li>{/each}
		</ul>
	</aside>
{/if}

<Historia pasos={guion.pasos}>
	{#snippet portada()}
		<p class="rotulo antetitulo">Historias con los barómetros del CIS</p>
		<h1>{@html guion.cabecera.titulo}</h1>
		<p class="entradilla">{@html guion.cabecera.entradilla}</p>
		<p class="rotulo">
			{#if guion.cabecera.firma}{@html guion.cabecera.firma}{' · '}{/if}{data.lineaEdicion}
		</p>
	{/snippet}

	{#snippet grafico({ estado, progreso, primero, enPortada, movil })}
		<Grafico {estado} {progreso} {primero} {enPortada} {movil}
			serie={data.serie} grupos={data.grupos} mono={data.mono} rotulos={guion.rotulos}
			onelegir={(id) => (abierta = id)} />
	{/snippet}
</Historia>

<Desglose id={abierta} cruces={guion.rotulos.cruces} rotulos={guion.rotulos} onclose={() => (abierta = null)} />

{#if ayuda}
	<details class="columna ayuda">
		<summary class="rotulo">Cifras disponibles para el guion (solo se ven al escribir)</summary>
		<p>Gráficos («## nombre»): {Object.keys(ayuda.estados).join(', ')}.</p>
		<p>Rótulos («## rotulos»): {Object.keys(ayuda.rotulos).join(', ')}.</p>
		<table>
			<thead><tr><th>Marca</th><th>Valor</th><th>Margen</th><th>Qué es</th></tr></thead>
			<tbody>
				{#each ayuda.cifras as c}
					<tr>
						<td><code>{'{'}{c.nombre}{'}'}</code></td>
						<td class:espana={c.tipo === 'esp'} class:personal={c.tipo === 'per'}>{c.valor}</td>
						<td>{c.margen}</td>
						<td>{c.nota}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</details>
{/if}

<style>
	.antetitulo {
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: clamp(2.1rem, 1.3rem + 4vw, 3.25rem);
		margin-bottom: 1rem;
	}

	.entradilla {
		font-size: 1.25rem;
		line-height: 1.4;
		color: var(--tinta-2);
	}

	.avisos {
		margin-top: 1.25rem;
		font-family: var(--f-rotulo);
		font-size: 0.875rem;
		color: var(--teja);
	}

	.avisos ul {
		margin: 0.4rem 0 0;
		padding-left: 1.1rem;
	}

	.ayuda {
		margin-top: 4rem;
		font-family: var(--f-rotulo);
		font-size: 0.8125rem;
	}

	.ayuda summary {
		cursor: pointer;
	}

	.ayuda table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 0.5rem;
		font-variant-numeric: tabular-nums;
	}

	.ayuda th,
	.ayuda td {
		text-align: left;
		vertical-align: top;
		padding: 4px 8px 4px 0;
		border-bottom: 1px solid var(--raya);
	}

	.ayuda td:nth-child(2),
	.ayuda td:nth-child(3) {
		white-space: nowrap;
	}

	.ayuda code {
		font-size: 0.75rem;
	}

	@media (max-width: 40rem) {
		.ayuda thead {
			display: none;
		}

		.ayuda tr {
			display: grid;
			grid-template-columns: auto auto 1fr;
			column-gap: 8px;
			padding: 6px 0;
			border-bottom: 1px solid var(--raya);
		}

		.ayuda td {
			border: 0;
			padding: 0;
		}

		.ayuda td:nth-child(4) {
			grid-column: 1 / -1;
			color: var(--tinta-2);
		}
	}
</style>
