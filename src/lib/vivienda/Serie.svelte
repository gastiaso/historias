<!--
	La serie mes a mes: problema de España (teja, continua) y problema personal (azul, discontinua), con sus bandas de
	margen. Marca R10 y los cuestionarios con preguntas de vivienda antes de la de problemas (anillos).
	Estados: linea (la primera vez se dibuja con el scroll), espana-personal, octubre (zoom a los últimos meses), cierre.
-->
<script>
	import { untrack } from 'svelte';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { porcentaje } from '$lib/formato.js';
	import { mesCorto, numeroMes, partir } from '$lib/graficos/comun.js';

	let { w, h, zona, estado, revelado, serie, rotulos, visible, fs, mesLupa } = $props();

	const uid = $props.id();
	const año0 = $derived(Number(serie.meses[0].slice(0, 4)));
	const nm = (s) => numeroMes(s, año0);
	const xs = $derived(serie.meses.map(nm));
	const ult = $derived(xs[xs.length - 1]);
	const domTodo = $derived([xs[0] - 0.5, ult + 0.5]);
	const domOctubre = $derived([ult - 15.5, ult + 0.5]);

	const dom = new Tween(untrack(() => domTodo), { duration: 800, easing: cubicInOut });
	const ampliado = $derived(estado === 'octubre' || estado === 'junio');
	$effect(() => {
		dom.set(ampliado ? domOctubre : domTodo, { duration: prefersReducedMotion.current ? 0 : 800 });
	});

	const conPer = $derived(estado === 'espana-personal' || estado === 'cierre' || estado === 'junio');
	const rev = $derived(estado === 'linea' ? revelado : 1);
	const car = $derived(fs * 0.56); // ancho aproximado de un carácter

	// Escalas
	const e = $derived.by(() => {
		const [d0, d1] = dom.current;
		const l = zona.left + fs * 2.8;
		const r = zona.right - 4;
		const t = zona.top + fs * 2 + 6;
		const b = zona.bottom - fs - 8;
		return { l, r, t, b, x: (m) => l + ((m - d0) / (d1 - d0)) * (r - l), y: (v) => b - (v / 60) * (b - t) };
	});

	function trazo(vals) {
		let d = '';
		let abierto = false;
		xs.forEach((m, i) => {
			const v = vals[i];
			if (v == null) {
				abierto = false;
				return;
			}
			d += `${abierto ? 'L' : 'M'}${e.x(m).toFixed(1)},${e.y(v).toFixed(1)}`;
			abierto = true;
		});
		return d;
	}

	function banda(lo, hi) {
		const arriba = [];
		const abajo = [];
		xs.forEach((m, i) => {
			if (lo[i] == null || hi[i] == null) return;
			arriba.push(`${e.x(m).toFixed(1)},${e.y(hi[i]).toFixed(1)}`);
			abajo.push(`${e.x(m).toFixed(1)},${e.y(lo[i]).toFixed(1)}`);
		});
		return arriba.length ? `M${arriba.join('L')}L${abajo.reverse().join('L')}Z` : '';
	}

	const ticks = $derived.by(() => {
		const [d0, d1] = dom.current;
		const out = [];
		if (d1 - d0 > 30) {
			for (let a = año0; a <= año0 + Math.floor(ult / 12); a++) out.push({ x: e.x((a - año0) * 12 + 5.5), t: String(a) });
		} else {
			for (let m = Math.ceil(d0); m <= d1; m++) if (m % 3 === 0) out.push({ x: e.x(m), t: mesCorto(m, año0) });
		}
		return out.filter((k) => k.x >= e.l - 2 && k.x <= e.r + 2);
	});

	const T = $derived(serie.texto);
	const avisos = $derived(
		serie.avisos.map((a) => ({ m: nm(a.mes), v: serie.esp.v[serie.meses.indexOf(a.mes)] }))
	);
	const xr = $derived(e.x(nm(serie.rupturas[0].mes)));
	const media = $derived(T.medias[T.medias.length - 1]);
	const xc = $derived(e.x(nm(T.cruce)));
	const fin = $derived({ x: e.x(nm(T.final.mes)), y: e.y(T.final.esp.v) });
	const prev = $derived({ x: e.x(nm(T.anterior.mes)), y: e.y(T.anterior.esp.v) });
	const anchoEspana = $derived(rotulos.espana.length * car + 30);
	const pie = $derived(e.b + fs * 2 + 14);
