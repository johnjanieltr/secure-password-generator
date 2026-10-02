// --- Idioma de la interfaz ---
// Los textos traducibles se marcan en el HTML con data-i18n (textContent) y
// data-i18n-aria-label (atributo aria-label). Al cambiar de idioma se recorren
// esos elementos y se reemplaza su contenido con el diccionario.

import { translations } from "./translations.js";
import { initLanguageMenu, syncLanguageMenu } from "./language-menu.js";
import { readStorage, writeStorage } from "./storage.js";

const SUPPORTED_LANGUAGES = ["en", "es", "pt", "fr"];
const DEFAULT_LANGUAGE = "en";
const LANGUAGE_KEY = "language";

// valor del atributo lang de <html> para cada idioma
const HTML_LANG = { en: "en", es: "es", pt: "pt-BR", fr: "fr" };

const $metaDescription = document.querySelector('meta[name="description"]');

let currentLanguage = DEFAULT_LANGUAGE;

// idioma guardado por el usuario; si no hay, el primero del navegador que
// coincida por prefijo (es-AR → es); si ninguno coincide, inglés
function detectLanguage() {
  const stored = readStorage(LANGUAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(stored)) return stored;

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const browserLanguage of browserLanguages) {
    const prefix = browserLanguage?.slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(prefix)) return prefix;
  }

  return DEFAULT_LANGUAGE;
}

// devuelve el texto traducido de una clave, interpolando {nombre} con params;
// si falta en el idioma actual cae al inglés, y si tampoco existe devuelve la clave
export function t(key, params = {}) {
  const text =
    translations[currentLanguage]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;

  return text.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match
  );
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(($el) => {
    $el.textContent = t($el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach(($el) => {
    $el.setAttribute("aria-label", t($el.dataset.i18nAriaLabel));
  });

  $metaDescription.setAttribute("content", t("meta.description"));
}

// aplica el idioma a la página, sincroniza el selector y opcionalmente lo persiste
function setLanguage(language, persist) {
  currentLanguage = language;
  document.documentElement.setAttribute("lang", HTML_LANG[language]);
  applyTranslations();
  syncLanguageMenu(language, t("language.label"));

  if (persist) {
    writeStorage(LANGUAGE_KEY, language);
  }
}

// onChange se llama después de que el usuario cambia el idioma, para que
// index.js pueda volver a traducir lo que no está marcado en el HTML
export function initLanguage(onChange) {
  // el idioma detectado no se guarda: solo una elección explícita prevalece
  setLanguage(detectLanguage(), false);

  initLanguageMenu((language) => {
    setLanguage(language, true);
    onChange();
  });
}
