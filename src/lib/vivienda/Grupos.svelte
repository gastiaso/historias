<!--
	Gráfico por grupos: una fila por grupo y dos o tres marcas por fila, con su margen de error.
	Modos:
	  edad, ideologia   problema de España (punto teja) y problema personal (anillo azul), barómetros
	  sexo              problema personal de mujeres (círculo) y hombres (cuadrado), barómetros
	  brecha            por edad: «le perjudica» (cuadrado, monográfico) y problema personal (anillo, barómetros)
	  situaciones       situaciones vividas por dos grupos de edad que elige quien lee (círculo y cuadrado), monográfico
	  intervencion      por ideología, todo del monográfico: le preocupa (punto teja), le perjudica (cuadrado azul) y
	                    el Estado debe intervenir (rombo de tinta)
	El color nunca identifica grupos: los grupos van por posición y rótulo. Cada marca enseña su % y su n en un globo.
	Las marcas conservan su hueco al cambiar de modo, para que el paso de uno a otro se pueda seguir.
-->
<script>
	import { fade } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { partir } from '$lib/graficos/comun.js';
	import { decimal, entero, porcentaje } from '$lib/formato.js';
	import { CLASE_COHORTE } from './cohortes.js';

	/** cohortes: grupos de edad marcados en «situaciones» (18-24… 65 y más, 18-34, total);
	 *  altoControles: alto de las casillas que los eligen (en Grafico.svelte) */
	let { w, h, zona, estado, grupos, mono, rotulos, visible, fs, cohortes, nombresCohortes, altoControles = 0 } = $props();

	const MODOS = {
		edad: { xmax: 70, ticks: [0, 20, 40, 60] },
		ideologia: { xmax: 70, ticks: [0, 20, 40, 60] },
		sexo: { xmax: 70, ticks: [0, 20, 40, 60] },
		brecha: { xmax: 70, ticks: [0, 20, 40, 60] },
		situaciones: { xmax: 40, ticks: [0, 10, 20, 30, 40], arriba: true, selector: true },
		intervencion: { xmax: 100, ticks: [0, 25, 50, 75, 100] }
	};
	let modo = $state('edad');
	$effect(() => {
		if (estado in MODOS) modo = estado;
	});
	const conf = $derived(MODOS[modo]);

	const edad = (g) => g.replace('-', '–');
	const marca = (tipo, d) => ({ tipo, v: d.v, lo: d.lo, hi: d.hi, n: d.n });
	const ideo = (g) => {
		const m = g.match(/^(.*) \((\d+)-(\d+)\)$/);
		return { nombre: m ? m[1] : g, sub: m ? `${m[2]}–${m[3]}` : '' };
	};
	const delGrupo = (lista, g) => {
		const r = lista.find((x) => x.g === g);
		if (!r) throw new Error(`Falta el grupo «${g}» en los datos`);
		return r;
	};
	/** Una situación en un grupo de edad del selector (o en el total). */
	const enCohorte = (s, id) => (id === 'total' ? s.total : (s.edad.find((x) => x.g === id) ?? delGrupo(s.edad2, id)));

	const filas = $derived.by(() => {
		const I = mono.indicadores;
		switch (modo) {
			case 'ideologia':
				return grupos.ideologia.map((r) => ({ ...ideo(r.g), marcas: [marca('esp', r.esp), marca('per', r.per)] }));
			case 'sexo':
				return grupos.sexo_edad.map((r) => ({ nombre: edad(r.g), sub: '', marcas: [marca('circulo', r.Mujer), marca('cuadrado', r.Hombre)] }));
			case 'brecha':
				return grupos.edad.map((r) => ({
					nombre: edad(r.g), sub: '',
					marcas: [marca('cuadrado', delGrupo(I.perjudica.edad, r.g)), marca('per', r.per)]
				}));
			case 'situaciones':
				return rotulos.situaciones.map((id) => {
					const s = mono.situaciones.find((x) => x.id === id);
					return {
						nombre: s.corto, sub: '',
						marcas: cohortes.map((c) => ({ ...marca(CLASE_COHORTE[c], enCohorte(s, c)), cohorte: c, clave: `c:${c}` }))
					};
				});
			case 'intervencion':
				return I.intervenir.ideologia.map((r) => ({
					...ideo(r.g),
					marcas: [
						marca('esp', delGrupo(I.preocupa.ideologia, r.g)),
						marca('cuadrado', delGrupo(I.perjudica.ideologia, r.g)),
						marca('rombo', r)
					]
				}));
			default:
				return grupos.edad.map((r) => ({ nombre: edad(r.g), sub: '', marcas: [marca('esp', r.esp), marca('per', r.per)] }));
		}
	});

	// En «situaciones» la leyenda son las casillas de edad (en Grafico.svelte), no texto del gráfico.
	const leyenda = $derived.by(() => {
		switch (modo) {
			case 'sexo':
				return [{ tipo: 'circulo', t: rotulos.mujeres }, { tipo: 'cuadrado', t: rotulos.hombres }, { tipo: null, t: `· ${rotulos.personal}` }];
			case 'brecha':
				return [{ tipo: 'cuadrado', t: rotulos.perjudica }, { tipo: 'per', t: rotulos.barometros }];
			case 'situaciones':
				return [];
			case 'intervencion':
				return [{ tipo: 'esp', t: rotulos.preocupa }, { tipo: 'cuadrado', t: rotulos.perjudica }, { tipo: 'rombo', t: rotulos.intervenir }];
			default:
				return [{ tipo: 'esp', t: rotulos.espana }, { tipo: 'per', t: rotulos.personal }];
		}
	});
	/** Qué mide cada marca, para el globo: el texto de su leyenda (o su grupo de edad, en «situaciones»). */
	const queMide = (m) => (m.cohorte ? nombresCohortes[m.cohorte] : (leyenda.find((l) => l.tipo === m.tipo)?.t ?? ''));
	const globo = (f, m) =>
		[
			f.sub ? `${f.nombre} (${f.sub})` : f.nombre,
			`${queMide(m)}: ${porcentaje(m.v)}${m.lo != null ? ` (${decimal(m.lo)}–${porcentaje(m.hi)})` : ''}`,
			m.n ? `${entero(m.n)} entrevistas` : null
		].filter(Boolean).join('\n');

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
	const altoLeyenda = $derived(Math.max(0, ...posLeyenda.map((p) => p.y)) - zona.top);

	const e = $derived.by(() => {
		const l = conf.arriba ? zona.left + 6 : zona.left + fs * 9.4;
		const r = zona.right - 8;
		// En «situaciones», el gráfico empieza debajo de las casillas de edad, que ocupan lo que ocupen.
		const t = conf.selector ? zona.top - fs * 1.1 + altoControles + fs * 1.8 : zona.top + altoLeyenda + fs * 2 + 6;
		const b = zona.bottom - fs - 8;
		return { l, r, t, b, x: (v) => l + (Math.min(v, conf.xmax) / conf.xmax) * (r - l), fila: (i) => t + ((i + 0.5) * (b - t)) / filas.length };
	});
	const alto = $derived((e.b - e.t) / filas.length);
	const rm = $derived(fs * 0.5); // radio de las marcas
	const dur = $derived(prefersReducedMotion.current ? 0 : 300);
