// --- Acceso a localStorage ---
// Único módulo que lo usa. Si el navegador lo bloquea, la app funciona sin guardar
// preferencias: las lecturas devuelven null y las escrituras no hacen nada.

const TEST_KEY = "__storage_test__";

// se detecta una sola vez al cargar: acceder a localStorage ya puede lanzar
// SecurityError, y en Firefox con el almacenamiento desactivado vale null
const storageAvailable = (() => {
  try {
    localStorage.setItem(TEST_KEY, TEST_KEY);
    localStorage.removeItem(TEST_KEY);
    return true;
  } catch {
    return false;
  }
})();

if (!storageAvailable) {
  console.info("localStorage no está disponible: las preferencias no se guardarán.");
}

// devuelve el valor guardado, o null si no existe o no hay almacenamiento
export function readStorage(key) {
  if (!storageAvailable) return null;

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// si guardar falla (por ejemplo, cuota llena) se ignora: perder una preferencia no debe cortar la app
export function writeStorage(key, value) {
  if (!storageAvailable) return;

  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.info("No se pudo guardar la preferencia:", error);
  }
}
