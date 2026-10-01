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
    throw new PasswordConfigError("noCharacterSets");
  }

  if (length < 8) {
    throw new PasswordConfigError("minLength", { min: 8 });
  }

  if (length < activeSets.length) {
    throw new PasswordConfigError("lengthBelowSets", { min: activeSets.length });
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
