// Vitest setup: polyfills / mocks simples
import '@testing-library/jest-dom';
// Polyfill básico para ResizeObserver en JSDOM
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
	class ResizeObserver {
		private _cb: ResizeObserverCallback;
		constructor(cb: ResizeObserverCallback) { this._cb = cb; }
		observe(_target?: Element) { /* no-op en tests */ }
		unobserve(_target?: Element) { /* no-op */ }
		disconnect() { /* no-op */ }
	}
	(globalThis as any).ResizeObserver = ResizeObserver as any;
}
