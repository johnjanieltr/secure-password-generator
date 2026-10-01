// --- Tema (oscuro/claro) ---
// El script inline del <head> ya aplicó data-theme (para evitar parpadeo);
// aquí solo se sincronizan los íconos y se maneja el toggle.

import { writeStorage } from "./storage.js";

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
    writeStorage("theme", theme);
  }
}

export function initTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  setTheme(currentTheme, false);

  // el clic sí guarda el tema, para que prevalezca en visitas futuras
  $themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    setTheme(isLight ? "dark" : "light", true);
  });
}
