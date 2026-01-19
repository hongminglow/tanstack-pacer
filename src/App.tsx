import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { useDebouncer } from "@tanstack/react-pacer/debouncer";
import { useThrottler } from "@tanstack/react-pacer/throttler";
import {
  rateLimiterOptions,
  useRateLimiter,
} from "@tanstack/react-pacer/rate-limiter";
import { useQueuer } from "@tanstack/react-pacer/queuer";
import { useBatcher } from "@tanstack/react-pacer/batcher";

type QueuePosition = "front" | "back";

function safeId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatMs(ms: number) {
  if (!Number.isFinite(ms)) return "—";
  const rounded = Math.max(0, Math.round(ms));
  if (rounded < 1000) return `${rounded}ms`;
  return `${(rounded / 1000).toFixed(2)}s`;
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <header className="cardHeader">
        <h2 className="cardTitle">{title}</h2>
        <p className="cardSubtitle">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="stat">
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <div className="fieldLabel">{label}</div>
      {children}
    </label>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="row">{children}</div>;
}

function ButtonBar({ children }: { children: React.ReactNode }) {
  return <div className="buttonBar">{children}</div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="pill">{children}</span>;
}

function CodeBlock({ value }: { value: unknown }) {
  return <pre className="code">{JSON.stringify(value, null, 2)}</pre>;
}

function DebouncerDemo() {
  const [enabled, setEnabled] = useState(true);
  const [leading, setLeading] = useState(false);
  const [waitMs, setWaitMs] = useState(500);

  const [instantSearch, setInstantSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const options = useMemo(
    () => ({
      wait: waitMs,
      leading,
      enabled: () => enabled && instantSearch.trim().length > 2,
    }),
    [enabled, instantSearch, leading, waitMs],
  );

  // Uses the 3rd argument selector to opt-in to state updates (advanced config).
  const debouncer = useDebouncer(setDebouncedSearch, options, (state) => ({
    status: state.status,
    isPending: state.isPending,
    executionCount: state.executionCount,
    lastArgs: state.lastArgs,
    canLeadingExecute: state.canLeadingExecute,
  }));

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setInstantSearch(next);
    debouncer.maybeExecute(next);
  }

  return (
    <Card
      title="Debouncer"
      subtitle="Collapse rapid changes into one call after a quiet period. Great for search boxes, resizing, or autosave."
    >
      <div className="content">
        <Row>
          <Field label="Type (executes once you pause)">
            <input
              className="input"
              type="search"
              value={instantSearch}
              onChange={onChange}
              placeholder="Try typing fast… (debounces after you stop)"
            />
          </Field>
        </Row>

        <Row>
          <Field label={`Wait: ${waitMs}ms`}>
            <input
              className="range"
              type="range"
              min={50}
              max={1500}
              step={50}
              value={waitMs}
              onChange={(e) => setWaitMs(parseInt(e.target.value, 10))}
            />
          </Field>
          <Field label="Enabled (also requires 3+ chars)">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </Field>
          <Field label="Leading edge">
            <input
              type="checkbox"
              checked={leading}
              onChange={(e) => setLeading(e.target.checked)}
            />
          </Field>
        </Row>

        <ButtonBar>
          <button className="btn" onClick={() => debouncer.flush()}>
            Flush
          </button>
          <button className="btn" onClick={() => debouncer.cancel()}>
            Cancel
          </button>
          <button className="btn" onClick={() => debouncer.reset()}>
            Reset
          </button>
        </ButtonBar>

        <div className="stats">
          <Stat label="Status" value={<Pill>{debouncer.state.status}</Pill>} />
          <Stat label="Pending" value={String(debouncer.state.isPending)} />
          <Stat label="Executions" value={debouncer.state.executionCount} />
          <Stat
            label="Last Args"
            value={
              debouncer.state.lastArgs
                ? JSON.stringify(debouncer.state.lastArgs)
                : "—"
            }
          />
        </div>

        <Row>
          <div className="split">
            <div>
              <div className="k">Instant</div>
              <div className="v">
                {instantSearch || <span className="muted">(empty)</span>}
              </div>
            </div>
            <div>
              <div className="k">Debounced</div>
              <div className="v">
                {debouncedSearch || <span className="muted">(empty)</span>}
              </div>
            </div>
          </div>
        </Row>

        <details className="details">
          <summary>Full debouncer state (Subscribe)</summary>
          <debouncer.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </debouncer.Subscribe>
        </details>
      </div>
    </Card>
  );
}

