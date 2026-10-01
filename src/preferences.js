// --- Preferencias de los inputs (longitud, mayúsculas, minúsculas, números, símbolos) ---
// Este módulo solo lee y escribe en localStorage; no conoce los inputs del DOM.

const PREFERENCES_KEY = "passwordPreferences";

// guarda en localStorage el objeto de preferencias recibido
export function savePreferences(preferences) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

// devuelve las preferencias guardadas, o null si no hay nada (o no se pudieron leer)
export function loadPreferences() {
  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.log("No se pudieron cargar las preferencias guardadas:", error);
    return null;
  }
}
