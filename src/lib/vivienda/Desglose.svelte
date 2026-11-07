<!--
	Desglose de una medida (monográfico, P24) por los cruces del CIS. Se abre al elegir una medida en el gráfico.
	Es un <dialog> modal: Escape o «Cerrar» lo cierran y el foco vuelve a la medida. Los datos del desglose se
	descargan la primera vez que se abre (no van en la página).
-->
<script>
	import { base } from '$app/paths';
	import { decimal, entero, porcentaje } from '$lib/formato.js';
	import { margenes } from '$lib/motor/margenes.js';

	/** id: medida abierta (o null); cruces: ids en el orden del guion */
	let { id, cruces, rotulos, onclose } = $props();

	/** @type {HTMLDialogElement} */
	let dialogo;
	/** @type {any} */
	let datos = $state.raw(null);
	let error = $state('');
	let cruce = $state('');
	let volverA = null;

	const medida = $derived(datos && id ? datos.medidas.find((m) => m.id === id) : null);
	const metaCruces = $derived(datos ? cruces.map((c) => datos.cruces.find((x) => x.id === c)).filter(Boolean) : []);
	const grupos = $derived(medida && cruce ? medida.desglose[cruce] : []);
	const nota = $derived(metaCruces.find((c) => c.id === cruce)?.nota ?? '');

	// Escala común de las barras: el centro deja sitio al «en contra» más largo del cruce.
	const maxContra = $derived(Math.max(medida?.contra.v ?? 0, ...grupos.map((g) => g.contra.v ?? 0)));
	const k = $derived(100 / (100 + maxContra));
	const centro = $derived(maxContra * k);

	const signo = (v) => `${Math.round(v) > 0 ? '+' : Math.round(v) < 0 ? '−' : ''}${decimal(Math.abs(v), 0)}`;
	const margen = (x, n) => `Margen de error al 95 %: ${decimal(x.lo)}–${porcentaje(x.hi)}. ${entero(n)} entrevistas`;

	async function cargar() {
		if (datos) return;
		try {
			const r = await fetch(`${base}/datos/vivienda/monografico.json`);
			if (!r.ok) throw new Error(String(r.status));
			datos = await r.json();
		} catch {
			error = 'No se han podido cargar los datos del desglose.';
		}
	}

	$effect(() => {
		if (!dialogo) return;
		if (id && !dialogo.open) {
			volverA = document.activeElement;
			if (!cruce) cruce = cruces[0];
			cargar();
			dialogo.showModal();
		} else if (!id && dialogo.open) {
			dialogo.close();
		}
	});

	function alCerrar() {
		onclose();
		if (volverA instanceof HTMLElement || volverA instanceof SVGElement) volverA.focus?.();
	}
</script>

