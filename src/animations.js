// caracteres solo para el efecto visual del scramble, nunca para la contraseña real
const SCRAMBLE_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*.?=-";

// se consulta .matches en cada animación para respetar cambios hechos con la app abierta
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// cada animación nueva lo incrementa, y así la anterior sabe que debe detenerse
let scrambleRunId = 0;

// timeout que restaura el texto plano tras la ola; se cancela para que no pise una contraseña nueva
let waveTimeoutId = null;

// detiene el scramble y la ola en curso; se usa antes de mostrar un error para que la animación no lo tape
export function cancelAnimations() {
  ++scrambleRunId;
  clearTimeout(waveTimeoutId);
}

// anima el texto de un elemento revelando cada caracter en cascada, tipo "decrypt"
export function scrambleReveal(element, finalText, duration = 500) {
  const runId = ++scrambleRunId;
  clearTimeout(waveTimeoutId);

  if (reducedMotionQuery.matches) {
    element.textContent = finalText;
    return;
  }

  const length = finalText.length;
  const startTime = performance.now();
  const settleInterval = duration / length;

  function frame(now) {
    // una animación más nueva cancela esta
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
  // cancela un scramble en curso para que no pise la ola
  ++scrambleRunId;

  if (reducedMotionQuery.matches) {
    element.textContent = text;
    return;
  }

  const chars = text.split("");
  const length = chars.length;

  // duración del rebote de cada caracter
  const charDuration = Math.min(350, duration);
  // separación entre el inicio de cada caracter, para que el último termine en `duration`
  const delayStep = length > 1 ? (duration - charDuration) / (length - 1) : 0;

  element.innerHTML = chars
    .map((char, i) => {
      const delay = i * delayStep;
      const safeChar = char === " " ? "&nbsp;" : char;
      return `<span class="wave-char" style="animation-delay:${delay}ms; animation-duration:${charDuration}ms;">${safeChar}</span>`;
    })
    .join("");

  // al terminar, vuelve a texto plano para no dejar spans en el DOM
  clearTimeout(waveTimeoutId);
  waveTimeoutId = setTimeout(() => {
    element.textContent = text;
  }, duration + charDuration - delayStep + 50);
}
