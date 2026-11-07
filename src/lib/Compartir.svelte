<!--
	Título de la página y etiquetas para compartir (Open Graph y la tarjeta grande de X/Bluesky/Mastodon).
	Las imágenes (1200 × 630) están en static/compartir/ y se generan con «npm run compartir».
-->
<script>
	import { NOMBRE, URL_SITIO } from '$lib/sitio.js';

	/** ruta: la de la página, empezando y acabando en «/»; imagen: nombre del PNG en static/compartir/ */
	let { titulo, descripcion, ruta = '/', imagen, alt, tipo = 'website' } = $props();

	const url = $derived(URL_SITIO + ruta);
	const img = $derived(`${URL_SITIO}/compartir/${imagen}`);
</script>

<svelte:head>
	<title>{titulo}</title>
	<meta name="description" content={descripcion} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content={tipo} />
	<meta property="og:site_name" content={NOMBRE} />
	<meta property="og:locale" content="es_ES" />
	<meta property="og:title" content={titulo} />
	<meta property="og:description" content={descripcion} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={img} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={alt} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