</script>

{#snippet formas()}
	<circle r={rm} />
	<rect x={-rm * 0.9} y={-rm * 0.9} width={rm * 1.8} height={rm * 1.8} />
	<rect class="rombo" x={-rm * 0.8} y={-rm * 0.8} width={rm * 1.6} height={rm * 1.6} transform="rotate(45)" />
{/snippet}

<svg class="capa" class:oculta={!visible} width={w} height={h} aria-hidden="true">
	<!-- Leyenda -->
	{#each leyenda as l, i (l.t)}
		<g transform="translate({posLeyenda[i].x}, {posLeyenda[i].y})" in:fade={{ duration: dur }}>
			{#if l.tipo}
				<g class="marca {l.tipo}">{@render formas()}</g>
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
		{@const vs = f.marcas.length ? f.marcas.map((m) => m.v) : [0]}
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
				style="transform: translate({e.x(Math.min(...vs))}px, {y}px) scaleX({e.x(Math.max(...vs)) - e.x(Math.min(...vs))})" />
			<!-- Cada marca guarda su hueco (o su edad, en «situaciones»): así se mueve, entra o sale sola. -->
			{#each f.marcas as m, j (m.clave ?? j)}
				<line class="bigote {m.tipo} mueve" x1="0" x2="1" vector-effect="non-scaling-stroke" transition:fade={{ duration: dur }}
					style="transform: translate({e.x(m.lo ?? m.v)}px, {y}px) scaleX({m.lo != null ? e.x(m.hi) - e.x(m.lo) : 0})" />
			{/each}
			{#each f.marcas as m, j (m.clave ?? j)}
				<g class="marca {m.tipo} mueve" style="transform: translate({e.x(m.v)}px, {y}px)" data-globo={globo(f, m)} transition:fade={{ duration: dur }}>
					<circle class="toque" r={Math.max(rm * 2.4, 11)} />
					{@render formas()}
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
		pointer-events: none;
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

	.bigote.neutro,
	.bigote.rombo,
	.bigote.tot {
		stroke: var(--tinta);
	}

	.bigote.e1 { stroke: var(--edad-1); }
	.bigote.e2 { stroke: var(--edad-2); }
	.bigote.e3 { stroke: var(--edad-3); }
	.bigote.e4 { stroke: var(--edad-4); }
	.bigote.e5 { stroke: var(--edad-5); }
	.bigote.e6 { stroke: var(--edad-6); }
	.bigote.e12 { stroke: var(--edad-12); }

	/* Zona de toque: invisible y mayor que la marca, para acertar con el dedo. */
	.marca .toque {
		fill: transparent;
		opacity: 1;
	}

	.marca:hover > :not(.toque) {
		filter: drop-shadow(0 0 2px var(--papel)) drop-shadow(0 0 1px var(--tinta-3));
	}

	.marca circle:not(.toque),
	.marca rect {
		fill: var(--azul);
		transition:
			fill 0.5s,
			stroke 0.5s,
			opacity 0.5s;
	}

	.marca.esp circle:not(.toque) {
		fill: var(--teja);
	}

	.marca.per circle:not(.toque) {
		fill: var(--papel);
		stroke: var(--azul);
		stroke-width: 2;
	}

	.marca.circulo circle:not(.toque) {
		fill: var(--azul);
	}

	.marca.cuadrado rect {
		fill: var(--azul);
	}

	.marca.neutro rect,
	.marca:is(.rombo, .tot) rect.rombo {
		fill: var(--tinta);
	}

	/* Grupos de edad de «situaciones»: círculos de claro a oscuro, 18-34 cuadrado, total rombo. */
	.marca.e1 circle:not(.toque) { fill: var(--edad-1); }
	.marca.e2 circle:not(.toque) { fill: var(--edad-2); }
	.marca.e3 circle:not(.toque) { fill: var(--edad-3); }
	.marca.e4 circle:not(.toque) { fill: var(--edad-4); }
	.marca.e5 circle:not(.toque) { fill: var(--edad-5); }
	.marca.e6 circle:not(.toque) { fill: var(--edad-6); }
	.marca.e12 rect { fill: var(--edad-12); }

	/* Cada tipo enseña solo su forma: cuadrado en «cuadrado», «neutro» y 18-34; rombo en «rombo» y el total;
	   círculo en el resto. */
	.marca:is(.cuadrado, .neutro, .e12, .rombo, .tot) circle:not(.toque),
	.marca:not(:is(.cuadrado, .neutro, .e12)) rect:not(.rombo),
	.marca:not(:is(.rombo, .tot)) rect.rombo {
		opacity: 0;
	}
</style>
