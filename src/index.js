import { generatePassword, PasswordConfigError } from "./password.js";
import { scrambleReveal, waveAnimate, cancelAnimations } from "./animations.js";
import { initTheme } from "./theme.js";
import { initLanguage, t } from "./i18n.js";
import { loadPreferences, savePreferences } from "./preferences.js";

const $resultingPassword = document.getElementById("resulting-password");
const $lengthInput = document.getElementById("check-length");
const $lengthValue = document.getElementById("length-value");
const $uppercaseInput = document.getElementById("check-uppercase");
const $lowercaseInput = document.getElementById("check-lowercase");
const $numbersInput = document.getElementById("check-numbers");
const $symbolsInput = document.getElementById("check-symbols");
const $copyBtn = document.getElementById("copy-btn");
const $copyTooltip = document.getElementById("copy-tooltip");
const $refreshBtn = document.getElementById("refresh-btn");
const $liveRegion = document.getElementById("live-region");

function readInputs() {
  return {
    length: $lengthInput.value,
    uppercase: $uppercaseInput.checked,
    lowercase: $lowercaseInput.checked,
    numbers: $numbersInput.checked,
    symbols: $symbolsInput.checked,
  };
}

function applyInputs(preferences) {
  $lengthInput.value = preferences.length;
  $lengthValue.textContent = preferences.length;
  $uppercaseInput.checked = preferences.uppercase;
  $lowercaseInput.checked = preferences.lowercase;
  $numbersInput.checked = preferences.numbers;
  $symbolsInput.checked = preferences.symbols;
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage(onLanguageChange);
  initTheme();

  // si no hay preferencias guardadas, se quedan los valores por defecto del HTML
  const preferences = loadPreferences();
  if (preferences) applyInputs(preferences);

  renderPassword();
});

// actualiza el número en vivo mientras se arrastra el slider (change llega al soltarlo)
$lengthInput.addEventListener("input", () => {
  $lengthValue.textContent = $lengthInput.value;
});

// cualquier cambio en las opciones regenera la contraseña y la guarda
document.addEventListener("change", (e) => {
  if (
    e.target.matches(
      "#check-length, #check-uppercase, #check-lowercase, #check-numbers, #check-symbols"
    )
  ) {
    renderPassword();
    savePreferences(readInputs());
  }
});

// contraseña real; se copia desde aquí y no desde textContent, que puede tener
// texto intermedio de una animación o un mensaje de error
let currentPassword = null;

// error mostrado ({ code, params }) o null; se guarda para retraducirlo al cambiar de idioma
let currentError = null;

let tooltipTimeoutId = null;

// copia la contraseña y lo confirma con la ola y el tooltip
$copyBtn.addEventListener("click", async () => {
  // si la configuración es inválida no hay contraseña que copiar
  if (currentPassword === null) return;

  const password = currentPassword;

  try {
    // navigator.clipboard solo existe en contextos seguros (HTTPS o localhost):
    // por http con la IP de la red local es undefined y esto lanza TypeError
    await navigator.clipboard.writeText(password);

    waveAnimate($resultingPassword, password);
    showCopyFeedback(t("actions.copied"));
  } catch (error) {
    console.log("No se pudo copiar la contraseña:", error);
    showCopyFeedback(t("actions.copyFailed"));
  }
});

// muestra el tooltip (solo visual) con el resultado de copiar y lo anuncia a lectores de pantalla
function showCopyFeedback(message) {
  $copyTooltip.textContent = message;
  $copyTooltip.classList.remove("opacity-0");
  $copyTooltip.classList.add("opacity-100");
  announce(message);

  // clics seguidos reinician el temporizador en vez de acumularse
  clearTimeout(tooltipTimeoutId);
  tooltipTimeoutId = setTimeout(() => {
    $copyTooltip.classList.remove("opacity-100");
    $copyTooltip.classList.add("opacity-0");
  }, 1500);
}

// anuncia un mensaje en la live region. Se vacía primero y se rellena en el
// siguiente tick para que el mismo mensaje dos veces seguidas se vuelva a anunciar
function announce(message) {
  $liveRegion.textContent = "";
  setTimeout(() => {
    $liveRegion.textContent = message;
  }, 50);
}

$refreshBtn.addEventListener("click", renderPassword);

function renderPassword() {
  const length = parseInt($lengthInput.value, 10);
  const uppercase = $uppercaseInput.checked;
  const lowercase = $lowercaseInput.checked;
  const numbers = $numbersInput.checked;
  const symbols = $symbolsInput.checked;

  try {
    const password = generatePassword(length, uppercase, lowercase, numbers, symbols);
    currentPassword = password;
    currentError = null;
    scrambleReveal($resultingPassword, password);
  } catch (error) {
    if (!(error instanceof PasswordConfigError)) throw error;

    // se anuncia solo cuando el error aparece, no cada vez que se repite
    const isNewError = currentError === null;

    currentPassword = null;
    currentError = { code: error.code, params: error.params };
    renderError();
    if (isNewError) announce($resultingPassword.textContent);
  }
}

// muestra el error en el idioma actual; cancelAnimations() evita que una animación en curso lo tape
function renderError() {
  cancelAnimations();
  $resultingPassword.textContent = t(`errors.${currentError.code}`, currentError.params);
}

// i18n.js ya tradujo el HTML; solo falta el error, si lo hay. La contraseña no se regenera
function onLanguageChange() {
  if (currentError) renderError();
}
