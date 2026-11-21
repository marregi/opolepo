# opolepo

Panel de preparación de oposiciones en React. Incluye una demostración local con 17 preguntas, cuatro categorías y tres sesiones de ejemplo. Al iniciar sesión con Supabase se abre un historial personal vacío. Las sesiones conservan una copia de sus preguntas y respuestas para que la edición posterior no altere los resultados.

## Ejecutar
Con Node.js 22: `npm ci` y `npm run dev`. `npm run build` genera la web estática en `dist/`.

## Supabase
1. Crea un proyecto gratuito y ejecuta `supabase.sql` una vez en el editor SQL.
2. Copia `.env.example` a `.env.local` y rellena la URL y la clave pública anon de tu proyecto. Reinicia Vite. Nunca uses la clave `service_role` en el frontend.
3. Activa el acceso por correo y configura Site URL y las URL de redirección autorizadas en Authentication, incluyendo la URL final con el subdirectorio del repositorio. En Ajustes puedes solicitar el enlace de acceso.
4. Para nombrar administrador a un usuario registrado, ejecuta en el editor SQL `update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb where id = 'UUID-DEL-USUARIO';`. Cierra sesión y vuelve a acceder. Los permisos de escritura los comprueba Supabase mediante RLS.

## GitHub Pages
Sube el proyecto a la rama `main`, selecciona GitHub Actions en Settings → Pages y crea las variables de Actions `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. El flujo incluido compila y publica al hacer push. La web publicada requiere Supabase e inicio de sesión; sin variables muestra un aviso de configuración. La demo solo se activa con `npm run dev` sin Supabase. Los materiales con `"demo": true` se excluyen del catálogo de producción.

## Estudio
### Apuntes Markdown y referencias
Para incorporar los ficheros entregados junto con sus preguntas a la demo, consulta `src/materiales/README.md`. El lector abre el documento completo y resalta la cita dentro de su apartado sin abandonar el cuestionario. Si el texto no coincide o la referencia es ambigua, solicita su revisión.

En Supabase, el administrador también puede subir un `.md` directamente desde Corpus documental (hasta 1 MB), seleccionar su categoría y después elegirlo como fuente en el editor de preguntas. Para un proyecto que ya tenía la tabla de documentos, aplica `migrations/002_markdown_documents.sql`. La instalación nueva incluye el cambio en `supabase.sql`.

En Corpus documental el administrador puede registrar enlaces o subir PDF públicos de hasta 10 MB. Para citar una página de un PDF, copia la dirección del documento y añade `#page=12` (por ejemplo) en la referencia de la pregunta.

El corpus de muestra enlaza a legislación oficial. Cada pregunta del banco tiene cuatro opciones, una categoría, una respuesta correcta y una referencia concreta. Desde el banco el administrador puede añadir y editar preguntas y referencias. Las fuentes referenciadas se agrupan en Corpus documental.

«Añadir falladas» da prioridad a preguntas pendientes sin superar el total ni salir de las categorías elegidas. Un fallo reinicia la racha; por defecto, tres aciertos consecutivos retiran la pregunta del repaso. El tema sigue al sistema salvo elección explícita en Ajustes.

En **Mis sesiones**, «Empezar y guardar» crea un favorito con las reglas del cuestionario. Tanto los favoritos como el detalle de una sesión completada permiten volver al configurador. En sesiones anteriores a esta versión se recuperan las categorías y el total; la preferencia de falladas no se había registrado.

**Preguntas falladas** muestra las pendientes actuales. **Estadísticas** cuenta todos los intentos (también en sesiones sin terminar), usando la fecha de cada respuesta nueva o, para respuestas antiguas, la fecha de inicio de la sesión. Los intervalos personalizados incluyen ambos días. Las barras usan una escala común a los resultados filtrados.

Para ampliar el temario, añade los nombres a `categories` en `src/data.js` sin reordenar los existentes: su posición es su identificador. Si ya instalaste el esquema antiguo de Supabase, ejecuta `migrations/001_expand_document_categories.sql` para admitir documentos de las categorías nuevas. La demo conserva sus cuatro categorías reales.
