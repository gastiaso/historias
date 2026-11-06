<!--
	Gráfico por grupos (último año): una fila por grupo y dos marcas por fila, con su margen de error.
	edad e ideologia: problema de España (punto teja) y problema personal (anillo azul).
	sexo: problema personal de mujeres (círculo) y hombres (cuadrado), dentro de cada grupo de edad.
	El color nunca identifica grupos: los grupos van por posición y rótulo.
-->
<script>
	import { fade } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';

	let { w, h, zona, estado, grupos, rotulos, visible, fs } = $props();

	const MODOS = ['edad', 'ideologia', 'sexo'];
	let modo = $state('edad');
	$effect(() => {
		if (MODOS.includes(estado)) modo = estado;
	});

	const edad = (g) => g.replace('-', '–');
	const marca = (tipo, d) => ({ tipo, v: d.v, lo: d.lo, hi: d.hi });

	const filas = $derived.by(() => {
		if (modo === 'ideologia') {
			return grupos.ideologia.map((r) => {
				const m = r.g.match(/^(.*) \((\d+)-(\d+)\)$/);
				return { nombre: m ? m[1] : r.g, sub: m ? `${m[2]}–${m[3]}` : '', marcas: [marca('esp', r.esp), marca('per', r.per)] };
			});
		}
		if (modo === 'sexo') {
			return grupos.sexo_edad.map((r) => ({ nombre: edad(r.g), sub: '', marcas: [marca('mujer', r.Mujer), marca('hombre', r.Hombre)] }));
		}
		return grupos.edad.map((r) => ({ nombre: edad(r.g), sub: '', marcas: [marca('esp', r.esp), marca('per', r.per)] }));
	});

	const leyenda = $derived(
		modo === 'sexo'
			? [{ tipo: 'mujer', t: rotulos.mujeres }, { tipo: 'hombre', t: rotulos.hombres }, { tipo: null, t: `· ${rotulos.personal}` }]
			: [{ tipo: 'esp', t: rotulos.espana }, { tipo: 'per', t: rotulos.personal }]
	);

	const car = $derived(fs * 0.56);
	const e = $derived.by(() => {
		const l = zona.left + fs * 9.4;
		const r = zona.right - 8;
		const t = zona.top + fs * 2 + 6;
		const b = zona.bottom - fs - 8;
		return { l, r, t, b, x: (v) => l + (v / 70) * (r - l), fila: (i) => t + ((i + 0.5) * (b - t)) / filas.length };
	});
	const rm = $derived(fs * 0.5); // radio de las marcas
	const dur = $derived(prefersReducedMotion.current ? 0 : 300);

	// Posición de cada elemento de la leyenda, uno detrás de otro.
	const xLeyenda = $derived.by(() => {
		let x = zona.left;
		return leyenda.map((l) => {
			const aqui = x;
			x += (l.tipo ? fs * 1.4 : 0) + l.t.length * car + fs * 1.4;
			return aqui;
		});
	});
</script>

<svg class="capa" class:oculta={!visible} width={w} height={h}>
	<!-- Leyenda -->
	{#each leyenda as l, i (l.t)}
		<g transform="translate({xLeyenda[i]}, {zona.top})" in:fade={{ duration: dur }}>
			{#if l.tipo}
				<g class="marca {l.tipo}">
					<circle r={rm} />
					<rect x={-rm * 0.9} y={-rm * 0.9} width={rm * 1.8} height={rm * 1.8} />
				</g>
			{/if}
			<text class="r fuerte" x={l.tipo ? fs * 1.1 : 0} y={fs * 0.35} font-size={fs}>{l.t}</text>
		</g>
	{/each}

	<!-- Eje -->
	{#each [0, 20, 40, 60] as g}
		<line class="rejilla" x1={e.x(g)} x2={e.x(g)} y1={e.t - 4} y2={e.b} />
		<text class="r" x={e.x(g)} y={e.b + fs + 6} text-anchor="middle" font-size={fs}>{g}{g === 60 ? ' %' : ''}</text>
	{/each}

	{#each filas as f, i (i)}
		{@const y = e.fila(i)}
		{@const [a, b] = f.marcas}
		<g transition:fade={{ duration: dur }}>
			<g class="mueve" style="transform: translate({e.l - fs * 0.8}px, {y}px)">
				<text class="r" text-anchor="end" y={f.sub ? -fs * 0.15 : fs * 0.35} font-size={fs * 1.05}>{f.nombre}</text>
				{#if f.sub}<text class="r" text-anchor="end" y={fs * 1.05} font-size={fs * 0.9}>{f.sub}</text>{/if}
			</g>
			<line class="union mueve" x1="0" x2="1" vector-effect="non-scaling-stroke"
				style="transform: translate({e.x(Math.min(a.v, b.v))}px, {y}px) scaleX({Math.abs(e.x(a.v) - e.x(b.v))})" />
			{#each f.marcas as m, j}
				<line class="bigote {m.tipo} mueve" x1="0" x2="1" vector-effect="non-scaling-stroke"
					style="transform: translate({e.x(m.lo ?? m.v)}px, {y}px) scaleX({m.lo != null ? e.x(m.hi) - e.x(m.lo) : 0})" />
				<g class="marca {m.tipo} mueve" style="transform: translate({e.x(m.v)}px, {y}px)">
					<circle r={rm} />
					<rect x={-rm * 0.9} y={-rm * 0.9} width={rm * 1.8} height={rm * 1.8} />
				</g>
			{/each}
		</g>
	{/each}

	<g class="cambia" class:oculta={modo !== 'ideologia'}>
		<text class="r" x={e.l} y={e.b + fs * 2 + 14} font-size={fs}>{rotulos.sin_ubicar}</text>
	</g>
</svg>

<style>
	.capa {
		position: absolute;
		inset: 0;
		transition: opacity 0.6s;
	}

	.cambia {
		transition: opacity 0.5s;
	}

	.oculta {
		opacity: 0;
	}

	.mueve {
		transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1);
	}

	.rejilla {
		stroke: var(--raya);
	}

	.union {
		stroke: var(--tinta-3);
		stroke-opacity: 0.5;
	}

	.bigote {
		stroke-width: 3;
		stroke-opacity: 0.35;
	}

	.bigote.esp {
		stroke: var(--teja);
	}

	.bigote.per,
	.bigote.mujer,
	.bigote.hombre {
		stroke: var(--azul);
	}

	.marca circle,
	.marca rect {
		transition:
			fill 0.5s,
			stroke 0.5s,
			opacity 0.5s;
	}

	.marca.esp circle {
		fill: var(--teja);
	}

	.marca.per circle {
		fill: var(--papel);
		stroke: var(--azul);
		stroke-width: 2;
	}

	.marca.mujer circle {
		fill: var(--azul);
	}

	.marca.hombre rect {
		fill: var(--azul);
	}

	.marca:not(.hombre) rect,
	.marca.hombre circle {
		opacity: 0;
	}
</style>