function ThrottlerDemo() {
  const now = useNow(250);
  const [waitMs, setWaitMs] = useState(500);
  const [leading, setLeading] = useState(true);
  const [trailing, setTrailing] = useState(true);

  const [instantValue, setInstantValue] = useState(25);
  const [throttledValue, setThrottledValue] = useState(25);
  const [instantMoves, setInstantMoves] = useState(0);

  const throttler = useThrottler(
    setThrottledValue,
    { wait: waitMs, leading, trailing },
    (state) => ({
      status: state.status,
      isPending: state.isPending,
      executionCount: state.executionCount,
      lastExecutionTime: state.lastExecutionTime,
      nextExecutionTime: state.nextExecutionTime,
    }),
  );

  function onRange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = parseInt(e.target.value, 10);
    setInstantValue(next);
    setInstantMoves((c) => c + 1);
    throttler.maybeExecute(next);
  }

  const msUntilNext =
    throttler.state.nextExecutionTime != null
      ? throttler.state.nextExecutionTime - now
      : undefined;

  return (
    <Card
      title="Throttler"
      subtitle="Guarantee at most one execution per window. Useful for scroll/drag handlers and expensive UI updates."
    >
      <div className="content">
        <Row>
          <Field
            label={`Drag (instant: ${instantValue}, throttled: ${throttledValue})`}
          >
            <input
              className="range"
              type="range"
              min={0}
              max={100}
              value={instantValue}
              onChange={onRange}
            />
          </Field>
        </Row>

        <Row>
          <Field label={`Wait: ${waitMs}ms`}>
            <input
              className="range"
              type="range"
              min={50}
              max={2000}
              step={50}
              value={waitMs}
              onChange={(e) => setWaitMs(parseInt(e.target.value, 10))}
            />
          </Field>
          <Field label="Leading">
            <input
              type="checkbox"
              checked={leading}
              onChange={(e) => setLeading(e.target.checked)}
            />
          </Field>
          <Field label="Trailing">
            <input
              type="checkbox"
              checked={trailing}
              onChange={(e) => setTrailing(e.target.checked)}
            />
          </Field>
        </Row>

        <ButtonBar>
          <button className="btn" onClick={() => throttler.flush()}>
            Flush
          </button>
          <button className="btn" onClick={() => throttler.cancel()}>
            Cancel
          </button>
          <button className="btn" onClick={() => throttler.reset()}>
            Reset
          </button>
        </ButtonBar>

        <div className="stats">
          <Stat label="Status" value={<Pill>{throttler.state.status}</Pill>} />
          <Stat label="Pending" value={String(throttler.state.isPending)} />
          <Stat label="Instant moves" value={instantMoves} />
          <Stat label="Executions" value={throttler.state.executionCount} />
          <Stat
            label="Until next"
            value={msUntilNext != null ? formatMs(msUntilNext) : "—"}
          />
        </div>

        <details className="details">
          <summary>Full throttler state (Subscribe)</summary>
          <throttler.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </throttler.Subscribe>
        </details>
      </div>
    </Card>
  );
}

