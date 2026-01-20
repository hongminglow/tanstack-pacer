# TanStack Pacer Showcase

An interactive single-page showcase demonstrating the core pacing utilities from TanStack Pacer.

This repo contains short, interactive demos for:

- Debouncing
- Throttling
- Rate limiting
- Queueing
- Batching

---

## Purpose

Explore and experiment with timing and execution patterns using adjustable options and live state readouts. Each section includes:

- A practical “what problem does this solve?” description
- A guided set of controls (with suggested test steps)
- A small “core snippet” that mirrors the demo’s real usage

---

## Quick Comparison

- **Debouncer** — collapse rapid events into a single execution after a quiet period (e.g., input autosave).
- **Throttler** — enforce a minimum gap between executions (e.g., scroll handlers).
- **Rate Limiter** — enforce quotas/limits over a moving window (e.g., API quotas).
- **Queue** — schedule items for processing with priority/expiration/backpressure.
- **Batching** — collect and process items together for efficient bulk operations.

---

## Getting Started

```bash
npm install
npm run dev
```

---

## Key Concepts & Options

### Debouncer

Use when you want: “run only after things have been quiet for a while” (search inputs, autosave).

Key options:

- `wait`: quiet period before execution.
- `leading`: also execute immediately at the start of a burst.
- `enabled`: gate execution (can be a boolean or a function).

Core snippet:

```ts
import { useDebouncer } from "@tanstack/react-pacer";

const debouncer = useDebouncer(setValue, {
  wait: 500,
  leading: false,
  enabled: () => query.length > 2,
});

// e.g. onChange
debouncer.maybeExecute(nextValue);
```

---

### Throttler

Use when you want: “run at most once per time window” (scroll/drag handlers).

Key options:

- `wait`: minimum time between executions.
- `leading`: execute immediately when the window opens.
- `trailing`: execute once more at the end of the window (using the latest value).

Core snippet:

```ts
import { useThrottler } from "@tanstack/react-pacer";

const throttler = useThrottler(setValue, {
  wait: 300,
  leading: true,
  trailing: true,
});

throttler.maybeExecute(nextValue);
```

---

### Rate Limiter

Use when you want: “hard quotas over time” (API quotas, abuse prevention).

Key options:

- `limit` + `window`: quota and time window.
- `windowType`:
  - `fixed`: strict buckets that reset after the window.
  - `sliding`: a moving window; capacity returns gradually as older calls expire.
- `enabled`: gate execution.

Core snippet:

```ts
import {
  rateLimiterOptions,
  useRateLimiter,
} from "@tanstack/react-pacer/rate-limiter";

const limiter = useRateLimiter(fn, {
  ...rateLimiterOptions({ limit: 5, window: 5_000 }),
  windowType: "fixed",
});

limiter.maybeExecute(payload);
```

---

### Queue (Queuer)

Use when you want: “buffer work and process it over time” (uploads, background sync, backpressure).

Key options:

- `maxSize`: when the queue is full, new items can be rejected.
- `wait(queue)`: spacing between item executions (can be dynamic).
- `getPriority(item)`: higher priority items run first.
- `addItemsTo` / `getItemsFrom`: front/back behavior (FIFO vs LIFO).
- `expirationDuration`: drop items that have been queued too long.

Core snippet:

```ts
import { useQueuer } from "@tanstack/react-pacer/queuer";

const queuer = useQueuer(processItem, {
  maxSize: 10,
  wait: 400,
  getPriority: (item) => item.priority,
  expirationDuration: 8_000,
});

queuer.addItem(item);
```

---

### Batching (Batcher)

Use when you want: “collect items and process them together” (bulk API calls, analytics).

Key options:

- `maxSize`: flush immediately when batch reaches this many items.
- `wait(batcher)`: flush after a timeout (can be dynamic).
- `getShouldExecute(items)`: custom “flush now” rule.

Core snippet:

```ts
import { useBatcher } from "@tanstack/react-pacer";

const batcher = useBatcher(flushHandler, {
  maxSize: 20,
  wait: 500,
  getShouldExecute: (items) => items.some((i) => i.urgent),
});

batcher.addItem(item);
```

---

## Async Hooks (Worth Knowing)

If you’re pacing _async_ work (API calls, async processing) and you want `maybeExecute()` to return a promise/result, TanStack Pacer also provides async variants:

- `useAsyncDebouncer` / `useAsyncDebouncedCallback`
- `useAsyncThrottler` / `useAsyncThrottledCallback`
- `useAsyncRateLimiter` / `useAsyncRateLimitedCallback`
- `useAsyncQueuer`
- `useAsyncBatcher` / `useAsyncBatchedCallback`

These are especially useful when you want to handle errors and results at the call site (instead of only inside the paced callback).

---

## React State Subscriptions

This showcase uses two subscription patterns:

- **Selector (3rd argument)**: opt-in to re-renders for only the state you care about.
- **`instance.Subscribe`**: subscribe deep in the tree without threading selectors through props.
