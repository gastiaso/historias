<!--
	Gráfico por grupos: una fila por grupo y dos marcas por fila, con su margen de error.
	Modos:
	  edad, ideologia   problema de España (punto teja) y problema personal (anillo azul), barómetros
	  sexo              problema personal de mujeres (círculo) y hombres (cuadrado), barómetros
	  brecha            por edad: «le perjudica» (cuadrado, monográfico) y problema personal (anillo, barómetros)
	  situaciones       situaciones vividas: de 18 a 34 años (círculo) y 65 y más (cuadrado), monográfico
	  intervencion      por ideología: problema de España (punto teja, barómetros) y «el Estado debe intervenir»
	                    (cuadrado de tinta, monográfico)
	El color nunca identifica grupos: los grupos van por posición y rótulo.
	Las marcas conservan su hueco al cambiar de modo, para que el paso de uno a otro se pueda seguir.
-->
<script>
	import { fade } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { partir } from '$lib/graficos/comun.js';

	let { w, h, zona, estado, grupos, mono, rotulos, visible, fs } = $props();

	const MODOS = {
		edad: { xmax: 70, ticks: [0, 20, 40, 60] },
		ideologia: { xmax: 70, ticks: [0, 20, 40, 60] },
		sexo: { xmax: 70, ticks: [0, 20, 40, 60] },
		brecha: { xmax: 70, ticks: [0, 20, 40, 60] },
		situaciones: { xmax: 40, ticks: [0, 10, 20, 30, 40], arriba: true },
		intervencion: { xmax: 100, ticks: [0, 25, 50, 75, 100] }
	};
	let modo = $state('edad');
	$effect(() => {
		if (estado in MODOS) modo = estado;
	});
	const conf = $derived(MODOS[modo]);

	const edad = (g) => g.replace('-', '–');
	const marca = (tipo, d) => ({ tipo, v: d.v, lo: d.lo, hi: d.hi });
	const ideo = (g) => {
		const m = g.match(/^(.*) \((\d+)-(\d+)\)$/);
		return { nombre: m ? m[1] : g, sub: m ? `${m[2]}–${m[3]}` : '' };
	};
	const delGrupo = (lista, g) => {
		const r = lista.find((x) => x.g === g);
		if (!r) throw new Error(`Falta el grupo «${g}» en el monográfico`);
		return r;
	};

	const filas = $derived.by(() => {
		switch (modo) {
			case 'ideologia':
				return grupos.ideologia.map((r) => ({ ...ideo(r.g), marcas: [marca('esp', r.esp), marca('per', r.per)] }));
			case 'sexo':
				return grupos.sexo_edad.map((r) => ({ nombre: edad(r.g), sub: '', marcas: [marca('circulo', r.Mujer), marca('cuadrado', r.Hombre)] }));
			case 'brecha':
				return grupos.edad.map((r) => ({
					nombre: edad(r.g), sub: '',
					marcas: [marca('cuadrado', delGrupo(mono.indicadores.perjudica.edad, r.g)), marca('per', r.per)]
				}));
			case 'situaciones':
				return rotulos.situaciones.map((id) => {
					const s = mono.situaciones.find((x) => x.id === id);
					return { nombre: s.corto, sub: '', marcas: [marca('circulo', delGrupo(s.edad2, '18-34')), marca('cuadrado', delGrupo(s.edad2, '65 y más'))] };
				});
			case 'intervencion':
				return grupos.ideologia.map((r) => ({
					...ideo(r.g),
					marcas: [marca('esp', r.esp), marca('neutro', delGrupo(mono.indicadores.intervenir.ideologia, r.g))]
				}));
			default:
				return grupos.edad.map((r) => ({ nombre: edad(r.g), sub: '', marcas: [marca('esp', r.esp), marca('per', r.per)] }));
		}
	});

	const leyenda = $derived.by(() => {
		switch (modo) {
			case 'sexo':
				return [{ tipo: 'circulo', t: rotulos.mujeres }, { tipo: 'cuadrado', t: rotulos.hombres }, { tipo: null, t: `· ${rotulos.personal}` }];
			case 'brecha':
				return [{ tipo: 'cuadrado', t: rotulos.perjudica }, { tipo: 'per', t: rotulos.barometros }];
			case 'situaciones':
				return [{ tipo: 'circulo', t: rotulos.jovenes }, { tipo: 'cuadrado', t: rotulos.mayores }];
			case 'intervencion':
				return [{ tipo: 'esp', t: rotulos.espana }, { tipo: 'neutro', t: rotulos.intervenir }];
			default:
				return [{ tipo: 'esp', t: rotulos.espana }, { tipo: 'per', t: rotulos.personal }];
		}
	});

	const car = $derived(fs * 0.56);
	const salto = $derived(fs * 1.6);

	// Leyenda: un elemento detrás de otro; si no cabe, pasa a la línea siguiente.
	const posLeyenda = $derived.by(() => {
		let x = zona.left;
		let y = zona.top;
		return leyenda.map((l) => {
			const ancho = (l.tipo ? fs * 1.1 : 0) + l.t.length * car;
			if (x > zona.left && x + ancho > zona.right) {
				x = zona.left;
				y += salto;
			}
			const aqui = { x, y };
			x += ancho + fs * 1.4;
			return aqui;
		});
	});
	const altoLeyenda = $derived(Math.max(...posLeyenda.map((p) => p.y)) - zona.top);

	const e = $derived.by(() => {
		const l = conf.arriba ? zona.left + 6 : zona.left + fs * 9.4;
		const r = zona.right - 8;
		const t = zona.top + altoLeyenda + fs * 2 + 6;
		const b = zona.bottom - fs - 8;
		return { l, r, t, b, x: (v) => l + (Math.min(v, conf.xmax) / conf.xmax) * (r - l), fila: (i) => t + ((i + 0.5) * (b - t)) / filas.length };
	});
	const alto = $derived((e.b - e.t) / filas.length);
	const rm = $derived(fs * 0.5); // radio de las marcas
	const dur = $derived(prefersReducedMotion.current ? 0 : 300);
