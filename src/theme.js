// --- Tema (oscuro/claro) ---
// theme-init.js ya aplicó data-theme en el <head> (para evitar parpadeo);
// aquí solo se sincronizan los íconos y se maneja el toggle.

import { writeStorage } from "./storage.js";
import { t } from "./i18n.js";

const $themeToggle = document.getElementById("theme-toggle");
const $sunIcon = document.getElementById("sun-icon");
const $moonIcon = document.getElementById("moon-icon");
const $themeColor = document.querySelector('meta[name="theme-color"]');

// aplica el tema al <html>, sincroniza los íconos y opcionalmente lo persiste
function setTheme(theme, persist) {
  const isLight = theme === "light";

  if (isLight) {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  $sunIcon.classList.toggle("hidden", !isLight);
  $moonIcon.classList.toggle("hidden", isLight);

  // la barra del navegador móvil toma el fondo del tema activo
  const background = getComputedStyle(document.documentElement).getPropertyValue("--color-app-bg");
  $themeColor.setAttribute("content", background.trim());

  // el label dice a qué tema cambia el botón; al cambiar la clave, applyTranslations
  // lo mantiene traducido cuando cambia el idioma
  const labelKey = isLight ? "theme.toDark" : "theme.toLight";
  $themeToggle.dataset.i18nAriaLabel = labelKey;
  $themeToggle.setAttribute("aria-label", t(labelKey));

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
