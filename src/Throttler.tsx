import "./App.css";
import { useState } from "react";
import { Pill } from "./components/Pill";
import { Card } from "./components/Card";
import { Field } from "./components/Field";
import { Row } from "./components/Row";
import { Stat } from "./components/Stat";
import { ButtonBar } from "./components/ButtonBar";
import { CodeBlock } from "./components/CodeBlock";
import { useNow } from "./hooks/useNow";
import { formatMs } from "./utils/general";
import { useThrottler } from "@tanstack/react-pacer";

export function ThrottlerDemo() {
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
