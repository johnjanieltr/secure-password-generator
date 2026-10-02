# Generador de contraseñas seguras

[English](README.md) · **Español**

Generador de contraseñas del lado del cliente, hecho con JavaScript vanilla y Tailwind CSS. Las contraseñas se generan con la Web Crypto API y nunca salen de tu dispositivo.

**Demo:** https://secure-password-generator-b96.pages.dev/

![Generador de contraseñas seguras en tema oscuro](og-image.png)

## Funciones

- Contraseñas criptográficamente seguras de 8 a 50 caracteres, con mayúsculas, minúsculas, números y símbolos.
- Copiar con un clic, con confirmación visual y un aviso claro si no se puede copiar.
- Tema oscuro y claro.
- Interfaz en inglés, español, portugués (Brasil) y francés, detectada según el idioma del navegador.
- El idioma, el tema y las opciones se recuerdan entre visitas.
- Funciona en escritorio y móvil, con mouse, toque o teclado.

## Seguridad y privacidad

- **Aleatoriedad segura:** cada carácter sale de `crypto.getRandomValues`, nunca de `Math.random`. Los índices aleatorios usan muestreo por rechazo para evitar el sesgo de `valor % n`.
- **Mezcla uniforme:** la contraseña garantiza al menos un carácter de cada tipo elegido y luego los mezcla con Fisher–Yates. Se descartó ordenar con un comparador aleatorio porque no es uniforme: en una prueba de 200.000 mezclas, el primer carácter se quedaba en su lugar el 17,1 % de las veces, cuando lo esperado es 8,3 %.
- **Nada se envía a ningún lado:** una Content-Security-Policy estricta (`connect-src 'none'`, y scripts, estilos e imágenes solo del propio sitio) hace que el navegador bloquee cualquier intento de enviar datos a otro servidor.
- **Headers de seguridad:** el sitio se sirve con `frame-ancestors 'none'`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy` (ver [`_headers`](_headers)).
- **Sin cookies, sin rastreo y sin scripts de terceros.** Las preferencias se guardan solo en `localStorage`, y la app funciona igual si el navegador lo bloquea (simplemente no recuerda tus elecciones).

## Accesibilidad

- Navegación completa con teclado y foco visible en todos los controles.
- Anuncios para lectores de pantalla del resultado de copiar y de los errores de configuración, mediante una única live region.
- El menú de idioma y el botón de información de privacidad siguen los patrones de WAI-ARIA y funcionan con hover, toque y teclado.
- Las animaciones respetan `prefers-reduced-motion`.

## Tecnologías

- HTML y JavaScript vanilla (módulos ES), sin framework ni bundler.
- [Tailwind CSS v4](https://tailwindcss.com/), compilado con la CLI de Tailwind.
- Alojada en [Cloudflare Pages](https://pages.cloudflare.com/).

## Estructura del proyecto

```
index.html            Marcado, clases de Tailwind y metadatos
_headers              Headers HTTP de seguridad para Cloudflare Pages
src/
  index.js            Punto de entrada: conecta los eventos y muestra la contraseña
  password.js         generatePassword(): función pura, sin DOM
  animations.js       Animaciones de scramble y de ola
  i18n.js             Detección de idioma y traducción
  translations.js     Diccionario de traducciones (4 idiomas)
  language-menu.js    Menú desplegable de idioma accesible
  privacy-info.js     Detalle de privacidad del pie
  theme.js            Cambio de tema
  theme-init.js       Aplica el tema guardado antes del primer pintado
  preferences.js      Guarda y restaura las opciones del generador
  storage.js          Acceso seguro a localStorage
  input.css           Punto de entrada de Tailwind y tokens de diseño
  styles.css          CSS compilado (generado, se versiona)
```

## Correr en local

Requiere Node.js 24.20.0 o superior.

```bash
npm install
npm run dev        # recompila el CSS con cada cambio
npx serve .        # en otra terminal, sirve la app
```

Abre la URL que muestra `serve`. La app debe servirse por HTTP: abrir `index.html` directamente (`file://`) no funciona, porque ahí no cargan los módulos ES.

Antes de hacer commit, compila el CSS minificado:

```bash
npm run build
```

## Despliegue

Cloudflare Pages publica la raíz del repositorio tal cual con cada push a `main`. No hay build en el servidor, así que el `src/styles.css` compilado debe estar commiteado.

## Flujo de desarrollo

Diseñé y desarrollé este proyecto apoyándome en [Claude Code](https://claude.com/claude-code) como asistente de IA. Definí los requisitos, tomé las decisiones de producto, diseño y seguridad, y revisé cada cambio antes de hacer commit. El asistente me ayudó a comparar opciones de implementación, agilizar el trabajo repetitivo y automatizar las pruebas en el navegador con Chrome headless y Puppeteer: simular un teléfono táctil, usar la app solo con el teclado, comprobar que la política de seguridad (CSP) no bloqueara nada de la propia app y repetir acciones muy seguidas, como desmarcar opciones mientras corre una animación.

Como parte de ese proceso hice una revisión completa del código, que detectó varios errores: la forma de mezclar los caracteres no era del todo aleatoria (el problema explicado en la sección de seguridad), la app no arrancaba si el navegador bloqueaba `localStorage` y algunas animaciones podían tapar los mensajes de error. Cada arreglo lo comprobé reproduciendo el error antes y después de corregirlo.

## Licencia

[MIT](LICENSE) © johnjanieltr