<dialog bind:this={dialogo} class="desglose" aria-labelledby="desglose-titulo" onclose={alCerrar} use:margenes>
	<header>
		<p class="rotulo">{rotulos.desglose}</p>
		<h2 id="desglose-titulo">{medida?.texto ?? ''}</h2>
		<button class="cerrar" type="button" onclick={() => dialogo.close()}>Cerrar</button>
	</header>

	{#if error}
		<p class="aviso">{error}</p>
	{:else if !medida}
		<p class="aviso">Cargando…</p>
	{:else}
		<div class="cruces" role="group" aria-label={rotulos.desglose_por}>
			{#each metaCruces as c (c.id)}
				<button type="button" aria-pressed={c.id === cruce} onclick={() => (cruce = c.id)}>{c.nombre}</button>
			{/each}
		</div>

		<p class="leyenda rotulo" aria-hidden="true">
			<span class="muestra contra"></span>{rotulos.contra}
			<span class="muestra favor"></span>{rotulos.favor}
			<span class="saldo-titulo">{rotulos.saldo}</span>
		</p>

		<ol class="filas">
			{#each [{ g: rotulos.desglose_total, n: medida.favor.n, favor: medida.favor, contra: medida.contra, neto: medida.neto, total: true }, ...grupos] as g (g.g)}
				<li class="fila" class:total={g.total}>
					<span class="nombre">{g.g}</span>
					{#if g.favor.v == null}
						<span class="pocas">{rotulos.desglose_pocas}</span>
					{:else}
						<span class="saldo">{signo(g.neto)}</span>
						<span class="barras" aria-hidden="true">
							<span class="barra contra" style="right: {100 - centro}%; width: {g.contra.v * k}%"></span>
							<span class="barra favor" style="left: {centro}%; width: {g.favor.v * k}%"></span>
						</span>
						<span class="detalle">
							{rotulos.favor.toLowerCase()}
							<button type="button" class="cifra" data-margen={margen(g.favor, g.n)}>{porcentaje(g.favor.v)}</button>
							· {rotulos.contra.toLowerCase()}
							<button type="button" class="cifra" data-margen={margen(g.contra, g.n)}>{porcentaje(g.contra.v)}</button>
						</span>
					{/if}
				</li>
			{/each}
		</ol>

		<p class="nota">{nota ? `${nota} ` : ''}{rotulos.desglose_nota}</p>
	{/if}
</dialog>

<style>
	.desglose {
		width: min(36rem, calc(100vw - 24px));
		max-height: calc(100dvh - 24px);
		padding: 0;
		border: 1px solid var(--raya);
		background: var(--papel-claro);
		color: var(--tinta);
		box-shadow: var(--sombra);
		overflow: auto;
		overscroll-behavior: contain;
	}

	.desglose::backdrop {
		background: color-mix(in srgb, var(--papel) 70%, transparent);
	}

	header {
		position: sticky;
		top: 0;
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: start;
		gap: 2px 12px;
		padding: 14px 16px 10px;
		background: var(--papel-claro);
		border-bottom: 1px solid var(--raya);
	}

	header .rotulo {
		grid-column: 1;
		margin: 0;
	}

	h2 {
		grid-column: 1;
		font-size: 1.3rem;
		line-height: 1.2;
	}

	.cerrar {
		grid-column: 2;
		grid-row: 1 / span 2;
		font: 600 0.8125rem/1 var(--f-rotulo);
		color: var(--tinta);
		background: none;
		border: 1px solid var(--raya);
		padding: 8px 10px;
		cursor: pointer;
	}

	.cruces {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 12px 16px 4px;
	}

	.cruces button {
		font: 500 0.8125rem/1 var(--f-rotulo);
		color: var(--tinta-2);
		background: none;
		border: 1px solid var(--raya);
		padding: 7px 10px;
		cursor: pointer;
	}

	.cruces button[aria-pressed='true'] {
		color: var(--papel-claro);
		background: var(--tinta);
		border-color: var(--tinta);
	}

	.leyenda {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 8px 16px 0;
	}

	.muestra {
		display: inline-block;
		width: 10px;
		height: 10px;
		margin-left: 6px;
	}

	.muestra:first-child {
		margin-left: 0;
	}

	.saldo-titulo {
		margin-left: auto;
	}

	.filas {
		list-style: none;
		margin: 0;
		padding: 4px 16px 8px;
	}

	.fila {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 3px 10px;
		padding: 9px 0;
		border-bottom: 1px solid var(--raya);
		font-family: var(--f-rotulo);
	}

	.fila.total {
		border-bottom-width: 2px;
	}

	.nombre {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.total .nombre,
	.saldo {
		font-weight: 700;
	}

	.saldo {
		font-size: 0.9375rem;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.barras {
		grid-column: 1 / -1;
		position: relative;
		height: 10px;
	}

	.barra {
		position: absolute;
		top: 0;
		bottom: 0;
	}

	.favor {
		background: var(--tinta-2);
	}

	.contra {
		background: var(--contra);
	}

	.detalle,
	.pocas {
		grid-column: 1 / -1;
		font-size: 0.75rem;
		color: var(--tinta-3);
		font-variant-numeric: tabular-nums;
	}

	.detalle button.cifra {
		font: inherit;
		color: var(--tinta-2);
		background: none;
		border: 0;
		padding: 0;
	}

	.pocas {
		grid-column: 2;
		grid-row: 1;
		text-align: right;
	}

	.nota,
	.aviso {
		margin: 4px 16px 16px;
		font: 400 0.75rem/1.4 var(--f-rotulo);
		color: var(--tinta-3);
	}
</style>
