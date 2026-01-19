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

````js
export default defineConfig([
  # TanStack Pacer Showcase (React)

  Single-page showcase app demonstrating TanStack Pacer’s core patterns with interactive demos and live state.

  ## What’s included

  Each section explains the “why”, then lets you tweak options and watch the state change.

  - **Debouncer**: collapse rapid input changes into one execution after a quiet period.
  - **Throttler**: enforce at most one execution per time window (with leading/trailing controls).
  - **Rate Limiter**: hard caps within a window (fixed vs sliding windows, rejections, remaining).
  - **Queue**: enqueue items, process over time, priority ordering, max size, expiration, batch flush.
  - **Batching**: collect items into batches by time/size/custom triggers, cancel/flush/reset.

  This project intentionally uses both TanStack Pacer React state subscription patterns:

  - Hook-level selector (3rd argument) to opt into specific state reactivity
  - Instance `.Subscribe` component for deep/tree subscriptions

  ## Run locally

  ```bash
  npm install
  npm run dev
````

Build:

```bash
npm run build
```

## Key files

- `src/App.tsx` — all five demos
- `src/App.css` + `src/index.css` — layout/theme styles
- `src/main.tsx` — wraps the app with `PacerProvider`
  extends: [