function RateLimiterDemo() {
  const now = useNow(250);
  const [enabled, setEnabled] = useState(true);
  const [limit, setLimit] = useState(5);
  const [windowMs, setWindowMs] = useState(5000);
  const [windowType, setWindowType] = useState<"fixed" | "sliding">("fixed");

  const [instantCount, setInstantCount] = useState(0);
  const [limitedCount, setLimitedCount] = useState(0);
  const [lastRejectMs, setLastRejectMs] = useState<number | null>(null);

  const common = useMemo(
    () => rateLimiterOptions({ limit, window: windowMs }),
    [limit, windowMs],
  );

  const rateLimiter = useRateLimiter(
    setLimitedCount,
    {
      ...common,
      windowType,
      enabled: () => enabled,
      onReject: (rl) => setLastRejectMs(rl.getMsUntilNextWindow()),
    },
    (state) => ({
      executionCount: state.executionCount,
      rejectionCount: state.rejectionCount,
      executionTimes: state.executionTimes,
    }),
  );

  const remaining = rateLimiter.getRemainingInWindow();
  const msUntilNextWindow = rateLimiter.getMsUntilNextWindow();
  const isLimited = remaining <= 0;

  function send(n: number) {
    setInstantCount((prev) => {
      let next = prev;
      for (let i = 0; i < n; i += 1) {
        next += 1;
        rateLimiter.maybeExecute(next);
      }
      return next;
    });
  }

  function resetAll() {
    rateLimiter.reset();
    setInstantCount(0);
    setLimitedCount(0);
    setLastRejectMs(null);
  }

  return (
    <Card
      title="Rate Limiter"
      subtitle="Enforce hard caps within a time window (API quotas, abuse prevention). Calls beyond the limit are rejected until the window resets."
    >
      <div className="content">
        <Row>
          <Field label={`Limit: ${limit} per window`}>
            <input
              className="range"
              type="range"
              min={1}
              max={20}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            />
          </Field>
          <Field label={`Window: ${windowMs}ms`}>
            <input
              className="range"
              type="range"
              min={500}
              max={20000}
              step={500}
              value={windowMs}
              onChange={(e) => setWindowMs(parseInt(e.target.value, 10))}
            />
          </Field>
        </Row>

        <Row>
          <Field label="Window type">
            <div className="radioRow">
              <label className="radio">
                <input
                  type="radio"
                  checked={windowType === "fixed"}
                  onChange={() => setWindowType("fixed")}
                />
                Fixed
              </label>
              <label className="radio">
                <input
                  type="radio"
                  checked={windowType === "sliding"}
                  onChange={() => setWindowType("sliding")}
                />
                Sliding
              </label>
            </div>
          </Field>
          <Field label="Enabled">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </Field>
        </Row>

        <ButtonBar>
          <button className="btn" onClick={() => send(1)}>
            Send 1
          </button>
          <button className="btn" onClick={() => send(10)}>
            Burst 10
          </button>
          <button className="btn" onClick={resetAll}>
            Reset
          </button>
        </ButtonBar>

        <div className="stats">
          <Stat
            label="Status"
            value={<Pill>{isLimited ? "limited" : "ok"}</Pill>}
          />
          <Stat label="Instant clicks" value={instantCount} />
          <Stat label="Allowed" value={limitedCount} />
          <Stat label="Executions" value={rateLimiter.state.executionCount} />
          <Stat label="Rejected" value={rateLimiter.state.rejectionCount} />
          <Stat label="Remaining" value={remaining} />
          <Stat label="Next window in" value={formatMs(msUntilNextWindow)} />
          <Stat
            label="Last reject (ms)"
            value={lastRejectMs != null ? lastRejectMs : "—"}
          />
          <Stat
            label="Tick"
            value={<span className="muted">{Math.floor(now / 1000)}s</span>}
          />
        </div>

        <details className="details">
          <summary>Full rate limiter state (Subscribe)</summary>
          <rateLimiter.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </rateLimiter.Subscribe>
        </details>
      </div>
    </Card>
  );
}

type TaskItem = {
  id: string;
  label: string;
  priority: number;
};

