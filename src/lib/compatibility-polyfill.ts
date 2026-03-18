/**
 * Polyfills de compatibilidade para dispositivos antigos.
 * Este arquivo deve ser importado no topo do main.tsx.
 */

// Polyfill para Promise.withResolvers (ES2024)
// Essencial para evitar o erro "Promise.withResolvers is not a function"
if (typeof Promise !== 'undefined' && !Promise.withResolvers) {
  Promise.withResolvers = function<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
  console.log('🛡️ Guardian: Polyfill para Promise.withResolvers aplicado.');
}

// Outros polyfills comuns que podem faltar em WebViews antigos
if (typeof Array.prototype.at !== 'function') {
  Array.prototype.at = function(index: number) {
    index = Math.trunc(index) || 0;
    if (index < 0) index += this.length;
    if (index < 0 || index >= this.length) return undefined;
    return this[index];
  };
}

// Suporte para globalThis em ambientes muito antigos
if (typeof globalThis === 'undefined') {
  (window as any).globalThis = window;
}
