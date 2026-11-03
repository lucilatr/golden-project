# GOLDEN — Narrative & Gameplay Script

Herramienta interna de producción para estructurar el guion narrativo + gameplay
del rhythm game basado en *Golden* (KPop Demon Hunters).

Una sola pantalla visual: una **barra-timeline** de la canción (como un editor de
video) y un **panel lateral** para editar cada bloque. Edición compartida en tiempo
real entre varias personas vía Supabase.

---

## 1. Probar localmente

Abrí `index.html` con doble clic, o levantá un server simple:

```bash
python3 -m http.server 8000
# luego abrí http://localhost:8000
```

Sin configurar Supabase funciona igual, pero en **modo local** (los cambios se
guardan solo en tu navegador). Para compartir y editar entre varios, seguí abajo.

---

## 2. Edición compartida en tiempo real (Supabase)

1. Creá una cuenta gratis en https://supabase.com y un proyecto nuevo.
2. En el proyecto: **SQL Editor → New query**, pegá el contenido de
   [`supabase-setup.sql`](./supabase-setup.sql) y dale **Run**.
3. Andá a **Project Settings → API** y copiá:
   - *Project URL*
   - *anon public* key
4. Pegalos en [`config.js`](./config.js):

   ```js
   window.GOLDEN_CONFIG = {
     supabaseUrl: "https://TU-PROYECTO.supabase.co",
     supabaseAnonKey: "TU-ANON-KEY",
     docId: "golden",
   };
   ```

5. Recargá. Arriba a la derecha vas a ver el indicador **● Online (en vivo)**.
   Todos los que abran el sitio con el mismo `config.js` editan el mismo documento
   y ven los cambios al instante.

> La anon key queda visible en el sitio (es lo normal en apps Supabase de cliente).
> Para una herramienta interna de equipo está bien; si querés restringir quién
> entra, se puede agregar login más adelante.

---

## 3. Publicar online (GitHub Pages)

```bash
# dentro de la carpeta del proyecto
git init
git add .
git commit -m "GOLDEN script tool"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/golden-script.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source: `main` / root → Save**.
En ~1 minuto queda en `https://TU-USUARIO.github.io/golden-script/`.

Cada vez que hagas `git push`, el sitio se actualiza. Los datos del guion NO viven
en Git: viven en Supabase (compartidos) o en el navegador (local).

---

## 4. Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Entrada |
| `styles.css` | Estilos (tema oscuro tipo editor) |
| `app.js` | Toda la lógica + datos de ejemplo (primeros 30s) |
| `config.js` | Credenciales Supabase (editás vos) |
| `supabase-setup.sql` | Esquema de la base |

Backup / export: botón **⋯ → Export JSON** dentro de la app.

## 5. Tracker: imágenes, GIF y versiones

Abrí una tarjeta y usá **Subir imagen o GIF** (también permite arrastrar varios archivos). Cada archivo recibe un número de versión editable. Elegí **Final** para marcarlo en verde o **Vieja** para dejarlo en naranja; al guardar una nueva final, la anterior pasa a vieja. Cada versión tiene feedback de hasta 300 caracteres y su botón **Descargar**. Guardá los campos con **Guardar versión y feedback**.

El botón **＋ Imagen / GIF** de una tarea sin adjuntos abre directamente el selector de archivos cuando la edición está activa. En modo lectura lleva a la sección de imágenes y muestra **Activar edición para subir archivos**; usa la misma clave de edición del Hub.

Formatos: PNG, JPG, GIF, WebP y AVIF; hasta 50 MB por archivo, sujeto al límite configurado en el bucket. Los GIF se conservan y descargan sin convertirlos. Las miniaturas anteriores siguen disponibles como v001.

Los archivos compartidos usan el bucket existente `tracker-thumbs` (o `thumbBucket` en `config.js`). Cada adjunto se guarda como una fila `kind: "attachment"` en `tracker_items`, con `taskId`, `version`, `status`, `feedback` y la referencia al archivo. No requiere migrar las tareas ni cambiar el esquema SQL existente. Editar una tarea conserva sus adjuntos y los clientes anteriores ignoran esas filas adicionales. En modo local, los archivos se conservan en IndexedDB y sus metadatos en localStorage, solo en ese navegador.

### Pruebas

Con Node.js y Google Chrome instalados: `npm ci` y `npm test`. Playwright inicia un servidor de prueba que reemplaza la configuración compartida y bloquea las solicitudes externas. Las pruebas cubren persistencia local y compartida simulada, versiones, cambio de final, feedback, descargas de GIF, errores de carga, miniaturas anteriores, modo lectura, vista lista, paginación y pantallas pequeñas.
