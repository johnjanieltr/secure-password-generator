// --- Preferencias del generador ---
// Solo lee y escribe en el almacenamiento; no conoce el DOM.

import { readStorage, writeStorage } from "./storage.js";

const PREFERENCES_KEY = "passwordPreferences";

export function savePreferences(preferences) {
  writeStorage(PREFERENCES_KEY, JSON.stringify(preferences));
}

// devuelve las preferencias guardadas, o null si no hay nada (o no se pudieron leer)
export function loadPreferences() {
  const stored = readStorage(PREFERENCES_KEY);
  if (!stored) return null;

  try {
    const preferences = JSON.parse(stored);
    return typeof preferences === "object" && preferences !== null ? preferences : null;
  } catch (error) {
    console.log("No se pudieron cargar las preferencias guardadas:", error);
    return null;
  }
}
