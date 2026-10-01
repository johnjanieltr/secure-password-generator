// --- Tema (oscuro/claro) ---
// Nota: el atributo data-theme YA fue aplicado por el script inline en el <head>
// (para evitar parpadeo). Aquí solo sincronizamos los íconos y manejamos
// el toggle manual del usuario.

const $themeToggle = document.getElementById("theme-toggle");
const $sunIcon = document.getElementById("sun-icon");
const $moonIcon = document.getElementById("moon-icon");

// aplica el tema al <html>, sincroniza los íconos y opcionalmente lo persiste
function setTheme(theme, persist) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    $sunIcon.classList.remove("hidden");
    $moonIcon.classList.add("hidden");
  } else {
    document.documentElement.removeAttribute("data-theme");
    $moonIcon.classList.remove("hidden");
    $sunIcon.classList.add("hidden");
  }

  if (persist) {
    localStorage.setItem("theme", theme);
  }
}

export function initTheme() {
  // sincroniza los íconos con el tema que el script del <head> ya aplicó
  const currentTheme =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  setTheme(currentTheme, false);

  // clic manual del usuario: alterna el tema y esta vez SÍ lo guarda como
  // preferencia explícita, para que prevalezca en visitas futuras
  $themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    setTheme(isLight ? "dark" : "light", true);
  });
}
