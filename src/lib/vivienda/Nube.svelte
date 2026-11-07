<!--
	La nube: una muestra de entrevistas de cada barómetro (sin ponderar), un punto por entrevista.
	Cada barómetro ocupa una columna del mismo ancho. Al colorearse, en teja quien cita la vivienda como problema de España.
	Se pinta en canvas; los puntos se descargan al abrir la página.
-->
<script>
	import { onMount } from 'svelte';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { MediaQuery } from 'svelte/reactivity';
	import { cubicOut } from 'svelte/easing';
	import { base } from '$app/paths';
	import { azarFijo } from '$lib/graficos/comun.js';

	let { w, h, zona, visible, color, etiquetas, meses, rotulo, fs } = $props();

	/** @type {HTMLCanvasElement} */
	let lienzo;
	/** @type {{ mes: number[], dia: number[], esp: number[] } | null} */
	let puntos = $state.raw(null);
	const tono = new Tween(0, { duration: 900, easing: cubicOut });
	const oscuro = new MediaQuery('prefers-color-scheme: dark', false);

	$effect(() => {
		tono.set(color ? 1 : 0, { duration: prefersReducedMotion.current ? 0 : 900 });
	});

	onMount(async () => {
		const r = await fetch(`${base}/datos/vivienda/puntos.json`);
		const p = await r.json();
		puntos = { mes: p.mes, dia: p.dia, esp: p.esp };
	});

	const nb = $derived(meses.length);
	const ancho = $derived(zona.right - zona.left);

	// Posiciones: x por barómetro (con un poco de dispersión dentro de su columna), y al azar pero fija.
	const pos = $derived.by(() => {
		if (!puntos) return null;
		const n = puntos.mes.length;
		const x = new Float32Array(n);
		const y = new Float32Array(n);
		const alto = zona.bottom - zona.top;
		for (let i = 0; i < n; i++) {
			x[i] = zona.left + ((puntos.mes[i] + 0.04 + (0.92 * puntos.dia[i]) / 100) / nb) * ancho;
			y[i] = zona.top + azarFijo(i) * alto;
		}
		return { x, y, n };
	});

	// Años bajo la nube, centrados en sus barómetros.
	const años = $derived.by(() => {
		const out = [];
		let a = null;
		let desde = 0;
		meses.forEach((m, k) => {
			const año = m.slice(0, 4);
			if (año !== a) {
				if (a) out.push({ t: a, x: zona.left + ((desde + k) / 2 / nb) * ancho });
				a = año;
				desde = k;
			}
		});
		out.push({ t: a, x: zona.left + ((desde + nb) / 2 / nb) * ancho });
		return out;
	});

	$effect(() => {
		if (!lienzo || !pos) return;
		oscuro.current; // repintar si cambia el modo de color
		const t = tono.current;
		const dpr = window.devicePixelRatio || 1;
		const W = Math.round(w * dpr);
		const H = Math.round(h * dpr);
		if (lienzo.width !== W || lienzo.height !== H) {
			lienzo.width = W;
			lienzo.height = H;
		}
		const c = lienzo.getContext('2d');
		c.setTransform(dpr, 0, 0, dpr, 0, 0);
		c.clearRect(0, 0, w, h);
		const css = getComputedStyle(lienzo);
		const gris = css.getPropertyValue('--nube');
		const teja = css.getPropertyValue('--teja');
		const r = w < 640 ? 0.95 : 1.25;
		const esp = puntos.esp;
		const camino = (citan) => {
			const ri = citan ? r * (1 + 0.25 * t) : r;
			c.beginPath();
			for (let i = 0; i < pos.n; i++) {
				if (!!esp[i] !== citan) continue;
				c.moveTo(pos.x[i] + ri, pos.y[i]);
				c.arc(pos.x[i], pos.y[i], ri, 0, 6.2832);
			}
		};
		c.fillStyle = gris;
		camino(false);
		c.fill();
		camino(true);
		if (t < 1) {
			c.globalAlpha = 1 - t;
			c.fill();
		}
		if (t > 0) {
			c.globalAlpha = t;
			c.fillStyle = teja;
			c.fill();
		}
		c.globalAlpha = 1;
	});
</script>

<div class="capa" class:oculta={!visible || !puntos} aria-hidden="true">
	<canvas bind:this={lienzo} style="width:{w}px;height:{h}px"></canvas>
	<svg width={w} height={h} class:oculta={!etiquetas}>
		<text class="r" x={zona.left} y={zona.top - 10} font-size={fs}>{rotulo}</text>
		{#each años as a}
			<text class="r" x={a.x} y={zona.bottom + fs + 6} font-size={fs} text-anchor="middle">{a.t}</text>
		{/each}
	</svg>
</div>

<style>
	.capa,
	canvas,
	svg {
		position: absolute;
		inset: 0;
	}

	.capa,
	svg {
		transition: opacity 0.6s;
	}

	.oculta {
		opacity: 0;
	}
</style>
