// Script clásico (no módulo) cargado en el <head> antes del CSS: se ejecuta antes
// del primer pintado para evitar el parpadeo de tema (FOUC). Es un archivo y no un
// script inline porque la Content-Security-Policy solo permite scripts propios.
// Oscuro por defecto, sin importar el sistema; claro solo si el usuario lo eligió.
// Si el navegador bloquea localStorage, leerlo lanza un error: se ignora y queda el tema oscuro.
try {
  if (localStorage.getItem("theme") === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    // mismo valor que --color-app-bg del tema claro (el CSS todavía no cargó)
    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#F5F3EE");
  }
} catch {}
