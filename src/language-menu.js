// --- Menú desplegable del selector de idioma ---
// Un <select> nativo no puede abrirse con hover (showPicker() exige un clic o
// una tecla), así que es un botón + listbox propio con el patrón de WAI-ARIA:
// - mouse: se abre con hover y se cierra al salir (con retraso para cruzar el hueco)
// - toque: se abre y cierra con el botón
// - teclado: Enter/Espacio/flechas abren; flechas, Home/End navegan;
//   Enter/Espacio eligen; Escape y Tab cierran
// Este módulo no conoce las traducciones: avisa la elección con onSelect.

const $languageMenu = document.getElementById("language-menu");
const $languageButton = document.getElementById("language-button");
const $languageCurrent = document.getElementById("language-current");
const $languageListbox = document.getElementById("language-listbox");
const $languageOptions = [...$languageListbox.querySelectorAll('[role="option"]')];

const OPEN_DELAY = 100;
const CLOSE_DELAY = 200;

let hoverTimeoutId = null;

// tipo del último puntero que presionó el botón, para distinguir mouse de toque
let lastPointerType = "mouse";

function isOpen() {
  return $languageButton.getAttribute("aria-expanded") === "true";
}

function getSelectedOption() {
  return $languageOptions.find(($option) => $option.getAttribute("aria-selected") === "true");
}

// focusSelected: mueve el foco a la opción activa (solo al abrir con teclado)
function openMenu(focusSelected) {
  $languageListbox.classList.remove("hidden");
  $languageButton.setAttribute("aria-expanded", "true");
  if (focusSelected) (getSelectedOption() ?? $languageOptions[0]).focus();
}

// returnFocus: devuelve el foco al botón (al cerrar desde dentro de la lista)
function closeMenu(returnFocus) {
  clearTimeout(hoverTimeoutId);
  $languageListbox.classList.add("hidden");
  $languageButton.setAttribute("aria-expanded", "false");
  if (returnFocus) $languageButton.focus();
}

// marca la opción activa y actualiza el texto y el nombre accesible del botón
export function syncLanguageMenu(language, label) {
  $languageOptions.forEach(($option) => {
    const isSelected = $option.dataset.value === language;
    $option.setAttribute("aria-selected", String(isSelected));

    if (isSelected) {
      const name = $option.textContent.trim();
      $languageCurrent.textContent = name;
      $languageButton.setAttribute("aria-label", `${label}: ${name}`);
    }
  });
}

export function initLanguageMenu(onSelect) {
  function select($option) {
    closeMenu(true);
    onSelect($option.dataset.value);
  }

  // hover solo con mouse: en pantallas táctiles no existe y el toque abre el menú
  $languageMenu.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(hoverTimeoutId);
    if (!isOpen()) hoverTimeoutId = setTimeout(() => openMenu(false), OPEN_DELAY);
  });

  $languageMenu.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(hoverTimeoutId);
    hoverTimeoutId = setTimeout(() => {
      // si el foco quedó dentro de la lista, se lo devolvemos al botón
      closeMenu($languageListbox.contains(document.activeElement));
    }, CLOSE_DELAY);
  });

  $languageButton.addEventListener("pointerdown", (e) => {
    lastPointerType = e.pointerType;
  });

  // con mouse el clic nunca cierra (el hover ya lo abrió y cerrarlo sería un
  // parpadeo); con toque o teclado (Enter/Espacio) alterna
  $languageButton.addEventListener("click", (e) => {
    const fromKeyboard = e.detail === 0;
    if (!fromKeyboard && lastPointerType === "mouse") {
      clearTimeout(hoverTimeoutId);
      openMenu(false);
    } else if (isOpen()) {
      closeMenu(false);
    } else {
      openMenu(fromKeyboard);
    }
  });

  $languageButton.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu(true);
    } else if (e.key === "Escape" && isOpen()) {
      closeMenu(false);
    }
  });

  $languageListbox.addEventListener("click", (e) => {
    const $option = e.target.closest('[role="option"]');
    if ($option) select($option);
  });

  $languageListbox.addEventListener("keydown", (e) => {
    const index = $languageOptions.indexOf(document.activeElement);
    const last = $languageOptions.length - 1;

    switch (e.key) {
      case "ArrowDown":
        $languageOptions[Math.min(index + 1, last)].focus();
        break;
      case "ArrowUp":
        $languageOptions[Math.max(index - 1, 0)].focus();
        break;
      case "Home":
        $languageOptions[0].focus();
        break;
      case "End":
        $languageOptions[last].focus();
        break;
      case "Enter":
      case " ":
        if (index !== -1) select($languageOptions[index]);
        break;
      case "Escape":
        closeMenu(true);
        break;
      case "Tab":
        // deja que el Tab siga su curso natural desde el botón
        closeMenu(true);
        return;
      default:
        return;
    }
    e.preventDefault();
  });

  // clic o toque fuera del menú lo cierra
  document.addEventListener("pointerdown", (e) => {
    if (isOpen() && !$languageMenu.contains(e.target)) closeMenu(false);
  });
}
