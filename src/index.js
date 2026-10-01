import { generatePassword } from "./password.js";
import { scrambleReveal, waveAnimate } from "./animations.js";
import { initTheme } from "./theme.js";
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

// lee los valores actuales de los inputs como un objeto de preferencias
function readInputs() {
  return {
    length: $lengthInput.value,
    uppercase: $uppercaseInput.checked,
    lowercase: $lowercaseInput.checked,
    numbers: $numbersInput.checked,
    symbols: $symbolsInput.checked,
  };
}

// aplica un objeto de preferencias a los inputs
function applyInputs(preferences) {
  $lengthInput.value = preferences.length;
  $lengthValue.textContent = preferences.length;
  $uppercaseInput.checked = preferences.uppercase;
  $lowercaseInput.checked = preferences.lowercase;
  $numbersInput.checked = preferences.numbers;
  $symbolsInput.checked = preferences.symbols;
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  // si no hay preferencias guardadas, se quedan los valores por defecto del HTML
  const preferences = loadPreferences();
  if (preferences) applyInputs(preferences);

  renderPassword();
});

// actualiza el número visible en tiempo real mientras se arrastra el slider
$lengthInput.addEventListener("input", () => {
  $lengthValue.textContent = $lengthInput.value;
});

// detecta cualquier cambio en los inputs
document.addEventListener("change", (e) => {
  if (
    e.target.matches(
      "#check-length, #check-uppercase, #check-lowercase, #check-numbers, #check-symbols"
    )
  ) {
    savePreferences(readInputs());
    renderPassword();
  }
});

// contraseña real generada; se copia desde aquí y no desde textContent, que puede
// tener texto intermedio de una animación o un mensaje de error
let currentPassword = null;

// contador para poder cancelar un tooltip viejo si el usuario hace click varias veces seguidas
let tooltipTimeoutId = null;

// copia la contraseña actual al portapapeles y muestra tooltip + animación de confirmación
$copyBtn.addEventListener("click", async () => {
  // si la configuración es inválida no hay contraseña que copiar
  if (currentPassword === null) return;

  const password = currentPassword;

  try {
    await navigator.clipboard.writeText(password);

    waveAnimate($resultingPassword, password);

    $copyTooltip.classList.remove("opacity-0");
    $copyTooltip.classList.add("opacity-100");

    // si el usuario hace click varias veces seguidas, reinicia el temporizador en vez de acumularlos
    clearTimeout(tooltipTimeoutId);
    tooltipTimeoutId = setTimeout(() => {
      $copyTooltip.classList.remove("opacity-100");
      $copyTooltip.classList.add("opacity-0");
    }, 1500);
  } catch (error) {
    console.log("No se pudo copiar la contraseña:", error);
  }
});

// genera una nueva contraseña manteniendo la configuración actual de los inputs
$refreshBtn.addEventListener("click", renderPassword);

// obtiene los valores actuales de los inputs y actualiza el <p> en el HTML
function renderPassword() {
  const length = parseInt($lengthInput.value, 10);
  const uppercase = $uppercaseInput.checked;
  const lowercase = $lowercaseInput.checked;
  const numbers = $numbersInput.checked;
  const symbols = $symbolsInput.checked;

  try {
    const password = generatePassword(length, uppercase, lowercase, numbers, symbols);
    currentPassword = password;
    scrambleReveal($resultingPassword, password);
  } catch (error) {
    currentPassword = null;
    $resultingPassword.textContent = error.message;
  }
}
