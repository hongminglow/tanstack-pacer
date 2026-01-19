import "./App.css";
import { useState } from "react";
import { useQueuer, type QueuePosition } from "@tanstack/react-pacer/queuer";
import { Pill } from "./components/Pill";
import type { TaskItem } from "./type/general";
import { safeId } from "./utils/general";
import { Card } from "./components/Card";
import { Field } from "./components/Field";
import { Row } from "./components/Row";
import { Stat } from "./components/Stat";
import { ButtonBar } from "./components/ButtonBar";
import { CodeBlock } from "./components/CodeBlock";

export function QueueDemo() {
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
