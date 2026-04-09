const DESMOS_API_VERSION = "v1.11";

export type DesmosCalculatorApi = {
  destroy: () => void;
  setExpression: (state: { id: string; latex: string }) => void;
};

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        element: HTMLElement,
        options?: Record<string, unknown>,
      ) => DesmosCalculatorApi;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function desmosApiKey(): string {
  const k = import.meta.env.VITE_DESMOS_API_KEY;
  return typeof k === "string" ? k : "";
}

export function loadDesmosScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Desmos) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-desmos-calculator="1"]');
    if (existing) {
      if (window.Desmos) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Script de Desmos no cargado.")));
      return;
    }
    const s = document.createElement("script");
    s.src = `https://www.desmos.com/api/${DESMOS_API_VERSION}/calculator.js?apiKey=${encodeURIComponent(desmosApiKey())}`;
    s.async = true;
    s.dataset.desmosCalculator = "1";
    s.onload = () => resolve();
    s.onerror = () =>
      reject(
        new Error(
          "No se pudo cargar Desmos. Solicita una API key en desmos.com y configura VITE_DESMOS_API_KEY.",
        ),
      );
    document.head.appendChild(s);
  });
  return scriptPromise;
}

const instances = new WeakMap<HTMLElement, DesmosCalculatorApi>();

export async function mountDesmosGraph(container: HTMLElement, latex: string): Promise<void> {
  await loadDesmosScript();
  const Desmos = window.Desmos;
  if (!Desmos) {
    throw new Error("La API de Desmos no esta disponible.");
  }
  const prev = instances.get(container);
  prev?.destroy();
  container.replaceChildren();
  const calc = Desmos.GraphingCalculator(container, {
    expressions: false,
    settingsMenu: false,
    zoomButtons: true,
    border: false,
  });
  instances.set(container, calc);
  const trimmed = latex.trim();
  if (trimmed) {
    calc.setExpression({ id: "g1", latex: trimmed });
  }
}

export function destroyDesmosGraph(container: HTMLElement): void {
  const prev = instances.get(container);
  prev?.destroy();
  instances.delete(container);
  container.replaceChildren();
}
