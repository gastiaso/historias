import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/** Con «npm run dev», recarga la página al guardar un guion (guiones/*.md) o al regenerar los datos. */
const recargarAlEditar = {
	name: 'recargar-al-editar',
	configureServer(server) {
		server.watcher.on('change', (archivo) => {
			const f = archivo.replace(/\\/g, '/');
			if ((f.includes('/guiones/') && f.endsWith('.md')) || (f.includes('/static/datos/') && f.endsWith('.json'))) {
				server.ws.send({ type: 'full-reload' });
			}
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), recargarAlEditar],
	// En Windows, vigilar build/ mientras se reconstruye tumba el servidor de desarrollo.
	server: { watch: { ignored: ['**/build/**'] } }
});
