# Ajetrez - Publicación en GitHub + Netlify

## Flujo de trabajo
1. Inicializar repo en GitHub
   ```bash
   git init
   git add .
   git commit -m "Primer commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/ajetrez.git
   git push -u origin main
   ```

2. Conectar en Netlify
   - "Add new site" → "Import from Git" → GitHub → repo `ajetrez`
   - Build command: _(vacío)_
   - Publish directory: `/`
   - Confirmar

3. Actualizar en el futuro
   ```bash
   git add -A
   git commit -m "Actualización"
   git push
   ```
   Netlify hace deploy automático.

## Estructura de carpetas
```
/
├─ index.html
├─ juego.html
├─ manifest.json
├─ sw.js
├─ netlify.toml
├─ _redirects
├─ assets/
│   ├─ imagenes/   (todas las imágenes, íconos y banners)
│   └─ media/      (audios y videos)
├─ css/
└─ js/
```
