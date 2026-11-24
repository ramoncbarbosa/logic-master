# Logic Master

[Português](README.md) · [English](README.en.md) · **Español** · [Français](README.fr.md)

Un quiz para practicar lógica computacional: proposiciones, tablas de verdad, diagramas de flujo, condicionales, bucles y prueba de escritorio.

**Pruébalo:** https://logic-master-web.ramon-cs-barbosa.workers.dev

Creé Logic Master como Recurso Educativo Digital para la asignatura Tópicos Especiales: Educación en Computación (UFPA, 2026.2).
La idea es simple: que los estudiantes practiquen lógica computacional por medio de quizzes.

## Cómo funciona para quien estudia

Hay cuatro quizzes, en una secuencia que va de los fundamentos a las tablas de verdad, las estructuras condicionales y los bucles. Tres de ellos empiezan con un video de apoyo, que cambia según el idioma elegido.

Eliges un quiz, escribes tu nombre y tu correo y lees el término de uso de los datos. Las preguntas aparecen una por pantalla. Algunas muestran compuertas lógicas, tablas de verdad o diagramas de flujo; otras traen pseudocódigo para que hagas la prueba de escritorio; también hay preguntas de verdadero o falso y otras con hasta seis opciones. En cuanto confirmas la respuesta, aparece la explicación del razonamiento, aciertes o no.

Al final ves tu nota, tu tiempo, cómo te fue en cada concepto y la revisión completa de las preguntas. Cada quiz tiene un ranking público: cuenta el mejor intento de cada persona, primero por aciertos y, en caso de empate, por el menor tiempo. En el ranking solo aparecen el nombre de pila y la inicial del apellido.

Toda la plataforma, incluido el contenido de los quizzes, está en portugués, inglés, español y francés. El idioma se elige automáticamente según el navegador y se puede cambiar con el ícono de idiomas.

## Cómo funciona para quien enseña

El docente tiene un área propia, con inicio de sesión, donde puede:

- crear y editar quizzes (enunciado, opciones, imagen, código, video y explicación), con la traducción de cada pregunta a los demás idiomas;
- ver en gráficos qué preguntas falló más el grupo y qué opciones incorrectas se eligieron más, lo que suele revelar la confusión detrás del error;
- seguir el desempeño por concepto y por día;
- ver en un globo desde dónde respondieron los estudiantes;
- consultar la lista de participantes y exportarlo todo en CSV;
- seguir la evaluación de usabilidad (cuestionario SUS) que los estudiantes responden al final del quiz, con nota promedio, clasificación, gráficos, comentarios y exportación en CSV.

## De qué está hecho

Todo funciona en Cloudflare, en el plan gratuito:

- **api/**: back end con [Hono](https://hono.dev) en un Cloudflare Worker
- **base de datos**: [D1](https://developers.cloudflare.com/d1/) (SQLite).
- **web/**: front end con React, Vite, Tailwind y [shadcn/ui](https://ui.shadcn.com), servido por otro Worker, que además reenvía las llamadas `/api` a la API.

La API no tiene dirección pública: solo el Worker del sitio se comunica con ella. Por eso no es posible falsificar la IP ni la ubicación de quien responde. Además, el proyecto tiene límite de solicitudes por IP, bloqueo tras varias contraseñas incorrectas y cabeceras de seguridad, y los datos personales se anonimizan automáticamente después de 180 días.

## Ejecutarlo en tu computadora

Necesitarás Node 22 o superior y [pnpm](https://pnpm.io).

```bash
pnpm install
cp api/.dev.vars.example api/.dev.vars
cp api/.dev.vars .dev.vars
pnpm db:reset:local
pnpm preview
```

El sitio se abre en http://localhost:8787. `db:reset:local` crea la base de datos con los cuatro quizzes y una cuenta de docente de prueba, definida en `.dev.vars`. En la pantalla de inicio de sesión, el botón **Usar cuenta de prueba** completa los datos por ti.

Si vas a trabajar en la interfaz, ejecuta `pnpm dev:api` y `pnpm dev:web` en dos terminales para tener recarga automática.

## Usarlo con tu grupo

El proyecto es abierto justamente para que otros docentes puedan usarlo y adaptarlo. Para tener tu propia versión:

1. Haz un fork de este repositorio.
2. Crea la base de datos en tu cuenta de Cloudflare con `pnpm wrangler d1 create logic-master-db` y coloca el `database_id` generado en `api/wrangler.jsonc`.
3. Si quieres aceptar solo correos de tu institución, pon el dominio en `ALLOWED_EMAIL_DOMAINS` (en el mismo archivo). Vacío acepta cualquier correo.
4. Prepara la base de datos y publica:

   ```bash
   pnpm db:migrate:remote
   pnpm --filter api exec wrangler secret put JWT_SECRET
   pnpm run deploy
   ```

5. Crea tu acceso de docente (la contraseña se pide en la terminal):

   ```bash
   pnpm professor --email tu@tuinstitucion.edu --name "Tu Nombre" --remote
   ```

Después solo tienes que entrar al área docente y armar tus quizzes.

## Licencia

Todo el proyecto, tanto el contenido educativo (preguntas, explicaciones e imágenes) como el código fuente, está bajo [Creative Commons Atribución-NoComercial-CompartirIgual 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es) (CC BY-NC-SA 4.0).

En la práctica, esto significa que puedes:

- usar el quiz con tus grupos, en el aula o a distancia;
- copiar, adaptar las preguntas y crear tu propia versión;
- compartirlo con otros docentes.

A cambio, solo pido tres cosas:

- **cita la fuente**, con un enlace a este repositorio;
- **no lo uses con fines comerciales**: nada de vender el material, cobrar por acceder a él o incluirlo en un producto de pago;
- **mantén la misma licencia** en tus adaptaciones, para que sigan abiertas para todos.

El texto completo está en el archivo [LICENSE.es](LICENSE.es).

¿Encontraste un error en una pregunta o tienes una idea? Abre un issue, me encantará verlo.
