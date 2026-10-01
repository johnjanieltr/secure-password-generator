// pool de caracteres usado únicamente para el efecto visual de scramble
const SCRAMBLE_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*.?=-";

// preferencia del sistema de reducir movimiento; .matches se actualiza solo si el
// usuario la cambia con la app abierta, así que se consulta en cada animación
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// contador para poder cancelar una animación vieja si arranca una nueva antes de que termine
let scrambleRunId = 0;

// timeout que restaura el texto plano al terminar la ola; se cancela si se genera
// una contraseña nueva para que la ola vieja no la sobrescriba
let waveTimeoutId = null;

// anima el texto de un elemento revelando cada caracter en cascada, tipo "decrypt"
export function scrambleReveal(element, finalText, duration = 500) {
  const runId = ++scrambleRunId;
  clearTimeout(waveTimeoutId);

  // con movimiento reducido se muestra el texto final directamente
  if (reducedMotionQuery.matches) {
    element.textContent = finalText;
    return;
  }

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
export function waveAnimate(element, text, duration = 500) {
  // cancela un scramble en curso para que no pise la ola (o el texto final)
  ++scrambleRunId;

  // con movimiento reducido no hay ola, solo se asegura el texto final
  if (reducedMotionQuery.matches) {
    element.textContent = text;
    return;
  }

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
  clearTimeout(waveTimeoutId);
  waveTimeoutId = setTimeout(() => {
    element.textContent = text;
  }, duration + charDuration - delayStep + 50);
}
