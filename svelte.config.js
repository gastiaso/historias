import adapter from '@sveltejs/adapter-static';

/** Sitio estático para GitHub Pages en gastiaso.github.io/historias/.
 *  Todas las páginas se generan al construir (prerender); no hay servidor. */
const config = {
	kit: {
		adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
		paths: { base: '/historias' },
		alias: {
			$guiones: 'guiones',
			$datos: 'static/datos'
		}
	}
};

export default config;
