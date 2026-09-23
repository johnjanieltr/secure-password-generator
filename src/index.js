const $resultingPassword = document.getElementById("resulting-password");
const $lengthInput = document.getElementById("check-length");
const $lengthValue = document.getElementById("length-value");
const $copyBtn = document.getElementById("copy-btn");
const $copyTooltip = document.getElementById("copy-tooltip");
const $refreshBtn = document.getElementById("refresh-btn");

// pool de caracteres usado únicamente para el efecto visual de scramble
const SCRAMBLE_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*.?=-";

// contador para poder cancelar una animación vieja si arranca una nueva antes de que termine
let scrambleRunId = 0;

// anima el texto de un elemento revelando cada caracter en cascada, tipo "decrypt"
function scrambleReveal(element, finalText, duration = 500) {
  const runId = ++scrambleRunId;
  const length = finalText.length;
  const startTime = performance.now();
  const settleInterval = duration / length;

  function frame(now) {
    // si ya arrancó una animación más nueva, esta se detiene sola
    if (runId !== scrambleRunId) return;

    const elapsed = now - startTime;
    let display = "";

    for (let i = 0; i < length; i++) {
      const settleTime = (i + 1) * settleInterval;

      if (elapsed >= settleTime) {
        display += finalText[i];
      } else {
        display +=
          SCRAMBLE_CHARACTERS[
            Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)
          ];
      }
    }

    element.textContent = display;

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      element.textContent = finalText;
    }
  }

  requestAnimationFrame(frame);
}

// anima cada caracter con un rebote (sube y baja) en cascada, tipo "ola"
function waveAnimate(element, text, duration = 500) {
  const chars = text.split("");
  const length = chars.length;

  // duración del rebote de cada caracter individual
  const charDuration = Math.min(350, duration);
  // qué tan separado arranca cada caracter respecto al anterior, para que el último termine justo en "duration"
  const delayStep = length > 1 ? (duration - charDuration) / (length - 1) : 0;

  element.innerHTML = chars
    .map((char, i) => {
      const delay = i * delayStep;
      const safeChar = char === " " ? "&nbsp;" : char;
      return `<span class="wave-char" style="animation-delay:${delay}ms; animation-duration:${charDuration}ms;">${safeChar}</span>`;
    })
    .join("");

  // al terminar, volvemos a texto plano para no dejar el DOM con spans innecesarios
  setTimeout(() => {
    element.textContent = text;
  }, duration + charDuration - delayStep + 50);
}

document.addEventListener("DOMContentLoaded", () => {
  scrambleReveal($resultingPassword, generatePassword());
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
    renderPassword();
  }
});

// contador para poder cancelar un tooltip viejo si el usuario hace click varias veces seguidas
let tooltipTimeoutId = null;

// copia la contraseña actual al portapapeles y muestra tooltip + animación de confirmación
$copyBtn.addEventListener("click", async () => {
  const password = $resultingPassword.textContent;

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
  const length = parseInt(document.getElementById("check-length").value, 10);
  const uppercase = document.getElementById("check-uppercase").checked;
  const lowercase = document.getElementById("check-lowercase").checked;
  const numbers = document.getElementById("check-numbers").checked;
  const symbols = document.getElementById("check-symbols").checked;

  try {
    const password = generatePassword(length, uppercase, lowercase, numbers, symbols);
    scrambleReveal($resultingPassword, password);
  } catch (error) {
    $resultingPassword.textContent = error.message;
  }
}

function generatePassword(
  length = 12,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
  excludeAmbiguous = false
) {
  // characters
  let upperCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lowerCharacters = "abcdefghijklmnopqrstuvwxyz";
  let numericCharacters = "0123456789";
  const symbolCharacters = "!@#$%&*.?=-";

  // Si excludeAmbiguous está activo, quitamos los caracteres que se confunden visualmente
  if (excludeAmbiguous) {
    const ambiguous = "O0Il1";
    upperCharacters = upperCharacters
      .split("")
      .filter((c) => !ambiguous.includes(c))
      .join("");
    lowerCharacters = lowerCharacters
      .split("")
      .filter((c) => !ambiguous.includes(c))
      .join("");
    numericCharacters = numericCharacters
      .split("")
      .filter((c) => !ambiguous.includes(c))
      .join("");
  }

  // Armamos dinámicamente la lista de conjuntos activos según los parámetros
  const activeSets = [];
  if (uppercase) activeSets.push(upperCharacters);
  if (lowercase) activeSets.push(lowerCharacters);
  if (numbers) activeSets.push(numericCharacters);
  if (symbols) activeSets.push(symbolCharacters);

  // Validaciones
  if (activeSets.length === 0) {
    throw new Error("Debes activar al menos un tipo de carácter");
  }

  if (length < 8) {
    throw new Error("La longitud mínima recomendada es 8 caracteres");
  }

  if (length < activeSets.length) {
    throw new Error(`La longitud debe ser al menos ${activeSets.length}`);
  }

  const allCharacters = activeSets.join("");

  // Usamos crypto.getRandomValues para generar valores aleatorios criptográficamente seguros
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = "";

  // Aseguramos al menos un carácter de cada tipo ACTIVO
  activeSets.forEach((set, i) => {
    password += set[randomValues[i] % set.length];
  });

  // Completamos el resto de la contraseña con el pool combinado de tipos activos
  for (let i = activeSets.length; i < length; i++) {
    password += allCharacters[randomValues[i] % allCharacters.length];
  }

  // Mezclamos los caracteres para que no siempre empiece igual
  password = password
    .split("")
    .sort(() => {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      return buffer[0] - 0x7fffffff;
    })
    .join("");

  return password;
}