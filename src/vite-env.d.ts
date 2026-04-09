/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** "false" para volver al registro con correo y codigo. Cualquier otro valor = un solo paso. */
  readonly VITE_SKIP_EMAIL_VERIFICATION?: string;
  /** API key de Desmos para calculadora embebida: https://www.desmos.com/api/ */
  readonly VITE_DESMOS_API_KEY?: string;
}
