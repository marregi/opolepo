# Incorporar un documento entregado por el usuario

Conserva el `.md` original junto a un JSON con `id` estable, `title`, `category` (nombre completo) y `questions`. Para cada pregunta:

```json
{
  "id": "tema01-p01",
  "text": "Enunciado",
  "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
  "correct": 0,
  "section": "Título principal › Apartado",
  "quote": "Cita literal del texto visible que justifica la respuesta."
}
```

`correct` va de 0 a 3. `section` es la ruta de encabezados separada por ` › `; usa `""` si no hay encabezados. La cita debe ser única en el apartado y estar dentro de un mismo párrafo, elemento de lista o celda. No copies los delimitadores de formato (`**`, por ejemplo). Un salto de línea normal puede copiarse como espacio.

Guarda los dos archivos con el mismo nombre base (por ejemplo `tema01.md` y `tema01.json`) en esta carpeta. Se incorporan automáticamente.

Para una categoría nueva, añade su nombre **al final** de `categories` en `src/data.js` para mantener estables los identificadores existentes. Reutiliza el mismo nombre para otros ficheros de esa categoría. Mantén los identificadores de documentos y preguntas al corregir el texto. `npm run build` comprueba las referencias de los materiales registrados.

Estos materiales forman parte de la web distribuida por GitHub Pages. Para apuntes de acceso restringido, súbelos con la cuenta administradora desde Corpus documental y crea sus preguntas en el banco; el Markdown se guarda en `documents` con las políticas de lectura de Supabase, no en el bucket público de PDF.
