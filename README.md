# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # TanStack Pacer Showcase

  A compact interactive showcase demonstrating core pacing utilities from TanStack Pacer.

  Purpose: explore and experiment with timing and execution patterns—debouncing, throttling, rate limiting, queueing, and batching—using adjustable options and live state readouts.

  About TanStack Pacer
  - A focused toolkit for controlling when and how functions or items are executed.
  - Provides utilities like Debouncer, Throttler, Rate Limiter, Queuer, and Batcher for both sync and async workflows.
  - Built-in reactive state (React adapter) with opt-in selectors and `.Subscribe` for efficient UI updates.

  What each section helps with
  - Debouncer — collapse rapid events into a single execution after a quiet period (e.g., search input, autosave).
  - Throttler — ensure at most one execution per time window (e.g., scroll/drag handlers, UI updates).
  - Rate Limiter — enforce hard quotas over a window (e.g., API rate limits, request caps).
  - Queue — enqueue work and process items over time with priority, expiration, and backpressure control (e.g., upload/background sync).
  - Batching — collect items and process them together by size/time/custom rules for efficient bulk operations.

  Why Pacer is different
  - Small, composable primitives focused on pacing concerns rather than a broad framework.
  - Rich instance API (flush, cancel, start/stop, reset, setOptions) and advanced configuration (dynamic `wait`, `enabled` functions, priority/getShouldExecute hooks).
  - Reactive state with opt-in selectors and a `Subscribe` component makes UI integration efficient and precise.

  See the demo implementation in [src/App.tsx](src/App.tsx).
  extends: [
```
