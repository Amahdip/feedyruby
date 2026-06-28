/// <reference types="vite/client" />

declare global {
  interface Window {
    __feedyrubyNonce?: string;
    feedyrubySurveys?: {
      renderSurvey: (options: unknown) => void;
      setNonce: (nonce: string | undefined) => void;
    };
  }
}

export {};