</script>

<svg class="capa" class:oculta={!visible} width={w} height={h} aria-hidden="true">
	<defs>
		<clipPath id="{uid}-area">
			<rect x={e.l} y={e.t - 30} width={Math.max(0, e.r - e.l)} height={e.b - e.t + 60} />
		</clipPath>
		<clipPath id="{uid}-rev">
			<rect x={e.l - 2} y={e.t - 30} width={Math.max(0, (e.r - e.l) * rev + 4)} height={e.b - e.t + 60} />
		</clipPath>
	</defs>

	<!-- Leyenda -->
	<line class="linea esp" x1={zona.left} x2={zona.left + 18} y1={zona.top} y2={zona.top} />
	<text class="r fuerte" x={zona.left + 24} y={zona.top + fs * 0.35} font-size={fs}>{rotulos.espana}</text>
	<g class="cambia" class:oculta={!conPer}>
		<line class="linea per" x1={zona.left + anchoEspana} x2={zona.left + anchoEspana + 18} y1={zona.top} y2={zona.top} />
		<text class="r fuerte" x={zona.left + anchoEspana + 24} y={zona.top + fs * 0.35} font-size={fs}>{rotulos.personal}</text>
	</g>

	<!-- Ejes -->
	{#each [0, 20, 40, 60] as g}
		<line class="rejilla" x1={e.l} x2={e.r} y1={e.y(g)} y2={e.y(g)} />
		<text class="r" x={e.l - 6} y={e.y(g) + fs * 0.35} text-anchor="end" font-size={fs}>{g}{g === 60 ? ' %' : ''}</text>
	{/each}
	{#each ticks as k}
		<text class="r" x={k.x} y={e.b + fs + 6} text-anchor="middle" font-size={fs}>{k.t}</text>
	{/each}

	<!-- Junio de 2026: el mes del monográfico -->
	<g class="cambia" class:oculta={estado !== 'junio'}>
		<rect class="lupa" x={e.x(nm(mesLupa) - 0.5)} y={e.t - 6} width={Math.max(0, e.x(nm(mesLupa) + 0.5) - e.x(nm(mesLupa) - 0.5))} height={e.b - e.t + 6} />
		{#each partir(rotulos.junio, 18) as l, i}
			<text class="r fuerte" x={e.x(nm(mesLupa)) - (e.x(nm(mesLupa) + 0.5) - e.x(nm(mesLupa))) - 4} y={e.t + fs * 0.4 + i * (fs + 3)} text-anchor="end" font-size={fs}>{l}</text>
		{/each}
	</g>

	<!-- R10: la línea siempre; el rótulo, a su izquierda, donde la serie va baja -->
	<g class="cambia" class:oculta={ampliado}>
		<line class="ruptura" x1={xr} x2={xr} y1={e.t - 6} y2={e.b} />
		{#each partir(rotulos.r10, Math.max(10, Math.floor((xr - e.l - 8) / car))) as l, i}
			<text class="r" x={xr - 5} y={e.t + fs * 0.4 + i * (fs + 3)} text-anchor="end" font-size={fs}>{l}</text>
		{/each}
	</g>

	<g clip-path="url(#{uid}-area)">
		<g clip-path="url(#{uid}-rev)">
			<path class="banda per cambia" class:oculta={!conPer} d={banda(serie.per.lo, serie.per.hi)} />
			<path class="banda esp" d={banda(serie.esp.lo, serie.esp.hi)} />
			<path class="linea per cambia" class:oculta={!conPer} d={trazo(serie.per.v)} />
			<path class="linea esp" d={trazo(serie.esp.v)} />
		</g>
		{#each avisos as a}
			<circle class="aviso cambia" class:oculta={e.x(a.m) > e.l + (e.r - e.l) * rev} cx={e.x(a.m)} cy={e.y(a.v)} r={fs * 0.4} />
		{/each}
	</g>

	<!-- Media del último año -->
	<g class="cambia" class:oculta={!(estado === 'linea' && rev >= 0.98)}>
		<line class="media" x1={e.x(nm(media.desde))} x2={e.x(nm(media.hasta))} y1={e.y(media.esp.v)} y2={e.y(media.esp.v)} />
		{#each partir(rotulos.media, Math.max(10, Math.floor((e.x(nm(media.desde)) - e.l - 8) / car))).reverse() as l, i}
			<text class="r fuerte" x={e.x(nm(media.desde)) - 6} y={e.y(media.esp.v) + fs * 0.35 - i * (fs + 3)} text-anchor="end" font-size={fs}>{l}</text>
		{/each}
	</g>

	<!-- Cruce de las dos líneas -->
	<g class="cambia" class:oculta={estado !== 'espana-personal'}>
		<line class="cruce" x1={xc} x2={xc} y1={e.t} y2={e.b} />
		<text class="r fuerte" x={xc + 5} y={e.t + fs * 0.4} font-size={fs}>{rotulos.cruce}</text>
	</g>

	<!-- Octubre: el último dato y el anterior -->
	<g class="cambia" class:oculta={estado !== 'octubre'}>
		<circle class="punto" cx={prev.x} cy={prev.y} r={fs * 0.3} />
		<text class="r fuerte" x={prev.x} y={prev.y + fs + 8} text-anchor="middle" font-size={fs}>{porcentaje(T.anterior.esp.v)}</text>
		<text class="r fuerte" x={fin.x - 9} y={fin.y + fs * 0.35} text-anchor="end" font-size={fs * 1.15}>{porcentaje(T.final.esp.v)}</text>
		{#each partir(rotulos.octubre, Math.max(12, Math.floor((fin.x - e.l) * 0.55 / car))) as l, i}
			<text class="r" x={fin.x - 9} y={fin.y + fs * 1.9 + i * (fs + 3)} text-anchor="end" font-size={fs}>{l}</text>
		{/each}
	</g>

	<!-- Nota de los avisos -->
	<g class="cambia" class:oculta={rev < 0.98}>
		<circle class="aviso" cx={e.l + fs * 0.4} cy={pie - fs * 0.35} r={fs * 0.4} />
		{#each partir(rotulos.avisos, Math.floor((e.r - e.l - fs * 1.5) / car)) as l, i}
			<text class="r" x={e.l + fs * 1.3} y={pie + i * (fs + 3)} font-size={fs}>{l}</text>
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

	.rejilla {
		stroke: var(--raya);
		stroke-width: 1;
	}

	.linea {
		fill: none;
		stroke-width: 2.2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.linea.esp {
		stroke: var(--teja);
	}

	.linea.per {
		stroke: var(--azul);
		stroke-dasharray: 5 3;
	}

	.banda.esp {
		fill: var(--banda-teja);
	}

	.banda.per {
		fill: var(--banda-azul);
	}

	.aviso {
		fill: var(--papel);
		stroke: var(--tinta);
		stroke-width: 1.4;
	}

	.punto {
		fill: var(--teja);
	}

	.ruptura {
		stroke: var(--tinta-2);
		stroke-dasharray: 2 3;
	}

	.media {
		stroke: var(--tinta);
		stroke-width: 1.5;
	}

	.cruce {
		stroke: var(--tinta-3);
	}

	.lupa {
		fill: var(--raya);
		opacity: 0.7;
	}
</style>
