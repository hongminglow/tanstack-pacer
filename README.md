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

Explore and experiment with timing and execution patterns using adjustable options and live state readouts. Each section contains a short explanation, an interactive demo, and a compact usage snippet showing idiomatic React + TypeScript usage with syntax highlighting.

---

## Quick Comparison

- **Debouncer** — collapse rapid events into a single execution after a quiet period (e.g., input autosave).
- **Throttler** — enforce a minimum gap between executions (e.g., scroll handlers).
- **Rate Limiter** — enforce quotas/limits over a moving window (e.g., API quotas).
- **Queue** — schedule items for processing with priority/expiration/backpressure.
- **Batching** — collect and process items together for efficient bulk operations.

---

## Usage Examples (TypeScript)

Debouncer (basic):

```ts
import { useDebouncer } from "@tanstack/pacer-react";

const debouncer = useDebouncer(
  () => {
    // called after quiet period
  },
  { wait: 300 },
);

// methods: debouncer.execute(), debouncer.cancel(), debouncer.flush()
```

Throttler (dynamic wait + selector):

```ts
import { useThrottler } from "@tanstack/pacer-react";

const throttler = useThrottler(
  () => doWork(),
  { wait: () => (fastMode ? 50 : 300) },
  (s) => ({ isPending: s.isPending, lastExecutedAt: s.lastExecutedAt }),
);

// call throttler.execute() as user events arrive
```

Rate Limiter (quota window):

```ts
import { useRateLimiter } from "@tanstack/pacer-react";

const limiter = useRateLimiter({ limit: 10, per: 60_000 });

// use limiter.maybeExecute(() => fetch(...)) to respect the quota
```

Queue (priority + expiration):

```ts
import { useQueuer } from "@tanstack/pacer-react";

const queue = useQueuer({
  processItem: async (item) => upload(item),
  getPriority: (item) => item.priority,
  expirationDuration: 30_000,
});

queue.addItem({ id: "u1", priority: 10 });
```

Batching (size/time rules):

```ts
import { useBatcher } from "@tanstack/pacer-react";

const batcher = useBatcher({
  flushAtSize: 20,
  flushAfter: 200, // ms
  flushHandler: (items) => api.bulkSend(items),
});

batcher.addItem(item);
```

---

## Notes

- The React adapter supports optional 3rd-argument selectors for fine-grained subscriptions and a `.Subscribe` component for instance-scoped subscriptions.
- Instances expose rich methods such as `flush`, `cancel`, `start`/`stop`, `reset`, and `setOptions` for runtime control.