</script>

<svg class="capa" class:oculta={!visible} width={w} height={h}>
	<!-- Leyenda -->
	{#each leyenda as l, i (l.t)}
		<g transform="translate({posLeyenda[i].x}, {posLeyenda[i].y})" in:fade={{ duration: dur }}>
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
	{#each conf.ticks as g (g)}
		<g in:fade={{ duration: dur }}>
			<line class="rejilla" x1={e.x(g)} x2={e.x(g)} y1={e.t - 4} y2={e.b} />
			<text class="r" x={e.x(g)} y={e.b + fs + 6} text-anchor="middle" font-size={fs}>{g}{g === conf.ticks[conf.ticks.length - 1] ? ' %' : ''}</text>
		</g>
	{/each}

	{#each filas as f, i (i)}
		{@const y = conf.arriba ? e.fila(i) + alto * 0.18 : e.fila(i)}
		{@const [a, b] = f.marcas}
		<g transition:fade={{ duration: dur }}>
			{#if conf.arriba}
				{#each partir(f.nombre, Math.floor((e.r - e.l) / car)) as linea, k}
					<text class="r" x={zona.left} y={y - rm - 5 - k * (fs + 2)} font-size={fs * 1.05}>{linea}</text>
				{/each}
			{:else}
				<g class="mueve" style="transform: translate({e.l - fs * 0.8}px, {y}px)">
					<text class="r" text-anchor="end" y={f.sub ? -fs * 0.15 : fs * 0.35} font-size={fs * 1.05}>{f.nombre}</text>
					{#if f.sub}<text class="r" text-anchor="end" y={fs * 1.05} font-size={fs * 0.9}>{f.sub}</text>{/if}
				</g>
			{/if}
			<line class="union mueve" x1="0" x2="1" vector-effect="non-scaling-stroke"
				style="transform: translate({e.x(Math.min(a.v, b.v))}px, {y}px) scaleX({Math.abs(e.x(a.v) - e.x(b.v))})" />
			{#each f.marcas as m}
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
		{#each partir(rotulos.sin_ubicar, Math.floor((e.r - e.l) / car)) as linea, k}
			<text class="r" x={e.l} y={e.b + fs * 2 + 14 + k * (fs + 3)} font-size={fs}>{linea}</text>
		{/each}
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
		stroke: var(--azul);
	}

	.bigote.esp {
		stroke: var(--teja);
	}

	.bigote.neutro {
		stroke: var(--tinta);
	}

	.marca circle,
	.marca rect {
		fill: var(--azul);
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

	.marca.circulo circle {
		fill: var(--azul);
	}

	.marca.cuadrado rect {
		fill: var(--azul);
	}

	.marca.neutro rect {
		fill: var(--tinta);
	}

	/* Cada tipo enseña solo su forma: círculo, o cuadrado en «cuadrado» y «neutro». */
	.marca:not(.cuadrado):not(.neutro) rect,
	.marca.cuadrado circle,
	.marca.neutro circle {
		opacity: 0;
	}
</style>
