// --- Detalle de privacidad del pie ---
// Botón ⓘ que despliega un panel (patrón disclosure). Mismo comportamiento que el
// menú de idioma: con mouse se abre con hover (con retraso para cruzar el hueco
// hasta el panel); con toque, clic de teclado (Enter/Espacio) alterna; Escape y
// un clic o toque fuera lo cierran.

const $privacyButton = document.getElementById("privacy-button");
const $privacyPanel = document.getElementById("privacy-panel");

const OPEN_DELAY = 100;
const CLOSE_DELAY = 200;

let hoverTimeoutId = null;

// tipo del último puntero que presionó el botón, para distinguir mouse de toque
let lastPointerType = "mouse";

function isOpen() {
  return $privacyButton.getAttribute("aria-expanded") === "true";
}

function setOpen(open) {
  clearTimeout(hoverTimeoutId);
  $privacyPanel.classList.toggle("hidden", !open);
  $privacyButton.setAttribute("aria-expanded", String(open));
}

export function initPrivacyInfo() {
  // hover solo con mouse, sobre el botón o el panel abierto
  for (const $target of [$privacyButton, $privacyPanel]) {
    $target.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(hoverTimeoutId);
      if (!isOpen()) hoverTimeoutId = setTimeout(() => setOpen(true), OPEN_DELAY);
    });

    $target.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(hoverTimeoutId);
      hoverTimeoutId = setTimeout(() => setOpen(false), CLOSE_DELAY);
    });
  }

  $privacyButton.addEventListener("pointerdown", (e) => {
    lastPointerType = e.pointerType;
  });

  // con mouse el clic nunca cierra (el hover ya lo abrió); con toque o teclado alterna
  $privacyButton.addEventListener("click", (e) => {
    const fromKeyboard = e.detail === 0;
    setOpen(!fromKeyboard && lastPointerType === "mouse" ? true : !isOpen());
  });

  $privacyButton.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) setOpen(false);
  });

  document.addEventListener("pointerdown", (e) => {
    if (isOpen() && !$privacyButton.contains(e.target) && !$privacyPanel.contains(e.target)) {
      setOpen(false);
    }
  });
}
