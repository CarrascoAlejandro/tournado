export {};

declare global {
  interface Window {
    bracketsViewer?: any | undefined;
    google: any; // Declara 'google' como una propiedad global
    googleTranslateElementInit: () => void; // Declara 'googleTranslateElementInit
  }
}
