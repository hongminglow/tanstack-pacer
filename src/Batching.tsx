import { useBatcher } from "@tanstack/react-pacer";
import { ButtonBar } from "./components/ButtonBar";
import { Card } from "./components/Card";
import { Field } from "./components/Field";
import { Row } from "./components/Row";
import { Stat } from "./components/Stat";
import type { BatchItem, BatchResult } from "./type/general";
import { safeId } from "./utils/general";
import { useState } from "react";
import { CodeBlock } from "./components/CodeBlock";

export function BatchingDemo() {
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
      started: true,
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

  const coreSnippet = `const batcher = useBatcher(flushHandler, {
  maxSize: ${maxSize},
  wait: (b) => Math.max(150, ${waitMs} - b.store.state.size * 50),
  getShouldExecute: (items) => items.some((i) => i.payload.includes('!now')),
})

batcher.addItem({ id, payload })`;

  function addOne(payload: string) {
    batcher.addItem({ id: safeId("item"), payload });
  }

  function addBurst(n: number) {
    for (let i = 0; i < n; i += 1) {
      addOne(`${text} ${i + 1}`);
    }
  }

  function clearLogs() {
    setEvents([]);
    setBatches([]);
  }

  return (
    <Card
      title="Batching"
      subtitle="Collect items and process them together (by size, timeout, or custom trigger). Great for bulk API calls and analytics."
    >
      <div className="content">
        <div className="help">
          <div className="helpTitle">How to try</div>
          <ul className="helpList">
            <li>
              Click <b>Add 10</b> to trigger a size-based flush (via Max size).
            </li>
            <li>
              Wait after adding: it will flush after a timeout (dynamic wait).
            </li>
            <li>
              Put <b>!now</b> in the item text to force an immediate flush.
            </li>
          </ul>
        </div>

        <details className="details">
          <summary>Core snippet</summary>
          <CodeBlock value={coreSnippet} />
        </details>

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

        <div className="help">
          <div className="helpTitle">What the key options mean</div>
          <ul className="helpList">
            <li>
              <b>maxSize</b>: flush as soon as the batch reaches this many
              items.
            </li>
            <li>
              <b>wait</b>: time-based flush; this demo shortens the wait as the
              batch grows.
            </li>
            <li>
              <b>getShouldExecute</b>: custom “flush now” rule (here: any
              payload contains <b>!now</b>).
            </li>
          </ul>
        </div>

        <ButtonBar>
          <button className="btn" onClick={() => addOne(text)}>
            Add item
          </button>
          <button className="btn" onClick={() => addBurst(10)}>
            Add 10
          </button>
          <button className="btn" onClick={() => batcher.flush()}>
            Flush now
          </button>
          <button className="btn" onClick={() => batcher.reset()}>
            Reset
          </button>
          <button className="btn" onClick={clearLogs}>
            Clear logs
          </button>
        </ButtonBar>

        <details className="details">
          <summary>Advanced controls</summary>
          <ButtonBar>
            <button className="btn" onClick={() => batcher.cancel()}>
              Cancel pending
            </button>
            <button className="btn" onClick={() => batcher.clear()}>
              Clear pending items
            </button>
          </ButtonBar>
        </details>

        <div className="stats">
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
          <summary>Advanced: full batcher state</summary>
          <batcher.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </batcher.Subscribe>
        </details>
      </div>
    </Card>
  );
}