function QueueDemo() {
  const [started, setStarted] = useState(true);
  const [waitBaseMs, setWaitBaseMs] = useState(400);
  const [maxSize, setMaxSize] = useState(8);
  const [addTo, setAddTo] = useState<QueuePosition>("back");
  const [getFrom, setGetFrom] = useState<QueuePosition>("front");

  const [label, setLabel] = useState("Task");
  const [priority, setPriority] = useState(5);

  const [processed, setProcessed] = useState<TaskItem[]>([]);
  const [lastBatch, setLastBatch] = useState<TaskItem[] | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  const queuer = useQueuer(
    (item: TaskItem) => {
      setProcessed((prev) => [item, ...prev].slice(0, 10));
      setEvents((prev) => [`executed: ${item.label}`, ...prev].slice(0, 10));
    },
    {
      started,
      maxSize,
      addItemsTo: addTo,
      getItemsFrom: getFrom,
      // Show advanced config: wait as a function (dynamic backpressure)
      wait: (q) => waitBaseMs + q.store.state.size * 75,
      // Show advanced config: priority ordering
      getPriority: (item) => item.priority,
      // Show advanced config: expiration (old items can drop)
      expirationDuration: 8000,
      onReject: (item) =>
        setEvents((prev) =>
          [`rejected(full): ${item.label}`, ...prev].slice(0, 10),
        ),
      onExpire: (item) =>
        setEvents((prev) => [`expired: ${item.label}`, ...prev].slice(0, 10)),
    },
    (state) => ({
      status: state.status,
      size: state.size,
      isRunning: state.isRunning,
      executionCount: state.executionCount,
      rejectionCount: state.rejectionCount,
      expirationCount: state.expirationCount,
      items: state.items,
    }),
  );

  function addItem() {
    const item: TaskItem = {
      id: safeId("task"),
      label: `${label} #${Math.floor(Math.random() * 1000)}`,
      priority,
    };
    const ok = queuer.addItem(item, addTo, true);
    setEvents((prev) =>
      [`add(${addTo}) ${ok ? "ok" : "failed"}: ${item.label}`, ...prev].slice(
        0,
        10,
      ),
    );
  }

  function flushBatch() {
    queuer.flushAsBatch((items: TaskItem[]) => {
      setLastBatch(items);
      setEvents((prev) =>
        [`flushAsBatch: ${items.length} items`, ...prev].slice(0, 10),
      );
      setProcessed((prev) => [...items.reverse(), ...prev].slice(0, 10));
    });
  }

  return (
    <Card
      title="Queue"
      subtitle="Queue work and process items over time (or when started). Useful for background sync, upload queues, and backpressure."
    >
      <div className="content">
        <Row>
          <Field label="Label">
            <input
              className="input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Task label"
            />
          </Field>
          <Field label={`Priority: ${priority}`}>
            <input
              className="range"
              type="range"
              min={0}
              max={10}
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value, 10))}
            />
          </Field>
        </Row>

        <Row>
          <Field
            label={`Base wait: ${waitBaseMs}ms (actual wait grows with size)`}
          >
            <input
              className="range"
              type="range"
              min={0}
              max={1500}
              step={50}
              value={waitBaseMs}
              onChange={(e) => setWaitBaseMs(parseInt(e.target.value, 10))}
            />
          </Field>
          <Field label={`Max size: ${maxSize}`}>
            <input
              className="range"
              type="range"
              min={1}
              max={20}
              value={maxSize}
              onChange={(e) => setMaxSize(parseInt(e.target.value, 10))}
            />
          </Field>
        </Row>

        <Row>
          <Field label="Started">
            <input
              type="checkbox"
              checked={started}
              onChange={(e) => setStarted(e.target.checked)}
            />
          </Field>
          <Field label="Add items to">
            <select
              className="select"
              value={addTo}
              onChange={(e) => setAddTo(e.target.value as QueuePosition)}
            >
              <option value="front">front</option>
              <option value="back">back</option>
            </select>
          </Field>
          <Field label="Get items from">
            <select
              className="select"
              value={getFrom}
              onChange={(e) => setGetFrom(e.target.value as QueuePosition)}
            >
              <option value="front">front</option>
              <option value="back">back</option>
            </select>
          </Field>
        </Row>

        <ButtonBar>
          <button className="btn" onClick={addItem}>
            Add item
          </button>
          <button className="btn" onClick={() => queuer.execute()}>
            Execute next
          </button>
          <button className="btn" onClick={() => queuer.flush(3)}>
            Flush 3
          </button>
          <button className="btn" onClick={flushBatch}>
            Flush as batch
          </button>
          <button
            className="btn"
            onClick={() =>
              queuer.state.isRunning ? queuer.stop() : queuer.start()
            }
          >
            {queuer.state.isRunning ? "Stop" : "Start"}
          </button>
          <button className="btn" onClick={() => queuer.clear()}>
            Clear
          </button>
          <button className="btn" onClick={() => queuer.reset()}>
            Reset
          </button>
        </ButtonBar>

        <div className="stats">
          <Stat label="Status" value={<Pill>{queuer.state.status}</Pill>} />
          <Stat label="Running" value={String(queuer.state.isRunning)} />
          <Stat label="Size" value={queuer.state.size} />
          <Stat label="Exec" value={queuer.state.executionCount} />
          <Stat label="Reject" value={queuer.state.rejectionCount} />
          <Stat label="Expire" value={queuer.state.expirationCount} />
        </div>

        <Row>
          <div className="split">
            <div>
              <div className="k">Queued items</div>
              <ul className="list">
                {(queuer.state.items ?? []).slice(0, 8).map((t) => (
                  <li key={t.id}>
                    <span className="mono">p{t.priority}</span> {t.label}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="k">Recent events</div>
              <ul className="list">
                {events.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        </Row>

        <Row>
          <div className="split">
            <div>
              <div className="k">Processed (most recent first)</div>
              <ul className="list">
                {processed.map((t) => (
                  <li key={t.id}>
                    <span className="mono">p{t.priority}</span> {t.label}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="k">Notes</div>
              <div className="muted">
                Items can expire after 8s and rejects happen when the queue is
                full. Priority (higher first) influences which item executes
                next.
              </div>
            </div>
          </div>
        </Row>

        {lastBatch ? (
          <details className="details">
            <summary>Last flushed batch</summary>
            <CodeBlock value={lastBatch} />
          </details>
        ) : null}

        <details className="details">
          <summary>Full queuer state (Subscribe)</summary>
          <queuer.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </queuer.Subscribe>
        </details>
      </div>
    </Card>
  );
}

type BatchItem = {
  id: string;
  payload: string;
};

type BatchResult = {
  id: string;
  at: number;
  items: BatchItem[];
};

function BatchingDemo() {
  const [started, setStarted] = useState(true);
  const [maxSize, setMaxSize] = useState(5);
  const [waitMs, setWaitMs] = useState(800);
  const [text, setText] = useState("event");
  const [batches, setBatches] = useState<BatchResult[]>([]);
  const [events, setEvents] = useState<string[]>([]);

  const batcher = useBatcher(
    (items: BatchItem[]) => {
      setBatches((prev) =>
        [{ id: safeId("batch"), at: Date.now(), items }, ...prev].slice(0, 6),
      );
    },
    {
      started,
      maxSize,
      // Advanced config: wait as function (dynamic)
      wait: (b) => Math.max(150, waitMs - b.store.state.size * 50),
      // Advanced config: execute early based on items
      getShouldExecute: (items) =>
        items.some((i) => i.payload.includes("!now")),
      onItemsChange: (b) =>
        setEvents((prev) =>
          [`itemsChange(size=${b.store.state.size})`, ...prev].slice(0, 8),
        ),
      onExecute: (batch) =>
        setEvents((prev) =>
          [`executed batch(${batch.length})`, ...prev].slice(0, 8),
        ),
    },
    (state) => ({
      status: state.status,
      size: state.size,
      isPending: state.isPending,
      executionCount: state.executionCount,
      totalItemsProcessed: state.totalItemsProcessed,
      items: state.items,
    }),
  );

  function addOne(payload: string) {
    batcher.addItem({ id: safeId("item"), payload });
  }

  function addBurst(n: number) {
    for (let i = 0; i < n; i += 1) {
      addOne(`${text} ${i + 1}`);
    }
  }

  return (
    <Card
      title="Batching"
      subtitle="Collect items and process them together (by size, timeout, or custom trigger). Great for bulk API calls and analytics."
    >
      <div className="content">
        <Row>
          <Field label="Item text">
            <input
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Try adding '!now' to force immediate batch"
            />
          </Field>
        </Row>

        <Row>
          <Field label={`Max size: ${maxSize}`}>
            <input
              className="range"
              type="range"
              min={1}
              max={20}
              value={maxSize}
              onChange={(e) => setMaxSize(parseInt(e.target.value, 10))}
            />
          </Field>
          <Field label={`Wait base: ${waitMs}ms (dynamic)`}>
            <input
              className="range"
              type="range"
              min={100}
              max={3000}
              step={50}
              value={waitMs}
              onChange={(e) => setWaitMs(parseInt(e.target.value, 10))}
            />
          </Field>
        </Row>

        <Row>
          <Field label="Started">
            <input
              type="checkbox"
              checked={started}
              onChange={(e) => setStarted(e.target.checked)}
            />
          </Field>
        </Row>

        <ButtonBar>
          <button className="btn" onClick={() => addOne(text)}>
            Add item
          </button>
          <button className="btn" onClick={() => addBurst(10)}>
            Add 10
          </button>
          <button className="btn" onClick={() => batcher.flush()}>
            Flush
          </button>
          <button className="btn" onClick={() => batcher.cancel()}>
            Cancel
          </button>
          <button className="btn" onClick={() => batcher.clear()}>
            Clear
          </button>
          <button className="btn" onClick={() => batcher.reset()}>
            Reset
          </button>
        </ButtonBar>

        <div className="stats">
          <Stat label="Status" value={<Pill>{batcher.state.status}</Pill>} />
          <Stat label="Pending" value={String(batcher.state.isPending)} />
          <Stat label="Size" value={batcher.state.size} />
          <Stat label="Exec" value={batcher.state.executionCount} />
          <Stat label="Processed" value={batcher.state.totalItemsProcessed} />
        </div>

        <Row>
          <div className="split">
            <div>
              <div className="k">Pending items</div>
              <ul className="list">
                {(batcher.state.items ?? []).slice(0, 10).map((i) => (
                  <li key={i.id}>
                    <span className="mono">{i.id.slice(-6)}</span> {i.payload}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="k">Recent batches</div>
              <ul className="list">
                {batches.map((b) => (
                  <li key={b.id}>
                    <span className="mono">
                      {new Date(b.at).toLocaleTimeString()}
                    </span>{" "}
                    {b.items.length} items
                  </li>
                ))}
              </ul>
              <div className="k" style={{ marginTop: 12 }}>
                Recent events
              </div>
              <ul className="list">
                {events.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        </Row>

        <details className="details">
          <summary>Full batcher state (Subscribe)</summary>
          <batcher.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </batcher.Subscribe>
        </details>
      </div>
    </Card>
  );
}

function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="heroTop">
          <h1 className="heroTitle">TanStack Pacer Showcase</h1>
          <p className="heroSubtitle">
            Five practical patterns (debounce, throttle, rate limit, queue,
            batching) with interactive controls and live state.
          </p>
        </div>
        <div className="heroBadges">
          <Pill>React + TypeScript</Pill>
          <Pill>@tanstack/react-pacer</Pill>
          <Pill>Selectors + Subscribe</Pill>
        </div>
      </header>

      <main className="grid">
        <DebouncerDemo />
        <ThrottlerDemo />
        <RateLimiterDemo />
        <QueueDemo />
        <BatchingDemo />
      </main>

      <footer className="footer">
        <span className="muted">
          Tip: open DevTools console if you add your own callbacks/logs.
        </span>
      </footer>
    </div>
  );
}

export default App;
