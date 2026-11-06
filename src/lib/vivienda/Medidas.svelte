<!--
	Apoyo a diez medidas de vivienda (monográfico, P24): en contra hacia la izquierda, a favor hacia la derecha,
	ordenadas por el saldo (a favor menos en contra), que va en la última columna. Se usa el saldo porque en
	estas baterías mucha gente tiende a decir que sí a todo (aquiescencia).
	Sin color de vivienda: no es ni el problema de España ni el personal.
-->
<script>
	import { decimal } from '$lib/formato.js';

	let { w, h, zona, medidas, rotulos, visible, fs } = $props();

	const filas = $derived([...medidas].sort((a, b) => b.neto - a.neto));
	const car = $derived(fs * 0.56);
	const signo = (v) => `${Math.round(v) > 0 ? '+' : Math.round(v) < 0 ? '−' : ''}${decimal(Math.abs(v), 0)}`;

	const e = $derived.by(() => {
		const colSaldo = fs * 3.2;
		const l = zona.left;
		const r = zona.right - colSaldo;
		const t = zona.top + fs * 2.4;
		const b = zona.bottom;
		// El centro deja sitio a la izquierda para el «en contra» más largo.
		const maxContra = Math.max(...filas.map((f) => f.contra.v));
		const k = (r - l) / (100 + maxContra);
		return { l, r, t, b, c: l + maxContra * k, k, saldo: zona.right };
	});
	const alto = $derived((e.b - e.t) / filas.length);
	const grosor = $derived(Math.max(6, Math.min(12, alto * 0.32)));
</script>

<svg class="capa" class:oculta={!visible} width={w} height={h}>
	<rect class="contra" x={e.c - fs * 0.9} y={zona.top - fs * 0.45} width={fs * 0.8} height={fs * 0.8} />
	<text class="r fuerte" x={e.c - fs * 1.3} y={zona.top + fs * 0.35} text-anchor="end" font-size={fs}>{rotulos.contra}</text>
	<rect class="favor" x={e.c + fs * 0.1} y={zona.top - fs * 0.45} width={fs * 0.8} height={fs * 0.8} />
	<text class="r fuerte" x={e.c + fs * 1.3} y={zona.top + fs * 0.35} font-size={fs}>{rotulos.favor}</text>
	<text class="r fuerte" x={e.saldo} y={zona.top + fs * 0.35} text-anchor="end" font-size={fs}>{rotulos.saldo}</text>

	{#each filas as f, i (f.id)}
		{@const y = e.t + (i + 0.62) * alto}
		<text class="r" x={e.l} y={y - grosor / 2 - 4} font-size={fs * 1.05}>{f.corto}</text>
		<line class="centro" x1={e.c} x2={e.c} y1={y - grosor / 2 - 2} y2={y + grosor / 2 + 2} />
		<rect class="barra contra" class:quieta={!visible} x={e.c - f.contra.v * e.k} y={y - grosor / 2} width={f.contra.v * e.k} height={grosor}
			style="transform-origin: {e.c}px {y}px" />
		<rect class="barra favor" class:quieta={!visible} x={e.c} y={y - grosor / 2} width={f.favor.v * e.k} height={grosor}
			style="transform-origin: {e.c}px {y}px" />
		<text class="r fuerte" x={e.saldo} y={y + fs * 0.35} text-anchor="end" font-size={fs * 1.05}>{signo(f.neto)}</text>
	{/each}
</svg>

<style>
	.capa {
		position: absolute;
		inset: 0;
		transition: opacity 0.6s;
	}

	.oculta {
		opacity: 0;
	}

	.centro {
		stroke: var(--tinta-3);
	}

	.barra {
		transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
	}

	/* Mientras no se ve, las barras esperan plegadas en el centro; al aparecer, crecen. */
	.barra.quieta {
		transform: scaleX(0);
	}

	.favor {
		fill: var(--tinta-2);
	}

	.contra {
		fill: var(--contra);
	}
</style>
