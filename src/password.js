// Error de configuración inválida. No lleva texto para el usuario: code y params
// identifican qué falló, y la UI lo traduce con la clave `errors.${code}`.
export class PasswordConfigError extends Error {
  constructor(code, params = {}) {
    super(code);
    this.name = "PasswordConfigError";
    this.code = code;
    this.params = params;
  }
}

export function generatePassword(
  length = 12,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
  excludeAmbiguous = false
) {
  let upperCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lowerCharacters = "abcdefghijklmnopqrstuvwxyz";
  let numericCharacters = "0123456789";
  const symbolCharacters = "!@#$%&*.?=-";

  // quita los caracteres que se confunden visualmente
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

  const activeSets = [];
  if (uppercase) activeSets.push(upperCharacters);
  if (lowercase) activeSets.push(lowerCharacters);
  if (numbers) activeSets.push(numericCharacters);
  if (symbols) activeSets.push(symbolCharacters);

  if (activeSets.length === 0) {
    throw new PasswordConfigError("noCharacterSets");
  }

  if (length < 8) {
    throw new PasswordConfigError("minLength", { min: 8 });
  }

  if (length < activeSets.length) {
    throw new PasswordConfigError("lengthBelowSets", { min: activeSets.length });
  }

  const allCharacters = activeSets.join("");

  // al menos un carácter de cada tipo activo
  const characters = activeSets.map((set) => set[randomIndex(set.length)]);

  // el resto sale del pool combinado de los tipos activos
  while (characters.length < length) {
    characters.push(allCharacters[randomIndex(allCharacters.length)]);
  }

  // Fisher-Yates, para que los caracteres garantizados no queden al principio.
  // No usar sort() con un comparador aleatorio: no da una mezcla uniforme
  for (let i = characters.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join("");
}

// entero uniforme en [0, max) con crypto.getRandomValues; el muestreo por rechazo
// descarta el último tramo incompleto de 2^32 para evitar el sesgo de `valor % max`
function randomIndex(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % max;
}
