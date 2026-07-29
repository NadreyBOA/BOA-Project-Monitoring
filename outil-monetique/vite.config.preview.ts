import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Build de prévisualisation uniquement : produit un unique fichier HTML
// autonome (JS/CSS inlinés) pour partager/ouvrir l'app sans serveur.
// N'est pas utilisé pour un déploiement réel (voir vite.config.ts).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-preview',
    emptyOutDir: true,
  },
});
